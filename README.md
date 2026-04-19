# PayPulse-AI 🏋️‍♂️🤖

**AI-Powered Payment Recovery & Subscription Management for Fitness SaaS.**

PayPulse-AI is a professional-grade full-stack application designed to help gym owners manage memberships and automatically recover failed payments using **Google Gemini AI**. Instead of just saying "Payment Failed," our system analyzes the failure and provides a personalized recovery plan for every customer.

## 🚀 Key Features

- **AI Recovery Engine**: Uses Google Gemini to analyze payment failure reasons and suggest smart retry timings (e.g., payday-aligned retries).
- **Secure Authentication**: Modular JWT-based auth system with password hashing (Bcrypt) and automated token handling (Axios Interceptors).
- **Payment Integration**: Seamless checkout experience using Razorpay's modern modal flow.
- **Industry-Standard Architecture**: Clean, modular structure separating Controllers, Services, and Routes for high maintainability.
- **Gym Dashboard**: Personalized dashboard for members to manage subscriptions and view membership status.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, React Router, CSS3.
- **Backend**: Node.js, Express, JWT, Morgan.
- **AI**: Google Gemini 1.5 Flash.
- **Database**: MySQL.
- **Payments**: Razorpay.
- **Queue System**: (Planned) Redis & BullMQ for automated recovery jobs.

## 🏛️ Project Structure

```text
├── backend/
│   ├── config/         # DB Connection
│   ├── controllers/    # Business Logic
│   ├── middleware/     # Auth Security Guards
│   ├── routes/         # API Endpoints
│   ├── services/       # Razorpay & Gemini AI Logic
│   └── index.js        # Server Entry
├── frontend/
│   ├── src/
│   │   ├── api/        # Automated Axios Interceptors
│   │   ├── context/    # Global State (Auth)
│   │   ├── pages/      # Login, Register, Dashboard
│   │   └── App.jsx     # Routing
```

---

*Built for the future of Fitness SaaS.*
