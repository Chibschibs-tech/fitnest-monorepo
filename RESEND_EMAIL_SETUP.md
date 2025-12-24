# Resend Email Setup Guide for Fitnest Waitlist

## Step-by-Step Implementation

### Step 1: Install Resend Package ✅
```bash
cd apps/web
npm install resend
```

### Step 2: Get Resend API Key

1. **Sign up for Resend** (if you haven't already):
   - Go to https://resend.com
   - Sign up for a free account
   - Verify your email

2. **Create an API Key**:
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Give it a name (e.g., "Fitnest Production")
   - Copy the API key (you'll only see it once!)

3. **Add Domain (Required for production)**:
   - Go to https://resend.com/domains
   - Click "Add Domain"
   - Add `fitnest.ma` (or your domain)
   - Follow the DNS verification steps:
     - Add the TXT record to your domain's DNS
     - Add the MX record if you want to receive emails
     - Wait for verification (can take a few minutes to 24 hours)

### Step 3: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**:
   - Navigate to your project: https://vercel.com/dashboard
   - Click on your Fitnest project
   - Go to "Settings" → "Environment Variables"

2. **Add the following environment variables**:

   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx (your Resend API key)
   ADMIN_EMAIL=chihab@ekwip.ma
   EMAIL_FROM=noreply@fitnest.ma
   ```

   **Important Notes**:
   - `EMAIL_FROM` must be a verified domain in Resend (e.g., `noreply@fitnest.ma`)
   - If your domain isn't verified yet, you can use Resend's test domain temporarily: `onboarding@resend.dev`
   - `ADMIN_EMAIL` is where admin notifications will be sent

3. **Apply to all environments**:
   - Make sure to add these to Production, Preview, and Development environments
   - Click "Save" after adding each variable

### Step 4: Verify the Implementation

The code has been updated to:
- ✅ Store submissions in the `waitlist` table (already working)
- ✅ Send confirmation email to the client using Resend
- ✅ Send admin notification to both `chihab@ekwip.ma` and `noreply@fitnest.ma`

### Step 5: Test the Email Flow

1. **Test locally** (optional):
   ```bash
   # Add to .env.local
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ADMIN_EMAIL=chihab@ekwip.ma
   EMAIL_FROM=onboarding@resend.dev  # Use test domain for local testing
   ```

2. **Test in production**:
   - Submit a test entry through the waitlist form
   - Check that:
     - Entry is saved in the database
     - Client receives confirmation email
     - Admin receives notification at both emails

3. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for logs showing:
     - `✅ [Resend] Confirmation email sent to...`
     - `✅ [Resend] Admin notification sent to...`

### Step 6: Monitor Email Delivery

1. **Resend Dashboard**:
   - Go to https://resend.com/emails
   - You'll see all sent emails
   - Check delivery status, opens, clicks, etc.

2. **Check Spam Folders**:
   - Make sure to check spam folders for test emails
   - Add `noreply@fitnest.ma` to contacts to avoid spam

## Troubleshooting

### Issue: "RESEND_API_KEY environment variable is not set"
**Solution**: Make sure you've added `RESEND_API_KEY` to Vercel environment variables and redeployed.

### Issue: "Domain not verified"
**Solution**: 
- Use `onboarding@resend.dev` temporarily for testing
- Complete domain verification in Resend dashboard
- Update `EMAIL_FROM` to use your verified domain

### Issue: Emails not being received
**Solutions**:
1. Check Resend dashboard for delivery status
2. Check spam folders
3. Verify email addresses are correct
4. Check Vercel function logs for errors

### Issue: "Invalid 'from' field"
**Solution**: The `EMAIL_FROM` must be:
- A verified domain in Resend, OR
- `onboarding@resend.dev` for testing

## Email Flow Summary

1. **User submits waitlist form** → `/api/waitlist-simple`
2. **Data is saved** → `waitlist` table in database
3. **Client email sent** → Confirmation email to user's email address
4. **Admin emails sent** → Notification to both:
   - `chihab@ekwip.ma` (from ADMIN_EMAIL env var)
   - `noreply@fitnest.ma` (hardcoded)

## Files Modified

- ✅ `apps/web/lib/resend-email.ts` - New file with Resend email functions
- ✅ `apps/web/app/api/waitlist-simple/route.ts` - Updated to use Resend
- ✅ `apps/web/package.json` - Added `resend` dependency

## Next Steps After Setup

1. ✅ Add `RESEND_API_KEY` to Vercel
2. ✅ Verify your domain in Resend (or use test domain)
3. ✅ Deploy to production
4. ✅ Test with a real submission
5. ✅ Monitor Resend dashboard for delivery

---

**Need Help?**
- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com

