// backend/services/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with your key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const analyzePaymentFailure = async (errorReason) => {
  const prompt = `
    A gym membership payment failed for our customer. 
    The error message was: "${errorReason}".
    
    As an expert in customer retention and payment recovery, please:
    1. Summarize why this might have happened in simple non-technical terms.
    2. Suggest how many days we should wait before trying to charge them again (as an integer, e.g., 3).
    3. Write a friendly, empathy-first email message to the customer asking them to update their details or check their balance.
    
    IMPORTANT: Return your entire response ONLY as a JSON object with these keys: 
    "reason_summary", "days_to_wait", "customer_message".
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Sometimes AI adds Markdown code blocks, we strip them out
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Failure Analysis Error:", error);
    return {
      reason_summary: "We encountered a payment issue.",
      days_to_wait: 1,
      customer_message: "Hi, we had some trouble processing your payment. Please check your card details."
    };
  }
};

module.exports = { analyzePaymentFailure };
