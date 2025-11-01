# 📝 Text Feature Guide

## ✨ New Feature: Add Text to Canvas

You can now add custom text messages to your outfit canvas!

---

## 🎯 **How to Use**

### **Step 1: Add Text**
1. Open the **Customize** panel (right side)
2. Scroll to **"➕ Add-ons"** section
3. Click **"📝 Add Text"** button
4. A text element appears on the canvas saying "Double click to edit"

### **Step 2: Edit Text**
1. **Double-click** on any text element on the canvas
2. A prompt appears asking for your message
3. Type your custom text
4. Click **OK** to apply

### **Step 3: Customize Text**
Once added, text elements work like any other canvas item:
- **Move**: Click and drag
- **Resize**: Scroll mouse wheel while dragging (changes font size)
- **Rotate**: Drag the green rotation handle
- **Delete**: Select and press Delete/Backspace

---

## 🎨 **Text Styling**

### Font
**Comic Sans MS** - The only font available (as requested!)
- Fun, casual, playful style
- Perfect for custom messages and captions
- Instantly recognizable

### Properties
| Property | How to Change |
|----------|---------------|
| **Content** | Double-click text |
| **Size** | Scroll wheel while dragging |
| **Position** | Click and drag |
| **Rotation** | Drag green handle |
| **Color** | Black (fixed) |

### Default Settings
- **Font**: Comic Sans MS
- **Size**: 32px (scales with resize)
- **Color**: Black
- **Position**: Center of canvas
- **Text**: "Double click to edit"

---

## 💡 **Use Cases**

### Creative Ideas:
- **Captions**: "Looking fresh 🔥"
- **Memes**: "Drip check ✅"
- **Names**: Your name or username
- **Dates**: Special occasions
- **Jokes**: Add humor to your outfit
- **Watermarks**: "Made on Look, I Tried"

### Multiple Text Elements:
- ✅ Add as many text elements as you want
- ✅ Each text is independently editable
- ✅ Each text can be moved/resized/rotated separately
- ✅ Text appears on top of all other items

---

## 🎮 **Controls Summary**

| Action | How To |
|--------|--------|
| **Add text** | Click "Add Text" in customization panel |
| **Edit text** | Double-click on text element |
| **Move text** | Click and drag |
| **Resize text** | Select + scroll mouse wheel |
| **Rotate text** | Drag green rotation handle |
| **Delete text** | Select + press Delete/Backspace |
| **Multi-select** | Shift/Cmd/Ctrl + click |

---

## 📦 **Export & Download**

Text elements are **automatically included** in:
- ✅ PNG Download (desktop)
- ✅ QR Code Download (mobile)
- ✅ Undo/Redo history

Your text will look exactly the same in the downloaded image as it does on the canvas!

---

## 🔄 **Undo/Redo Support**

Text changes support undo/redo:
- Add text → `Cmd+Z` → Text removed
- Edit text → `Cmd+Z` → Previous text restored
- Move text → `Cmd+Z` → Previous position restored
- Resize text → `Cmd+Z` → Previous size restored

---

## ⚠️ **Known Limitations**

### Current Restrictions:
- ❌ Can't change font (Comic Sans only, as requested)
- ❌ Can't change color (black only)
- ❌ No text formatting (bold, italic, etc.)
- ❌ Uses browser `prompt()` for editing (simple but functional)

### Why These Choices:
- **Comic Sans only**: Per your request
- **Simple prompt**: Quick hackathon-style implementation
- **Black color**: Maximum readability on white canvas
- **No formatting**: Keeps it simple and fast

---

## 🚀 **Tips & Tricks**

### Best Practices:
1. **Add text last** - After positioning outfit items
2. **Keep it short** - Long text may overflow canvas
3. **Use rotation sparingly** - Straight text is most readable
4. **Layer control** - Text always appears on top (can't change z-index)

### Pro Tips:
- 📍 **Position first, resize second** - Easier to visualize
- 🔄 **Small rotations** (5-10°) look more natural than 45°+
- 📏 **Consistent sizing** - Use similar sizes for multiple texts
- 🎨 **Balance** - Don't cover important outfit parts

---

## 🧪 **Testing Text Feature**

Try these examples:
```
1. Click "Add Text"
2. Double-click the text
3. Type: "Outfit of the Day"
4. Resize it larger
5. Position it at the top
6. Download - text is included!
```

---

## 🐛 **Troubleshooting**

### Text not appearing?
- Make sure you clicked "Add Text" button
- Check if text is behind other items (shouldn't happen, but check)
- Try adding another text element

### Can't edit text?
- Make sure you're **double-clicking** (not single click)
- Wait a moment between clicks
- Text must be visible on canvas

### Text disappeared?
- Check if you accidentally deleted it (press `Cmd+Z` to undo)
- Verify it's not moved off-canvas
- Try adding a new one

---

## 📱 **Mobile Compatibility**

Text works perfectly on mobile:
- ✅ Renders correctly in QR code downloads
- ✅ Comic Sans MS is web-safe and universally supported
- ✅ Black color ensures good contrast
- ✅ All edits preserved in final image

---

## 🎉 **Examples**

### Meme Captions:
```
"Fit check 💯"
"Dripped out"
"Look, I tried 🤷"
"No cap"
"Sheeesh"
```

### Event Labels:
```
"Halloween 2025"
"Birthday Fit"
"New Year, New Me"
"Date Night Ready"
```

### Personal Touch:
```
"@yourusername"
"Custom made on Look, I Tried"
"One of one ✨"
```

---

Have fun adding text to your outfits! 🎨✨

