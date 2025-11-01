"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FaceUploaderProps {
  onFaceUploaded: (imageUrl: string) => void;
}

export default function FaceUploader({ onFaceUploaded }: FaceUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setPreview(result);
        onFaceUploaded(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload Your Face</h2>
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
        />
        <Button onClick={handleButtonClick} className="w-full max-w-xs">
          Choose Photo
        </Button>
        {preview && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300">
            <img
              src={preview}
              alt="Face preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {!preview && (
          <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <span className="text-sm text-gray-400">No image</span>
          </div>
        )}
      </div>
    </div>
  );
}

