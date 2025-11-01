# 🚨 Quick Fix: QR Code Not Working

## Problem
QR code is not generating because R2 environment variables are missing from your **local** `.env.local` file.

## Solution

### Step 1: Create/Update `.env.local`

Copy these lines into your `.env.local` file (in the project root):

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id_from_cloudflare
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=look-i-tried
CLOUDFLARE_R2_PUBLIC_URL=https://pub-your_account_id.r2.dev

# OpenAI API Key (if you want AI generation)
OPENAI_API_KEY=your_openai_api_key
```

**Note:** Check `.env.local.INSTRUCTIONS` file in your project root for the actual values to copy.

### Step 2: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test R2 Connection

```bash
node test-r2.js
```

You should see:
```
✅ Connection successful!
✅ Upload successful!
✅ Public access is configured correctly!
```

### Step 4: Test QR Code

1. Go to http://localhost:3000
2. Create an outfit
3. Click **"Generate QR Code for Mobile"**
4. QR code should appear!

---

## Why This Happened

You added the R2 environment variables to **Netlify** (for production), but they also need to be in your **local** `.env.local` file for development.

**Two Environments:**
- 🌐 **Netlify (Production)**: Uses environment variables you set in Netlify dashboard ✅
- 💻 **Local (Development)**: Uses `.env.local` file ❌ (was missing)

---

## Verify R2 Bucket Public Access

The bucket `look-i-tried` needs to have **public access enabled**:

1. Go to: Cloudflare Dashboard → R2 → Buckets → look-i-tried
2. Click **Settings** tab
3. Look for **"Public Access"** or **"R2.dev Subdomain"**
4. Make sure it's enabled
5. Verify URL matches your public URL setting

---

## Testing Checklist

- [ ] `.env.local` file created with all 5 R2 variables
- [ ] Dev server restarted
- [ ] `node test-r2.js` shows all ✅
- [ ] R2 bucket has public access enabled
- [ ] QR code generates successfully
- [ ] Netlify has same variables (already done ✅)

---

## Still Not Working?

Check browser console for errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Click "Generate QR Code"
4. Look for red errors
5. Share the error message

Common issues:
- `403 Forbidden` → Bucket not public
- `NoSuchBucket` → Bucket name wrong
- `InvalidAccessKeyId` → Access key wrong
- `SignatureDoesNotMatch` → Secret key wrong

