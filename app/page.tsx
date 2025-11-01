"use client";

import { useState, useCallback, useEffect } from "react";
import OutfitSelector from "@/components/OutfitSelector";
import PreviewCanvas from "@/components/PreviewCanvas";
import NavBarFaceUploader from "@/components/NavBarFaceUploader";
import CollapsibleSection from "@/components/CollapsibleSection";
import AddonToggle from "@/components/AddonToggle";
import TransformPanel from "@/components/TransformPanel";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Home() {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [selectedShirt, setSelectedShirt] = useState<string | null>(null);
  const [selectedPants, setSelectedPants] = useState<string | null>(null);
  const [selectedHeadwear, setSelectedHeadwear] = useState<string | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  
  // Optional addons (not shown by default)
  const [showLeftArm, setShowLeftArm] = useState(false);
  const [showRightArm, setShowRightArm] = useState(false);
  const [showLeftFoot, setShowLeftFoot] = useState(false);
  const [showRightFoot, setShowRightFoot] = useState(false);
  
  // Position state for each item
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0 });
  const [shirtPosition, setShirtPosition] = useState({ x: 0, y: 0 });
  const [pantsPosition, setPantsPosition] = useState({ x: 0, y: 0 });
  const [headwearPosition, setHeadwearPosition] = useState({ x: 0, y: 0 });
  const [shoesPosition, setShoesPosition] = useState({ x: 0, y: 0 });
  const [leftArmPosition, setLeftArmPosition] = useState({ x: 0, y: 0 });
  const [rightArmPosition, setRightArmPosition] = useState({ x: 0, y: 0 });
  const [leftFootPosition, setLeftFootPosition] = useState({ x: 0, y: 0 });
  const [rightFootPosition, setRightFootPosition] = useState({ x: 0, y: 0 });
  
  // Size state for each item (separate width and height scale for aspect ratio control)
  const [faceScale, setFaceScale] = useState({ x: 1, y: 1 });
  const [shirtScale, setShirtScale] = useState({ x: 1, y: 1 });
  const [pantsScale, setPantsScale] = useState({ x: 1, y: 1 });
  const [headwearScale, setHeadwearScale] = useState({ x: 1, y: 1 });
  const [shoesScale, setShoesScale] = useState({ x: 1, y: 1 });
  const [leftArmScale, setLeftArmScale] = useState({ x: 1, y: 1 });
  const [rightArmScale, setRightArmScale] = useState({ x: 1, y: 1 });
  const [leftFootScale, setLeftFootScale] = useState({ x: 1, y: 1 });
  const [rightFootScale, setRightFootScale] = useState({ x: 1, y: 1 });
  
  // Rotation state for each item (in degrees)
  const [faceRotation, setFaceRotation] = useState(0);
  const [shirtRotation, setShirtRotation] = useState(0);
  const [pantsRotation, setPantsRotation] = useState(0);
  const [headwearRotation, setHeadwearRotation] = useState(0);
  const [shoesRotation, setShoesRotation] = useState(0);
  const [leftArmRotation, setLeftArmRotation] = useState(0);
  const [rightArmRotation, setRightArmRotation] = useState(0);
  const [leftFootRotation, setLeftFootRotation] = useState(0);
  const [rightFootRotation, setRightFootRotation] = useState(0);
  
  // Drawing order for z-index control (background always first, then order matters)
  const [drawingOrder, setDrawingOrder] = useState<string[]>([
    'background', 'shoes', 'leftFoot', 'rightFoot', 'leftArm', 'rightArm', 'shirt', 'pants', 'headwear', 'head'
  ]);
  
  // Panel visibility state
  const [showLeftPanel, setShowLeftPanel] = useState(false); // Hidden by default
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Selected items for transform panel (supports multi-select)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Text elements on canvas
  const [textElements, setTextElements] = useState<Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
    scale: number;
    rotation: number;
  }>>([]);
  
  // Note: "face" is now called "head" in the code for better naming
  
  // Reset canvas confirmation dialog
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // Undo/Redo History System
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Capture current state for history
  const captureState = useCallback(() => {
    return {
      facePosition, shirtPosition, pantsPosition, headwearPosition, shoesPosition,
      leftArmPosition, rightArmPosition, leftFootPosition, rightFootPosition,
      faceScale, shirtScale, pantsScale, headwearScale, shoesScale,
      leftArmScale, rightArmScale, leftFootScale, rightFootScale,
      faceRotation, shirtRotation, pantsRotation, headwearRotation, shoesRotation,
      leftArmRotation, rightArmRotation, leftFootRotation, rightFootRotation,
      drawingOrder: [...drawingOrder],
    };
  }, [
    facePosition, shirtPosition, pantsPosition, headwearPosition, shoesPosition,
    leftArmPosition, rightArmPosition, leftFootPosition, rightFootPosition,
    faceScale, shirtScale, pantsScale, headwearScale, shoesScale,
    leftArmScale, rightArmScale, leftFootScale, rightFootScale,
    faceRotation, shirtRotation, pantsRotation, headwearRotation, shoesRotation,
    leftArmRotation, rightArmRotation, leftFootRotation, rightFootRotation,
    drawingOrder
  ]);
  
  // Save to history
  const saveToHistory = useCallback(() => {
    const newState = captureState();
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prev => prev + 1);
  }, [captureState, historyIndex]);
  
  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setFacePosition(prevState.facePosition);
      setShirtPosition(prevState.shirtPosition);
      setPantsPosition(prevState.pantsPosition);
      setHeadwearPosition(prevState.headwearPosition);
      setShoesPosition(prevState.shoesPosition);
      setLeftArmPosition(prevState.leftArmPosition);
      setRightArmPosition(prevState.rightArmPosition);
      setLeftFootPosition(prevState.leftFootPosition);
      setRightFootPosition(prevState.rightFootPosition);
      setFaceScale(prevState.faceScale);
      setShirtScale(prevState.shirtScale);
      setPantsScale(prevState.pantsScale);
      setHeadwearScale(prevState.headwearScale);
      setShoesScale(prevState.shoesScale);
      setLeftArmScale(prevState.leftArmScale);
      setRightArmScale(prevState.rightArmScale);
      setLeftFootScale(prevState.leftFootScale);
      setRightFootScale(prevState.rightFootScale);
      setFaceRotation(prevState.faceRotation);
      setShirtRotation(prevState.shirtRotation);
      setPantsRotation(prevState.pantsRotation);
      setHeadwearRotation(prevState.headwearRotation);
      setShoesRotation(prevState.shoesRotation);
      setLeftArmRotation(prevState.leftArmRotation);
      setRightArmRotation(prevState.rightArmRotation);
      setLeftFootRotation(prevState.leftFootRotation);
      setRightFootRotation(prevState.rightFootRotation);
      setDrawingOrder(prevState.drawingOrder);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);
  
  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setFacePosition(nextState.facePosition);
      setShirtPosition(nextState.shirtPosition);
      setPantsPosition(nextState.pantsPosition);
      setHeadwearPosition(nextState.headwearPosition);
      setShoesPosition(nextState.shoesPosition);
      setLeftArmPosition(nextState.leftArmPosition);
      setRightArmPosition(nextState.rightArmPosition);
      setLeftFootPosition(nextState.leftFootPosition);
      setRightFootPosition(nextState.rightFootPosition);
      setFaceScale(nextState.faceScale);
      setShirtScale(nextState.shirtScale);
      setPantsScale(nextState.pantsScale);
      setHeadwearScale(nextState.headwearScale);
      setShoesScale(nextState.shoesScale);
      setLeftArmScale(nextState.leftArmScale);
      setRightArmScale(nextState.rightArmScale);
      setLeftFootScale(nextState.leftFootScale);
      setRightFootScale(nextState.rightFootScale);
      setFaceRotation(nextState.faceRotation);
      setShirtRotation(nextState.shirtRotation);
      setPantsRotation(nextState.pantsRotation);
      setHeadwearRotation(nextState.headwearRotation);
      setShoesRotation(nextState.shoesRotation);
      setLeftArmRotation(nextState.leftArmRotation);
      setRightArmRotation(nextState.rightArmRotation);
      setLeftFootRotation(nextState.leftFootRotation);
      setRightFootRotation(nextState.rightFootRotation);
      setDrawingOrder(nextState.drawingOrder);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Shirt options - realistic clothing cut-outs
  const shirtOptions = [
    "/outfits/shirts/shirt1.png",
    "/outfits/shirts/shirt2.png",
    "/outfits/shirts/shirt3.png",
    "/outfits/shirts/shirt4.png",
    "/outfits/shirts/shirt5.png",
    "/outfits/shirts/pimpjacket.png",
  ];

  const pantsOptions = [
    "/outfits/pants/pants1.png",
    "/outfits/pants/pants2.png",
    "/outfits/pants/pants3.png",
    "/outfits/pants/pants4.png",
    "/outfits/pants/pants5.png",
    "/outfits/pants/pimppants.png",
  ];

  const headwearOptions = [
    "/outfits/headwear/pimphat.png",
  ];

  const shoesOptions = [
    "/outfits/shoes/leftshoe.png",
    "/outfits/shoes/rightshoe.png",
    "/outfits/shoes/Birkens .png",
    "/outfits/shoes/Birkens 2.png",
    "/outfits/shoes/heels one .png",
    "/outfits/shoes/heels two.png",
  ];

  const handleRemoveFace = () => {
    setFaceImage(null);
  };

  const handleAddText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      text: 'Double click to edit',
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
    };
    setTextElements(prev => [...prev, newText]);
  };

  const handleClearCanvas = () => {
    setShowResetDialog(true);
  };

  const confirmClearCanvas = () => {
      // Clear all images
      setFaceImage(null);
      setSelectedShirt(null);
      setSelectedPants(null);
      setSelectedHeadwear(null);
      setSelectedShoes(null);
      setBackgroundImage(null);
    
    // Disable all add-ons
    setShowLeftArm(false);
    setShowRightArm(false);
    setShowLeftFoot(false);
    setShowRightFoot(false);
    
    // Clear text elements
    setTextElements([]);
    
      // Reset all positions
      setFacePosition({ x: 0, y: 0 });
      setShirtPosition({ x: 0, y: 0 });
      setPantsPosition({ x: 0, y: 0 });
      setHeadwearPosition({ x: 0, y: 0 });
      setShoesPosition({ x: 0, y: 0 });
      setLeftArmPosition({ x: 0, y: 0 });
      setRightArmPosition({ x: 0, y: 0 });
      setLeftFootPosition({ x: 0, y: 0 });
      setRightFootPosition({ x: 0, y: 0 });
      
      // Reset all scales
      setFaceScale({ x: 1, y: 1 });
      setShirtScale({ x: 1, y: 1 });
      setPantsScale({ x: 1, y: 1 });
      setHeadwearScale({ x: 1, y: 1 });
      setShoesScale({ x: 1, y: 1 });
      setLeftArmScale({ x: 1, y: 1 });
      setRightArmScale({ x: 1, y: 1 });
      setLeftFootScale({ x: 1, y: 1 });
      setRightFootScale({ x: 1, y: 1 });
    
    // Reset drawing order
    setDrawingOrder([
      'background', 'shoes', 'leftFoot', 'rightFoot', 'leftArm', 'rightArm', 'shirt', 'pants', 'headwear', 'head'
    ]);
    
    // Deselect any selected items
    setSelectedItems([]);
    
    // Close dialog
    setShowResetDialog(false);
  };

  const handleAIGenerate = (shirtUrl: string, pantsUrl: string, prompt: string) => {
    // AI-generated outfit - automatically apply to character
    console.log("AI Generated outfit for:", prompt);
    console.log("Shirt:", shirtUrl);
    console.log("Pants:", pantsUrl);
    
    // Automatically select the AI-generated clothing
    setSelectedShirt(shirtUrl);
    setSelectedPants(pantsUrl);
    
    // Show success message
    alert(`✨ AI outfit applied! Styled with: "${prompt}"`);
  };

  // Layer reordering function
  const handleReorderLayers = (newOrder: string[]) => {
    setDrawingOrder(newOrder);
  };

  // Delete selected item(s)
  const handleDeleteSelected = () => {
    selectedItems.forEach(item => {
      // Check if it's a text element
      if (item.startsWith('text-')) {
        setTextElements(prev => prev.filter(t => t.id !== item));
        return;
      }
      
      switch (item) {
        case 'head':
          setFaceImage(null);
          setFacePosition({ x: 0, y: 0 });
          setFaceScale({ x: 1, y: 1 });
          break;
        case 'shirt':
          setSelectedShirt(null);
          setShirtPosition({ x: 0, y: 0 });
          setShirtScale({ x: 1, y: 1 });
          break;
        case 'pants':
          setSelectedPants(null);
          setPantsPosition({ x: 0, y: 0 });
          setPantsScale({ x: 1, y: 1 });
          break;
        case 'headwear':
          setSelectedHeadwear(null);
          setHeadwearPosition({ x: 0, y: 0 });
          setHeadwearScale({ x: 1, y: 1 });
          break;
        case 'shoes':
          setSelectedShoes(null);
          setShoesPosition({ x: 0, y: 0 });
          setShoesScale({ x: 1, y: 1 });
          break;
        case 'background':
          setBackgroundImage(null);
          break;
        case 'leftArm':
          setShowLeftArm(false);
          setLeftArmPosition({ x: 0, y: 0 });
          setLeftArmScale({ x: 1, y: 1 });
          break;
        case 'rightArm':
          setShowRightArm(false);
          setRightArmPosition({ x: 0, y: 0 });
          setRightArmScale({ x: 1, y: 1 });
          break;
        case 'leftFoot':
          setShowLeftFoot(false);
          setLeftFootPosition({ x: 0, y: 0 });
          setLeftFootScale({ x: 1, y: 1 });
          break;
        case 'rightFoot':
          setShowRightFoot(false);
          setRightFootPosition({ x: 0, y: 0 });
          setRightFootScale({ x: 1, y: 1 });
          break;
      }
    });
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/branding/logo.png" 
                alt="Look, I Tried Logo" 
                className="h-12 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Look, I Tried
              </h1>
            </div>
            <NavBarFaceUploader
              faceImage={faceImage}
              onFaceUploaded={setFaceImage}
              onRemoveFace={handleRemoveFace}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative w-full">
        {/* Left Panel - Hidden for now */}
        {/* <div 
          className={`fixed left-0 top-[88px] h-[calc(100vh-88px)] w-80 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20 ${
            showLeftPanel ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowLeftPanel(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
              title="Hide AI Generator"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <AIPromptInput onGenerate={handleAIGenerate} />
          </div>
        </div> */}

        {/* Toggle Left Panel Button (when hidden) */}
        {/* {!showLeftPanel && (
          <button
            onClick={() => setShowLeftPanel(true)}
            className="fixed left-0 top-24 bg-white rounded-r-lg shadow-lg px-3 py-4 hover:bg-gray-50 transition-all duration-200 z-30 border border-l-0 border-gray-200 flex items-center gap-2"
            title="Show AI Generator"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium text-gray-700">AI Generator</span>
          </button>
        )} */}

        {/* Center Preview - Always Centered */}
        <div className="flex justify-center items-start p-8">
          <div className="w-full max-w-xl">
            <PreviewCanvas
              faceImage={faceImage}
              selectedShirt={selectedShirt}
              selectedPants={selectedPants}
              selectedHeadwear={selectedHeadwear}
              selectedShoes={selectedShoes}
              backgroundImage={backgroundImage}
              showLeftArm={showLeftArm}
              showRightArm={showRightArm}
              showLeftFoot={showLeftFoot}
              showRightFoot={showRightFoot}
              facePosition={facePosition}
              shirtPosition={shirtPosition}
              pantsPosition={pantsPosition}
              headwearPosition={headwearPosition}
              shoesPosition={shoesPosition}
              leftArmPosition={leftArmPosition}
              rightArmPosition={rightArmPosition}
              leftFootPosition={leftFootPosition}
              rightFootPosition={rightFootPosition}
              faceScale={faceScale}
              shirtScale={shirtScale}
              pantsScale={pantsScale}
              headwearScale={headwearScale}
              shoesScale={shoesScale}
              leftArmScale={leftArmScale}
              rightArmScale={rightArmScale}
              leftFootScale={leftFootScale}
              rightFootScale={rightFootScale}
              drawingOrder={drawingOrder}
              selectedItems={selectedItems}
              onFacePositionChange={setFacePosition}
              onShirtPositionChange={setShirtPosition}
              onPantsPositionChange={setPantsPosition}
              onHeadwearPositionChange={setHeadwearPosition}
              onShoesPositionChange={setShoesPosition}
              onLeftArmPositionChange={setLeftArmPosition}
              onRightArmPositionChange={setRightArmPosition}
              onLeftFootPositionChange={setLeftFootPosition}
              onRightFootPositionChange={setRightFootPosition}
              onFaceScaleChange={setFaceScale}
              onShirtScaleChange={setShirtScale}
              onPantsScaleChange={setPantsScale}
              onHeadwearScaleChange={setHeadwearScale}
              onShoesScaleChange={setShoesScale}
              onLeftArmScaleChange={setLeftArmScale}
              onRightArmScaleChange={setRightArmScale}
              onLeftFootScaleChange={setLeftFootScale}
              onRightFootScaleChange={setRightFootScale}
              faceRotation={faceRotation}
              shirtRotation={shirtRotation}
              pantsRotation={pantsRotation}
              headwearRotation={headwearRotation}
              shoesRotation={shoesRotation}
              leftArmRotation={leftArmRotation}
              rightArmRotation={rightArmRotation}
              leftFootRotation={leftFootRotation}
              rightFootRotation={rightFootRotation}
              onFaceRotationChange={setFaceRotation}
              onShirtRotationChange={setShirtRotation}
              onPantsRotationChange={setPantsRotation}
              onHeadwearRotationChange={setHeadwearRotation}
              onShoesRotationChange={setShoesRotation}
              onLeftArmRotationChange={setLeftArmRotation}
              onRightArmRotationChange={setRightArmRotation}
              onLeftFootRotationChange={setLeftFootRotation}
              onRightFootRotationChange={setRightFootRotation}
              textElements={textElements}
              onTextElementsChange={setTextElements}
              onItemSelect={setSelectedItems}
              onClearCanvas={handleClearCanvas}
              onDeleteSelected={handleDeleteSelected}
              onSaveHistory={saveToHistory}
            />
          </div>
        </div>

        {/* Transform Panel - Only show for single selection */}
        {selectedItems.length === 1 && (
          <TransformPanel
            selectedItem={selectedItems[0]}
            selectedItems={selectedItems}
            drawingOrder={drawingOrder}
            textElements={textElements}
            activeItems={{
              background: !!backgroundImage,
              head: !!faceImage,
              shirt: !!selectedShirt,
              pants: !!selectedPants,
              headwear: !!selectedHeadwear,
              shoes: !!selectedShoes,
              leftArm: showLeftArm,
              rightArm: showRightArm,
              leftFoot: showLeftFoot,
              rightFoot: showRightFoot,
            }}
            onReorderLayers={handleReorderLayers}
            onSelectLayer={(item, isMulti) => {
              if (isMulti) {
                // Multi-select in layer panel
                if (selectedItems.includes(item)) {
                  setSelectedItems(selectedItems.filter(i => i !== item));
                } else {
                  setSelectedItems([...selectedItems, item]);
                }
              } else {
                // Single select
                setSelectedItems([item]);
              }
            }}
            onDeselect={() => setSelectedItems([])}
          />
        )}

        {/* Right Panel - Slides in/out from right */}
        <div 
          className={`fixed right-0 top-[88px] h-[calc(100vh-88px)] w-80 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20 ${
            showRightPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto">
            <div className="p-6 relative">
              <button
                onClick={() => setShowRightPanel(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 z-10"
                title="Hide Customization"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="p-4 border-b border-gray-200 -mx-6 -mt-6 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Customize</h2>
                <p className="text-xs text-gray-500 mt-1">Select and adjust your outfit</p>
              </div>
              <div className="space-y-2">
                <CollapsibleSection title="🎩 Headwear" defaultOpen={false}>
                  <OutfitSelector
                    category="headwear"
                    options={headwearOptions}
                    selected={selectedHeadwear}
                    onSelect={setSelectedHeadwear}
                  />
                </CollapsibleSection>
                
                <CollapsibleSection title="👕 Tops" defaultOpen={true}>
                  <OutfitSelector
                    category="shirts"
                    options={shirtOptions}
                    selected={selectedShirt}
                    onSelect={setSelectedShirt}
                  />
                </CollapsibleSection>
                
                <CollapsibleSection title="👖 Bottoms" defaultOpen={true}>
                  <OutfitSelector
                    category="pants"
                    options={pantsOptions}
                    selected={selectedPants}
                    onSelect={setSelectedPants}
                  />
                </CollapsibleSection>
                
                <CollapsibleSection title="👟 Footwear" defaultOpen={false}>
                  <OutfitSelector
                    category="shoes"
                    options={shoesOptions}
                    selected={selectedShoes}
                    onSelect={setSelectedShoes}
                  />
                </CollapsibleSection>
                
                <CollapsibleSection title="➕ Add-ons" defaultOpen={false}>
                  <div className="space-y-2">
                    <AddonToggle
                      label="Left Arm"
                      icon="💪"
                      enabled={showLeftArm}
                      onToggle={setShowLeftArm}
                    />
                    <AddonToggle
                      label="Right Arm"
                      icon="💪"
                      enabled={showRightArm}
                      onToggle={setShowRightArm}
                    />
                    <AddonToggle
                      label="Left Foot"
                      icon="🦶"
                      enabled={showLeftFoot}
                      onToggle={setShowLeftFoot}
                    />
                    <AddonToggle
                      label="Right Foot"
                      icon="🦶"
                      enabled={showRightFoot}
                      onToggle={setShowRightFoot}
                    />
                    
                    {/* Add Text Button */}
                    <button
                      onClick={handleAddText}
                      className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors"
                    >
                      <span className="text-xl">📝</span>
                      <span className="text-sm font-medium text-gray-700">Add Text</span>
                    </button>
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Right Panel Button (when hidden) */}
        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="fixed right-0 top-24 bg-white rounded-l-lg shadow-lg px-3 py-4 hover:bg-gray-50 transition-all duration-200 z-30 border border-r-0 border-gray-200 flex items-center gap-2"
            title="Show Customization"
          >
            <span className="text-sm font-medium text-gray-700">Customize</span>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Reset Canvas Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        title="Reset Canvas?"
        message="This will clear all items, positions, and settings. This action cannot be undone."
        confirmText="Reset Canvas"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmClearCanvas}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
}
