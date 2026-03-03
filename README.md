# Sharavat Pali Clinic - TeleCare & Emergency Platform

This project now includes:

- React + Vite frontend (hospital theme UI)
- Node.js + Express backend (`server/`)
- MongoDB (Mongoose models for users, doctors, appointments, products, blogs, testimonials, contacts, prescriptions, notifications, logs, settings)
- Razorpay order + payment verification + webhook route
- Role-based dashboards (patient/doctor/admin)
- Prescription PDF generation (PDFKit)
- SEO basics (schema, robots, sitemap generator)

## Run Frontend

```bash
npm install
npm run dev
```

## Run Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Optional Single Command

From root:

```bash
npm run dev:full
```

## Required Environment

- Frontend: `VITE_API_URL=http://localhost:5000/api`
- Backend: see `server/.env.example`

## Build

```bash
npm run build
```

Build generates `public/sitemap.xml` through `scripts/generate-sitemap.mjs`.
