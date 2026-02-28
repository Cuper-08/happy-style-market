

## Fix: 360 Viewer Accidental Zoom on Scroll

### Problem
The `ProductViewer360` component has an `onWheel` handler that captures **all** scroll wheel events over the image and converts them into zoom. When a user scrolls down the product page and their cursor passes over the 360 viewer, it:
1. Prevents normal page scrolling (`e.preventDefault()`)
2. Zooms the image in/out unintentionally
3. Leaves the image stuck at a zoomed-in state (the "Reset" button is small and easy to miss)

This is especially bad on mobile/trackpad where scroll gestures are constant.

### Solution
**Remove the wheel-to-zoom feature entirely.** The zoom functionality via pinch (touch) is sufficient and intentional. Wheel/scroll should never hijack page scrolling.

### Technical Changes

**File: `src/components/product/ProductViewer360.tsx`**

1. Remove the `handleWheel` function (lines ~119-122)
2. Remove the `onWheel={handleWheel}` prop from the container div (line ~140)
3. Optionally: also remove the zoom `scale` feature entirely since pinch-to-zoom on desktop is uncommon and the feature causes more confusion than value. If kept, at minimum ensure wheel events pass through normally.

This is a 2-line removal that fixes the scrolling/zoom issue completely.

