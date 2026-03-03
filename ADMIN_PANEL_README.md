# Admin Panel README

## Overview
This admin panel is built for Sharavat Pali Clinic operations:
- Patient management
- Appointment lifecycle management
- Prescription + PDF workflows
- Payment/refund operations
- Product/content management
- Analytics and security status monitoring

Frontend route:
- `/dashboard/admin`

Backend base:
- `/api/admin/*`

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + Mongoose
- Email: Nodemailer (SMTP)
- PDF: PDFKit

## Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- SMTP credentials (for email notifications)

## Environment Setup

### `server/.env` (required keys)
```env
NODE_ENV=development
PORT=5000
API_PUBLIC_URL=http://localhost:5000
CLIENT_ORIGIN=http://localhost:8080
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

WHATSAPP_NUMBER=919999999999
EMAIL_FROM=you@example.com
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

### Root `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

## Run Locally

### 1) Start backend
```powershell
cd server
npm install
npm run dev
```

### 2) Start frontend
```powershell
cd ..
npm install
npm run dev
```

### 3) Seed admin user (if needed)
```powershell
cd server
npm run seed
```

Default seeded admin:
- Phone: `9000000001`
- Password: `Admin@123`

## Admin Modules

### 1. Dashboard
- KPI cards: total patients, today appointments, revenue, pending payments
- Recent payments
- Transactions table with Details modal and Refund action

### 2. Patients
- Create patient
- View patient list

### 3. Appointments
- Approve/cancel appointment
- Reschedule support via update API

### 4. Prescriptions
- Create digital prescription
- Generate branded PDF (with clinic logo)

### 5. Payments
- Refund operation from transactions/refund flow

### 6. Products
- Add and list products

### 7. Content
- Blog create/publish
- Testimonial moderation (approve toggle)

### 8. Analytics
- Revenue trend, patient growth, common disease, repeat patient %

### 9. Security
- Status indicators for OTP/backup/SSL/RBAC flags

## Notifications and Email Flows

Patient emails are sent for:
- Appointment confirmed
- Appointment cancelled
- Appointment rescheduled
- Payment refunded

Email templates use branded HTML and inline logo support.

## Prescription PDF
- Generated when prescription is created
- Stored in:
  - `server/uploads/prescriptions/`
- Served from:
  - `http://localhost:5000/uploads/prescriptions/<file>.pdf`

Note:
- Ensure `public/logo.png` exists for logo embedding.
- `API_PUBLIC_URL` must be set correctly for absolute PDF links.

## Useful API Endpoints
- `GET /api/admin/dashboard`
- `GET /api/admin/patients`
- `POST /api/admin/patients`
- `GET /api/admin/appointments`
- `PATCH /api/admin/appointments/:id`
- `POST /api/admin/appointments/:id/refund`
- `GET /api/admin/payments`
- `GET /api/admin/prescriptions`
- `POST /api/prescriptions`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/blogs`
- `POST /api/admin/blogs`
- `GET /api/admin/testimonials`
- `PATCH /api/admin/testimonials/:id/approve`
- `GET /api/admin/analytics`
- `GET /api/admin/security/status`

## Troubleshooting

### 403 on admin APIs
- Logged-in user is not admin.
- Verify role in DB:
  - `role: "admin"`

### PDF link opens frontend 404
- Check `API_PUBLIC_URL` in `server/.env`
- Restart backend after env change.

### Emails not sent
- Verify SMTP config in `server/.env`
- Check backend logs for SMTP errors.

### Atlas connection issues
- Add your IP in Atlas Network Access
- Verify DB user credentials

## Build Checks
```powershell
npx tsc --noEmit
npm run build
```

