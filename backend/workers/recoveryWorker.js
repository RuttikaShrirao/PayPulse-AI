// backend/workers/recoveryWorker.js
const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');

// 👨‍🏫 This is the "Employee" logic
// It defines what happens when it's time to process a job.
const worker = new Worker('payment-recovery', async (job) => {
  const { order_id, amount, user_email } = job.data;
  
  console.log(`\n⏰ [WORKER] TIME TO RETRY PAYMENT!`);
  console.log(`⚙️ Attempting to recharge user: ${user_email}`);
  console.log(`💰 Target Amount: ₹${amount}`);
  console.log(`🔖 Razorpay Order: ${order_id}`);
  
  // 👨‍🏫 In a real app, this is where we would call Razorpay's 
  // recurring payment API. For now, we are just simulating!
  
  console.log(`✅ [WORKER] Simulation complete for Job ID: ${job.id}\n`);

}, { connection });

// Handle any worker errors
worker.on('failed', (job, err) => {
  console.error(`❌ [WORKER] Job ${job.id} failed:`, err);
});

console.log('👷 Recovery Worker is sitting and waiting for jobs...');

module.exports = worker;
