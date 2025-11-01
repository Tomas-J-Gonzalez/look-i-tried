"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface BackgroundUploaderProps {
  background: string | null;
  onBackgroundChange: (imageUrl: string | null) => void;
}

export default function BackgroundUploader({
  background,
  onBackgroundChange,
}: BackgroundUploaderProps) {
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
        onBackgroundChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onBackgroundChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
      />
      
      {background ? (
        <div className="space-y-2">
          <div className="relative w-full aspect-video rounded-md overflow-hidden border border-gray-200">
            <img
              src={background}
              alt="Background preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleButtonClick}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              Change
            </Button>
            <Button
              onClick={handleRemove}
              variant="ghost"
              size="sm"
              className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleButtonClick} className="w-full" variant="outline" size="sm">
          Upload Image
        </Button>
      )}
    </div>
  );
}

