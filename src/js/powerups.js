import { Game } from './game.js';
import { Sound } from './sound.js';
import { Renderer } from './renderer.js';

// ========== POWER-UPS ==========
export const PowerUps = {
  /**
   * Undo the last move
   * Puts the screw back on the board and removes it from the hole
   */
  undo() {
    if (Game.moveHistory.length === 0 || Game.animating || Game.won || Game.lost) return;

    Sound.click();
    const lastMove = Game.moveHistory.pop();
    Game.moves++; // Undo counts as a move (for star rating)

    if (lastMove.type === 'move') {
      // Restore screw to the board
      const screw = Game.screws[lastMove.screwIdx];
      screw.removed = false;
      screw.x = lastMove.screwSnapshot.x;
      screw.y = lastMove.screwSnapshot.y;
      screw.color = lastMove.screwSnapshot.color;
      screw.plateIds = [...lastMove.screwSnapshot.plateIds];

      // Remove from hole
      // Find the screw in holes by screwIdx
      for (let i = 0; i < Game.holes.length; i++) {
        if (Game.holes[i].screw && Game.holes[i].screw.screwIdx === lastMove.screwIdx) {
          Game.holes[i].screw = null;
          break;
        }
      }
      Game.compactHoles();

      // Restore any plates that should still exist
      for (const pid of screw.plateIds) {
        if (Game.plates[pid]) {
          Game.plates[pid].removed = false;
        }
      }
    } else if (lastMove.type === 'cut') {
      // Restore cut screw
      const screw = Game.screws[lastMove.screwIdx];
      screw.removed = false;
      screw.x = lastMove.screwSnapshot.x;
      screw.y = lastMove.screwSnapshot.y;
      screw.color = lastMove.screwSnapshot.color;
      screw.plateIds = [...lastMove.screwSnapshot.plateIds];
      Game.cutterCount++;

      // Restore plates
      for (const pid of screw.plateIds) {
        if (Game.plates[pid]) {
          Game.plates[pid].removed = false;
        }
      }
    }

    // Clear lose state if applicable
    if (Game.lost) {
      Game.lost = false;
      Game.ui.closeModals();
    }

    Renderer.renderBoard();
    Renderer.renderHoles();
    Renderer.updatePowerUps();
    Game.ui.updateHeader();
  },

  /**
   * Add 3 extra holes temporarily
   * One-time use per level
   */
  extraSlots() {
    if (Game.extraSlotsUsed || Game.animating || Game.won) return;

    Sound.click();
    Game.extraSlotsUsed = true;

    // Add 3 extra holes
    for (let i = 0; i < 3; i++) {
      Game.holes.push({
        id: Game.holes.length,
        screw: null,
        extra: true
      });
    }

    Renderer.renderHoles();
    Renderer.updatePowerUps();

    // If the game was lost (all holes full), the extra slots might save the player
    if (Game.lost) {
      Game.lost = false;
      Game.ui.closeModals();
    }
  },

  /**
   * Toggle bolt cutter mode
   * When active, the next screw tapped is removed entirely (not placed in a hole)
   */
  boltCutter() {
    if (Game.cutterCount <= 0 || Game.animating || Game.won || Game.lost) return;

    Sound.click();

    // Toggle cutter mode
    Game.cutterMode = !Game.cutterMode;

    // Update visual state
    Renderer.renderBoard();
    Renderer.updatePowerUps();
  },

  /**
   * Provide a hint by highlighting the best screw to remove
   * Priority: complete a match-3 > work toward a match > any accessible screw
   */
  hint() {
    if (Game.animating || Game.won || Game.lost) return;

    Sound.click();

    // Remove any existing hints
    document.querySelectorAll('.screw.hint-glow').forEach(el => {
      el.classList.remove('hint-glow');
    });

    let bestIdx = -1;

    // Count colors currently in holes
    const holeColors = {};
    for (const h of Game.holes) {
      if (h.screw) {
        const c = h.screw.color;
        holeColors[c] = (holeColors[c] || 0) + 1;
      }
    }

    // Priority 1: Find an accessible screw that would complete a match-3 (2 already in holes)
    for (let i = 0; i < Game.screws.length; i++) {
      const s = Game.screws[i];
      if (s.removed || !Game.isScrewAccessible(i)) continue;
      if ((holeColors[s.color] || 0) >= 2) {
        bestIdx = i;
        break;
      }
    }

    // Priority 2: Find a color that has the most accessible screws (toward completing a set)
    if (bestIdx === -1) {
      const accessibleByColor = {};
      for (let i = 0; i < Game.screws.length; i++) {
        const s = Game.screws[i];
        if (s.removed || !Game.isScrewAccessible(i)) continue;
        if (!accessibleByColor[s.color]) accessibleByColor[s.color] = [];
        accessibleByColor[s.color].push(i);
      }

      // Find a color where accessible + in-holes >= 3
      let bestCount = 0;
      let bestColor = null;
      for (const color in accessibleByColor) {
        const totalAvailable = accessibleByColor[color].length + (holeColors[color] || 0);
        if (totalAvailable >= 3 && accessibleByColor[color].length > bestCount) {
          bestCount = accessibleByColor[color].length;
          bestColor = color;
        }
      }

      if (bestColor && accessibleByColor[bestColor].length > 0) {
        bestIdx = accessibleByColor[bestColor][0];
      }
    }

    // Priority 3: Any accessible screw
    if (bestIdx === -1) {
      for (let i = 0; i < Game.screws.length; i++) {
        if (!Game.screws[i].removed && Game.isScrewAccessible(i)) {
          bestIdx = i;
          break;
        }
      }
    }

    // Highlight the chosen screw
    if (bestIdx !== -1) {
      const el = document.querySelector(`[data-screw-idx="${bestIdx}"]`);
      if (el) {
        el.classList.add('hint-glow');
        setTimeout(() => {
          el.classList.remove('hint-glow');
        }, 2500);
      }
    }
  }
};
