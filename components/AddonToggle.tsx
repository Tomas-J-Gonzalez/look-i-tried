"use client";

import { Button } from "@/components/ui/button";

interface AddonToggleProps {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function AddonToggle({
  label,
  icon,
  enabled,
  onToggle,
}: AddonToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <Button
        onClick={() => onToggle(!enabled)}
        variant={enabled ? "default" : "outline"}
        size="sm"
        className="text-xs"
      >
        {enabled ? "Remove" : "Add"}
      </Button>
    </div>
  );
}

