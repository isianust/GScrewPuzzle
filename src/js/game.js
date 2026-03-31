import { BOARD_W, BOARD_H, BASE_HOLE_COUNT, COLOR_HEX, COLOR_DARK, COLOR_LIGHT, SCREW_RENDER_SIZE } from './constants.js';
import { Sound } from './sound.js';
import { Particles } from './particles.js';
import { Levels } from './levels.js';
import { Storage } from './storage.js';

// ========== GAME STATE & CORE LOGIC ==========
// Note: Game.renderer and Game.ui are set by main.js to break circular dependencies.
export const Game = {
  renderer: null,
  ui: null,
  currentLevel: 1,
  plates: [],
  screws: [],
  holes: [],
  moves: 0,
  moveHistory: [],
  extraSlotsUsed: false,
  cutterCount: 2,
  cutterMode: false,
  animating: false,
  won: false,
  lost: false,
  boardScale: 1,

  /**
   * Initialize and start a level
   * @param {number} levelNum - 1-indexed level number
   */
  startLevel(levelNum) {
    if (levelNum < 1 || levelNum > Levels.length) return;
    this.currentLevel = levelNum;
    Storage.setLastLevel(levelNum);

    const def = Levels[levelNum - 1];

    // Deep-copy plates and screws to avoid mutating level data
    this.plates = def.plates.map((p, i) => ({
      x: p.x, y: p.y, w: p.w, h: p.h, z: p.z,
      id: i, removed: false
    }));

    this.screws = def.screws.map((s, i) => ({
      x: s.x, y: s.y, color: s.color,
      plateIds: [...s.plateIds],
      id: i, removed: false
    }));

    // Initialize holes
    this.holes = [];
    for (let i = 0; i < BASE_HOLE_COUNT; i++) {
      this.holes.push({ id: i, screw: null, extra: false });
    }

    // Reset state
    this.moves = 0;
    this.moveHistory = [];
    this.extraSlotsUsed = false;
    this.cutterCount = 2;
    this.cutterMode = false;
    this.animating = false;
    this.won = false;
    this.lost = false;

    // Close any open modals and show game screen
    this.ui.closeModals();
    this.ui.showScreen('gameScreen');

    // Render everything
    this.renderer.renderBoard();
    this.renderer.renderHoles();
    this.renderer.updatePowerUps();
    this.ui.updateHeader();

    // Scale board to fit after layout
    requestAnimationFrame(() => {
      this.scaleBoard();
    });
  },

  /** Restart the current level */
  restartLevel() {
    this.ui.closeModals();
    this.startLevel(this.currentLevel);
  },

  /** Calculate and apply board scaling to fit the viewport */
  scaleBoard() {
    const wrapper = document.querySelector('.board-wrapper');
    const board = document.getElementById('board');
    if (!wrapper || !board) return;

    const availW = wrapper.clientWidth - 20;
    const availH = wrapper.clientHeight - 10;
    const scaleX = availW / BOARD_W;
    const scaleY = availH / BOARD_H;
    this.boardScale = Math.min(scaleX, scaleY, 1.25);

    board.style.transform = `scale(${this.boardScale})`;
    board.style.transformOrigin = 'top center';
    board.style.width = BOARD_W + 'px';
    board.style.height = BOARD_H + 'px';
  },

  /**
   * Check if a screw is accessible (not blocked by higher plates)
   * A screw is blocked if any unremoved plate that:
   * 1. Has a higher z-index than all of the screw's parent plates
   * 2. Is NOT a parent plate of this screw
   * 3. Geometrically covers the screw's position
   * @param {number} screwIdx - Index into this.screws
   * @returns {boolean}
   */
  isScrewAccessible(screwIdx) {
    const screw = this.screws[screwIdx];
    if (!screw || screw.removed) return false;

    // Find the maximum z-index among the screw's unremoved parent plates
    let screwMaxZ = 0;
    for (const pid of screw.plateIds) {
      const plate = this.plates[pid];
      if (!plate.removed && plate.z > screwMaxZ) {
        screwMaxZ = plate.z;
      }
    }

    // Check every plate to see if it blocks this screw
    for (const plate of this.plates) {
      if (plate.removed) continue;
      // Skip if this plate is a parent of the screw
      if (screw.plateIds.includes(plate.id)) continue;
      // Only plates with strictly higher z can block
      if (plate.z <= screwMaxZ) continue;
      // Check if screw center is within plate bounds
      if (screw.x >= plate.x && screw.x <= plate.x + plate.w &&
          screw.y >= plate.y && screw.y <= plate.y + plate.h) {
        return false; // Blocked!
      }
    }
    return true;
  },

  /** Find the index of the first empty hole, or -1 */
  getFirstEmptyHole() {
    for (let i = 0; i < this.holes.length; i++) {
      if (this.holes[i].screw === null) return i;
    }
    return -1;
  },

  /**
   * Main action: remove a screw from the board
   * @param {number} screwIdx - Index of the screw to remove
   */
  async removeScrew(screwIdx) {
    if (this.animating || this.won || this.lost) return;

    const screw = this.screws[screwIdx];
    if (!screw || screw.removed) return;

    // Check accessibility
    if (!this.isScrewAccessible(screwIdx)) {
      Sound.tap();
      // Shake the screw to indicate it's blocked
      const el = document.querySelector(`[data-screw-idx="${screwIdx}"]`);
      if (el) {
        el.style.animation = 'none';
        el.offsetHeight; // Force reflow
        el.style.animation = 'shake 0.3s ease';
        setTimeout(() => { el.style.animation = ''; }, 300);
      }
      return;
    }

    // Handle bolt cutter mode
    if (this.cutterMode) {
      this.cutterMode = false;
      this.cutterCount--;
      screw.removed = true;
      this.moves++;
      this.moveHistory.push({
        type: 'cut',
        screwIdx,
        screwSnapshot: { x: screw.x, y: screw.y, color: screw.color, plateIds: [...screw.plateIds] }
      });

      Sound.snip();

      // Sparkle effect at screw position
      const board = document.getElementById('board');
      const boardRect = board.getBoundingClientRect();
      const sx = boardRect.left + screw.x * this.boardScale;
      const sy = boardRect.top + screw.y * this.boardScale;
      Particles.sparkle(sx, sy, screw.color);

      this.renderer.renderBoard();
      this.renderer.updatePowerUps();
      this.ui.updateHeader();
      this.checkPlateRemovals();
      if (!this.checkWin()) {
        this.checkLose();
      }
      return;
    }

    // Normal removal: find empty hole
    const holeIdx = this.getFirstEmptyHole();
    if (holeIdx === -1) {
      // No space available
      Sound.tap();
      return;
    }

    // Lock animations
    this.animating = true;

    // Mark screw as removed
    screw.removed = true;
    this.moves++;

    // Record move for undo
    this.moveHistory.push({
      type: 'move',
      screwIdx,
      holeIdx,
      screwSnapshot: { x: screw.x, y: screw.y, color: screw.color, plateIds: [...screw.plateIds] }
    });

    // Play unscrew sound
    Sound.unscrew();

    // Animate screw flying from board to hole
    await this.animateScrewToHole(screwIdx, holeIdx, screw);

    // Place screw in the hole
    this.holes[holeIdx].screw = { color: screw.color, screwIdx };
    Sound.place();

    // Re-render board and holes
    this.renderer.renderBoard();
    this.renderer.renderHoles();
    this.ui.updateHeader();

    // Check for match-3 clears
    await this.checkAndClearMatches();

    // Check for plate removals
    this.checkPlateRemovals();

    // Unlock animations
    this.animating = false;
    this.renderer.updatePowerUps();

    // Check win/lose conditions
    if (!this.checkWin()) {
      this.checkLose();
    }
  },

  /**
   * Animate a screw flying from its board position to a hole
   * Uses a quadratic bezier curve for a nice arc effect
   */
  async animateScrewToHole(screwIdx, holeIdx, screw) {
    return new Promise(resolve => {
      const board = document.getElementById('board');
      const boardRect = board.getBoundingClientRect();

      // Calculate start position (screw on board, accounting for scale)
      const startX = boardRect.left + screw.x * this.boardScale;
      const startY = boardRect.top + screw.y * this.boardScale;

      // Calculate end position (target hole)
      const holeElements = document.querySelectorAll('.hole');
      const holeEl = holeElements[holeIdx];
      if (!holeEl) { resolve(); return; }
      const holeRect = holeEl.getBoundingClientRect();
      const endX = holeRect.left + holeRect.width / 2;
      const endY = holeRect.top + holeRect.height / 2;

      // Create flying screw element
      const flyEl = document.createElement('div');
      flyEl.className = 'flying-screw';
      const gradient = `radial-gradient(circle at 35% 35%, ${COLOR_LIGHT[screw.color]}, ${COLOR_HEX[screw.color]} 50%, ${COLOR_DARK[screw.color]})`;
      flyEl.style.background = gradient;
      flyEl.style.left = startX + 'px';
      flyEl.style.top = startY + 'px';
      const scaledSize = SCREW_RENDER_SIZE * this.boardScale;
      flyEl.style.width = scaledSize + 'px';
      flyEl.style.height = scaledSize + 'px';
      flyEl.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(flyEl);

      // Spawn sparkles at the source
      Particles.sparkle(startX, startY, screw.color);

      // Animation parameters
      const duration = 420;
      const startTime = performance.now();
      // Control point for the bezier arc (above midpoint)
      const midX = (startX + endX) / 2;
      const arcHeight = -Math.min(100, Math.abs(endY - startY) * 0.4 + 50);
      const midY = Math.min(startY, endY) + arcHeight;

      const animateFrame = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Ease-in-out quad
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // Quadratic bezier position
        const u = 1 - ease;
        const cx = u * u * startX + 2 * u * ease * midX + ease * ease * endX;
        const cy = u * u * startY + 2 * u * ease * midY + ease * ease * endY;

        // Rotation and scale
        const rotation = ease * 720;
        const scale = 1 - ease * 0.2;

        flyEl.style.left = cx + 'px';
        flyEl.style.top = cy + 'px';
        flyEl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;

        if (t < 1) {
          requestAnimationFrame(animateFrame);
        } else {
          flyEl.remove();
          resolve();
        }
      };

      requestAnimationFrame(animateFrame);
    });
  },

  /**
   * Check for and clear any match-3 groups in the holes
   * Continues checking until no more matches are found
   */
  async checkAndClearMatches() {
    let foundMatch = true;

    while (foundMatch) {
      foundMatch = false;

      // Count colors in holes
      const colorPositions = {};
      for (let i = 0; i < this.holes.length; i++) {
        const h = this.holes[i];
        if (h.screw) {
          const c = h.screw.color;
          if (!colorPositions[c]) colorPositions[c] = [];
          colorPositions[c].push(i);
        }
      }

      // Find first color with 3+ screws
      for (const color in colorPositions) {
        if (colorPositions[color].length >= 3) {
          foundMatch = true;
          const matchIndices = colorPositions[color].slice(0, 3);

          // Play match sound
          Sound.match();

          // Animate the match clear
          await this.animateMatchClear(matchIndices, color);

          // Remove matched screws from holes
          for (const idx of matchIndices) {
            this.holes[idx].screw = null;
          }

          // Compact: shift remaining screws to the left
          this.compactHoles();

          // Re-render holes
          this.renderer.renderHoles();

          // Brief pause for visual clarity
          await this.delay(120);

          break; // Restart the while loop to check for cascading matches
        }
      }
    }
  },

  /**
   * Compact holes by shifting all screws to leftmost positions
   * Maintains order but removes gaps
   */
  compactHoles() {
    const occupied = this.holes.filter(h => h.screw !== null).map(h => ({ ...h.screw }));
    for (let i = 0; i < this.holes.length; i++) {
      this.holes[i].screw = i < occupied.length ? occupied[i] : null;
    }
  },

  /**
   * Animate match-3 clear effect
   * @param {number[]} indices - Hole indices to clear
   * @param {string} color - Color of matched screws
   */
  async animateMatchClear(indices, color) {
    return new Promise(resolve => {
      const holeElements = document.querySelectorAll('.hole');

      indices.forEach(idx => {
        const el = holeElements[idx];
        if (!el) return;

        // Animate the screw in the hole
        const screwEl = el.querySelector('.hole-screw');
        if (screwEl) {
          screwEl.style.animation = 'matchPop 0.45s ease-out forwards';
        }

        // Particle explosion at each matched hole
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        Particles.explode(cx, cy, color);
      });

      setTimeout(resolve, 480);
    });
  },

  /**
   * Check all plates and remove any that have no remaining screws
   */
  checkPlateRemovals() {
    for (const plate of this.plates) {
      if (plate.removed) continue;

      // Does this plate have any unremoved screws?
      const hasRemainingScrew = this.screws.some(
        s => !s.removed && s.plateIds.includes(plate.id)
      );

      if (!hasRemainingScrew) {
        plate.removed = true;
        Sound.plateRemove();

        // Animate plate removal
        const plateEl = document.querySelector(`[data-plate-id="${plate.id}"]`);
        if (plateEl) {
          plateEl.classList.add('removing');

          // Particles at plate center
          const rect = plateEl.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          Particles.sparkle(cx, cy, 'yellow');
          Particles.shimmer(cx - 30, cy, 'yellow');
          Particles.shimmer(cx + 30, cy, 'yellow');

          // Remove element after animation
          setTimeout(() => {
            if (plateEl.parentNode) plateEl.remove();
          }, 600);
        }

        // Re-render to update screw accessibility
        this.renderer.renderBoard();
      }
    }
  },

  /**
   * Check if all screws are removed (win condition)
   * @returns {boolean}
   */
  checkWin() {
    const allRemoved = this.screws.every(s => s.removed);
    if (!allRemoved) return false;

    this.won = true;
    this.animating = true;

    // Calculate star rating
    const par = Levels[this.currentLevel - 1].par;
    let stars = 1;
    if (this.moves <= par) {
      stars = 3;
    } else if (this.moves <= Math.floor(par * 1.5)) {
      stars = 2;
    }

    // Save progress
    Storage.setStars(this.currentLevel, stars);

    // Play victory sound
    Sound.win();

    // Confetti celebration
    const w = window.innerWidth;
    const h = window.innerHeight;
    Particles.confetti(w / 2, h / 3);
    setTimeout(() => {
      Particles.confetti(w * 0.25, h * 0.4);
      Particles.confetti(w * 0.75, h * 0.4);
    }, 250);
    setTimeout(() => {
      Particles.confetti(w / 2, h / 2);
    }, 500);

    // Show win modal after a brief delay
    setTimeout(() => {
      this.ui.showWinModal(stars, this.moves, par);
    }, 900);

    return true;
  },

  /**
   * Check if the game is lost (all holes full, no matches possible)
   * @returns {boolean}
   */
  checkLose() {
    // Can only lose if there are no empty holes
    if (this.getFirstEmptyHole() !== -1) return false;

    // Check if any match-3 is still possible in the current holes
    const colorCounts = {};
    for (const h of this.holes) {
      if (h.screw) {
        const c = h.screw.color;
        colorCounts[c] = (colorCounts[c] || 0) + 1;
      }
    }

    for (const color in colorCounts) {
      if (colorCounts[color] >= 3) return false; // A match is still pending
    }

    // All holes full, no matches possible - game over
    this.lost = true;
    Sound.lose();

    setTimeout(() => {
      this.ui.showLoseModal();
    }, 600);

    return true;
  },

  /** Promise-based delay helper */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
