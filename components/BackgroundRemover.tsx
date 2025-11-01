"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * BackgroundRemover Component
 * 
 * Takes a face image and removes the background using MediaPipe Selfie Segmentation
 * 
 * Usage:
 * <BackgroundRemover 
 *   sourceImage={imageDataUrl} 
 *   onProcessed={(transparentImageUrl) => console.log(transparentImageUrl)} 
 * />
 */

interface BackgroundRemoverProps {
  sourceImage: string | null; // Data URL or image URL
  onProcessed?: (transparentImageUrl: string) => void;
  width?: number;
  height?: number;
}

export default function BackgroundRemover({
  sourceImage,
  onProcessed,
  width = 400,
  height = 400,
}: BackgroundRemoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const removeBackground = async () => {
    if (!sourceImage || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Load MediaPipe Selfie Segmentation
      const { SelfieSegmentation } = await import("@mediapipe/selfie_segmentation");
      const { Camera } = await import("@mediapipe/camera_utils");

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Load the source image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = sourceImage;
      });

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Initialize MediaPipe Selfie Segmentation
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        },
      });

      // Configure the model (0 = general, 1 = landscape/portrait)
      selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: true,
      });

      // Process the image
      let segmentationMask: any = null;

      selfieSegmentation.onResults((results) => {
        if (results.segmentationMask) {
          segmentationMask = results.segmentationMask;
        }
      });

      // Send image to MediaPipe
      await selfieSegmentation.send({ image: img });

      // Wait a bit for processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!segmentationMask) {
        throw new Error("Failed to generate segmentation mask");
      }

      // Create transparent image using the mask
      const outputData = ctx.createImageData(canvas.width, canvas.height);
      
      // The mask is a single channel where white (255) = person, black (0) = background
      for (let i = 0; i < imageData.data.length; i += 4) {
        const maskIndex = i / 4;
        const maskValue = segmentationMask.data[maskIndex * 4]; // R channel of mask
        
        // Copy RGB values
        outputData.data[i] = imageData.data[i];     // R
        outputData.data[i + 1] = imageData.data[i + 1]; // G
        outputData.data[i + 2] = imageData.data[i + 2]; // B
        
        // Set alpha based on mask (255 = fully visible, 0 = fully transparent)
        outputData.data[i + 3] = maskValue;
      }

      // Draw the transparent image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(outputData, 0, 0);

      // Convert to data URL
      const transparentImageUrl = canvas.toDataURL("image/png");
      setProcessedImage(transparentImageUrl);

      // Callback with result
      if (onProcessed) {
        onProcessed(transparentImageUrl);
      }

      // Clean up
      selfieSegmentation.close();

    } catch (err) {
      console.error("Background removal error:", err);
      setError(err instanceof Error ? err.message : "Failed to remove background");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.download = `no-bg-${Date.now()}.png`;
    link.href = processedImage;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {/* Original Image Preview */}
        {sourceImage && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Original Image:</p>
            <img 
              src={sourceImage} 
              alt="Original" 
              className="max-w-xs border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Process Button */}
        {sourceImage && !processedImage && (
          <Button
            onClick={removeBackground}
            disabled={isProcessing}
            className="w-full max-w-xs"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Remove Background"
            )}
          </Button>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            ❌ {error}
          </div>
        )}

        {/* Result Canvas */}
        <div>
          {processedImage && <p className="text-sm text-gray-600 mb-2">Transparent Result:</p>}
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`border border-gray-300 rounded ${processedImage ? 'block' : 'hidden'}`}
            style={{
              background: 'repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 20px 20px'
            }}
          />
        </div>

        {/* Download Button */}
        {processedImage && (
          <Button
            onClick={downloadImage}
            variant="outline"
            className="w-full max-w-xs"
          >
            Download Transparent PNG
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 max-w-md mx-auto space-y-1">
        <p>💡 This uses MediaPipe Selfie Segmentation</p>
        <p>💡 Processing happens entirely in your browser</p>
        <p>💡 Best results with clear, well-lit face photos</p>
      </div>
    </div>
  );
}

// ============================================
// ALTERNATIVE: Standalone Function Version
// ============================================

/**
 * Standalone function to remove background from an image
 * 
 * @param imageSource - Image element, canvas, or data URL
 * @returns Promise<string> - Data URL of transparent PNG
 */
export async function removeBackgroundFromImage(
  imageSource: string | HTMLImageElement | HTMLCanvasElement
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const { SelfieSegmentation } = await import("@mediapipe/selfie_segmentation");
      
      // Create a canvas for processing
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Load image if it's a URL
      let img: HTMLImageElement | HTMLCanvasElement;
      if (typeof imageSource === "string") {
        const imgElement = new Image();
        imgElement.crossOrigin = "anonymous";
        await new Promise((res, rej) => {
          imgElement.onload = res;
          imgElement.onerror = rej;
          imgElement.src = imageSource;
        });
        img = imgElement;
      } else {
        img = imageSource;
      }

      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Initialize MediaPipe
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        },
      });

      selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: true,
      });

      let segmentationMask: any = null;

      selfieSegmentation.onResults((results) => {
        if (results.segmentationMask) {
          segmentationMask = results.segmentationMask;
        }
      });

      await selfieSegmentation.send({ image: img as HTMLImageElement });
      await new Promise((res) => setTimeout(res, 500));

      if (!segmentationMask) {
        throw new Error("Failed to generate mask");
      }

      // Apply mask
      const outputData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const maskValue = segmentationMask.data[(i / 4) * 4];
        outputData.data[i] = imageData.data[i];
        outputData.data[i + 1] = imageData.data[i + 1];
        outputData.data[i + 2] = imageData.data[i + 2];
        outputData.data[i + 3] = maskValue;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(outputData, 0, 0);

      const result = canvas.toDataURL("image/png");
      selfieSegmentation.close();
      
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

