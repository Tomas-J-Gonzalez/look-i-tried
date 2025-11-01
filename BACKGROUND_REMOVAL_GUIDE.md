# Background Removal Guide

## Using MediaPipe Selfie Segmentation for Background Removal

This guide shows how to integrate background removal into your existing webcam/upload flow.

---

## Installation

```bash
npm install @mediapipe/selfie_segmentation @mediapipe/camera_utils
```

---

## Option 1: Component-Based (Recommended)

### Basic Usage

```tsx
import BackgroundRemover from "@/components/BackgroundRemover";

function MyApp() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    <div>
      {/* Your existing webcam/upload component */}
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => setCapturedImage(reader.result as string);
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* Background Remover */}
      {capturedImage && (
        <BackgroundRemover
          sourceImage={capturedImage}
          onProcessed={(transparentImage) => {
            console.log("Transparent image ready:", transparentImage);
            // Use the transparent image in your app
          }}
        />
      )}
    </div>
  );
}
```

---

## Option 2: Function-Based (Advanced)

### Direct Function Call

```tsx
import { removeBackgroundFromImage } from "@/components/BackgroundRemover";

async function handleImageCapture(imageDataUrl: string) {
  try {
    // Remove background
    const transparentImage = await removeBackgroundFromImage(imageDataUrl);
    
    // Use the result
    console.log("Background removed:", transparentImage);
    setFaceImage(transparentImage); // Update your state
    
  } catch (error) {
    console.error("Failed to remove background:", error);
  }
}
```

---

## Integration with Existing NavBarFaceUploader

### Update your webcam capture flow:

```tsx
// In NavBarFaceUploader.tsx

import { removeBackgroundFromImage } from "@/components/BackgroundRemover";

const capturePhoto = async () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw video frame to canvas
  ctx.drawImage(video, 0, 0);

  // Get image data
  const capturedImageUrl = canvas.toDataURL("image/png");

  try {
    setIsProcessing(true);
    
    // Remove background
    const transparentImage = await removeBackgroundFromImage(capturedImageUrl);
    
    // Use the transparent image
    onFaceImageChange(transparentImage);
    
    setIsProcessing(false);
    stopWebcam();
    setShowWebcam(false);
    
  } catch (error) {
    console.error("Background removal failed:", error);
    // Fallback to original image
    onFaceImageChange(capturedImageUrl);
    setIsProcessing(false);
  }
};
```

---

## Standalone HTML Example (No React)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Background Removal</title>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation"></script>
</head>
<body>
  <input type="file" id="imageInput" accept="image/*">
  <canvas id="canvas" style="border: 1px solid #ccc;"></canvas>
  <button id="removeBtn">Remove Background</button>
  <button id="downloadBtn" style="display:none;">Download PNG</button>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageInput = document.getElementById('imageInput');
    const removeBtn = document.getElementById('removeBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    let loadedImage = null;

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          loadedImage = img;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    removeBtn.addEventListener('click', async () => {
      if (!loadedImage) return;

      removeBtn.textContent = 'Processing...';
      removeBtn.disabled = true;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
      });

      selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: true,
      });

      let mask = null;

      selfieSegmentation.onResults((results) => {
        if (results.segmentationMask) {
          mask = results.segmentationMask;
        }
      });

      await selfieSegmentation.send({ image: loadedImage });
      await new Promise(resolve => setTimeout(resolve, 500));

      if (mask) {
        const outputData = ctx.createImageData(canvas.width, canvas.height);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          const maskValue = mask.data[(i / 4) * 4];
          outputData.data[i] = imageData.data[i];
          outputData.data[i + 1] = imageData.data[i + 1];
          outputData.data[i + 2] = imageData.data[i + 2];
          outputData.data[i + 3] = maskValue;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(outputData, 0, 0);
        
        downloadBtn.style.display = 'block';
      }

      removeBtn.textContent = 'Remove Background';
      removeBtn.disabled = false;
      selfieSegmentation.close();
    });

    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'transparent-face.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  </script>
</body>
</html>
```

---

## Tips & Best Practices

### 1. **Performance**
- Processing takes ~500ms-1s per image
- Show a loading indicator during processing
- Consider processing after capture, not during live preview

### 2. **Image Quality**
- Best results with well-lit, front-facing photos
- Avoid busy backgrounds for cleaner results
- Higher resolution = better segmentation

### 3. **Error Handling**
```tsx
try {
  const result = await removeBackgroundFromImage(image);
  setProcessedImage(result);
} catch (error) {
  console.error("Background removal failed:", error);
  // Fallback: use original image
  setProcessedImage(image);
}
```

### 4. **Model Selection**
```tsx
selfieSegmentation.setOptions({
  modelSelection: 0, // 0 = general (faster)
  modelSelection: 1, // 1 = landscape (better quality)
  selfieMode: true,  // Mirror for front camera
});
```

### 5. **Memory Management**
Always close the segmentation instance when done:
```tsx
selfieSegmentation.close();
```

---

## Common Issues

### Issue: "Module not found: @mediapipe/selfie_segmentation"
**Solution:** Install the package:
```bash
npm install @mediapipe/selfie_segmentation
```

### Issue: "Failed to load model files"
**Solution:** Use CDN for model files:
```tsx
locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
}
```

### Issue: "CORS errors"
**Solution:** Ensure images have `crossOrigin = "anonymous"` set

### Issue: "Slow performance"
**Solution:** 
- Use modelSelection: 0 for faster processing
- Process images at lower resolution
- Show loading indicator

---

## Next.js Config (if needed)

If you encounter build errors, add to `next.config.ts`:

```ts
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mediapipe/selfie_segmentation': '@mediapipe/selfie_segmentation',
    };
    return config;
  },
};
```

---

## Testing

Test with different scenarios:
- ✅ Well-lit face
- ✅ Side profile
- ✅ Multiple people (segments closest)
- ✅ Busy background
- ✅ Low light

---

Happy hacking! 🚀

