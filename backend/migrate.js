// backend/migrate.js
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Adding AI columns
const sql = `
  ALTER TABLE payments 
  ADD COLUMN ai_analysis TEXT AFTER error_reason,
  ADD COLUMN retry_date DATETIME AFTER ai_analysis;
`;

db.query(sql, (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('✅ AI Columns already exist.');
    } else {
      console.error('❌ Error updating database:', err.message);
    }
  } else {
    console.log('🚀 SUCCESS! AI analysis columns added to payments table.');
  }
  process.exit();
});
