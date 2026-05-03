// backend/services/queueService.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// 👨‍🏫 Redis Connection:
// We use IORedis to create a stable bridge to your Upstash Cloud Redis.
// The "maxRetriesPerRequest" is required by BullMQ to prevent errors.
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// 👨‍🏫 The Queue:
// This is our "Waiting Room". When a payment fails, we will put
// a "Ticket" (Job) in here that says "Retry this in X days".
const recoveryQueue = new Queue('payment-recovery', { connection });

module.exports = { recoveryQueue, connection };
