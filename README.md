# 🔩 GScrewPuzzle

[![Build Status](https://img.shields.io/github/actions/workflow/status/nicobailey/GScrewPuzzle/ci.yml?branch=main&style=flat-square)](https://github.com/nicobailey/GScrewPuzzle/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](package.json)

A production-quality **screw puzzle game** built with vanilla JavaScript, featuring match-3 mechanics, layered plate physics, power-ups, particle effects, and synthesized audio — all running in the browser with zero dependencies.

---

## 🎮 How to Play

1. **Tap an accessible screw** to unscrew it from the board.
2. The screw flies into one of the **collection holes** at the bottom.
3. When **3 screws of the same color** land in the holes, they **match and clear**.
4. Once all screws on a plate are removed, the **plate disappears**, revealing screws underneath.
5. Clear **all screws** to complete the level!
6. **Be careful** — if all holes fill up with no matches possible, you lose.

## ✨ Features

- **15 hand-crafted levels** with increasing complexity
- **Layered plate system** — plates stack with z-index blocking mechanics
- **Match-3 clearing** — collect 3 same-color screws to clear them
- **4 Power-ups**: Undo, Extra Slots, Bolt Cutter, and Hint
- **Star rating system** (1–3 stars based on par score)
- **Persistent progress** via `localStorage`
- **Web Audio API** synthesized sound effects (tap, unscrew, match, win, lose)
- **Canvas-based particle system** (sparkles, explosions, confetti, shimmer)
- **Flying screw animation** with quadratic bezier curves
- **Responsive design** — works on mobile, tablet, and desktop
- **Zero runtime dependencies** — pure vanilla JS

## 📸 Screenshots

> _Screenshots coming soon._

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18+**
- npm (included with Node.js)

### Installation

```bash
git clone https://github.com/nicobailey/GScrewPuzzle.git
cd GScrewPuzzle
npm install
```

### Development

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint with auto-fix
npm run format     # Format code with Prettier
npm run test       # Run tests with Vitest
```

## 🏗️ Project Architecture

```
GScrewPuzzle/
├── src/
│   ├── index.html              # HTML shell
│   ├── css/
│   │   ├── main.css            # Base/reset styles + CSS imports
│   │   ├── components.css      # Plates, screws, holes, power-ups
│   │   ├── screens.css         # Start, level select, game screens
│   │   ├── modals.css          # Win/lose/pause modals
│   │   ├── animations.css      # Keyframes & transitions
│   │   └── responsive.css      # Media queries
│   └── js/
│       ├── main.js             # Entry point — imports & init
│       ├── constants.js        # Board dimensions, color maps
│       ├── sound.js            # Web Audio API sound effects
│       ├── particles.js        # Canvas particle system
│       ├── levels.js           # 15 level definitions
│       ├── storage.js          # localStorage persistence
│       ├── game.js             # Core game logic & state
│       ├── renderer.js         # DOM rendering engine
│       ├── powerups.js         # Undo, Extra Slots, Cutter, Hint
│       └── ui.js               # Screen & modal management
├── vite.config.js              # Vite build configuration
├── .eslintrc.cjs               # ESLint rules
├── .prettierrc                 # Prettier formatting
├── package.json                # Project manifest & scripts
├── LICENSE                     # MIT License
└── README.md                   # This file
```

### Module Dependency Graph

```
constants.js ──┐
sound.js ──────┤
particles.js ──┼──▶ game.js ──┐
levels.js ─────┤              ├──▶ main.js (entry)
storage.js ────┘              │
                renderer.js ──┤
                powerups.js ──┤
                ui.js ────────┘
```

## 🛠️ Tech Stack

| Category       | Technology                     |
| -------------- | ------------------------------ |
| Language       | JavaScript (ES2022 modules)    |
| Build Tool     | Vite                           |
| Rendering      | DOM + Canvas (particles)       |
| Audio          | Web Audio API (synthesized)    |
| Storage        | localStorage                   |
| Styling        | CSS3 (gradients, animations)   |
| Linter         | ESLint                         |
| Formatter      | Prettier                       |
| Test Framework | Vitest                         |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code passes linting (`npm run lint`) and tests (`npm run test`) before submitting.

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
