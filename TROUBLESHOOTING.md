# Troubleshooting Guide

## 🐛 Common Issues

### Issue: Download PNG Shows Empty Canvas

**Symptoms:**
- Click "Download PNG" → Gets white/blank image
- Canvas shows outfit correctly but export is empty

**Fix:**
✅ **Already fixed in latest version!** Make sure you've deployed the latest code.

**Verify fix:**
1. Check browser console for errors
2. Try downloading again
3. Should see your complete outfit in downloaded file

---

### Issue: QR Code Not Working

**Symptoms:**
- Click "Generate QR Code" → Error message
- QR code doesn't appear
- Error: "R2 not configured"

**Check these in order:**

#### **1. Verify Netlify Environment Variables**

Go to: **Netlify Dashboard** → Your site → **Site settings** → **Environment variables**

**Required variables (all 5):**
```
✅ CLOUDFLARE_R2_ACCOUNT_ID=275a2a3ef0756795bc833d943dfc67d3
✅ CLOUDFLARE_R2_ACCESS_KEY_ID=e3ee0dc1a8da79072e10a01f5fc4bcde
✅ CLOUDFLARE_R2_SECRET_ACCESS_KEY=9166eca5c46308048ef53018e7955b5f6c8ef087f8e2815265c4e9e3906545d8
✅ CLOUDFLARE_R2_BUCKET_NAME=look-i-tried
✅ CLOUDFLARE_R2_PUBLIC_URL=https://pub-275a2a3ef0756795bc833d943dfc67d3.r2.dev
```

**After adding variables:**
- Click **"Save"**
- Netlify will auto-redeploy
- **Wait for deployment to finish** (2-3 minutes)

#### **2. Enable Public Access on R2 Bucket**

**Steps:**
1. Go to: https://dash.cloudflare.com/275a2a3ef0756795bc833d943dfc67d3/r2/default/buckets/look-i-tried
2. Click **"Settings"** tab
3. Find **"Public Access"** section
4. Click **"Allow Access"** or **"Connect Domain"**
5. Choose **"R2.dev Subdomain"**
6. Verify URL matches what you put in Netlify

**If you can't find this setting:**
- The bucket might not have public access enabled
- Try clicking around for "Domain", "Connect Domain", or "Public Access"
- You might need to enable it from the R2 overview page

#### **3. Test the API Route Directly**

After Netlify deploys, test the upload:

1. Open browser console (F12)
2. Go to your deployed site
3. Run this in console:
```javascript
fetch('https://your-site.netlify.app/api/upload-to-r2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' 
  })
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

**Expected response:**
```json
{ "url": "https://pub-275a2a3ef0756795bc833d943dfc67d3.r2.dev/outfits/123456-abc.png" }
```

**If you get error:**
- Check Netlify function logs
- Verify env variables are set
- Check R2 credentials are correct

#### **4. Check Netlify Function Logs**

1. Go to Netlify Dashboard
2. Click on your site
3. Go to **"Functions"** tab
4. Look for `upload-to-r2`
5. Click on it to see logs
6. Try generating QR code on your site
7. Check logs for errors

---

### Issue: Background Removal Not Working

**Symptoms:**
- Webcam capture doesn't remove background
- Takes photo with background still visible

**Status:**
✅ Background removal is working! It uses MediaPipe Selfie Segmentation.

**If not working:**
- Check browser console for errors
- May take 1-2 seconds to process
- Button shows "Removing Background..." while processing
- Falls back to original image if it fails

---

### Issue: Multi-Select Not Working

**Symptoms:**
- Shift+Click doesn't select multiple items
- Can't move multiple items together

**Fix:**
- Make sure you're using Shift, Cmd (Mac), or Ctrl (Windows) while clicking
- Or drag on empty canvas to create selection box
- Selected items show blue bounding boxes

---

### Issue: Netlify Build Fails

**Recent fixes applied:**
✅ OpenAI client initialization moved to runtime
✅ TypeScript errors fixed (segmentationMask, OutfitSelector)
✅ Unused Supabase files removed

**If still failing:**
1. Check Netlify build logs
2. Look for the specific error
3. Share the error message

---

## 🔍 **Debug QR Code Issue**

### **Check Browser Console:**

When you click "Generate QR Code for Mobile":

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click the QR button
4. Look for messages:
   - `📊 Image size: XX.XX KB` ← Should see this
   - `⚠️ R2 upload not available` ← Bad (means env vars not working)
   - `✅ QR code ready with cloud URL` ← Good!
   - `❌ R2 upload error: ...` ← Check the error message

### **Check Network Tab:**

1. Open DevTools → Network tab
2. Click QR button
3. Look for `/api/upload-to-r2` request
4. Check:
   - Status: Should be 200
   - Response: Should have `{ url: "https://..." }`
   - If 503: Env vars not loaded yet
   - If 500: Upload failed (check credentials)

---

## ✅ **Confirmed Working:**

**Desktop Download (PNG):** ✅ Fixed and pushed to GitHub
- Downloads complete outfit with all items
- Preserves custom aspect ratios
- Works immediately

---

## 🎯 **Next Steps for QR Code:**

1. **Verify Netlify redeployed** after you added env vars
2. **Check function logs** in Netlify dashboard
3. **Test with browser console** (instructions above)
4. **Share any error messages** you see

The code is correct - if it's not working, it's likely:
- Env vars not loaded yet (needs redeploy)
- R2 bucket not publicly accessible
- Wrong credentials

Let me know what you see in the console/network tab! 🔍

