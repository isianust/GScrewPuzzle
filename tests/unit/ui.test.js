vi.mock('../../src/js/game.js', () => ({
  Game: {
    currentLevel: 1,
    moves: 0,
    screws: [],
    startLevel: vi.fn(),
    scaleBoard: vi.fn(),
  }
}));

vi.mock('../../src/js/sound.js', () => ({
  Sound: {
    click: vi.fn(),
  }
}));

vi.mock('../../src/js/storage.js', () => ({
  Storage: {
    isUnlocked: vi.fn(),
    getStars: vi.fn(),
    data: { lastLevel: 1, unlockedLevel: 1, stars: {}, totalScore: 0 },
  }
}));

vi.mock('../../src/js/levels.js', () => ({
  Levels: [
    { plates: [], screws: [], par: 6 },
    { plates: [], screws: [], par: 8 },
    { plates: [], screws: [], par: 10 },
  ]
}));

import { UI } from '../../src/js/ui.js';
import { Game } from '../../src/js/game.js';
import { Sound } from '../../src/js/sound.js';
import { Storage } from '../../src/js/storage.js';
import { Levels } from '../../src/js/levels.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="startScreen" class="screen active"></div>
    <div id="levelSelect" class="screen">
      <div id="levelGrid" class="level-grid"></div>
    </div>
    <div id="gameScreen" class="screen"></div>
    <div id="levelTitle">Level 1</div>
    <div id="movesDisplay">Moves: 0</div>
    <div class="modal-overlay" id="winModal">
      <div id="winStars">⭐⭐⭐</div>
      <div id="winScore">Moves: 0 / Par: 0</div>
    </div>
    <div class="modal-overlay" id="loseModal"></div>
    <div id="pauseOverlay"></div>
  `;
}

describe('UI', () => {
  beforeEach(() => {
    setupDOM();
    Game.currentLevel = 1;
    Game.moves = 0;
    vi.clearAllMocks();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb();
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== showScreen ==========
  describe('showScreen', () => {
    it('deactivates all screens', () => {
      UI.showScreen('levelSelect');
      const screens = document.querySelectorAll('.screen');
      const activeScreens = [...screens].filter(s => s.classList.contains('active'));
      expect(activeScreens.length).toBe(1);
      expect(activeScreens[0].id).toBe('levelSelect');
    });

    it('activates the target screen', () => {
      UI.showScreen('gameScreen');
      expect(document.getElementById('gameScreen').classList.contains('active')).toBe(true);
    });

    it('plays click sound', () => {
      UI.showScreen('startScreen');
      expect(Sound.click).toHaveBeenCalled();
    });

    it('renders level grid when showing levelSelect', () => {
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(0);
      UI.showScreen('levelSelect');
      const grid = document.getElementById('levelGrid');
      expect(grid.children.length).toBe(Levels.length);
    });

    it('calls Game.scaleBoard when showing gameScreen', () => {
      UI.showScreen('gameScreen');
      expect(Game.scaleBoard).toHaveBeenCalled();
    });

    it('does not crash when target screen does not exist', () => {
      expect(() => UI.showScreen('nonExistent')).not.toThrow();
    });
  });

  // ========== renderLevelGrid ==========
  describe('renderLevelGrid', () => {
    it('creates a button for each level', () => {
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      expect(buttons.length).toBe(Levels.length);
    });

    it('marks unlocked levels with .unlocked class', () => {
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      buttons.forEach(btn => {
        expect(btn.classList.contains('unlocked')).toBe(true);
      });
    });

    it('marks locked levels with .locked class', () => {
      Storage.isUnlocked.mockReturnValue(false);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      buttons.forEach(btn => {
        expect(btn.classList.contains('locked')).toBe(true);
      });
    });

    it('shows lock icon for locked levels', () => {
      Storage.isUnlocked.mockReturnValue(false);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      expect(buttons[0].innerHTML).toContain('🔒');
    });

    it('shows stars for played unlocked levels', () => {
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(2);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      expect(buttons[0].querySelector('.stars-display')).toBeTruthy();
    });

    it('marks the current level with .current class', () => {
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 2;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      expect(buttons[0].classList.contains('current')).toBe(false);
      expect(buttons[1].classList.contains('current')).toBe(true);
    });

    it('clicking unlocked level button starts that level', () => {
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      buttons[1].click();
      expect(Game.startLevel).toHaveBeenCalledWith(2);
    });

    it('clicking locked level button does not start a level', () => {
      Storage.isUnlocked.mockReturnValue(false);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      const buttons = document.querySelectorAll('.level-btn');
      buttons[0].click();
      expect(Game.startLevel).not.toHaveBeenCalled();
    });

    it('clears grid before re-rendering', () => {
      const grid = document.getElementById('levelGrid');
      grid.innerHTML = '<div>old</div>';
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = 1;
      UI.renderLevelGrid();
      expect(grid.querySelector('div.old')).toBeNull();
    });
  });

  // ========== updateHeader ==========
  describe('updateHeader', () => {
    it('updates level title', () => {
      Game.currentLevel = 3;
      Game.moves = 5;
      UI.updateHeader();
      expect(document.getElementById('levelTitle').textContent).toBe('Level 3');
    });

    it('updates moves display with par', () => {
      Game.currentLevel = 2;
      Game.moves = 3;
      UI.updateHeader();
      expect(document.getElementById('movesDisplay').textContent).toBe('Moves: 3 / Par: 8');
    });
  });

  // ========== showWinModal ==========
  describe('showWinModal', () => {
    it('activates the win modal', () => {
      UI.showWinModal(3, 6, 6);
      expect(document.getElementById('winModal').classList.contains('active')).toBe(true);
    });

    it('shows correct star count', () => {
      UI.showWinModal(2, 8, 6);
      const starsHTML = document.getElementById('winStars').innerHTML;
      // Should have 2 filled stars with animation and 1 empty
      const filledStars = starsHTML.match(/animation/g) || [];
      expect(filledStars.length).toBe(2);
    });

    it('shows score text with moves and par', () => {
      UI.showWinModal(3, 5, 6);
      expect(document.getElementById('winScore').textContent).toBe('Moves: 5 / Par: 6');
    });
  });

  // ========== showLoseModal ==========
  describe('showLoseModal', () => {
    it('activates the lose modal', () => {
      UI.showLoseModal();
      expect(document.getElementById('loseModal').classList.contains('active')).toBe(true);
    });
  });

  // ========== closeModals ==========
  describe('closeModals', () => {
    it('deactivates all modal overlays', () => {
      document.getElementById('winModal').classList.add('active');
      document.getElementById('loseModal').classList.add('active');
      UI.closeModals();
      expect(document.getElementById('winModal').classList.contains('active')).toBe(false);
      expect(document.getElementById('loseModal').classList.contains('active')).toBe(false);
    });

    it('deactivates pause overlay', () => {
      document.getElementById('pauseOverlay').classList.add('active');
      UI.closeModals();
      expect(document.getElementById('pauseOverlay').classList.contains('active')).toBe(false);
    });
  });

  // ========== nextLevel ==========
  describe('nextLevel', () => {
    it('starts the next level when available', () => {
      Game.currentLevel = 1;
      UI.nextLevel();
      expect(Game.startLevel).toHaveBeenCalledWith(2);
    });

    it('shows level select when at the last level', () => {
      Game.currentLevel = Levels.length;
      Storage.isUnlocked.mockReturnValue(true);
      Storage.getStars.mockReturnValue(0);
      Storage.data.lastLevel = Levels.length;

      const showScreenSpy = vi.spyOn(UI, 'showScreen');
      UI.nextLevel();
      expect(Game.startLevel).not.toHaveBeenCalled();
      expect(showScreenSpy).toHaveBeenCalledWith('levelSelect');
    });

    it('closes modals before advancing', () => {
      Game.currentLevel = 1;
      document.getElementById('winModal').classList.add('active');
      UI.nextLevel();
      expect(document.getElementById('winModal').classList.contains('active')).toBe(false);
    });
  });

  // ========== pauseGame ==========
  describe('pauseGame', () => {
    it('activates pause overlay', () => {
      UI.pauseGame();
      expect(document.getElementById('pauseOverlay').classList.contains('active')).toBe(true);
    });

    it('plays click sound', () => {
      UI.pauseGame();
      expect(Sound.click).toHaveBeenCalled();
    });
  });

  // ========== resumeGame ==========
  describe('resumeGame', () => {
    it('deactivates pause overlay', () => {
      document.getElementById('pauseOverlay').classList.add('active');
      UI.resumeGame();
      expect(document.getElementById('pauseOverlay').classList.contains('active')).toBe(false);
    });

    it('plays click sound', () => {
      UI.resumeGame();
      expect(Sound.click).toHaveBeenCalled();
    });
  });

  // ========== startLastLevel ==========
  describe('startLastLevel', () => {
    it('starts the last played level when unlocked', () => {
      Storage.data.lastLevel = 2;
      Storage.isUnlocked.mockReturnValue(true);
      UI.startLastLevel();
      expect(Game.startLevel).toHaveBeenCalledWith(2);
    });

    it('starts level 1 when last level is locked', () => {
      Storage.data.lastLevel = 5;
      Storage.isUnlocked.mockReturnValue(false);
      UI.startLastLevel();
      expect(Game.startLevel).toHaveBeenCalledWith(1);
    });

    it('caps last level to Levels.length', () => {
      Storage.data.lastLevel = 100;
      Storage.isUnlocked.mockReturnValue(true);
      UI.startLastLevel();
      expect(Game.startLevel).toHaveBeenCalledWith(Levels.length);
    });

    it('starts level 1 when lastLevel is 0 or falsy', () => {
      Storage.data.lastLevel = 0;
      Storage.isUnlocked.mockReturnValue(true);
      UI.startLastLevel();
      expect(Game.startLevel).toHaveBeenCalledWith(1);
    });
  });
});
