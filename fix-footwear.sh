#!/bin/bash

# Script to replace old footwear variables with new left/right shoe system

echo "Fixing footwear system..."

# Backup files
cp app/page.tsx app/page.tsx.backup
cp components/PreviewCanvas.tsx components/PreviewCanvas.tsx.backup

# Replace in app/page.tsx
sed -i '' \
  -e 's/selectedShoes/selectedLeftShoe/g' \
  -e 's/shoesPosition/leftShoePosition/g' \
  -e 's/setShoesPosition/setLeftShoePosition/g' \
  -e 's/shoesScale/leftShoeScale/g' \
  -e 's/setShoesScale/setLeftShoeScale/g' \
  -e 's/shoesRotation/leftShoeRotation/g' \
  -e 's/setShoesRotation/setLeftShoeRotation/g' \
  -e 's/showLeftFoot/showLeftShoe/g' \
  -e 's/setShowLeftFoot/setShowLeftShoe/g' \
  -e 's/showRightFoot/showRightShoe/g' \
  -e 's/setShowRightFoot/setShowRightShoe/g' \
  -e 's/leftFootPosition/leftShoePosition/g' \
  -e 's/setLeftFootPosition/setLeftShoePosition/g' \
  -e 's/rightFootPosition/rightShoePosition/g' \
  -e 's/setRightFootPosition/setRightShoePosition/g' \
  -e 's/leftFootScale/leftShoeScale/g' \
  -e 's/setLeftFootScale/setLeftShoeScale/g' \
  -e 's/rightFootScale/rightShoeScale/g' \
  -e 's/setRightFootScale/setRightShoeScale/g' \
  -e 's/leftFootRotation/leftShoeRotation/g' \
  -e 's/setLeftFootRotation/setLeftShoeRotation/g' \
  -e 's/rightFootRotation/rightShoeRotation/g' \
  -e 's/setRightFootRotation/setRightShoeRotation/g' \
  app/page.tsx

echo "✅ app/page.tsx updated"

# Replace in PreviewCanvas.tsx
sed -i '' \
  -e 's/selectedShoes/selectedLeftShoe/g' \
  -e 's/shoesPosition/leftShoePosition/g' \
  -e 's/onShoesPositionChange/onLeftShoePositionChange/g' \
  -e 's/shoesScale/leftShoeScale/g' \
  -e 's/onShoesScaleChange/onLeftShoeScaleChange/g' \
  -e 's/shoesRotation/leftShoeRotation/g' \
  -e 's/onShoesRotationChange/onLeftShoeRotationChange/g' \
  -e 's/showLeftFoot/showLeftShoe/g' \
  -e 's/showRightFoot/showRightShoe/g' \
  -e 's/leftFootPosition/leftShoePosition/g' \
  -e 's/onLeftFootPositionChange/onLeftShoePositionChange/g' \
  -e 's/rightFootPosition/rightShoePosition/g' \
  -e 's/onRightFootPositionChange/onRightShoePositionChange/g' \
  -e 's/leftFootScale/leftShoeScale/g' \
  -e 's/onLeftFootScaleChange/onLeftShoeScaleChange/g' \
  -e 's/rightFootScale/rightShoeScale/g' \
  -e 's/onRightFootScaleChange/onRightShoeScaleChange/g' \
  -e 's/leftFootRotation/leftShoeRotation/g' \
  -e 's/onLeftFootRotationChange/onLeftShoeRotationChange/g' \
  -e 's/rightFootRotation/rightShoeRotation/g' \
  -e 's/onRightFootRotationChange/onRightShoeRotationChange/g' \
  -e "s/'leftFoot'/'leftShoe'/g" \
  -e "s/'rightFoot'/'rightShoe'/g" \
  -e "s/'shoes'/'leftShoe'/g" \
  components/PreviewCanvas.tsx

echo "✅ components/PreviewCanvas.tsx updated"

echo ""
echo "🎉 Done! Backups saved as *.backup"
echo ""
echo "Next steps:"
echo "1. Review changes with: git diff"
echo "2. Test build with: npm run build"
echo "3. If issues, restore: mv app/page.tsx.backup app/page.tsx"

