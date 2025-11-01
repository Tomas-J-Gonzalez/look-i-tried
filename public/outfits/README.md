# Clothing Cut-Outs Instructions

## Overview
This directory should contain realistic transparent PNG cut-outs of clothing items that will be overlaid on the mannequin.

## File Structure
```
outfits/
├── shirts/
│   ├── shirt1.png  (or .svg)
│   ├── shirt2.png
│   └── shirt3.png
├── pants/
│   ├── pants1.png  (or .svg)
│   ├── pants2.png
│   └── pants3.png
├── arms.svg        (arms overlay)
└── mannequin-base.svg
```

## Image Requirements

### Dimensions
- **Canvas Size**: 400x600 pixels
- **Clothing items should match this canvas size** for proper alignment

### Technical Requirements
- **Format**: PNG with transparency (alpha channel)
- **Background**: Must be transparent
- **Size**: Recommended 400x600px to match canvas
- **Quality**: High resolution (300dpi recommended for export quality)

### Alignment Guidelines
- **Shirts**: Should cover torso area (approximately y: 180-460)
- **Pants**: Should cover leg area (approximately y: 400-580)
- **Positioning**: Center the clothing items horizontally at x: 200

## Where to Get Clothing Cut-Outs

### Free Resources
1. **Pixabay** - https://pixabay.com/vectors/search/clothing/
2. **PNG All** - https://www.pngall.com/clothing-png/
3. **CGDream** - https://cgdream.ai/ (AI-generated clothing cutouts)
4. **Pippit** - https://www.pippit.ai/templates/free-cutout-template

### Creating Your Own
1. Use photo editing software (Photoshop, GIMP, etc.)
2. Cut out clothing items from product photos
3. Ensure clean edges with transparency
4. Resize to 400x600px canvas
5. Align to center (x: 200)

## Adding New Clothing Items

1. Add your PNG file to the appropriate folder (`shirts/` or `pants/`)
2. Name it following the pattern: `shirt1.png`, `shirt2.png`, etc.
3. Update `app/page.tsx` to reference your new file:

```typescript
const shirtOptions = [
  "/outfits/shirts/shirt1.png",
  "/outfits/shirts/shirt2.png",
  "/outfits/shirts/shirt3.png",
];
```

## Current Setup
The application currently uses SVG placeholders. To use realistic cut-outs:
1. Replace the `.svg` files with `.png` files
2. Update the paths in `app/page.tsx` from `.svg` to `.png`
3. Ensure your PNG files have transparent backgrounds

