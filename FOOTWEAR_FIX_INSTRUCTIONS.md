# 🔧 Footwear Fix - Final Steps

## Current Status

✅ Footwear system refactored to support left/right shoes separately
❌ Build errors due to prop mismatches
❌ UI needs to show separate left/right shoe selectors
❌ Welcome screen when no face uploaded not yet added

## Quick Fix Commands

The build is failing because some props don't match. Run these commands to fix:

```bash
# 1. Restore clean state
cd /Users/tomas.gonzalez/hackathon
git checkout app/page.tsx components/PreviewCanvas.tsx

# 2. I'll provide you with working files instead
```

## What Changed

### Old System
- Single `shoes` state for footwear
- `leftFoot` and `rightFoot` as add-ons
- Only 1 footwear option at a time

### New System
- Separate `selectedLeftShoe` and `selectedRightShoe` states
- Two footwear selectors in UI
- Can have different shoes on each foot
- Add-ons now only show arms

## Alternative: Simple Manual Fix

Since the automated sed script created inconsistencies, here's what needs to happen manually:

### Step 1: Update OutfitSelector Component

Add support for leftshoe/rightshoe categories in `components/OutfitSelector.tsx`:

```typescript
// Update the category prop type to include:
category: "shirts" | "pants" | "headwear" | "leftshoe" | "rightshoe"
```

### Step 2: Update Footwear Section in app/page.tsx

Replace the single footwear selector with two:

```tsx
<CollapsibleSection title="👟 Left Shoe" defaultOpen={false}>
  <OutfitSelector
    category="leftshoe"
    options={leftShoeOptions}
    selected={selectedLeftShoe}
    onSelect={setSelectedLeftShoe}
  />
</CollapsibleSection>

<CollapsibleSection title="👟 Right Shoe" defaultOpen={false}>
  <OutfitSelector
    category="rightshoe"
    options={rightShoeOptions}
    selected={selectedRightShoe}
    onSelect={setSelectedRightShoe}
  />
</CollapsibleSection>
```

### Step 3: Remove Foot Add-ons

In the Add-ons section, keep only:
- Left Arm
- Right Arm

Remove Left Foot and Right Foot toggles.

### Step 4: Add Welcome Screen

After the nav bar in app/page.tsx, add:

```tsx
{!faceImage && (
  <div className="flex justify-center items-center min-h-[60vh] p-8">
    <div className="text-center max-w-md">
      <h2 className="text-2xl font-bold mb-4">Welcome to Look, I Tried!</h2>
      <p className="text-gray-600 mb-4">
        Upload or capture your photo above to start creating your outfit
      </p>
    </div>
  </div>
)}

{faceImage && (
  // ... existing canvas and customization panel ...
)}
```

## Simpler Alternative: Keep Current System

If the above is too complex, you can:

1. Revert all changes: `git checkout .`
2. Keep the single shoes selector
3. Just add the welcome screen conditional

The welcome screen is the simpler fix and addresses your second requirement without the footwear complexity.

## Recommendation

Given the complexity, I recommend:

1. **Quick Fix**: Just add the welcome screen (hide canvas until face uploaded)
2. **Phase 2**: Add multiple footwear support later

This way you get the immediate UX improvement without the refactoring complexity.

## Next Steps

Let me know if you want:
- A) Complete working files with all changes
- B) Just the welcome screen fix (simpler)
- C) Help debugging the current state

I can provide whichever approach you prefer!

