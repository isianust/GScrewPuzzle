# 🔩 Screw Puzzle

A modern HTML5 implementation of the famous **Screw Puzzle** game — fully playable in any browser with no dependencies.

## How to Play

1. **Open** `index.html` in any modern browser.
2. **Tap a screw** to select it (it lifts up with a glow).
3. **Tap an empty hole** at the bottom to move the screw there.
4. When all screws are removed from a plate, the plate disappears and the holes are freed.
5. **Clear all plates** to win the level!

### Rules

- A screw can only be removed if no higher plate is covering it.
- Holes are limited — plan ahead! When a plate is cleared its screws are released from the holes.
- If all holes are full and plates remain, the game is over — use **Undo** or **Restart**.

## Features

- 🎮 **8 hand-crafted levels** with increasing difficulty
- 🔄 **Undo** and **Restart** buttons
- 📱 **Responsive design** for phones, tablets, and desktops
- ✨ Smooth CSS animations and transitions
- 🎨 Modern dark gradient UI with vibrant plate colours
- 🏆 Level-complete celebration modal
- 🚫 No external dependencies — single HTML file

## Getting Started

```bash
# Simply open in your browser
open index.html
# or
xdg-open index.html
```

No build step, no server, no install required.

## Tech Stack

- HTML5 + CSS3 + Vanilla JavaScript
- CSS Grid & Flexbox responsive layout
- CSS custom properties and animations
- Touch-friendly (mobile-first design)
