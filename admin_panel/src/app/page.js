"use client";

import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  Users, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  BrainCircuit, 
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, revenue: 0 });
  const router = useRouter();

  useEffect(() => {
    // 🛡️ Security Guard:
    // If no token exists, send the user to the login page.
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPayments();
  }, [router]);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments/admin/all');
      setPayments(data);
      
      // Calculate Stats
      const total = data.length;
      const success = data.filter(p => p.status === 'success').length;
      const failed = data.filter(p => p.status === 'failed').length;
      const revenue = data.filter(p => p.status === 'success').reduce((acc, curr) => acc + curr.amount, 0);
      
      setStats({ total, success, failed, revenue });
    } catch (error) {
      console.error("Failed to fetch payments", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* 🚀 Header */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BrainCircuit className="text-indigo-600" size={36} />
            PayPulse AI <span className="text-slate-400 font-light">| Command Center</span>
          </h1>
          <p className="text-slate-500 mt-2">Real-time revenue monitoring and AI recovery analysis.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button onClick={fetchPayments} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Refresh Data
          </button>
        </div>
      </div>

      {/* 📊 KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Total Revenue" value={`₹${stats.revenue}`} subValue="+12% from last month" color="emerald" />
        <StatCard icon={<Users className="text-blue-600" />} label="Total Members" value={stats.total} subValue="Active subscriptions" color="blue" />
        <StatCard icon={<CheckCircle2 className="text-indigo-600" />} label="Successful" value={stats.success} subValue="Payments processed" color="indigo" />
        <StatCard icon={<AlertCircle className="text-rose-600" />} label="Failed Payments" value={stats.failed} subValue="Need AI Recovery" color="rose" />
      </div>

      {/* 🛡️ Main Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 text-lg">Payment Transactions</h2>
          <div className="flex gap-2">
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Updated 1m ago</span>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-slate-400">Analyzing database...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">AI Analysis & Recovery Plan</th>
                <th className="px-8 py-4">Retry Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-medium text-slate-900">{p.user_name}</div>
                    <div className="text-xs text-slate-500">{p.user_email}</div>
                  </td>
                  <td className="px-8 py-5 font-semibold text-slate-700">₹{p.amount}</td>
                  <td className="px-8 py-5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-8 py-5">
                    {p.ai_analysis ? (
                      <div className="max-w-md bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl text-sm text-indigo-900 leading-relaxed">
                        <div className="flex items-center gap-2 mb-1 font-bold text-xs text-indigo-600 uppercase">
                          <BrainCircuit size={14} /> AI Insight
                        </div>
                        {p.ai_analysis}
                      </div>
                    ) : (
                      <span className="text-slate-300 italic text-sm">No analysis required</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    {p.retry_date ? (
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                        <ArrowRight size={14} className="text-slate-400" />
                        {new Date(p.retry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    ) : (
                      <span  className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// 📦 UI Components
function StatCard({ icon, label, value, subValue, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-slate-500 text-sm font-medium">{label}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      <div className="text-slate-400 text-xs mt-2">{subValue}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isSuccess = status === 'success';
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
      ${isSuccess 
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
        : 'bg-rose-50 text-rose-700 border border-rose-200'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {status}
    </div>
  );
}
