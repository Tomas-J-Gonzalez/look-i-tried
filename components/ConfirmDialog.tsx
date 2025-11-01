"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmDialogProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const iconColors = {
    danger: "text-red-600",
    warning: "text-orange-600",
    info: "text-blue-600",
  };

  const buttonColors = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="flex items-center justify-center pt-6 pb-4">
          <div className={`rounded-full bg-opacity-10 p-3 ${type === 'danger' ? 'bg-red-600' : type === 'warning' ? 'bg-orange-600' : 'bg-blue-600'}`}>
            {type === "danger" && (
              <svg className={`w-8 h-8 ${iconColors[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {type === "warning" && (
              <svg className={`w-8 h-8 ${iconColors[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === "info" && (
              <svg className={`w-8 h-8 ${iconColors[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`flex-1 text-white ${buttonColors[type]} focus:ring-2 focus:ring-offset-2`}
            >
              {confirmText}
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

