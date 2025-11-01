"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import QRDownload from "@/components/QRDownload";

interface Position {
  x: number;
  y: number;
}

interface Scale {
  x: number;
  y: number;
}

interface PreviewCanvasProps {
  faceImage: string | null;
  selectedShirt: string | null;
  selectedPants: string | null;
  selectedHeadwear: string | null;
  selectedShoes: string | null;
  backgroundImage: string | null;
  showLeftArm: boolean;
  showRightArm: boolean;
  showLeftFoot: boolean;
  showRightFoot: boolean;
  facePosition: Position;
  shirtPosition: Position;
  pantsPosition: Position;
  headwearPosition: Position;
  shoesPosition: Position;
  leftArmPosition: Position;
  rightArmPosition: Position;
  leftFootPosition: Position;
  rightFootPosition: Position;
  faceScale: Scale;
  shirtScale: Scale;
  pantsScale: Scale;
  headwearScale: Scale;
  shoesScale: Scale;
  leftArmScale: Scale;
  rightArmScale: Scale;
  leftFootScale: Scale;
  rightFootScale: Scale;
  drawingOrder: string[];
  selectedItems: string[];
  onFacePositionChange: (pos: Position) => void;
  onShirtPositionChange: (pos: Position) => void;
  onPantsPositionChange: (pos: Position) => void;
  onHeadwearPositionChange: (pos: Position) => void;
  onShoesPositionChange: (pos: Position) => void;
  onLeftArmPositionChange: (pos: Position) => void;
  onRightArmPositionChange: (pos: Position) => void;
  onLeftFootPositionChange: (pos: Position) => void;
  onRightFootPositionChange: (pos: Position) => void;
  onFaceScaleChange: (scale: Scale) => void;
  onShirtScaleChange: (scale: Scale) => void;
  onPantsScaleChange: (scale: Scale) => void;
  onHeadwearScaleChange: (scale: Scale) => void;
  onShoesScaleChange: (scale: Scale) => void;
  onLeftArmScaleChange: (scale: Scale) => void;
  onRightArmScaleChange: (scale: Scale) => void;
  onLeftFootScaleChange: (scale: Scale) => void;
  onRightFootScaleChange: (scale: Scale) => void;
  onItemSelect: (items: string[]) => void;
  onClearCanvas: () => void;
  onDeleteSelected: () => void;
}

type ItemType = 'head' | 'shirt' | 'pants' | 'headwear' | 'shoes' | 'leftArm' | 'rightArm' | 'leftFoot' | 'rightFoot';

interface ItemBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PreviewCanvas({
  faceImage,
  selectedShirt,
  selectedPants,
  selectedHeadwear,
  selectedShoes,
  backgroundImage,
  showLeftArm,
  showRightArm,
  showLeftFoot,
  showRightFoot,
  facePosition,
  shirtPosition,
  pantsPosition,
  headwearPosition,
  shoesPosition,
  leftArmPosition,
  rightArmPosition,
  leftFootPosition,
  rightFootPosition,
  faceScale,
  shirtScale,
  pantsScale,
  headwearScale,
  shoesScale,
  leftArmScale,
  rightArmScale,
  leftFootScale,
  rightFootScale,
  drawingOrder,
  selectedItems,
  onFacePositionChange,
  onShirtPositionChange,
  onPantsPositionChange,
  onHeadwearPositionChange,
  onShoesPositionChange,
  onLeftArmPositionChange,
  onRightArmPositionChange,
  onLeftFootPositionChange,
  onRightFootPositionChange,
  onFaceScaleChange,
  onShirtScaleChange,
  onPantsScaleChange,
  onHeadwearScaleChange,
  onShoesScaleChange,
  onLeftArmScaleChange,
  onRightArmScaleChange,
  onLeftFootScaleChange,
  onRightFootScaleChange,
  onItemSelect,
  onClearCanvas,
  onDeleteSelected,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<ItemType | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState<Scale>({ x: 1, y: 1 });
  const [initialBounds, setInitialBounds] = useState<ItemBounds | null>(null);
  const [showScaleIndicator, setShowScaleIndicator] = useState(false);
  const [itemBounds, setItemBounds] = useState<Map<string, ItemBounds>>(new Map());
  const [multiSelectStartPositions, setMultiSelectStartPositions] = useState<Map<string, Position>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Keyboard event handler for Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItems.length > 0) {
        // Don't delete if user is typing in an input
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        
        e.preventDefault();
        onDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, onDeleteSelected]);

  // Helper function to load image
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Helper function to get item configuration
  const getItemConfig = (item: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const configs: Record<string, any> = {
      head: {
        src: faceImage,
        position: facePosition,
        scale: faceScale,
        baseWidth: 120,
        baseHeight: 140,
        baseX: 300,
        baseY: 120,
      },
      shirt: {
        src: selectedShirt,
        position: shirtPosition,
        scale: shirtScale,
        baseWidth: 260,
        baseHeight: 300,
        baseX: (canvas.width - 260) / 2,
        baseY: 170,
      },
      pants: {
        src: selectedPants,
        position: pantsPosition,
        scale: pantsScale,
        baseWidth: 260,
        baseHeight: 240,
        baseX: (canvas.width - 260) / 2,
        baseY: 440,
      },
      headwear: {
        src: selectedHeadwear,
        position: headwearPosition,
        scale: headwearScale,
        baseWidth: 140,
        baseHeight: 100,
        baseX: (canvas.width - 140) / 2,
        baseY: 50,
      },
      shoes: {
        src: selectedShoes,
        position: shoesPosition,
        scale: shoesScale,
        baseWidth: 180,
        baseHeight: 100,
        baseX: (canvas.width - 180) / 2,
        baseY: 500,
      },
      leftArm: {
        src: showLeftArm ? "/outfits/arms/left-arm.png" : null,
        position: leftArmPosition,
        scale: leftArmScale,
        baseWidth: 60,
        baseHeight: 180,
        baseX: 170,
        baseY: 200,
      },
      rightArm: {
        src: showRightArm ? "/outfits/arms/right-arm.png" : null,
        position: rightArmPosition,
        scale: rightArmScale,
        baseWidth: 60,
        baseHeight: 180,
        baseX: 370,
        baseY: 200,
      },
      leftFoot: {
        src: showLeftFoot ? "/outfits/shoes/leftfoot.png" : null,
        position: leftFootPosition,
        scale: leftFootScale,
        baseWidth: 80,
        baseHeight: 90,
        baseX: (canvas.width / 2) - 70,
        baseY: 510,
      },
      rightFoot: {
        src: showRightFoot ? "/outfits/shoes/rightfoot.png" : null,
        position: rightFootPosition,
        scale: rightFootScale,
        baseWidth: 80,
        baseHeight: 90,
        baseX: (canvas.width / 2) - 10,
        baseY: 510,
      },
    };

    return configs[item] || null;
  };

  // Main drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;

    const drawImages = async () => {
      try {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const newBounds = new Map<string, ItemBounds>();

        // Draw items in the specified order
        for (const itemKey of drawingOrder) {
          const config = getItemConfig(itemKey);
          if (!config || !config.src) continue;

          try {
            const img = await loadImage(config.src);
            const width = config.baseWidth * config.scale.x;
            const height = config.baseHeight * config.scale.y;
            const x = config.baseX + config.position.x;
            const y = config.baseY + config.position.y;

            // Draw the item
            ctx.drawImage(img, x, y, width, height);

            // Store bounds for hit detection
            newBounds.set(itemKey, { x, y, width, height });

            // Draw bounding box if this item is selected
            if (selectedItems.includes(itemKey)) {
              ctx.save();
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(x, y, width, height);
              
              // Only show handles for single selection
              if (selectedItems.length === 1) {
                // Draw corner handles (Figma style - for proportional scaling)
                const handleSize = 8;
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
                ctx.fillRect(x + width - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
                ctx.fillRect(x - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
                ctx.fillRect(x + width - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
                
                // Draw edge handles (for aspect ratio adjustment)
                ctx.fillStyle = '#60a5fa'; // Lighter blue
                // Top
                ctx.fillRect(x + width / 2 - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
                // Bottom
                ctx.fillRect(x + width / 2 - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
                // Left
                ctx.fillRect(x - handleSize / 2, y + height / 2 - handleSize / 2, handleSize, handleSize);
                // Right
                ctx.fillRect(x + width - handleSize / 2, y + height / 2 - handleSize / 2, handleSize, handleSize);
              }
              
              ctx.restore();
            }
          } catch (error) {
            console.log(`Could not load ${itemKey} image:`, error);
          }
        }

        setItemBounds(newBounds);
      } catch (error) {
        console.error("Error drawing images:", error);
      }
    };

    drawImages();
  }, [
    faceImage, selectedShirt, selectedPants, selectedHeadwear, backgroundImage,
    showLeftArm, showRightArm, showLeftFoot, showRightFoot,
    facePosition, shirtPosition, pantsPosition, headwearPosition,
    leftArmPosition, rightArmPosition, leftFootPosition, rightFootPosition,
    faceScale, shirtScale, pantsScale, headwearScale,
    leftArmScale, rightArmScale, leftFootScale, rightFootScale,
    drawingOrder, selectedItems
  ]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExporting(true);
      // Create a temporary canvas without the selection box
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw all items without selection box
      const drawWithoutSelection = async () => {
        for (const itemKey of drawingOrder) {
          const config = getItemConfig(itemKey);
          if (!config || !config.src) continue;

          try {
            const img = await loadImage(config.src);
            const width = config.baseWidth * config.scale;
            const height = config.baseHeight * config.scale;
            const x = config.baseX + config.position.x;
            const y = config.baseY + config.position.y;
            tempCtx.drawImage(img, x, y, width, height);
          } catch (error) {
            console.log(`Could not load ${itemKey} for export`);
          }
        }

        // Export
        tempCanvas.toBlob((blob) => {
          if (!blob) {
            console.error("Failed to create blob");
            setIsExporting(false);
            return;
          }

          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `my-outfit-${timestamp}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setIsExporting(false);
        }, "image/png");
      };

      drawWithoutSelection();
    } catch (error) {
      console.error("Error exporting image:", error);
      alert("❌ Failed to export outfit. Please try again.");
      setIsExporting(false);
    }
  };

  const isCompleteOutfit = faceImage && selectedShirt && selectedPants;

  // Check if clicking on a resize handle
  const checkResizeHandle = (x: number, y: number, bounds: ItemBounds): string | null => {
    const handleSize = 8;
    const hitArea = 12; // Larger hit area for easier clicking
    
    const handles = {
      // Corner handles (proportional scaling)
      'top-left': { x: bounds.x, y: bounds.y },
      'top-right': { x: bounds.x + bounds.width, y: bounds.y },
      'bottom-left': { x: bounds.x, y: bounds.y + bounds.height },
      'bottom-right': { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      // Edge handles (aspect ratio adjustment)
      'top': { x: bounds.x + bounds.width / 2, y: bounds.y },
      'bottom': { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      'left': { x: bounds.x, y: bounds.y + bounds.height / 2 },
      'right': { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    };
    
    for (const [handleName, handlePos] of Object.entries(handles)) {
      if (Math.abs(x - handlePos.x) <= hitArea && Math.abs(y - handlePos.y) <= hitArea) {
        return handleName;
      }
    }
    
    return null;
  };

  // Mouse event handlers for drag functionality
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const isMultiSelect = e.shiftKey || e.metaKey || e.ctrlKey;

    // First check if clicking on selected item's resize handle (only for single selection)
    if (selectedItems.length === 1) {
      const bounds = itemBounds.get(selectedItems[0]);
      if (bounds) {
        const handle = checkResizeHandle(x, y, bounds);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragItem(selectedItems[0] as ItemType);
          setDragStart({ x, y });
          setInitialScale(getItemScale(selectedItems[0] as ItemType));
          setInitialBounds(bounds);
          return;
        }
      }
    }

    // Check items in reverse order (top to bottom in z-index)
    for (let i = drawingOrder.length - 1; i >= 0; i--) {
      const itemKey = drawingOrder[i];
      const bounds = itemBounds.get(itemKey);
      
      if (bounds && x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        
        // Multi-select logic (Shift/Cmd/Ctrl)
        let itemsToMove: string[] = [];
        
        if (isMultiSelect) {
          if (selectedItems.includes(itemKey)) {
            // Deselect this item
            const newSelection = selectedItems.filter(item => item !== itemKey);
            onItemSelect(newSelection);
            return; // Don't start dragging when deselecting
          } else {
            // Add to selection
            const newSelection = [...selectedItems, itemKey];
            onItemSelect(newSelection);
            itemsToMove = newSelection;
          }
        } else {
          // Single select
          onItemSelect([itemKey]);
          itemsToMove = [itemKey];
        }
        
        // Start dragging
        setDragItem(itemKey as ItemType);
        setIsDragging(true);
        setDragStart({ x, y });
        
        // Store initial positions for all items that will be moved
        const startPositions = new Map<string, Position>();
        itemsToMove.forEach(item => {
          const config = getItemConfig(item);
          if (config) {
            startPositions.set(item, { ...config.position });
          }
        });
        setMultiSelectStartPositions(startPositions);
        
        return;
      }
    }

    // Clicked on empty canvas - start marquee selection
    if (!isMultiSelect) {
      onItemSelect([]);
    }
    
    // Start marquee selection
    setIsMarqueeSelecting(true);
    setMarqueeStart({ x, y });
    setMarqueeEnd({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Handle marquee selection
    if (isMarqueeSelecting) {
      setMarqueeEnd({ x, y });
      
      // Find all items within marquee box
      const marqueeLeft = Math.min(marqueeStart.x, x);
      const marqueeTop = Math.min(marqueeStart.y, y);
      const marqueeRight = Math.max(marqueeStart.x, x);
      const marqueeBottom = Math.max(marqueeStart.y, y);
      
      const itemsInBox: string[] = [];
      itemBounds.forEach((bounds, itemKey) => {
        // Check if item intersects with marquee
        const itemRight = bounds.x + bounds.width;
        const itemBottom = bounds.y + bounds.height;
        
        if (!(bounds.x > marqueeRight || itemRight < marqueeLeft ||
              bounds.y > marqueeBottom || itemBottom < marqueeTop)) {
          itemsInBox.push(itemKey);
        }
      });
      
      onItemSelect(itemsInBox);
      return;
    }

    // Update cursor based on hover state (only for single selection)
    if (!isDragging && !isResizing && selectedItems.length === 1) {
      const bounds = itemBounds.get(selectedItems[0]);
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      if (bounds) {
        const handle = checkResizeHandle(x, y, bounds);
        if (handle) {
          const cursors: Record<string, string> = {
            'top-left': 'nwse-resize',
            'top-right': 'nesw-resize',
            'bottom-left': 'nesw-resize',
            'bottom-right': 'nwse-resize',
            'top': 'ns-resize',
            'bottom': 'ns-resize',
            'left': 'ew-resize',
            'right': 'ew-resize',
          };
          canvas.style.cursor = cursors[handle] || 'move';
          return;
        }
      }
      canvas.style.cursor = 'move';
    }

    if (isResizing && dragItem && initialBounds) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;

        let newScale = { ...initialScale };

        // Edge handles - adjust only one dimension (distort aspect ratio)
        if (resizeHandle === 'right') {
          const scaleChangeX = deltaX / initialBounds.width;
          newScale.x = Math.max(0.3, Math.min(3, initialScale.x + scaleChangeX));
        } else if (resizeHandle === 'left') {
          const scaleChangeX = -deltaX / initialBounds.width;
          newScale.x = Math.max(0.3, Math.min(3, initialScale.x + scaleChangeX));
        } else if (resizeHandle === 'bottom') {
          const scaleChangeY = deltaY / initialBounds.height;
          newScale.y = Math.max(0.3, Math.min(3, initialScale.y + scaleChangeY));
        } else if (resizeHandle === 'top') {
          const scaleChangeY = -deltaY / initialBounds.height;
          newScale.y = Math.max(0.3, Math.min(3, initialScale.y + scaleChangeY));
        }
        // Corner handles - proportional scaling
        else {
          let scaleChange = 0;
          
          if (resizeHandle?.includes('right')) {
            scaleChange = deltaX / initialBounds.width;
          } else if (resizeHandle?.includes('left')) {
            scaleChange = -deltaX / initialBounds.width;
          }
          
          if (resizeHandle?.includes('bottom')) {
            const verticalChange = deltaY / initialBounds.height;
            scaleChange = (scaleChange + verticalChange) / 2;
          } else if (resizeHandle?.includes('top')) {
            const verticalChange = -deltaY / initialBounds.height;
            scaleChange = (scaleChange + verticalChange) / 2;
          }

          const uniformScale = Math.max(0.3, Math.min(3, initialScale.x + scaleChange));
          newScale = { x: uniformScale, y: uniformScale };
        }

        updateItemScale(dragItem, newScale);
        setShowScaleIndicator(true);
      });
    } else if (isDragging && dragItem) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;

        // If multiple items selected, move all of them together
        if (selectedItems.length > 1) {
          selectedItems.forEach(item => {
            const config = getItemConfig(item);
            const startPos = multiSelectStartPositions.get(item);
            if (!config || !startPos) return;

            const newPos = {
              x: startPos.x + deltaX,
              y: startPos.y + deltaY,
            };

            // Update position based on item type
            switch (item) {
              case 'head': onFacePositionChange(newPos); break;
              case 'shirt': onShirtPositionChange(newPos); break;
              case 'pants': onPantsPositionChange(newPos); break;
              case 'headwear': onHeadwearPositionChange(newPos); break;
              case 'shoes': onShoesPositionChange(newPos); break;
              case 'leftArm': onLeftArmPositionChange(newPos); break;
              case 'rightArm': onRightArmPositionChange(newPos); break;
              case 'leftFoot': onLeftFootPositionChange(newPos); break;
              case 'rightFoot': onRightFootPositionChange(newPos); break;
            }
          });
        } else {
          // Single item drag
          const config = getItemConfig(dragItem);
          if (!config) return;

          const newPos = {
            x: config.position.x + deltaX,
            y: config.position.y + deltaY,
          };

          // Update position based on item type
          switch (dragItem) {
            case 'head': onFacePositionChange(newPos); break;
            case 'shirt': onShirtPositionChange(newPos); break;
            case 'pants': onPantsPositionChange(newPos); break;
            case 'headwear': onHeadwearPositionChange(newPos); break;
            case 'shoes': onShoesPositionChange(newPos); break;
            case 'leftArm': onLeftArmPositionChange(newPos); break;
            case 'rightArm': onRightArmPositionChange(newPos); break;
            case 'leftFoot': onLeftFootPositionChange(newPos); break;
            case 'rightFoot': onRightFootPositionChange(newPos); break;
          }

          setDragStart({ x, y });
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsMarqueeSelecting(false);
    setResizeHandle(null);
    setDragItem(null);
    setInitialBounds(null);
    setShowScaleIndicator(false);
    setMultiSelectStartPositions(new Map());
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset cursor
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'move';
    }
  };

  const getItemLabel = (item: ItemType): string => {
    const labels: Record<ItemType, string> = {
      head: 'Head',
      shirt: 'Shirt',
      pants: 'Pants',
      headwear: 'Headwear',
      shoes: 'Shoes',
      leftArm: 'Left Arm',
      rightArm: 'Right Arm',
      leftFoot: 'Left Foot',
      rightFoot: 'Right Foot',
    };
    return labels[item];
  };

  const getItemScale = (item: ItemType): Scale => {
    switch (item) {
      case 'head': return faceScale;
      case 'shirt': return shirtScale;
      case 'pants': return pantsScale;
      case 'headwear': return headwearScale;
      case 'shoes': return shoesScale;
      case 'leftArm': return leftArmScale;
      case 'rightArm': return rightArmScale;
      case 'leftFoot': return leftFootScale;
      case 'rightFoot': return rightFootScale;
      default: return { x: 1, y: 1 };
    }
  };

  const updateItemScale = (item: ItemType, scale: Scale) => {
    switch (item) {
      case 'head': onFaceScaleChange(scale); break;
      case 'shirt': onShirtScaleChange(scale); break;
      case 'pants': onPantsScaleChange(scale); break;
      case 'headwear': onHeadwearScaleChange(scale); break;
      case 'shoes': onShoesScaleChange(scale); break;
      case 'leftArm': onLeftArmScaleChange(scale); break;
      case 'rightArm': onRightArmScaleChange(scale); break;
      case 'leftFoot': onLeftFootScaleChange(scale); break;
      case 'rightFoot': onRightFootScaleChange(scale); break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Canvas</h2>
        {selectedItems.length > 0 && (
          <div className="text-xs text-gray-500">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            {selectedItems.length > 1 && <span className="ml-2 text-blue-600">(Move only)</span>}
          </div>
        )}
      </div>

      <div className="relative w-full flex justify-center">
        {/* Checkered background to show transparency */}
        <div className="inline-block relative" style={{
          background: 'repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 20px 20px'
        }}>
          {/* Scale Indicator - shows when resizing (single item only) */}
          {showScaleIndicator && dragItem && selectedItems.length === 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
              {getItemLabel(dragItem)}: W {Math.round(getItemScale(dragItem).x * 100)}% × H {Math.round(getItemScale(dragItem).y * 100)}%
            </div>
          )}
          {/* Multi-select indicator */}
          {selectedItems.length > 1 && isDragging && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
              Moving {selectedItems.length} items
            </div>
          )}
          {/* Marquee selection box */}
          {isMarqueeSelecting && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 pointer-events-none z-20"
              style={{
                left: `${Math.min(marqueeStart.x, marqueeEnd.x) * (canvasRef.current!.getBoundingClientRect().width / 600)}px`,
                top: `${Math.min(marqueeStart.y, marqueeEnd.y) * (canvasRef.current!.getBoundingClientRect().height / 600)}px`,
                width: `${Math.abs(marqueeEnd.x - marqueeStart.x) * (canvasRef.current!.getBoundingClientRect().width / 600)}px`,
                height: `${Math.abs(marqueeEnd.y - marqueeStart.y) * (canvasRef.current!.getBoundingClientRect().height / 600)}px`,
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={(e) => {
              // Only allow scroll wheel resize for single selection
              if (isDragging && dragItem && selectedItems.length === 1) {
                e.preventDefault();
                const delta = -e.deltaY * 0.001;
                const currentScale = getItemScale(dragItem);
                
                // Calculate aspect ratio
                const aspectRatio = currentScale.x / currentScale.y;
                
                // Scale both dimensions but maintain the current aspect ratio
                const newScaleX = Math.max(0.3, Math.min(3, currentScale.x + delta));
                const newScaleY = Math.max(0.3, Math.min(3, newScaleX / aspectRatio));
                
                updateItemScale(dragItem, { x: newScaleX, y: newScaleY });
                
                setShowScaleIndicator(true);
                setTimeout(() => setShowScaleIndicator(false), 1000);
              }
            }}
            className="border border-gray-300 rounded-lg shadow-sm cursor-move"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs mx-auto space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting || !isCompleteOutfit}
            variant="outline"
            size="sm"
            className="flex-1 text-sm"
          >
            {isExporting ? "Downloading..." : "Download PNG"}
          </Button>
          
          <Button
            onClick={onClearCanvas}
            variant="outline"
            size="sm"
            className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            title="Clear everything and start over"
          >
            Reset Canvas
          </Button>
        </div>
        
        {!isCompleteOutfit && (
          <p className="text-xs text-center text-gray-400">
            Complete your outfit to download
          </p>
        )}
      </div>

      {/* QR Code Download - Show when outfit is complete */}
      {isCompleteOutfit && (
        <div className="w-full max-w-md mx-auto mt-6">
          <QRDownload
            canvasRef={canvasRef}
            fileName="my-outfit"
            maxDirectSize={100} // Very small - force upload for almost all images
            onUploadNeeded={async (blob) => {
              // Convert blob to base64 data URL
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              
              try {
                // Try to upload to Cloudflare R2 (if configured)
                const response = await fetch('/api/upload-to-r2', {
                  method: 'POST',
                  body: JSON.stringify({ imageData: base64 }),
                  headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  console.warn('R2 upload not available:', errorData.error);
                  // Return null to indicate upload failed (don't use data URL)
                  throw new Error('R2 not configured');
                }
                
                const data = await response.json();
                console.log('Image uploaded to R2:', data.url);
                return data.url;
              } catch (error) {
                console.warn('R2 upload failed:', error);
                // Don't return data URL - it's too large for QR code
                throw error;
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
