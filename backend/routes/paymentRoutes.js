const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middleware/auth');

router.post('/create-order', authenticateToken, paymentController.createOrder);
router.post('/verify-payment', authenticateToken, paymentController.verifyPayment);
router.post('/report-failure', authenticateToken, paymentController.reportFailure);

module.exports = router;
