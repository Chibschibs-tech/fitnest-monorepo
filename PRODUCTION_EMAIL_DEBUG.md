# Production Email Debugging Guide

## Step 1: Check Email Configuration

Visit this URL in your browser:
```
https://fitnest.ma/api/email-diagnostic
```

This will show you:
- ✅ Which environment variables are set
- ✅ If the configuration is complete
- ✅ If the Gmail connection can be verified
- ✅ Detailed error messages if something fails

## Step 2: Check Vercel Function Logs

1. Go to: https://vercel.com/dashboard
2. Select your Fitnest project
3. Click on **"Functions"** tab
4. Look for recent function invocations from `/api/waitlist-simple`
5. Check the logs for:
   - `✅ Confirmation email sent to client:...`
   - `❌ Failed to send confirmation email...`
   - `✅ Admin notification sent...`
   - `❌ Failed to send admin notification...`

## Step 3: Common Issues and Solutions

### Issue 1: "Email configuration is incomplete"
**Check**: Visit `/api/email-diagnostic` to see which variables are missing
**Solution**: Add missing environment variables in Vercel and redeploy

### Issue 2: "Invalid login" or "Authentication failed"
**Possible causes**:
- App Password is incorrect (check for spaces: should be `ggbljzczzvhsuvci`)
- `EMAIL_SERVER_USER` doesn't match the account that generated the App Password
- 2-Step Verification not enabled on the Gmail account

**Solution**:
1. Verify App Password: Go to https://myaccount.google.com/apppasswords
2. Generate a new App Password if needed
3. Update `EMAIL_SERVER_PASSWORD` in Vercel
4. Make sure `EMAIL_SERVER_USER` matches the Gmail account

### Issue 3: "Connection timeout" or "ECONNREFUSED"
**Possible causes**:
- Wrong port number
- Firewall blocking connection
- `EMAIL_SERVER_SECURE` doesn't match port

**Solution**:
- Port 587 → `EMAIL_SERVER_SECURE=false`
- Port 465 → `EMAIL_SERVER_SECURE=true`
- Try port 587 with `EMAIL_SERVER_SECURE=false` first

### Issue 4: Emails sent but not received
**Possible causes**:
- Emails going to spam
- Wrong email addresses
- Gmail rate limiting

**Solution**:
1. Check spam folders
2. Verify email addresses are correct
3. Check Gmail sent folder to confirm emails were sent
4. Wait a few minutes (Gmail can be slow)

## Step 4: Test Email Sending

You can test email sending directly:

### Test Client Email
```bash
curl -X POST https://fitnest.ma/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testType": "client", "email": "your-test-email@example.com"}'
```

### Test Admin Email
```bash
curl -X POST https://fitnest.ma/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testType": "admin", "email": "chihab@ekwip.ma"}'
```

## Step 5: Verify Environment Variables in Vercel

Double-check all variables are set correctly:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these 7 variables exist:
   - `EMAIL_SERVER_HOST` = `smtp.gmail.com`
   - `EMAIL_SERVER_PORT` = `587`
   - `EMAIL_SERVER_SECURE` = `false`
   - `EMAIL_SERVER_USER` = `noreply@fitnest.ma` (or your Gmail)
   - `EMAIL_SERVER_PASSWORD` = `ggbljzczzvhsuvci` (no spaces!)
   - `EMAIL_FROM` = `noreply@fitnest.ma`
   - `ADMIN_EMAIL` = `chihab@ekwip.ma`

3. Make sure they're applied to **Production** environment
4. **Redeploy** after adding/changing variables

## Step 6: Check Recent Waitlist Submissions

1. Go to Vercel Dashboard → Functions
2. Filter by `/api/waitlist-simple`
3. Click on a recent invocation
4. Check the logs for:
   - Database save status
   - Email sending attempts
   - Error messages

Look for these log patterns:
- `Waitlist submission saved to database:` ✅
- `📧 Attempting to send waitlist confirmation email to...` ✅
- `✅ Confirmation email sent to client:` ✅
- `❌ Failed to send confirmation email:` ❌

## Quick Diagnostic Checklist

- [ ] Visit `/api/email-diagnostic` - shows configuration status
- [ ] Check Vercel function logs for `/api/waitlist-simple`
- [ ] Verify all 7 environment variables are set in Vercel
- [ ] Confirm App Password has no spaces: `ggbljzczzvhsuvci`
- [ ] Verify `EMAIL_SERVER_USER` matches Gmail account
- [ ] Check that 2-Step Verification is enabled
- [ ] Test email sending with `/api/test-email` endpoint
- [ ] Check spam folders for test emails
- [ ] Verify Gmail sent folder shows emails were sent

## Next Steps

After checking the diagnostic endpoint and logs, share the results and I can help fix the specific issue!

