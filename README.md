# Sprout & Spark Childcare Management System 🧸

A comprehensive, full-stack daycare management platform designed to streamline administrative tasks, enhance parent-teacher communication, and provide a secure portal for parents to monitor their child's daily activities, attendance, and billing.

## 🌟 Key Features

### For Administrators

- **Inquiry & Enrollment Management:** Review public inquiries, schedule tours, and seamlessly enroll children into specific classes.
- **Staff Management:** Register new staff members (teachers/admins), assign them to classes, and manage staff records.
- **Class Management:** Create and manage classes (Infant, Toddler, Preschool), track capacity, and set monthly tuition fees.
- **Financial Dashboard:** Generate monthly invoices and track total expected, collected, and outstanding payments.
- **Attendance Logs:** Filter and review historical attendance records across all classes.

### For Parents

- **Family Dashboard:** Quick overview of enrolled children, assigned classes, and daily updates.
- **Health & Safety Profiles:** Manage allergies, dietary restrictions, medications, and authorized emergency pickups for each child.
- **Activity Feed:** Real-time timeline of daily activities (naps, meals, learning, play) logged by teachers.
- **Billing & Payments:** View tuition balances, past invoices, and make secure online payments via Razorpay integration.

### For Teachers / Staff

- **Class Roster:** View assigned students and manage daily check-ins/check-outs.
- **Activity Logging:** Record meals, naps, educational activities, and incidents for individual children or the entire class.
- **Attendance Tracking:** Easily mark students as present or absent for the day.

### Public Facing Website

- **Landing Page:** Showcase programs, core values, and parent testimonials.
- **Lead Generation:** Integrated forms for prospective parents to submit inquiries and book facility tours.

## 💻 Tech Stack

**Frontend:**

- React.js (via Vite)
- Tailwind CSS (for styling and responsive design)
- React Router DOM (for navigation)
- Lucide React (for iconography)
- Axios (for API requests)
- Razorpay Frontend SDK (for payments)

**Backend:**

- Node.js & Express.js
- MongoDB & Mongoose (Database & ODM)
- JSON Web Tokens (JWT) for authentication

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or Atlas)
- Razorpay Account (for payment gateway keys)

### 1. Clone the repository

```bash
git clone https://github.com/sunny-rajak/Daycare-Center.git
cd DayCare
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/daycare
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the frontend development server:

```bash
npm run dev
```
