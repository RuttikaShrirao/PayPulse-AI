const db = require('../config/db');
const razorpay = require('../services/razorpay');
const crypto = require('crypto');
const { analyzePaymentFailure } = require('../services/gemini');
const { recoveryQueue } = require('../services/queueService');

const createOrder = async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created----->", order);
    const sql = "INSERT INTO payments (user_id, amount, razorpay_order_id, status) VALUES (?, ?, ?, 'pending')";
    console.log("SQL Query----->", sql)
    db.query(sql, [req.user.id, amount, order.id], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error saving order" });
      res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Razorpay error: " + error.message });
  }
};

const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSignature) {
    const sql = "UPDATE payments SET status = 'success', razorpay_payment_id = ? WHERE razorpay_order_id = ?";
    db.query(sql, [razorpay_payment_id, razorpay_order_id], (err, result) => {
      if (err) return res.status(500).json({ error: "Database update failed" });
      res.json({ message: "Payment verified successfully!" });
    });
  } else {
    res.status(400).json({ error: "Invalid signature! Payment might be tampered." });
  }
};

const reportFailure = async (req, res) => {
  const { razorpay_order_id, error_reason } = req.body;

  if (!razorpay_order_id || !error_reason) {
    return res.status(400).json({ error: "Missing order_id or error_reason" });
  }

  try {
    // 1. Get AI analysis from Gemini
    const aiResult = await analyzePaymentFailure(error_reason);

    // 2. Calculate retry date (Current date + suggested days)
    const retryDate = new Date();
    retryDate.setDate(retryDate.getDate() + (aiResult.days_to_wait || 0));
    console.log("Retry Date----->",retryDate,"-----", aiResult.days_to_wait);
    
    // 3. Update the database with failure info and AI advice
    const sql = `
      UPDATE payments 
      SET status = 'failed', 
          error_reason = ?, 
          ai_analysis = ?, 
          retry_date = ? 
      WHERE razorpay_order_id = ?
    `;

    db.query(sql, [
      error_reason, 
      aiResult.customer_message, 
      retryDate, 
      razorpay_order_id
    ], async (err, result) => {
      if (err) return res.status(500).json({ error: "Database update failed" });

      // 👨‍🏫 BULLMQ MAGIC:
      // We schedule a job to retry in the future.
      const delayInMs = 10000; 

      await recoveryQueue.add('retry-payment', {
        order_id: razorpay_order_id,
        user_email: req.user.email,
        amount: 500
      }, { delay: delayInMs });

      res.json({ 
        message: "Failure analyzed and retry scheduled!", 
        suggestion: aiResult 
      });
    });
  } catch (error) {
    console.error("Failure reporting error:", error);
    res.status(500).json({ error: "Server error during analysis" });
  }
};

// 📊 Get all payments for Admin Dashboard
const getAllPayments = (req, res) => {
  const sql = `
    SELECT p.*, u.email as user_email, u.name as user_name 
    FROM payments p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

module.exports = { createOrder, verifyPayment, reportFailure, getAllPayments };