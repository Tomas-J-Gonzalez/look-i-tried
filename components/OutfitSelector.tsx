"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OutfitSelectorProps {
  category: "shirts" | "pants" | "shoes" | "headwear";
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
}

export default function OutfitSelector({
  category,
  options,
  selected,
  onSelect,
}: OutfitSelectorProps) {
  const categoryLabel =
    category.charAt(0).toUpperCase() + category.slice(1, -1);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (src: string) => {
    setFailedImages((prev) => new Set(prev).add(src));
  };

  const getFallbackPath = (src: string): string => {
    return src.replace('.png', '.svg');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {options.map((option, index) => {
          const isSelected = selected === option;
          const imageFailed = failedImages.has(option);
          const displaySrc = imageFailed ? getFallbackPath(option) : option;

          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={`relative aspect-square border-2 rounded-md overflow-hidden transition-all ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={displaySrc}
                alt={`${categoryLabel} ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(option)}
              />
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-15">
                  <div className="absolute top-1 right-1 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

