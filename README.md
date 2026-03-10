# Sharavat Pali Clinic

Unified Next.js application for the clinic website, dashboards, and API.

## Architecture

- `src/app/*`: Next.js App Router pages
- `src/app/api/*`: Next.js API routes
- `src/lib/server/*`: backend code used by the Next.js API layer
- `uploads/*`: generated reports, invoices, backups, and prescription PDFs served by Next.js at `/uploads/*`

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Environment

Create `.env` in the project root. Minimum required values:

```env
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
API_PUBLIC_URL=http://localhost:3000
CLIENT_ORIGIN=http://localhost:3000
```

Optional service integrations:

- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- Admin backup/security toggles: `ADMIN_OTP_ENABLED`, `BACKUP_CRON`, `BACKUP_BUCKET`, `BACKUP_PATH`

## Data Scripts

Run these from the project root:

```bash
npm run seed
npm run sync:doctors
npm run sync:products
npm run sync:blogs
```

These scripts use the root `.env`.

## Build

```bash
npm run build
npm run start
```
