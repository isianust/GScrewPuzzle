import { Game } from './game.js';
import { Sound } from './sound.js';
import { Storage } from './storage.js';
import { Levels } from './levels.js';

// ========== UI MANAGER ==========
export const UI = {
  /**
   * Switch to a named screen, hiding all others
   * @param {string} screenId - DOM id of the screen to show
   */
  showScreen(screenId) {
    Sound.click();

    // Deactivate all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Activate target screen
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');

    // Screen-specific setup
    if (screenId === 'levelSelect') {
      this.renderLevelGrid();
    }
    if (screenId === 'gameScreen') {
      requestAnimationFrame(() => Game.scaleBoard());
    }
  },

  /**
   * Render the level select grid with unlock states and stars
   */
  renderLevelGrid() {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';

    for (let i = 1; i <= Levels.length; i++) {
      const btn = document.createElement('button');
      const unlocked = Storage.isUnlocked(i);
      const stars = Storage.getStars(i);
      const isCurrent = i === Storage.data.lastLevel;

      btn.className = 'level-btn';
      if (unlocked) btn.classList.add('unlocked');
      else btn.classList.add('locked');
      if (isCurrent && unlocked) btn.classList.add('current');

      // Build button content
      let content = '';
      if (unlocked) {
        content = `<span>${i}</span>`;
        if (stars > 0) {
          let starsStr = '';
          for (let s = 0; s < 3; s++) {
            starsStr += s < stars ? '⭐' : '<span style="opacity:0.2">☆</span>';
          }
          content += `<span class="stars-display">${starsStr}</span>`;
        }
      } else {
        content = '🔒';
      }

      btn.innerHTML = content;

      if (unlocked) {
        const levelNum = i;
        btn.addEventListener('click', () => {
          Game.startLevel(levelNum);
        });
      }

      grid.appendChild(btn);
    }
  },

  /**
   * Update the game header with current level info and moves
   */
  updateHeader() {
    const levelDef = Levels[Game.currentLevel - 1];
    document.getElementById('levelTitle').textContent = `Level ${Game.currentLevel}`;
    document.getElementById('movesDisplay').textContent =
      `Moves: ${Game.moves} / Par: ${levelDef.par}`;
  },

  /**
   * Show the win modal with star rating
   * @param {number} stars - 1, 2, or 3
   * @param {number} moves - Total moves taken
   * @param {number} par - Optimal move count
   */
  showWinModal(stars, moves, par) {
    let starsHTML = '';
    for (let i = 0; i < 3; i++) {
      if (i < stars) {
        starsHTML += '<span style="animation: starPop 0.3s ease ' + (i * 0.15) + 's both">⭐</span>';
      } else {
        starsHTML += '<span class="star-empty">⭐</span>';
      }
    }

    document.getElementById('winStars').innerHTML = starsHTML;
    document.getElementById('winScore').textContent =
      `Moves: ${moves} / Par: ${par}`;

    document.getElementById('winModal').classList.add('active');
  },

  /** Show the lose/game-over modal */
  showLoseModal() {
    document.getElementById('loseModal').classList.add('active');
  },

  /** Close all modals and overlays */
  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.getElementById('pauseOverlay').classList.remove('active');
  },

  /**
   * Advance to the next level
   * If we're at the last level, go back to level select
   */
  nextLevel() {
    this.closeModals();
    const next = Game.currentLevel + 1;
    if (next <= Levels.length) {
      Game.startLevel(next);
    } else {
      // All levels complete - show level select with congratulations
      this.showScreen('levelSelect');
    }
  },

  /** Show pause overlay */
  pauseGame() {
    Sound.click();
    document.getElementById('pauseOverlay').classList.add('active');
  },

  /** Hide pause overlay */
  resumeGame() {
    Sound.click();
    document.getElementById('pauseOverlay').classList.remove('active');
  },

  /** Start the last played level or level 1 */
  startLastLevel() {
    const lvl = Math.min(Storage.data.lastLevel || 1, Levels.length);
    const target = Storage.isUnlocked(lvl) ? lvl : 1;
    Game.startLevel(target);
  }
};
