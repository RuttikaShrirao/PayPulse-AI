import React, { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Check, Dumbbell, Zap, Crown, LogOut, Loader2 } from 'lucide-react';
import './Dashboard.css'; // 📱 Import our new responsive styles!

function Dashboard() {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { user, logout } = useAuth();

  const handlePayment = async (amount, planName) => {
    setLoadingPlan(planName);
    try {
      const { data } = await api.post('/payments/create-order', { amount: amount });

      const options = {
        key: "rzp_test_SbEgxbFHXVhjZC",
        amount: data.amount,
        currency: data.currency,
        name: "PayPulse AI Gym",
        description: `${planName} Membership`,
        order_id: data.order_id,
        theme: {
          color: "#4f46e5" 
        },
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
        alert("Razorpay SDK failed to load. Are you connected to the internet?");
        setLoadingPlan(null);
        return;
      }

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        api.post('/payments/report-failure', {
          razorpay_order_id: data.order_id,
          error_reason: response.error.description
        });
        alert(`Payment for ${planName} Failed. Our AI is analyzing a recovery plan!`);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="dashboard-page">
      {/* 🚀 Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-logo">
          <Dumbbell size={28} color="#818cf8" />
          PayPulse AI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#94a3b8' }}>Welcome, <strong style={{ color: '#fff' }}>{user.name}</strong></span>
          <button className="dashboard-logout-btn" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* 💥 Hero Section */}
      <div className="dashboard-hero">
        <h1 className="dashboard-title">Transform Your Body Today</h1>
        <p className="dashboard-subtitle">
          Choose the plan that fits your goals. Every plan includes access to our AI-powered community and world-class equipment.
        </p>
      </div>

      {/* 📊 Pricing Grid */}
      <div className="dashboard-grid">
        
        {/* Tier 1: Starter */}
        <div className="dashboard-card">
          <h2 className="dashboard-plan-name">Starter</h2>
          <div className="dashboard-price">₹500<span className="dashboard-period">/mo</span></div>
          <ul className="dashboard-feature-list">
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Access to Gym floor</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Basic equipment</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Locker room access</li>
          </ul>
          <button 
            className="dashboard-btn dashboard-btn-secondary"
            onClick={() => handlePayment(500, "Starter")}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === "Starter" ? <Loader2 className="animate-spin" size={20} /> : "Get Started"}
          </button>
        </div>

        {/* Tier 2: Pro (Most Popular) */}
        <div className="dashboard-card-popular">
          <div className="dashboard-badge">Most Popular</div>
          <h2 className="dashboard-plan-name">Pro</h2>
          <div className="dashboard-price">₹1500<span className="dashboard-period">/mo</span></div>
          <ul className="dashboard-feature-list">
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Full Gym Access</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> 2 Group Classes/week</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Free Towel Service</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Guest pass (1/month)</li>
          </ul>
          <button 
            className="dashboard-btn dashboard-btn-primary"
            onClick={() => handlePayment(1500, "Pro")}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === "Pro" ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} /> Upgrade to Pro</>}
          </button>
        </div>

        {/* Tier 3: Elite */}
        <div className="dashboard-card">
          <h2 className="dashboard-plan-name">Elite</h2>
          <div className="dashboard-price">₹2500<span className="dashboard-period">/mo</span></div>
          <ul className="dashboard-feature-list">
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> 24/7 Access</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Unlimited Classes</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Personal Trainer App</li>
            <li className="dashboard-feature"><Check size={18} color="#818cf8" /> Spa & Sauna Access</li>
          </ul>
          <button 
            className="dashboard-btn dashboard-btn-secondary"
            onClick={() => handlePayment(2500, "Elite")}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === "Elite" ? <Loader2 className="animate-spin" size={20} /> : <><Crown size={18} /> Become Elite</>}
          </button>
        </div>

      </div>
      
      {/* Footer trick */}
      <div style={{ height: '40px' }}></div>
    </div>
  );
}

export default Dashboard;
