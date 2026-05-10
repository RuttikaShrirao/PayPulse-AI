// backend/workers/recoveryWorker.js
const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const db = require('../config/db');
const { sendRecoveryEmail } = require('../services/emailService');

// 👨‍🏫 The Worker logic
const worker = new Worker('payment-recovery', async (job) => {
  const { order_id, user_email } = job.data;
  
  console.log(`\n⏰ [WORKER] Processing retry for: ${user_email}`);

  try {
    // 1. Fetch the AI analysis from the database
    // We need to know WHAT message Gemini wrote for this specific failure.
    const sql = "SELECT ai_analysis, user_id FROM payments WHERE razorpay_order_id = ?";
    
    // We use a promise-based query so the worker waits for the result
    const [rows] = await db.promise().query(sql, [order_id]);

    if (rows.length === 0 || !rows[0].ai_analysis) {
      console.log(`⚠️ No AI analysis found for order ${order_id}. Skipping email.`);
      return;
    }

    const aiMessage = rows[0].ai_analysis;

    // 2. Fetch User Name
    const [userRows] = await db.promise().query("SELECT name FROM users WHERE id = ?", [rows[0].user_id]);
    const userName = userRows[0]?.name || "Customer";

    // 3. Send the actual email!
    await sendRecoveryEmail(user_email, userName, aiMessage);

    console.log(`✅ [WORKER] Recovery process completed for Job ID: ${job.id}\n`);

  } catch (error) {
    console.error(`❌ [WORKER] Error processing recovery:`, error);
    throw error; // This allows BullMQ to retry the job later if it fails!
  }

}, { connection });

worker.on('failed', (job, err) => {
  console.error(`❌ [WORKER] Job ${job.id} failed:`, err);
});

console.log('👷 Recovery Worker is active and monitoring the queue...');

module.exports = worker;
