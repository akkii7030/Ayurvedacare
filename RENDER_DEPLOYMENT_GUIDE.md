# Render Backend Deployment Guide - Step by Step

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Your code pushed to GitHub repository

---

## Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
cd server
git init
git add .
git commit -m "Initial backend commit"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** button → Select **"Web Service"**
3. Connect your GitHub repository
4. Select your repository from the list

---

## Step 3: Configure Web Service

Fill in the following settings:

### Basic Settings:
- **Name**: `sharavat-clinic-api` (or your preferred name)
- **Region**: Select closest to your users (e.g., Singapore, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `server` (important!)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Instance Type:
- Select **Free** (or paid plan for better performance)

---

## Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

```
NODE_ENV=production
PORT=5000
API_PUBLIC_URL=https://YOUR_RENDER_URL.onrender.com
CLIENT_ORIGIN=https://your-frontend-domain.com
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster>/<database>?retryWrites=true&w=majority
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
WHATSAPP_NUMBER=919999999999
EMAIL_FROM=akhileshvishwakarma2002@gmail.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_user
SMTP_PASS=your_brevo_smtp_key
```

**Note**: Replace `YOUR_RENDER_URL` with actual URL after deployment (you'll get it after Step 5)

---

## Step 5: Deploy

1. Click **"Create Web Service"** button
2. Wait 5-10 minutes for deployment
3. Check logs for any errors
4. Once deployed, you'll get URL like: `https://sharavat-clinic-api.onrender.com`

---

## Step 6: Update Environment Variables

1. Go to your service dashboard
2. Click **"Environment"** tab
3. Update these variables with your actual Render URL:
   - `API_PUBLIC_URL=https://YOUR_ACTUAL_RENDER_URL.onrender.com`
   - `CLIENT_ORIGIN=https://your-actual-frontend-url.com`
4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## Step 7: Test Your API

Test endpoints:
```bash
# Health check
curl https://YOUR_RENDER_URL.onrender.com/api/health

# Or visit in browser:
https://YOUR_RENDER_URL.onrender.com/api/health
```

---

## Step 8: Update Frontend

Update your frontend `.env` file:
```
VITE_API_URL=https://YOUR_RENDER_URL.onrender.com/api
```

---

## Important Notes

### Free Tier Limitations:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 50+ seconds
- 750 hours/month free

### Upgrade to Paid Plan for:
- No spin-down
- Faster performance
- More resources

### MongoDB Atlas:
- Whitelist Render IPs or use `0.0.0.0/0` (allow all)
- Go to MongoDB Atlas → Network Access → Add IP Address

### File Uploads:
- Render's filesystem is ephemeral
- Use cloud storage (AWS S3, Cloudinary) for persistent files
- Current uploads will be lost on redeploy

---

## Troubleshooting

### Build Fails:
- Check logs in Render dashboard
- Verify `package.json` has all dependencies
- Ensure Node version compatibility

### Connection Errors:
- Verify MongoDB Atlas allows Render IPs
- Check environment variables are correct
- Ensure PORT is set to 5000 or use `process.env.PORT`

### 503 Errors:
- Service might be spinning up (free tier)
- Wait 50-60 seconds and retry

---

## Auto-Deploy Setup

Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
# Render will auto-deploy
```

---

## Monitoring

- View logs: Dashboard → Your Service → Logs
- Check metrics: Dashboard → Your Service → Metrics
- Set up alerts: Dashboard → Your Service → Settings → Notifications

---

## Production Checklist

- [ ] All environment variables added
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Frontend updated with backend URL
- [ ] Health endpoint working
- [ ] CORS configured for frontend domain
- [ ] Razorpay webhook URL updated in Razorpay dashboard
- [ ] Email service tested
- [ ] Rate limiting configured
- [ ] Security headers enabled (helmet)

---

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

**Your backend will be live at**: `https://YOUR_SERVICE_NAME.onrender.com`
