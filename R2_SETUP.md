# Cloudflare R2 Setup Guide

## Overview
This application uses Cloudflare R2 (S3-compatible object storage) to store user-uploaded images and AI-generated outfits.

## What You Need

To complete the R2 setup, you need the following from your Cloudflare dashboard:

### 1. Account ID
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Click on "R2" in the left sidebar
- Your Account ID is shown at the top of the page

### 2. R2 API Credentials

Create an API token:
1. Go to R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. You'll get:
   - **Access Key ID** (already added: `8rch0_R8BR-ZpHst5zIXZDnCEPrV6MnZzuS7r_02`)
   - **Secret Access Key** (you need to copy this when creating the token)

### 3. Create an R2 Bucket

1. Go to R2 → Create Bucket
2. Name it: `outfit-customizer-assets` (or your preferred name)
3. Choose a location (automatic is fine)
4. Click "Create Bucket"

### 4. Enable Public Access (Optional but Recommended)

For public access to your assets:
1. Go to your bucket settings
2. Enable "Public Access"
3. Set up a custom domain or use the default R2.dev subdomain
4. Copy your public URL (e.g., `https://outfit-customizer-assets.your-account.r2.dev`)

## Configuration

Update your `.env.local` file with the following:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=8rch0_R8BR-ZpHst5zIXZDnCEPrV6MnZzuS7r_02
R2_SECRET_ACCESS_KEY=your_secret_access_key_from_cloudflare
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_BUCKET_NAME=outfit-customizer-assets
R2_PUBLIC_URL=https://your-bucket-name.r2.dev
```

## How to Get These Values

### Account ID:
1. Go to https://dash.cloudflare.com/
2. Click "R2" in sidebar
3. Look at the URL or top of page for your account ID

### Secret Access Key:
1. When you created the API token, you were shown the Secret Access Key
2. If you didn't save it, you'll need to create a new token:
   - Go to R2 → Manage R2 API Tokens
   - Delete old token
   - Create new one
   - Copy both Access Key ID and Secret Access Key

### Public URL:
1. Go to your R2 bucket
2. Click "Settings"
3. Look for "Public Bucket URL" or set up a custom domain
4. Copy the URL

## Testing

After configuration:
1. Restart your Next.js dev server
2. Upload a face photo or take a webcam photo
3. Check browser console for upload success
4. Images should be stored in your R2 bucket

## API Endpoint

- **Route**: `/api/upload-to-r2`
- **Method**: POST
- **Body**: `{ "imageData": "data:image/png;base64,...", "type": "face" }`
- **Response**: `{ "url": "https://...", "filename": "...", "success": true }`

## Current Status

✅ R2 client configured
✅ Upload API created
✅ Access Key ID added
⚠️ Need to add: Secret Access Key, Account ID, Bucket Name, Public URL

Once you add the missing credentials, the application will automatically upload all images to R2.

