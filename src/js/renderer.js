import { Game } from './game.js';

// ========== RENDERER ==========
export const Renderer = {
  /**
   * Render all plates and screws on the board
   * Clears and rebuilds the entire board DOM
   */
  renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Render plates sorted by z-index (back to front)
    const visiblePlates = Game.plates
      .filter(p => !p.removed)
      .sort((a, b) => a.z - b.z);

    for (const plate of visiblePlates) {
      const el = document.createElement('div');
      el.className = 'plate';
      el.dataset.plateId = plate.id;
      el.style.left = plate.x + 'px';
      el.style.top = plate.y + 'px';
      el.style.width = plate.w + 'px';
      el.style.height = plate.h + 'px';
      el.style.zIndex = plate.z * 10;
      board.appendChild(el);
    }

    // Render screws
    for (let i = 0; i < Game.screws.length; i++) {
      const screw = Game.screws[i];
      if (screw.removed) continue;

      const accessible = Game.isScrewAccessible(i);
      const isCutterTarget = Game.cutterMode && accessible;

      const el = document.createElement('div');
      el.className = `screw screw-${screw.color}`;
      el.classList.add(accessible ? 'accessible' : 'blocked');
      if (isCutterTarget) el.classList.add('cutter-target');

      el.style.left = screw.x + 'px';
      el.style.top = screw.y + 'px';

      // Z-index: above its highest parent plate
      let maxZ = 0;
      for (const pid of screw.plateIds) {
        if (Game.plates[pid] && Game.plates[pid].z > maxZ) {
          maxZ = Game.plates[pid].z;
        }
      }
      el.style.zIndex = maxZ * 10 + 5;

      el.dataset.screwIdx = i;

      // Inner screw visual structure
      el.innerHTML = `
        <div class="screw-inner">
          <div class="screw-highlight"></div>
        </div>
        <div class="screw-rim"></div>
      `;

      // Event listeners
      if (accessible) {
        const idx = i;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          Game.removeScrew(idx);
        });
        el.addEventListener('touchend', (e) => {
          e.preventDefault();
          e.stopPropagation();
          Game.removeScrew(idx);
        });
      }

      board.appendChild(el);
    }
  },

  /**
   * Render the holes bar with current screw placements
   */
  renderHoles() {
    const bar = document.getElementById('holesBar');
    bar.innerHTML = '';

    for (let i = 0; i < Game.holes.length; i++) {
      const hole = Game.holes[i];
      const el = document.createElement('div');
      el.className = 'hole';
      if (hole.extra) el.classList.add('extra');

      if (hole.screw) {
        const screwEl = document.createElement('div');
        screwEl.className = `hole-screw color-${hole.screw.color}`;
        el.appendChild(screwEl);
      }

      bar.appendChild(el);
    }
  },

  /**
   * Update power-up button states (disabled/enabled, counts)
   */
  updatePowerUps() {
    const undoBtn = document.getElementById('puUndo');
    const extraBtn = document.getElementById('puExtra');
    const cutterBtn = document.getElementById('puCutter');
    const hintBtn = document.getElementById('puHint');

    // Undo: disabled if no history or animating
    const canUndo = Game.moveHistory.length > 0 && !Game.animating && !Game.won && !Game.lost;
    undoBtn.classList.toggle('disabled', !canUndo);

    // Extra slots: disabled if already used
    const canExtra = !Game.extraSlotsUsed && !Game.animating && !Game.won;
    extraBtn.classList.toggle('disabled', !canExtra);

    // Bolt cutter: disabled if none left
    const canCut = Game.cutterCount > 0 && !Game.animating && !Game.won && !Game.lost;
    cutterBtn.classList.toggle('disabled', !canCut);
    cutterBtn.classList.toggle('active-mode', Game.cutterMode);

    // Hint: disabled if animating
    const canHint = !Game.animating && !Game.won && !Game.lost;
    hintBtn.classList.toggle('disabled', !canHint);

    // Update counts
    document.getElementById('puCutterCount').textContent = Game.cutterCount;
    document.getElementById('puExtraCount').textContent = Game.extraSlotsUsed ? '0' : '1';
  }
};
