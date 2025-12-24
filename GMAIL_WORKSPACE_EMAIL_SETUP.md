# Gmail/Google Workspace Email Setup Guide for Fitnest Waitlist

## Step-by-Step Implementation

### Step 1: Set Up Google Workspace Account

1. **Ensure you have a Google Workspace account** with:
   - Domain: `fitnest.ma` (or your domain)
   - Admin access to create App Passwords

2. **Create a Service Account Email** (recommended):
   - Go to Google Admin Console: https://admin.google.com
   - Navigate to Users → Create a new user
   - Create: `noreply@fitnest.ma` (or use existing email)
   - This email will be used to send emails

### Step 2: Enable 2-Step Verification

1. **For the sending email account**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification (required for App Passwords)

### Step 3: Create Gmail App Password

1. **Go to Google Account**:
   - Visit: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App Passwords

2. **Generate App Password**:
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "Fitnest Production"
   - Click "Generate"
   - **Copy the 16-character password** (you'll only see it once!)
   - Format: `xxxx xxxx xxxx xxxx` (remove spaces when using)

### Step 4: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**:
   - Navigate to your project: https://vercel.com/dashboard
   - Click on your Fitnest project
   - Go to "Settings" → "Environment Variables"

2. **Add the following environment variables**:

   ```
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_SECURE=false
   EMAIL_SERVER_USER=noreply@fitnest.ma
   EMAIL_SERVER_PASSWORD=xxxx xxxx xxxx xxxx (your App Password - remove spaces)
   EMAIL_FROM=noreply@fitnest.ma
   ADMIN_EMAIL=chihab@ekwip.ma
   ```

   **Important Notes**:
   - `EMAIL_SERVER_USER`: The Gmail/Google Workspace email that will send emails
   - `EMAIL_SERVER_PASSWORD`: The 16-character App Password (NOT your regular password)
   - `EMAIL_FROM`: Should match `EMAIL_SERVER_USER` or be a verified alias
   - `ADMIN_EMAIL`: Where admin notifications will be sent
   - `EMAIL_SERVER_SECURE`: `false` for port 587 (TLS), `true` for port 465 (SSL)

3. **Apply to all environments**:
   - Make sure to add these to Production, Preview, and Development
   - Click "Save" after adding each variable

### Step 5: Verify Email Configuration

The code will:
- ✅ Store submissions in the `waitlist` table (already working)
- ✅ Send confirmation email to the client using Gmail SMTP
- ✅ Send admin notification to both:
  - `chihab@ekwip.ma` (from ADMIN_EMAIL env var)
  - `noreply@fitnest.ma` (hardcoded)

### Step 6: Test the Email Flow

1. **Test locally** (optional):
   ```bash
   # Add to .env.local
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_SECURE=false
   EMAIL_SERVER_USER=noreply@fitnest.ma
   EMAIL_SERVER_PASSWORD=your-app-password-here
   EMAIL_FROM=noreply@fitnest.ma
   ADMIN_EMAIL=chihab@ekwip.ma
   ```

2. **Test in production**:
   - Submit a test entry through the waitlist form
   - Check that:
     - Entry is saved in the database
     - Client receives confirmation email
     - Both `chihab@ekwip.ma` and `noreply@fitnest.ma` receive admin notification

3. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for logs showing:
     - `✅ Confirmation email sent to client:...`
     - `✅ Admin notification sent to...`

### Step 7: Monitor Email Delivery

1. **Check Gmail Sent Folder**:
   - Log into the sending email account (`noreply@fitnest.ma`)
   - Check "Sent" folder to verify emails were sent

2. **Check Spam Folders**:
   - Make sure to check spam folders for test emails
   - Add `noreply@fitnest.ma` to contacts to avoid spam

## Troubleshooting

### Issue: "Invalid login" or "Authentication failed"
**Solutions**:
1. Make sure you're using an **App Password**, not your regular Gmail password
2. Verify 2-Step Verification is enabled
3. Check that the App Password was copied correctly (no spaces)
4. Ensure `EMAIL_SERVER_USER` matches the account that generated the App Password

### Issue: "Connection timeout"
**Solutions**:
1. Check firewall settings
2. Verify `EMAIL_SERVER_PORT` is correct (587 for TLS, 465 for SSL)
3. Check `EMAIL_SERVER_SECURE` matches the port:
   - Port 587 → `EMAIL_SERVER_SECURE=false` (uses STARTTLS)
   - Port 465 → `EMAIL_SERVER_SECURE=true` (uses SSL)

### Issue: "Less secure app access" error
**Solution**: This shouldn't happen with App Passwords. If it does:
1. Make sure you're using an App Password, not regular password
2. Check that 2-Step Verification is enabled

### Issue: Emails going to spam
**Solutions**:
1. Set up SPF record for your domain
2. Set up DKIM signing in Google Workspace
3. Set up DMARC policy
4. Add `noreply@fitnest.ma` to recipient's contacts

### Issue: "Email configuration is incomplete"
**Solution**: Check that all environment variables are set:
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

## Email Flow Summary

1. **User submits waitlist form** → `/api/waitlist-simple`
2. **Data is saved** → `waitlist` table in database
3. **Client email sent** → Confirmation email to user's email address (via Gmail SMTP)
4. **Admin emails sent** → Notification to both:
   - `chihab@ekwip.ma` (from ADMIN_EMAIL env var)
   - `noreply@fitnest.ma` (hardcoded)

## Gmail SMTP Settings Reference

```
Host: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
Security: STARTTLS (port 587) or SSL (port 465)
Authentication: Required (App Password)
```

## Google Workspace SMTP Settings (if different)

If using Google Workspace with custom SMTP:
```
Host: smtp-relay.gmail.com (for Workspace)
Port: 587 or 465
Security: Same as Gmail
Authentication: App Password or OAuth
```

## Files Modified

- ✅ `apps/web/lib/email-utils.ts` - Updated to send to both admin emails
- ✅ `apps/web/app/api/waitlist-simple/route.ts` - Uses Gmail SMTP via email-utils
- ❌ `apps/web/lib/resend-email.ts` - Removed (not using Resend)

## Next Steps After Setup

1. ✅ Create Gmail App Password
2. ✅ Add environment variables to Vercel
3. ✅ Deploy to production
4. ✅ Test with a real submission
5. ✅ Monitor Gmail sent folder and Vercel logs

---

**Need Help?**
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Google Workspace Admin: https://admin.google.com
- Gmail SMTP Settings: https://support.google.com/mail/answer/7126229

