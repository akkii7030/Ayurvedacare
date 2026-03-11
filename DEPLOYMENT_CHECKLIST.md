# Vercel Deployment Checklist

## MongoDB Atlas Setup

1. **Database User**:
   - Username: `clinicadmin@admin` (already created ✓)
   - Built-in Role: Select **atlasAdmin** or **readWriteAnyDatabase**
   - Click "Update User"

2. **Network Access**:
   - Go to: Network Access tab
   - Click: "Add IP Address"
   - Select: "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

3. **Connection String**:
   - Go to: Database → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with actual password
   - Format: `mongodb+srv://clinicadmin:YOUR_PASSWORD@cluster.mongodb.net/ayurvedacare?retryWrites=true&w=majority`

## Vercel Environment Variables

Add these in: Vercel Dashboard → Project Settings → Environment Variables

```
MONGODB_URI=mongodb+srv://clinicadmin:YOUR_PASSWORD@cluster.mongodb.net/ayurvedacare
JWT_SECRET=your_strong_secret_minimum_32_characters
API_PUBLIC_URL=https://ayurvedacaree.vercel.app
CLIENT_ORIGIN=https://ayurvedacaree.vercel.app
NEXT_PUBLIC_APP_URL=https://ayurvedacaree.vercel.app
NODE_ENV=production
```

Optional (if using):
```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@ayurvedacare.com
WHATSAPP_NUMBER=919999999999
```

## After Adding Variables

1. Go to: Deployments tab
2. Click: Latest deployment → 3 dots menu
3. Select: "Redeploy"
4. Check: Runtime Logs for any errors

## Test API

After deployment, test:
- https://ayurvedacaree.vercel.app/api
- https://ayurvedacaree.vercel.app/api/health
- https://ayurvedacaree.vercel.app/api/auth/login

## Common Issues

1. **500 Error**: Check Runtime Logs for MongoDB connection error
2. **CORS Error**: Verify CLIENT_ORIGIN matches your domain
3. **Auth Error**: Verify JWT_SECRET is set
4. **MongoDB Timeout**: Check Network Access allows 0.0.0.0/0
