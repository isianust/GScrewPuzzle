# 🔩 Screw Puzzle

A production-quality browser puzzle game inspired by the popular mobile "Screw Puzzle" (螺絲解謎) game.

**Unscrew · Match · Clear!**

![Start Screen](https://github.com/user-attachments/assets/80b61716-89f2-4447-b704-0a6674f084fa)

## 🎮 How to Play

1. **Tap colored screws** to unscrew them from metal plates into collection holes at the bottom
2. **Match 3 same-color screws** in the holes — they auto-clear, freeing up space
3. **Clear all plates** to win the level
4. **Don't fill all holes** without a match — that's game over!

### Rules
- Screws can only be removed if **no higher plate** covers them
- When **all screws** holding a plate are removed, the plate disappears
- Plan your moves — **color order matters** for match-3 clears

## ✨ Features

### Core Mechanics
- 🎨 **6 screw colors** (red, blue, green, yellow, purple, orange)
- 🔧 **Match-3 auto-clear** — the defining advanced mechanic
- 📋 **Stacked plates** with realistic depth and blocking logic
- 🔄 **Screw sharing** — screws can hold multiple overlapping plates

### 15 Progressive Levels
- Levels 1–3: Tutorial (2 plates, 2–3 colors)
- Levels 4–6: Easy (3 plates, 3–4 colors)
- Levels 7–9: Medium (3–4 plates, 4–5 colors)
- Levels 10–12: Hard (4–5 plates, 5–6 colors)
- Levels 13–15: Expert (5–6 plates, 6 colors, complex layouts)

### Power-ups
- ↩️ **Undo** — revert last move
- ➕ **Extra Slots** — add 3 temporary holes
- ✂️ **Bolt Cutter** — remove any screw instantly
- 💡 **Hint** — highlights the best screw to remove

### Visual Polish
- 🔩 3D metallic screw heads with Phillips-head cross pattern
- 🌀 Rotation animation when unscrewing
- ✈️ Smooth Bézier flight paths from board to hole
- 💥 Particle effects on match-3 clears
- 🎊 Confetti celebration on level complete
- ✨ Shimmer on accessible screws

### Audio
- 🔊 9 synthesized sound effects (Web Audio API, no external files)
- 🔇 Mute toggle

### Progression
- ⭐ Star rating (1–3 stars based on move count vs par)
- 📋 Level select grid with lock/unlock states
- 💾 localStorage persistence (progress, stars, last level)

### Responsive Design
- 📱 Mobile-first, touch-optimized (44px+ targets)
- 💻 Works on 320px to 1920px screens
- ⌨️ Desktop keyboard support

## 🚀 Getting Started

### Play Instantly
Just open `index.html` in any modern browser — **zero dependencies, zero build step**.

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html

# Or serve locally
python -m http.server 8000
# Visit http://localhost:8000
```

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🏗️ Technical Details

| Aspect | Detail |
|--------|--------|
| Architecture | Single HTML file (~2,900 lines) |
| Dependencies | **Zero** |
| Languages | Vanilla JS (ES6+), CSS3, HTML5 |
| Rendering | DOM-based with Canvas overlay for particles |
| Animation | CSS transitions + requestAnimationFrame |
| Audio | Web Audio API (oscillator-synthesized) |
| Storage | localStorage for persistence |
| Performance | 60fps smooth animations |

## 📄 License

MIT
