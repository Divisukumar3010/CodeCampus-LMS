# 🎓 CodeCampus - Modern Learning Management System (LMS)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-cyan.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CodeCampus** is a full-featured, production-ready Learning Management System built using the MERN stack (MongoDB, Express, React, Node.js). Designed for educators, students, and administrators, it delivers interactive course experiences with an integrated online code editor, quizzes/exams, automated certificate generation, payment processing, calendar scheduling, and detailed performance tracking.

---

## 🚀 Key Features

### 👨‍🎓 For Students
- **Course Discovery & Enrollment**: Browse categorized courses with search, filters, ratings, and preview clips.
- **Interactive Course Player**: Video lectures, lesson notes, downloadable attachments, and auto-tracked curriculum progress.
- **Embedded Online Code Editor**: In-browser multi-language Monaco code editor with live execution for practical programming lessons.
- **Exams & Quizzes**: Timed assessments, automatic scoring, and detailed grade reviews.
- **Automated PDF Certificates**: Instant, verifiable certificate generation upon course completion.
- **Calendar & Schedules**: Integrated calendar tracking deadlines, live sessions, and milestones.
- **Reviews & Ratings**: Post feedback and ratings for completed courses.

### 👨‍🏫 For Trainers / Instructors
- **Course Creation & Curriculum Studio**: Rich multi-section course builder with video uploads (Cloudinary or local storage), downloadable resources, and chapter arrangement.
- **Exam / Quiz Builder**: Create timed quizzes with multiple-choice questions, passing grades, and attempt limits.
- **Student Performance & Grades**: View student progress, test submissions, and individual performance metrics.

### 🛡️ For Administrators
- **Admin Dashboard**: Comprehensive statistics on platform revenue, user registrations, course sales, and enrollments.
- **User & Instructor Management**: Manage permissions, assign roles (`student`, `trainer`, `admin`), and moderate accounts.
- **Course Approvals & Categories**: Manage catalog taxonomy, course visibility, and platform-wide configurations.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Library/Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) & CSS3 Animations
- **Icons & Components**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Data Visualization**: [Recharts](https://recharts.org/), [D3](https://d3js.org/), [Three.js](https://threejs.org/)
- **Notifications & UI**: `react-hot-toast`
- **Payments**: [@stripe/react-stripe-js](https://stripe.com/)

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) with cookies/headers, bcrypt password hashing, and OAuth 2.0 (Google, Microsoft)
- **Payment Gateway**: [Stripe](https://stripe.com/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) & local disk streaming
- **Certificates**: [PDFKit](https://pdfkit.org/) server-side PDF generation
- **Mailing**: [Nodemailer](https://nodemailer.com/) (SMTP / Gmail)
- **Security**: Helmet, Express Mongo Sanitize, HPP, Express Rate Limit, CORS

---

## 📂 Project Structure

```text
CodeCampus/
├── backend/
│   ├── config/             # Database connection & third-party configs
│   ├── controllers/        # Business logic for auth, courses, exams, certificates, etc.
│   ├── middleware/         # Auth, validation, file upload, error & rate limiting
│   ├── models/             # Mongoose data schemas (User, Course, Exam, Order, Review, etc.)
│   ├── public/             # Static assets, certificates, and video streaming cache
│   ├── routes/             # RESTful API route definitions
│   ├── scripts/            # Utility scripts (duration updates, etc.)
│   ├── utils/              # Token generators, email templates, PDF builder
│   ├── validators/         # Request validation rules
│   ├── seed.js             # Database seeding script with mock data
│   ├── server.js           # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── public/             # Static public assets and icons
│   ├── src/
│   │   ├── assets/         # Images, illustrations, and logos
│   │   ├── components/     # Reusable UI components (Navbar, Sidebar, Modals, Cards, etc.)
│   │   ├── context/        # React context providers (AuthContext, ThemeContext, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Application views (Home, Courses, CourseView, Compiler, Exam, etc.)
│   │   ├── services/       # Axios API client instances and endpoint handlers
│   │   ├── utils/          # Helpers and formatters
│   │   ├── App.jsx         # App routes & main layout
│   │   └── main.jsx        # React DOM bootstrap
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have installed on your local machine:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Divisukumar3010/CodeCampus-LMS.git
cd CodeCampus
```

### 2. Configure Backend Environment
Navigate into the `backend` directory and copy the environment template:
```bash
cd backend
cp .env.example .env
```

Open `.env` in your editor and configure your secrets:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/CodeCampusDB

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary (Optional for cloud media hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (Optional for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email / SMTP (Optional for reset password & notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Install Backend Dependencies & Seed Sample Data
```bash
npm install

# Seed the database with sample courses, exams, categories, and test accounts:
node seed.js

# Start backend server in development mode:
npm run dev
```
The server will start at `http://localhost:5000`.

### 4. Configure Frontend Environment & Run
Open a new terminal window:
```bash
cd frontend
cp .env.example .env
```
*(If `.env.example` has defaults, ensure `VITE_API_URL` or `VITE_BACKEND_URL` points to `http://localhost:5000/api`)*

Install dependencies and start Vite dev server:
```bash
npm install
npm run dev
```
The client app will launch at `http://localhost:5173`.

---

## 🔑 Demo & Test Accounts

Running `node seed.js` in the `backend` directory automatically populates the following accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `Admin@123` |
| **Trainer / Instructor** | `trainer@gmail.com` | `Trainer@123` |
| **Student** | `student@gmail.com` | `Student@123` |

---

## 📡 API Overview

| Route Prefix | Description |
| :--- | :--- |
| `/api/auth` | User registration, login, logout, token refresh, OAuth callbacks |
| `/api/courses` | Course catalog, chapter/lecture creation, curriculum management |
| `/api/exams` | Quiz and exam creation, question bank, test submission & scoring |
| `/api/certificates`| Certificate generation and verification |
| `/api/compiler` | In-browser code execution runtime |
| `/api/orders` | Checkout session creation, payment history, and Stripe webhooks |
| `/api/reviews` | Course reviews and star rating submissions |
| `/api/users` | User profile updates, avatars, enrolled courses |
| `/api/admin` | Platform analytics, user role administration, moderation |

---

## 🛡️ Security Best Practices

- Secure HTTP headers via `helmet`
- Data sanitization against NoSQL injection via `express-mongo-sanitize`
- Parameter pollution protection via `hpp`
- API request throttling with `express-rate-limit`
- Passwords hashed with `bcryptjs` (salt factor 10)
- HTTP-only authentication cookies and CORS configuration
