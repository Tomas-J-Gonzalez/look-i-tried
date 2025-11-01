"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

/**
 * QRDownload Component
 * 
 * Generates a QR code for downloading canvas images on mobile devices
 * 
 * Features:
 * - Small images: Encoded directly in QR code as base64
 * - Large images: Uploaded to cloud storage, URL in QR code
 * - Desktop fallback: Direct download button
 */

interface QRDownloadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fileName?: string;
  maxDirectSize?: number; // Max size in bytes for direct QR encoding (default: 2KB)
  onUploadNeeded?: (blob: Blob) => Promise<string>; // Upload function that returns URL
}

export default function QRDownload({
  canvasRef,
  fileName = "my-outfit",
  maxDirectSize = 2048, // 2KB default
  onUploadNeeded,
}: QRDownloadProps) {
  const [qrValue, setQrValue] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [qrMode, setQrMode] = useState<"direct" | "url" | null>(null);

  const generateQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Canvas not available");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });

      // Check blob size
      const blobSize = blob.size;
      console.log(`📊 Image size: ${(blobSize / 1024).toFixed(2)} KB`);

      // For QR codes, we need short URLs
      // Images are almost always too large for direct QR encoding
      
      if (!onUploadNeeded) {
        // No upload handler - show error
        throw new Error("Image too large for QR code. Cloud upload required but not configured. Please configure Cloudflare R2.");
      }

      try {
        // Try to upload to cloud storage
        const uploadedUrl = await onUploadNeeded(blob);
        
        // Verify we got a real URL (not a data URL)
        if (uploadedUrl.startsWith('data:')) {
          throw new Error("Cloud upload not available. Configure Cloudflare R2 to enable QR downloads.");
        }
        
        setQrValue(uploadedUrl);
        setDownloadUrl(uploadedUrl);
        setQrMode("url");
        console.log("✅ QR code ready with cloud URL");
        
      } catch (err) {
        // Upload failed - show helpful error
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        throw new Error(`QR download requires cloud upload. ${errorMsg}`);
      }

      setIsGenerating(false);
    } catch (err) {
      console.error("QR code generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate QR code");
      setIsGenerating(false);
    }
  };

  const handleDirectDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `${fileName}-${timestamp}.png`;
    link.href = downloadUrl;
    link.click();
  };

  // Auto-generate when component mounts or canvas changes
  useEffect(() => {
    if (canvasRef.current) {
      generateQRCode();
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
      {/* QR Code Display */}
      {isGenerating && (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Generating QR code...</p>
        </div>
      )}

      {error && (
        <div className="text-sm bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <p className="font-semibold text-orange-900 mb-2">📱 QR Download Unavailable</p>
          <p className="text-xs text-orange-700 mb-3">
            Cloud storage (Cloudflare R2) is not configured. QR downloads require uploading images to a public URL.
          </p>
          <p className="text-xs text-gray-600">
            💡 <strong>Workaround:</strong> Use the "Download PNG" button above to save directly to this device.
          </p>
          <details className="mt-3 text-xs text-gray-600">
            <summary className="cursor-pointer font-medium text-orange-700">Show setup instructions</summary>
            <p className="mt-2">
              To enable QR downloads, add Cloudflare R2 credentials to <code className="bg-orange-100 px-1 rounded">.env.local</code>. See <code className="bg-orange-100 px-1 rounded">R2_SETUP.md</code> for details.
            </p>
          </details>
        </div>
      )}

      {qrValue && !isGenerating && (
        <>
          {/* QR Code */}
          <div className="p-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="M" // Error correction level (L, M, Q, H)
              includeMargin={true}
            />
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="font-semibold text-gray-900 mb-1">
              📱 Scan to download your outfit
            </p>
            <p className="text-xs text-gray-500">
              {qrMode === "direct" 
                ? "Image embedded in QR code" 
                : "Scan to open download link"}
            </p>
            {qrMode === "direct" && qrValue.length > 10000 && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ Large QR code - may be slow to scan
              </p>
            )}
          </div>

          {/* Desktop Download Fallback */}
          <div className="w-full border-t border-gray-200 pt-4">
            <Button
              onClick={handleDirectDownload}
              variant="outline"
              className="w-full"
              size="sm"
            >
              💾 Download on This Device
            </Button>
          </div>

          {/* Regenerate Button */}
          <Button
            onClick={generateQRCode}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500"
          >
            🔄 Regenerate QR Code
          </Button>
        </>
      )}

      {/* Initial Generate Button */}
      {!qrValue && !isGenerating && !error && (
        <Button onClick={generateQRCode} className="w-full">
          Generate QR Code
        </Button>
      )}
    </div>
  );
}

// ============================================
// STANDALONE HELPER FUNCTION
// ============================================

/**
 * Generate QR code value from canvas
 * 
 * @param canvas - HTMLCanvasElement to encode
 * @param maxDirectSize - Max size in bytes for direct encoding
 * @param uploadFn - Optional upload function for large images
 * @returns QR code value (data URL or uploaded URL)
 */
export async function generateQRFromCanvas(
  canvas: HTMLCanvasElement,
  maxDirectSize: number = 2048,
  uploadFn?: (blob: Blob) => Promise<string>
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }

        // Small image: direct encoding
        if (blob.size <= maxDirectSize) {
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        }
        // Large image: upload required
        else if (uploadFn) {
          const url = await uploadFn(blob);
          resolve(url);
        }
        // No upload function: use data URL anyway
        else {
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        }
      }, "image/png");
    } catch (err) {
      reject(err);
    }
  });
}

