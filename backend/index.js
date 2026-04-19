require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import our new Routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Use Routes
app.use('/auth', authRoutes); // All auth routes will start with /auth (e.g., /auth/login)
app.use('/payments', paymentRoutes); // All payment routes will start with /payments

app.listen(port, () => {
  console.log(`🚀 Modular Server running on http://localhost:${port}`);
});
