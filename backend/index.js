require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import our new Routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
require('./workers/recoveryWorker'); // 👨‍🏫 Start the background worker

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // For development, we allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Use Routes
app.use('/auth', authRoutes); // All auth routes will start with /auth (e.g., /auth/login)
app.use('/payments', paymentRoutes); // All payment routes will start with /payments

app.listen(port, () => {
  console.log(`🚀 Modular Server running on http://localhost:${port}`);
});
