# QR Code Download Guide

## Overview

Allow users to download their outfit images by scanning a QR code on their phone.

---

## Installation

```bash
npm install qrcode.react @aws-sdk/client-s3
```

---

## Quick Integration

### Option 1: Add to PreviewCanvas Component

Update `components/PreviewCanvas.tsx` to include QR download:

```tsx
import QRDownload from "@/components/QRDownload";

// In your PreviewCanvas component:
<div className="space-y-4">
  {/* Existing canvas */}
  <canvas ref={canvasRef} />
  
  {/* QR Download - only show when outfit is complete */}
  {isCompleteOutfit && (
    <QRDownload
      canvasRef={canvasRef}
      fileName="my-outfit"
      onUploadNeeded={async (blob) => {
        // Upload to Cloudflare R2
        const formData = new FormData();
        formData.append('image', blob);
        
        const response = await fetch('/api/upload-to-r2', {
          method: 'POST',
          body: JSON.stringify({
            imageData: await blobToBase64(blob)
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        return data.url;
      }}
    />
  )}
</div>

// Helper function
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Cloudflare R2 Configuration (for large images)
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=outfit-images
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
```

---

## How It Works

### Small Images (< 2KB)
1. Canvas converted to PNG data URL
2. Data URL encoded directly in QR code
3. User scans QR → Image downloads immediately
4. **No server needed!**

### Large Images (> 2KB)
1. Canvas converted to PNG blob
2. Uploaded to Cloudflare R2
3. Public URL encoded in QR code
4. User scans QR → Opens download link
5. **Better for high-resolution images**

---

## Usage Examples

### Example 1: Basic Usage (Small Images Only)

```tsx
import QRDownload from "@/components/QRDownload";

<QRDownload canvasRef={myCanvasRef} />
```

### Example 2: With Cloud Upload (Recommended)

```tsx
<QRDownload
  canvasRef={myCanvasRef}
  fileName="my-awesome-outfit"
  maxDirectSize={2048} // 2KB threshold
  onUploadNeeded={async (blob) => {
    // Your upload logic
    const response = await fetch('/api/upload-to-r2', {
      method: 'POST',
      body: JSON.stringify({
        imageData: await blobToDataURL(blob)
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.url;
  }}
/>
```

### Example 3: Standalone Function

```tsx
import { generateQRFromCanvas } from "@/components/QRDownload";

const qrValue = await generateQRFromCanvas(
  canvasElement,
  2048, // max direct size
  async (blob) => {
    // Upload and return URL
    return "https://cdn.example.com/image.png";
  }
);

// Use qrValue with any QR library
<QRCodeSVG value={qrValue} size={200} />
```

---

## Cloudflare R2 Setup

### 1. Create R2 Bucket

```bash
# Via Cloudflare Dashboard:
1. Go to R2 Object Storage
2. Create new bucket: "outfit-images"
3. Set public access (optional)
```

### 2. Get API Credentials

```bash
1. Go to R2 > Manage R2 API Tokens
2. Create API Token with:
   - Permission: Object Read & Write
   - Bucket: outfit-images
3. Copy Access Key ID and Secret Access Key
```

### 3. Configure Public URL (Optional)

For custom domain:
```bash
1. Go to R2 > Your Bucket > Settings
2. Add Custom Domain
3. Point DNS to Cloudflare
4. Use: https://outfits.yourdomain.com
```

Or use default R2.dev URL:
```bash
https://pub-ACCOUNT_ID.r2.dev/
```

---

## Integration with Current App

Add to `components/PreviewCanvas.tsx` after the Download PNG button:

```tsx
{/* Download Buttons */}
<div className="w-full max-w-xs mx-auto space-y-2">
  <div className="flex gap-2">
    <Button
      onClick={handleExport}
      disabled={isExporting || !isCompleteOutfit}
      variant="outline"
      size="sm"
      className="flex-1 text-sm"
    >
      {isExporting ? "Downloading..." : "Download PNG"}
    </Button>
    
    <Button
      onClick={onClearCanvas}
      variant="outline"
      size="sm"
      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
    >
      Reset Canvas
    </Button>
  </div>
  
  {!isCompleteOutfit && (
    <p className="text-xs text-center text-gray-400">
      Complete your outfit to download
    </p>
  )}
</div>

{/* QR Code Download - NEW */}
{isCompleteOutfit && (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <QRDownload 
      canvasRef={canvasRef}
      fileName="my-outfit"
      onUploadNeeded={async (blob) => {
        // Convert blob to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        // Upload to R2
        const response = await fetch('/api/upload-to-r2', {
          method: 'POST',
          body: JSON.stringify({ imageData: base64 }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const data = await response.json();
        return data.url;
      }}
    />
  </div>
)}
```

---

## Customization

### QR Code Styling

```tsx
<QRCodeSVG
  value={qrValue}
  size={256}              // Size in pixels
  bgColor="#ffffff"       // Background color
  fgColor="#000000"       // Foreground color
  level="H"               // Error correction (L=7%, M=15%, Q=25%, H=30%)
  includeMargin={true}    // Add white margin
  imageSettings={{        // Optional logo in center
    src: "/logo.png",
    x: undefined,
    y: undefined,
    height: 24,
    width: 24,
    excavate: true,
  }}
/>
```

### Error Correction Levels

- **L (Low)**: 7% - Smaller QR code, less robust
- **M (Medium)**: 15% - Balanced (recommended)
- **Q (Quartile)**: 25% - More robust
- **H (High)**: 30% - Most robust, larger QR code

### Size Thresholds

```tsx
// Very small images only
maxDirectSize={1024} // 1KB

// Standard (recommended)
maxDirectSize={2048} // 2KB

// Larger direct encoding (slower scanning)
maxDirectSize={4096} // 4KB
```

---

## Testing

### Test Direct Encoding
```tsx
// Create small test canvas
const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);

// Should use direct encoding
<QRDownload canvasRef={{ current: canvas }} />
```

### Test Cloud Upload
```tsx
// Create large test canvas
const canvas = document.createElement('canvas');
canvas.width = 600;
canvas.height = 600;
// ... draw complex image ...

// Should trigger upload
<QRDownload 
  canvasRef={{ current: canvas }}
  onUploadNeeded={yourUploadFunction}
/>
```

---

## Mobile Testing

1. **iPhone**: Open Camera app → Point at QR code → Tap notification
2. **Android**: Open Camera or Google Lens → Scan QR code
3. **Both**: Should download image or open download link

---

## Troubleshooting

### Issue: QR code won't scan
**Solution**: 
- Increase size: `<QRCodeSVG size={300} />`
- Increase error correction: `level="H"`
- Ensure good contrast (black on white)

### Issue: "Image too large" warning
**Solution**: 
- Implement upload function
- Or increase `maxDirectSize` (not recommended > 4KB)

### Issue: Upload fails
**Solution**:
- Check R2 credentials in `.env.local`
- Verify bucket permissions
- Check network tab for errors

### Issue: CORS errors on mobile
**Solution**:
- Ensure R2 bucket has CORS enabled
- Add CORS headers to bucket

---

## Production Checklist

- [ ] R2 credentials configured
- [ ] Bucket created and accessible
- [ ] Public URL or custom domain set up
- [ ] CORS configured on R2 bucket
- [ ] Error handling implemented
- [ ] Tested on iOS and Android
- [ ] File size limits appropriate
- [ ] Expiration policy set (optional)

---

## Advanced: Auto-Expiring Links

Add expiration to R2 uploads:

```tsx
// In upload-to-r2/route.ts
const command = new PutObjectCommand({
  Bucket: R2_BUCKET_NAME,
  Key: key,
  Body: buffer,
  ContentType: "image/png",
  // Auto-delete after 7 days
  Metadata: {
    'expiry': (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
  }
});
```

Set up R2 lifecycle rules to delete expired objects.

---

## Security Notes

1. **Rate limiting**: Add rate limiting to prevent abuse
2. **File size limits**: Validate max upload size (e.g., 5MB)
3. **Content validation**: Verify it's actually an image
4. **Authentication**: Consider requiring auth for uploads

---

Happy hacking! 🚀📱

