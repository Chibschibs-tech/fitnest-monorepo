# Vercel Environment Variables Setup - Step by Step

## Your Gmail App Password
```
ggbl jzcz zvhs uvci
```
**Note**: Remove spaces when adding to Vercel → `ggbljzczzvhsuvci`

## Step-by-Step Instructions

### Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Log in with your Vercel account
3. Find and click on your **Fitnest project**

### Step 2: Navigate to Environment Variables
1. Click on **"Settings"** (top navigation bar)
2. Click on **"Environment Variables"** (left sidebar)

### Step 3: Add Each Environment Variable

Add the following variables one by one:

#### 1. EMAIL_SERVER_HOST
- **Name**: `EMAIL_SERVER_HOST`
- **Value**: `smtp.gmail.com`
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

#### 2. EMAIL_SERVER_PORT
- **Name**: `EMAIL_SERVER_PORT`
- **Value**: `587`
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

#### 3. EMAIL_SERVER_SECURE
- **Name**: `EMAIL_SERVER_SECURE`
- **Value**: `false`
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

#### 4. EMAIL_SERVER_USER
- **Name**: `EMAIL_SERVER_USER`
- **Value**: `noreply@fitnest.ma` (or your Gmail/Workspace email)
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

#### 5. EMAIL_SERVER_PASSWORD ⭐ (Your App Password)
- **Name**: `EMAIL_SERVER_PASSWORD`
- **Value**: `ggbljzczzvhsuvci` (remove spaces from: ggbl jzcz zvhs uvci)
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

#### 6. EMAIL_FROM
- **Name**: `EMAIL_FROM`
- **Value**: `noreply@fitnest.ma` (should match EMAIL_SERVER_USER)
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

#### 7. ADMIN_EMAIL
- **Name**: `ADMIN_EMAIL`
- **Value**: `chihab@ekwip.ma`
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

### Step 4: Verify All Variables Are Added

You should see these 7 environment variables in the list:
- ✅ EMAIL_SERVER_HOST
- ✅ EMAIL_SERVER_PORT
- ✅ EMAIL_SERVER_SECURE
- ✅ EMAIL_SERVER_USER
- ✅ EMAIL_SERVER_PASSWORD
- ✅ EMAIL_FROM
- ✅ ADMIN_EMAIL

### Step 5: Redeploy Your Application

**Important**: After adding environment variables, you need to redeploy:

1. Go to **"Deployments"** tab
2. Click the **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

**Why?** Environment variables are only loaded when the application starts, so existing deployments won't have the new variables.

## Quick Checklist

- [ ] Added EMAIL_SERVER_HOST = `smtp.gmail.com`
- [ ] Added EMAIL_SERVER_PORT = `587`
- [ ] Added EMAIL_SERVER_SECURE = `false`
- [ ] Added EMAIL_SERVER_USER = `noreply@fitnest.ma` (or your email)
- [ ] Added EMAIL_SERVER_PASSWORD = `ggbljzczzvhsuvci` (no spaces)
- [ ] Added EMAIL_FROM = `noreply@fitnest.ma`
- [ ] Added ADMIN_EMAIL = `chihab@ekwip.ma`
- [ ] Selected all environments (Production, Preview, Development) for each
- [ ] Redeployed the application

## Testing After Setup

1. **Submit a test waitlist entry** on your live site
2. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for logs showing:
     - `✅ Confirmation email sent to client:...`
     - `✅ Admin notification sent to...`
3. **Check email inboxes**:
   - Client should receive confirmation email
   - `chihab@ekwip.ma` should receive admin notification
   - `noreply@fitnest.ma` should receive admin notification

## Troubleshooting

### If emails still don't send:
1. **Check Vercel logs** for error messages
2. **Verify App Password** is correct (no spaces)
3. **Verify EMAIL_SERVER_USER** matches the account that generated the App Password
4. **Make sure 2-Step Verification** is enabled on the Gmail account
5. **Redeploy** after adding variables

### Common Errors:
- **"Invalid login"**: App Password is incorrect or has spaces
- **"Connection timeout"**: Check EMAIL_SERVER_PORT (should be 587)
- **"Email configuration incomplete"**: Missing environment variables

## Security Note

⚠️ **Important**: The App Password is sensitive. Make sure:
- Only add it to Vercel environment variables (never commit to git)
- Don't share it publicly
- If compromised, generate a new App Password and update Vercel

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/environment-variables
- Gmail App Passwords: https://support.google.com/accounts/answer/185833

