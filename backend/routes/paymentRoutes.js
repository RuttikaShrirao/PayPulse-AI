const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middleware/auth');

router.post('/create-order', authenticateToken, paymentController.createOrder);
router.post('/verify-payment', authenticateToken, paymentController.verifyPayment);
router.post('/report-failure', authenticateToken, paymentController.reportFailure);

// 📊 Admin Route: Get all payments for the dashboard
router.get('/admin/all', authenticateToken, paymentController.getAllPayments);

module.exports = router;
