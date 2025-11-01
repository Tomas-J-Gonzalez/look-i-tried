"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

interface TransformPanelProps {
  selectedItem: string | null; // For single selection (backwards compat)
  drawingOrder: string[];
  activeItems: Record<string, boolean>;
  onReorderLayers: (newOrder: string[]) => void;
  onSelectLayer: (item: string, isMulti?: boolean) => void;
  onDeselect: () => void;
  selectedItems?: string[]; // For multi-selection display
}

export default function TransformPanel({
  selectedItem,
  drawingOrder,
  activeItems,
  onReorderLayers,
  onSelectLayer,
  onDeselect,
  selectedItems = [],
}: TransformPanelProps) {
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize panel position to the left of canvas
  useEffect(() => {
    if (selectedItem && panelRef.current) {
      const panelWidth = panelRef.current.offsetWidth;
      const panelHeight = panelRef.current.offsetHeight;
      
      // Position to the left of the center canvas area
      const canvasMaxWidth = 650; // Slightly more than canvas width for padding
      const centerX = window.innerWidth / 2;
      const canvasLeftEdge = centerX - (canvasMaxWidth / 2);
      
      setPanelPosition({
        x: Math.max(16, canvasLeftEdge - panelWidth - 32),
        y: 120,
      });
    }
  }, [selectedItem]);

  // Helper functions defined before second useEffect
  const handlePanelMouseMove = (e: MouseEvent) => {
    if (!isDraggingPanel) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const panelWidth = panelRef.current?.offsetWidth || 320;
    const panelHeight = panelRef.current?.offsetHeight || 200;
    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - panelHeight;
    
    setPanelPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handlePanelMouseUp = () => {
    setIsDraggingPanel(false);
  };

  // Add/remove global mouse event listeners for panel dragging
  useEffect(() => {
    if (isDraggingPanel) {
      document.addEventListener('mousemove', handlePanelMouseMove);
      document.addEventListener('mouseup', handlePanelMouseUp);
      return () => {
        document.removeEventListener('mousemove', handlePanelMouseMove);
        document.removeEventListener('mouseup', handlePanelMouseUp);
      };
    }
  }, [isDraggingPanel, dragStart, panelPosition]);

  // Return early AFTER all hooks are called
  if (!selectedItem) return null;

  const itemLabel = selectedItem === 'head' ? 'Head' :
                     selectedItem === 'leftFoot' ? 'Left Foot' : 
                     selectedItem === 'rightFoot' ? 'Right Foot' :
                     selectedItem === 'leftArm' ? 'Left Arm' :
                     selectedItem === 'rightArm' ? 'Right Arm' :
                     selectedItem === 'headwear' ? 'Headwear' :
                     selectedItem === 'shoes' ? 'Shoes' :
                     selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1);

  const handlePanelMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.panel-header')) {
      setIsDraggingPanel(true);
      setDragStart({
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y,
      });
    }
  };

  // Layer drag and drop handlers
  const handleLayerDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLayerDragOver = (e: React.DragEvent, item: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  const handleLayerDragLeave = () => {
    setDragOverItem(null);
  };

  const handleLayerDrop = (e: React.DragEvent, targetItem: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetItem) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Create new order array
    const newOrder = [...drawingOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetItem);

    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    newOrder.splice(targetIndex, 0, draggedItem);

    onReorderLayers(newOrder);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleLayerDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const getItemIcon = (item: string) => {
    const icons: Record<string, string> = {
      background: '🖼️',
      head: '😊',
      headwear: '🎩',
      shirt: '👕',
      pants: '👖',
      shoes: '👟',
      leftArm: '💪',
      rightArm: '💪',
      leftFoot: '🦶',
      rightFoot: '🦶',
    };
    return icons[item] || '📦';
  };

  const getItemDisplayName = (item: string) => {
    const names: Record<string, string> = {
      background: 'Background',
      head: 'Head',
      headwear: 'Headwear',
      shirt: 'Shirt',
      pants: 'Pants',
      shoes: 'Shoes',
      leftArm: 'Left Arm',
      rightArm: 'Right Arm',
      leftFoot: 'Left Foot',
      rightFoot: 'Right Foot',
    };
    return names[item] || item;
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
      }}
      className="bg-white rounded-lg shadow-2xl border border-gray-300 p-4 z-40 w-80"
      onMouseDown={handlePanelMouseDown}
    >
      {/* Header - Draggable */}
      <div className="panel-header flex items-center justify-between mb-3 pb-2 border-b border-gray-200 cursor-move select-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h3 className="font-semibold text-sm text-gray-900">{itemLabel}</h3>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <button
          onClick={onDeselect}
          className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Layer Hierarchy Panel */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block flex items-center gap-2">
            Layers
            <span className="text-xs text-gray-400 font-normal">(drag to reorder)</span>
          </label>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {drawingOrder.slice().reverse().filter(item => activeItems[item]).map((item, index) => {
              const isSelected = selectedItems.length > 0 ? selectedItems.includes(item) : item === selectedItem;
              const isDragging = item === draggedItem;
              const isDragOver = item === dragOverItem;
              const activeItemsInOrder = drawingOrder.filter(i => activeItems[i]);
              const actualIndex = activeItemsInOrder.indexOf(item);
              
              return (
                <div
                  key={item}
                  draggable
                  onDragStart={(e) => handleLayerDragStart(e, item)}
                  onDragOver={(e) => handleLayerDragOver(e, item)}
                  onDragLeave={handleLayerDragLeave}
                  onDrop={(e) => handleLayerDrop(e, item)}
                  onDragEnd={handleLayerDragEnd}
                  onClick={(e) => {
                    const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
                    onSelectLayer(item, isMulti);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-all cursor-move ${
                    isDragging
                      ? 'opacity-50 scale-95'
                      : ''
                  } ${
                    isDragOver
                      ? 'border-t-2 border-t-blue-500'
                      : ''
                  } ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <span className="text-base">{getItemIcon(item)}</span>
                  <span className="flex-1 text-left font-medium">{getItemDisplayName(item)}</span>
                  <span className="text-xs text-gray-400">#{actualIndex + 1}</span>
                </div>
              );
            })}
            {drawingOrder.filter(item => activeItems[item]).length === 0 && (
              <div className="text-center py-4 text-xs text-gray-400">
                No layers yet. Add items to see them here.
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
          <p>💡 Drag layers to change order</p>
          <p>💡 Top = front, bottom = back</p>
        </div>
      </div>
    </div>
  );
}
