# THE MINDVERSE — 3D Interactive Intro

A browser-based Three.js intro for Trí Huỳnh's personal portfolio.

## Run locally
Because this uses ES modules and loads a local portrait texture, serve the folder over HTTP (do not open index.html
directly).

Python:
```bash
cd mindverse_3d_intro
python -m http.server 8080
```
Then open http://localhost:8080

Node alternative:
```bash
npx serve .
```

## Interactions
- Drag to orbit the scene
- Scroll to zoom
- “Enter the mindverse” triggers the intro transition
- “Reframe the world” toggles auto-rotation

## Customize
- Edit copy and colors in `index.html`
- Replace `assets/tri-portrait.jpeg` with another portrait (keep the same filename)
- Three.js and OrbitControls are loaded from jsDelivr, so internet access is required.

## Production notes
This is a prototype. For production, consider lazy-loading the 3D scene, serving optimized WebP/AVIF portrait assets,
providing a static fallback for reduced-motion/low-power devices, and integrating the intro into your existing app
routing.
