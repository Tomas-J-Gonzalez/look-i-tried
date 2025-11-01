"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NavBarFaceUploaderProps {
  faceImage: string | null;
  onFaceUploaded: (imageUrl: string) => void;
  onRemoveFace: () => void;
}

export default function NavBarFaceUploader({
  faceImage,
  onFaceUploaded,
  onRemoveFace,
}: NavBarFaceUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        alert("Please upload a JPG or PNG image");
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onFaceUploaded(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
      });
      setStream(mediaStream);
      setShowWebcam(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing webcam:", error);
      alert("Could not access webcam. Please check your camera permissions.");
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowWebcam(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      console.error("Video or canvas ref not available");
      return;
    }

    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      alert("Camera is still loading. Please wait a moment and try again.");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Could not get canvas context");
      return;
    }

    try {
      setIsProcessing(true);

      // Use video's native dimensions - NO scaling, NO distortion
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // Set canvas to exact video dimensions
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw video frame at native resolution (1:1, no transformation)
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Get image data before background removal
      const originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Load MediaPipe Selfie Segmentation
      const { SelfieSegmentation } = await import("@mediapipe/selfie_segmentation");

      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        },
      });

      selfieSegmentation.setOptions({
        modelSelection: 1, // 1 = landscape mode (better quality)
        selfieMode: true,
      });

      // Process the image
      let segmentationMask: any = null;

      selfieSegmentation.onResults((results) => {
        if (results.segmentationMask) {
          segmentationMask = results.segmentationMask;
        }
      });

      // Send current canvas image to MediaPipe
      await selfieSegmentation.send({ image: canvas });

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!segmentationMask) {
        throw new Error("Failed to generate segmentation mask");
      }

      // Apply mask to create transparent background
      const outputData = context.createImageData(canvas.width, canvas.height);
      
      for (let i = 0; i < originalImageData.data.length; i += 4) {
        const maskValue = segmentationMask.data[(i / 4) * 4]; // R channel of mask
        
        // Copy RGB values
        outputData.data[i] = originalImageData.data[i];         // R
        outputData.data[i + 1] = originalImageData.data[i + 1]; // G
        outputData.data[i + 2] = originalImageData.data[i + 2]; // B
        
        // Set alpha based on mask (255 = person, 0 = background)
        outputData.data[i + 3] = maskValue;
      }

      // Draw the transparent image
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.putImageData(outputData, 0, 0);

      // Convert to base64 PNG
      const transparentImageData = canvas.toDataURL("image/png");
      
      // Upload the transparent image
      onFaceUploaded(transparentImageData);

      // Clean up
      selfieSegmentation.close();
      stopWebcam();
      setIsProcessing(false);

    } catch (error) {
      console.error("Error processing image:", error);
      
      // Fallback: use original image without background removal
      const imageData = canvas.toDataURL("image/png");
      onFaceUploaded(imageData);
      
      stopWebcam();
      setIsProcessing(false);
      
      alert("Background removal failed. Using original image.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <>
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
        />
        {faceImage ? (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
              <img
                src={faceImage}
                alt="Face preview"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              onClick={handleButtonClick}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Change Photo
            </Button>
            <Button
              onClick={onRemoveFace}
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button onClick={handleButtonClick} size="sm" variant="outline">
              Upload Photo
            </Button>
            <Button onClick={startWebcam} size="sm">
              Take Photo
            </Button>
          </div>
        )}
      </div>

      {/* Webcam Modal */}
      {showWebcam && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Take Your Photo</h2>
            <p className="text-sm text-gray-600 mb-4">Position your face inside the circle</p>
            <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="rounded-lg max-w-full"
                style={{ 
                  display: 'block',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '70vh'
                }}
              />
              {/* Face Guide Overlay - Matches actual capture area */}
              <div className="absolute inset-0 pointer-events-none">
                {/* SVG Overlay with oval cutout */}
                <svg 
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <mask id="faceGuideMask">
                      {/* White background */}
                      <rect width="100%" height="100%" fill="white"/>
                      {/* Black oval - this creates the transparent area */}
                      {/* Positioned to match the face clipping in preview (52x60 ellipse at 200,140 on 400x600 canvas) */}
                      <ellipse 
                        cx="50%" 
                        cy="40%" 
                        rx="120" 
                        ry="140" 
                        fill="black"
                      />
                    </mask>
                  </defs>
                  {/* Dark overlay with mask */}
                  <rect 
                    width="100%" 
                    height="100%" 
                    fill="rgba(0,0,0,0.6)" 
                    mask="url(#faceGuideMask)"
                  />
                  {/* Dashed oval border guide */}
                  <ellipse 
                    cx="50%" 
                    cy="40%" 
                    rx="120" 
                    ry="140"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                    style={{ 
                      filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
                      animation: 'guidePulse 2s ease-in-out infinite'
                    }}
                  />
                </svg>
                
                {/* Helper text */}
                <div className="absolute top-4 left-0 right-0 text-center">
                  <div className="inline-block bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                    👤 Fit your face in the oval
                  </div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <Button onClick={stopWebcam} variant="outline" disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={capturePhoto} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Removing Background...
                  </>
                ) : (
                  "Capture Photo"
                )}
              </Button>
            </div>
          </div>
          
          {/* Guide animations */}
          <style jsx>{`
            @keyframes guidePulse {
              0%, 100% {
                opacity: 1;
                stroke-width: 3;
              }
              50% {
                opacity: 0.7;
                stroke-width: 4;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

