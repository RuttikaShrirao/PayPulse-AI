import React, { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const { data } = await api.post('/payments/create-order', { amount: 500 });

      // 2. Setup Razorpay
      const options = {
        key: "rzp_test_SbEgxbFHXVhjZC", // USE YOUR ACTUAL KEY ID HERE
        amount: data.amount,
        currency: data.currency,
        name: "Gym AI Saas",
        description: "Gold Membership",
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert(verifyRes.data.message);
          } catch (err) {
            alert("Verification failed!");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
      };

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      
      // Listen for payment failure
      rzp.on('payment.failed', function (response) {
        api.post('/payments/report-failure', {
          razorpay_order_id: data.order_id,
          error_reason: response.error.description
        });
        alert("Payment Failed. Our AI is analyzing a recovery plan!");
      });

      rzp.open();
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome, {user.name}! 🏋️‍♂️</h1>
      <button onClick={logout} style={{ marginBottom: '20px' }}>Logout</button>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', display: 'inline-block' }}>
        <h2>Gold Plan</h2>
        <p>₹500 / month</p>
        <button onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
