"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AIPromptInputProps {
  onGenerate: (shirtUrl: string, pantsUrl: string, prompt: string) => void;
}

export default function AIPromptInput({ onGenerate }: AIPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWithPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    setPrompt(promptText);
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptText.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate outfit");
      }

      if (data.shirtUrl && data.pantsUrl) {
        // Convert external URLs to data URLs for canvas compatibility
        const [shirtResponse, pantsResponse] = await Promise.all([
          fetch("/api/proxy-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: data.shirtUrl }),
          }),
          fetch("/api/proxy-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: data.pantsUrl }),
          }),
        ]);

        const shirtData = await shirtResponse.json();
        const pantsData = await pantsResponse.json();

        if (shirtData.dataUrl && pantsData.dataUrl) {
          onGenerate(shirtData.dataUrl, pantsData.dataUrl, promptText);
          setPrompt("");
        } else {
          throw new Error("Failed to process generated images");
        }
      } else {
        throw new Error("No clothing items returned");
      }
    } catch (error: any) {
      console.error("Error generating outfit:", error);
      setError(error.message || "Failed to generate outfit. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateWithPrompt(prompt);
  };

  const handleQuickPrompt = async (promptText: string) => {
    await generateWithPrompt(promptText);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">AI Outfit Generator</h2>
      <p className="text-sm text-gray-600">
        Generate custom clothing and apply it to your character
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'spooky Halloween themed' or 'professional business casual'"
            className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isGenerating}
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-700">Generating outfit...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Prompts */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickPrompt("create a spooky Halloween outfit")}
            className="px-3 py-1.5 text-xs border border-gray-300 hover:border-gray-400 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isGenerating}
          >
            create spooky fit
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("create a swaggy street style outfit")}
            className="px-3 py-1.5 text-xs border border-gray-300 hover:border-gray-400 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isGenerating}
          >
            create swaggy fit
          </button>
        </div>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        <Button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? "Generating & Applying..." : "Generate & Apply to Character"}
        </Button>
      </form>
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-semibold">Tips:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Be specific about colors and styles</li>
          <li>Mention shirt and pants separately</li>
          <li>Include style preferences (casual, formal, etc.)</li>
          <li>Example: "Blue denim shirt with beige chino pants"</li>
        </ul>
      </div>
    </div>
  );
}
