vi.mock('../../src/js/sound.js', () => ({
  Sound: {
    tap: vi.fn(),
    unscrew: vi.fn(),
    place: vi.fn(),
    match: vi.fn(),
    plateRemove: vi.fn(),
    win: vi.fn(),
    lose: vi.fn(),
    click: vi.fn(),
    snip: vi.fn(),
  }
}));

vi.mock('../../src/js/particles.js', () => ({
  Particles: {
    sparkle: vi.fn(),
    explode: vi.fn(),
    confetti: vi.fn(),
    shimmer: vi.fn(),
  }
}));

vi.mock('../../src/js/storage.js', () => ({
  Storage: {
    setStars: vi.fn(),
    setLastLevel: vi.fn(),
    load: vi.fn(),
    save: vi.fn(),
    getStars: vi.fn(),
    isUnlocked: vi.fn(),
    data: { unlockedLevel: 1, stars: {}, lastLevel: 1, totalScore: 0 },
  }
}));

import { Game } from '../../src/js/game.js';
import { Storage } from '../../src/js/storage.js';
import { Sound } from '../../src/js/sound.js';
import { Particles } from '../../src/js/particles.js';

function resetGame() {
  Game.plates = [];
  Game.screws = [];
  Game.holes = [];
  Game.moves = 0;
  Game.moveHistory = [];
  Game.currentLevel = 1;
  Game.extraSlotsUsed = false;
  Game.cutterCount = 2;
  Game.cutterMode = false;
  Game.animating = false;
  Game.won = false;
  Game.lost = false;
  Game.boardScale = 1;
  Game.renderer = {
    renderBoard: vi.fn(),
    renderHoles: vi.fn(),
    updatePowerUps: vi.fn(),
  };
  Game.ui = {
    showWinModal: vi.fn(),
    showLoseModal: vi.fn(),
    closeModals: vi.fn(),
    updateHeader: vi.fn(),
    showScreen: vi.fn(),
  };
}

describe('Game', () => {
  beforeEach(() => {
    resetGame();
    vi.clearAllMocks();
  });

  // ========== isScrewAccessible ==========
  describe('isScrewAccessible', () => {
    it('a screw on a single plate with no overlapping plates is accessible', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }
      ];
      expect(Game.isScrewAccessible(0)).toBe(true);
    });

    it('a screw blocked by a higher-z plate is NOT accessible', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 2, id: 1, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }
      ];
      expect(Game.isScrewAccessible(0)).toBe(false);
    });

    it('a screw on its own plate is accessible even if that plate has high z', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 5, id: 1, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [1], id: 0, removed: false }
      ];
      expect(Game.isScrewAccessible(0)).toBe(true);
    });

    it('removed plates do not block screws', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 2, id: 1, removed: true }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }
      ];
      expect(Game.isScrewAccessible(0)).toBe(true);
    });

    it('returns false for a removed screw', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: true }
      ];
      expect(Game.isScrewAccessible(0)).toBe(false);
    });

    it('a plate that does not geometrically cover the screw does not block it', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 200, y: 200, w: 100, h: 100, z: 2, id: 1, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }
      ];
      expect(Game.isScrewAccessible(0)).toBe(true);
    });
  });

  // ========== getFirstEmptyHole ==========
  describe('getFirstEmptyHole', () => {
    it('returns 0 when all holes are empty', () => {
      Game.holes = [
        { id: 0, screw: null },
        { id: 1, screw: null },
        { id: 2, screw: null }
      ];
      expect(Game.getFirstEmptyHole()).toBe(0);
    });

    it('returns correct index when some holes are filled', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'blue', screwIdx: 1 } },
        { id: 2, screw: null },
        { id: 3, screw: null }
      ];
      expect(Game.getFirstEmptyHole()).toBe(2);
    });

    it('returns -1 when all holes are full', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'blue', screwIdx: 1 } },
        { id: 2, screw: { color: 'green', screwIdx: 2 } }
      ];
      expect(Game.getFirstEmptyHole()).toBe(-1);
    });
  });

  // ========== checkPlateRemovals ==========
  describe('checkPlateRemovals', () => {
    it('plate is removed when all its screws are removed', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: true }
      ];
      Game.checkPlateRemovals();
      expect(Game.plates[0].removed).toBe(true);
      expect(Sound.plateRemove).toHaveBeenCalled();
    });

    it('plate stays when it still has screws', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false },
        { x: 60, y: 60, color: 'red', plateIds: [0], id: 1, removed: true }
      ];
      Game.checkPlateRemovals();
      expect(Game.plates[0].removed).toBe(false);
    });

    it('only removes plates with no remaining screws (mixed)', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 200, y: 0, w: 100, h: 100, z: 1, id: 1, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: true },
        { x: 250, y: 50, color: 'blue', plateIds: [1], id: 1, removed: false }
      ];
      Game.checkPlateRemovals();
      expect(Game.plates[0].removed).toBe(true);
      expect(Game.plates[1].removed).toBe(false);
    });
  });

  // ========== checkWin ==========
  describe('checkWin', () => {
    it('returns false when screws remain', () => {
      Game.screws = [
        { removed: true },
        { removed: false }
      ];
      expect(Game.checkWin()).toBe(false);
    });

    it('returns true when all screws are removed', () => {
      Game.currentLevel = 1;
      Game.moves = 6;
      Game.screws = [{ removed: true }, { removed: true }];
      expect(Game.checkWin()).toBe(true);
      expect(Game.won).toBe(true);
    });
  });

  // ========== checkLose ==========
  describe('checkLose', () => {
    it('returns false when empty holes exist', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: null }
      ];
      expect(Game.checkLose()).toBe(false);
    });

    it('returns false when holes full but match-3 exists', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'red', screwIdx: 1 } },
        { id: 2, screw: { color: 'red', screwIdx: 2 } }
      ];
      expect(Game.checkLose()).toBe(false);
    });

    it('returns true when holes full and no matches', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'blue', screwIdx: 1 } },
        { id: 2, screw: { color: 'green', screwIdx: 2 } }
      ];
      expect(Game.checkLose()).toBe(true);
      expect(Game.lost).toBe(true);
      expect(Sound.lose).toHaveBeenCalled();
    });
  });

  // ========== compactHoles ==========
  describe('compactHoles', () => {
    it('gaps in holes are filled by shifting screws left', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: null },
        { id: 2, screw: { color: 'blue', screwIdx: 1 } },
        { id: 3, screw: null }
      ];
      Game.compactHoles();
      expect(Game.holes[0].screw).toEqual({ color: 'red', screwIdx: 0 });
      expect(Game.holes[1].screw).toEqual({ color: 'blue', screwIdx: 1 });
      expect(Game.holes[2].screw).toBeNull();
      expect(Game.holes[3].screw).toBeNull();
    });

    it('order is preserved after compaction', () => {
      Game.holes = [
        { id: 0, screw: null },
        { id: 1, screw: { color: 'green', screwIdx: 2 } },
        { id: 2, screw: null },
        { id: 3, screw: { color: 'red', screwIdx: 0 } },
        { id: 4, screw: { color: 'blue', screwIdx: 1 } }
      ];
      Game.compactHoles();
      expect(Game.holes[0].screw.color).toBe('green');
      expect(Game.holes[1].screw.color).toBe('red');
      expect(Game.holes[2].screw.color).toBe('blue');
      expect(Game.holes[3].screw).toBeNull();
      expect(Game.holes[4].screw).toBeNull();
    });

    it('no change when already compacted', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'blue', screwIdx: 1 } },
        { id: 2, screw: null }
      ];
      Game.compactHoles();
      expect(Game.holes[0].screw.color).toBe('red');
      expect(Game.holes[1].screw.color).toBe('blue');
      expect(Game.holes[2].screw).toBeNull();
    });
  });

  // ========== Star calculation in checkWin ==========
  describe('star calculation in checkWin', () => {
    beforeEach(() => {
      // Level 1 has par = 6
      Game.currentLevel = 1;
      Game.screws = [{ removed: true }];
      Game.won = false;
      Game.animating = false;
    });

    it('3 stars when moves <= par', () => {
      Game.moves = 6;
      Game.checkWin();
      expect(Storage.setStars).toHaveBeenCalledWith(1, 3);
    });

    it('3 stars when moves < par', () => {
      Game.moves = 4;
      Game.checkWin();
      expect(Storage.setStars).toHaveBeenCalledWith(1, 3);
    });

    it('2 stars when moves <= par * 1.5', () => {
      Game.moves = 8;
      Game.checkWin();
      expect(Storage.setStars).toHaveBeenCalledWith(1, 2);
    });

    it('2 stars at exactly floor(par * 1.5)', () => {
      Game.moves = 9; // floor(6 * 1.5) = 9
      Game.checkWin();
      expect(Storage.setStars).toHaveBeenCalledWith(1, 2);
    });

    it('1 star when moves > par * 1.5', () => {
      Game.moves = 10;
      Game.checkWin();
      expect(Storage.setStars).toHaveBeenCalledWith(1, 1);
    });
  });

  // ========== startLevel ==========
  describe('startLevel', () => {
    beforeEach(() => {
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('does nothing for invalid level numbers (< 1)', () => {
      Game.startLevel(0);
      expect(Storage.setLastLevel).not.toHaveBeenCalled();
    });

    it('does nothing for level numbers exceeding max', () => {
      Game.startLevel(999);
      expect(Storage.setLastLevel).not.toHaveBeenCalled();
    });

    it('sets currentLevel correctly', () => {
      Game.startLevel(1);
      expect(Game.currentLevel).toBe(1);
    });

    it('calls Storage.setLastLevel', () => {
      Game.startLevel(1);
      expect(Storage.setLastLevel).toHaveBeenCalledWith(1);
    });

    it('deep-copies plates from level definition', () => {
      Game.startLevel(1);
      expect(Game.plates.length).toBeGreaterThan(0);
      expect(Game.plates[0]).toHaveProperty('id');
      expect(Game.plates[0]).toHaveProperty('removed', false);
    });

    it('deep-copies screws from level definition', () => {
      Game.startLevel(1);
      expect(Game.screws.length).toBeGreaterThan(0);
      expect(Game.screws[0]).toHaveProperty('id');
      expect(Game.screws[0]).toHaveProperty('removed', false);
      expect(Array.isArray(Game.screws[0].plateIds)).toBe(true);
    });

    it('initializes 7 empty holes', () => {
      Game.startLevel(1);
      expect(Game.holes.length).toBe(7);
      expect(Game.holes.every(h => h.screw === null)).toBe(true);
      expect(Game.holes.every(h => h.extra === false)).toBe(true);
    });

    it('resets game state', () => {
      Game.moves = 10;
      Game.won = true;
      Game.lost = true;
      Game.cutterCount = 0;
      Game.cutterMode = true;
      Game.extraSlotsUsed = true;
      Game.animating = true;

      Game.startLevel(1);

      expect(Game.moves).toBe(0);
      expect(Game.won).toBe(false);
      expect(Game.lost).toBe(false);
      expect(Game.cutterCount).toBe(2);
      expect(Game.cutterMode).toBe(false);
      expect(Game.extraSlotsUsed).toBe(false);
      expect(Game.animating).toBe(false);
    });

    it('calls ui.closeModals and ui.showScreen', () => {
      Game.startLevel(1);
      expect(Game.ui.closeModals).toHaveBeenCalled();
      expect(Game.ui.showScreen).toHaveBeenCalledWith('gameScreen');
    });

    it('calls renderer.renderBoard, renderHoles, updatePowerUps', () => {
      Game.startLevel(1);
      expect(Game.renderer.renderBoard).toHaveBeenCalled();
      expect(Game.renderer.renderHoles).toHaveBeenCalled();
      expect(Game.renderer.updatePowerUps).toHaveBeenCalled();
    });

    it('calls ui.updateHeader', () => {
      Game.startLevel(1);
      expect(Game.ui.updateHeader).toHaveBeenCalled();
    });

    it('does not mutate original level data', () => {
      const { Levels } = require('../../src/js/levels.js');
      const origPlatesLen = Levels[0].plates.length;
      const origScrewsLen = Levels[0].screws.length;
      Game.startLevel(1);
      // Mutate game state
      Game.plates[0].removed = true;
      Game.screws[0].removed = true;
      // Original should be unchanged
      expect(Levels[0].plates.length).toBe(origPlatesLen);
      expect(Levels[0].screws.length).toBe(origScrewsLen);
    });
  });

  // ========== restartLevel ==========
  describe('restartLevel', () => {
    beforeEach(() => {
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('closes modals and re-starts current level', () => {
      Game.currentLevel = 2;
      Game.restartLevel();
      expect(Game.ui.closeModals).toHaveBeenCalled();
      expect(Game.currentLevel).toBe(2);
    });
  });

  // ========== scaleBoard ==========
  describe('scaleBoard', () => {
    it('returns early when board-wrapper is missing', () => {
      document.body.innerHTML = '';
      expect(() => Game.scaleBoard()).not.toThrow();
    });

    it('returns early when board element is missing', () => {
      document.body.innerHTML = '<div class="board-wrapper"></div>';
      expect(() => Game.scaleBoard()).not.toThrow();
    });

    it('sets board transform and dimensions when elements exist', () => {
      document.body.innerHTML = '<div class="board-wrapper" style="width:800px;height:600px"><div id="board"></div></div>';
      Game.scaleBoard();
      const board = document.getElementById('board');
      expect(board.style.width).toBe('400px');
      expect(board.style.height).toBe('480px');
      expect(board.style.transformOrigin).toBe('top center');
    });
  });

  // ========== removeScrew ==========
  describe('removeScrew', () => {
    beforeEach(() => {
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
      // Setup minimal DOM
      document.body.innerHTML = '<div id="board"><div data-screw-idx="0" class="screw"></div></div>';
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('does nothing when animating', async () => {
      Game.animating = true;
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      await Game.removeScrew(0);
      expect(Game.screws[0].removed).toBe(false);
    });

    it('does nothing when game is won', async () => {
      Game.won = true;
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      await Game.removeScrew(0);
      expect(Game.screws[0].removed).toBe(false);
    });

    it('does nothing when game is lost', async () => {
      Game.lost = true;
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      await Game.removeScrew(0);
      expect(Game.screws[0].removed).toBe(false);
    });

    it('does nothing for invalid screw index', async () => {
      Game.screws = [];
      await Game.removeScrew(99);
      expect(Sound.tap).not.toHaveBeenCalled();
    });

    it('does nothing for already removed screw', async () => {
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: true }];
      await Game.removeScrew(0);
      expect(Sound.tap).not.toHaveBeenCalled();
    });

    it('plays tap sound for blocked screw', async () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 2, id: 1, removed: false }
      ];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      await Game.removeScrew(0);
      expect(Sound.tap).toHaveBeenCalled();
      expect(Game.screws[0].removed).toBe(false);
    });

    it('handles bolt cutter mode: removes screw without using a hole', async () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.holes = [{ id: 0, screw: null, extra: false }];
      Game.cutterMode = true;
      Game.cutterCount = 2;

      await Game.removeScrew(0);

      expect(Game.screws[0].removed).toBe(true);
      expect(Game.cutterMode).toBe(false);
      expect(Game.cutterCount).toBe(1);
      expect(Game.moves).toBe(1);
      expect(Sound.snip).toHaveBeenCalled();
      expect(Particles.sparkle).toHaveBeenCalled();
    });

    it('records cut move in history', async () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.holes = [{ id: 0, screw: null, extra: false }];
      Game.cutterMode = true;
      Game.cutterCount = 2;

      await Game.removeScrew(0);

      expect(Game.moveHistory.length).toBe(1);
      expect(Game.moveHistory[0].type).toBe('cut');
    });

    it('plays tap sound when no empty holes available', async () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.holes = [{ id: 0, screw: { color: 'blue', screwIdx: 99 }, extra: false }];

      await Game.removeScrew(0);

      expect(Sound.tap).toHaveBeenCalled();
      expect(Game.screws[0].removed).toBe(false);
    });
  });

  // ========== delay ==========
  describe('delay', () => {
    it('resolves after specified time', async () => {
      vi.useFakeTimers();
      const promise = Game.delay(100);
      vi.advanceTimersByTime(100);
      await expect(promise).resolves.toBeUndefined();
      vi.useRealTimers();
    });
  });

  // ========== checkWin edge cases ==========
  describe('checkWin - extended', () => {
    it('sets won and animating flags on win', () => {
      Game.currentLevel = 1;
      Game.screws = [{ removed: true }, { removed: true }];
      Game.moves = 5;
      Game.checkWin();
      expect(Game.won).toBe(true);
      expect(Game.animating).toBe(true);
    });

    it('plays win sound on victory', () => {
      Game.currentLevel = 1;
      Game.screws = [{ removed: true }];
      Game.moves = 3;
      Game.checkWin();
      expect(Sound.win).toHaveBeenCalled();
    });

    it('triggers confetti particles on win', () => {
      Game.currentLevel = 1;
      Game.screws = [{ removed: true }];
      Game.moves = 3;
      Game.checkWin();
      expect(Particles.confetti).toHaveBeenCalled();
    });

    it('saves stars via Storage.setStars on win', () => {
      Game.currentLevel = 1;
      Game.screws = [{ removed: true }];
      Game.moves = 6;
      Game.checkWin();
      expect(Storage.setStars).toHaveBeenCalledWith(1, 3);
    });
  });

  // ========== checkLose edge cases ==========
  describe('checkLose - extended', () => {
    it('does not set lost when there is exactly 1 empty hole', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: null }
      ];
      expect(Game.checkLose()).toBe(false);
      expect(Game.lost).toBe(false);
    });

    it('does not lose when 3 same-color screws are in full holes', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'red', screwIdx: 1 } },
        { id: 2, screw: { color: 'red', screwIdx: 2 } },
        { id: 3, screw: { color: 'blue', screwIdx: 3 } },
      ];
      expect(Game.checkLose()).toBe(false);
    });

    it('loses when all holes are full with diverse colors', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'blue', screwIdx: 1 } },
        { id: 2, screw: { color: 'green', screwIdx: 2 } },
        { id: 3, screw: { color: 'yellow', screwIdx: 3 } },
        { id: 4, screw: { color: 'purple', screwIdx: 4 } },
      ];
      expect(Game.checkLose()).toBe(true);
      expect(Game.lost).toBe(true);
    });

    it('plays lose sound on game over', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'blue', screwIdx: 1 } },
      ];
      Game.checkLose();
      expect(Sound.lose).toHaveBeenCalled();
    });
  });

  // ========== isScrewAccessible edge cases ==========
  describe('isScrewAccessible - extended', () => {
    it('returns false for null/undefined screw index', () => {
      Game.screws = [];
      expect(Game.isScrewAccessible(0)).toBe(false);
    });

    it('screw shared between two plates uses highest z', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 3, id: 1, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 2, id: 2, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0, 1], id: 0, removed: false }
      ];
      // Plate 2 has z=2, which is < screw's max z of 3, so it doesn't block
      expect(Game.isScrewAccessible(0)).toBe(true);
    });

    it('screw with all parent plates removed still checks non-parent plates', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: true },
        { x: 0, y: 0, w: 100, h: 100, z: 2, id: 1, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }
      ];
      // Parent plate is removed (z=0 for screw), plate 1 (z=2 > 0) covers the screw
      expect(Game.isScrewAccessible(0)).toBe(false);
    });

    it('accessible when all blocking plates are removed', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 3, id: 1, removed: true }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }
      ];
      expect(Game.isScrewAccessible(0)).toBe(true);
    });
  });

  // ========== compactHoles edge cases ==========
  describe('compactHoles - extended', () => {
    it('handles all empty holes', () => {
      Game.holes = [
        { id: 0, screw: null },
        { id: 1, screw: null },
        { id: 2, screw: null }
      ];
      Game.compactHoles();
      expect(Game.holes.every(h => h.screw === null)).toBe(true);
    });

    it('handles all full holes', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 } },
        { id: 1, screw: { color: 'blue', screwIdx: 1 } },
      ];
      Game.compactHoles();
      expect(Game.holes[0].screw.color).toBe('red');
      expect(Game.holes[1].screw.color).toBe('blue');
    });

    it('handles single element', () => {
      Game.holes = [{ id: 0, screw: { color: 'red', screwIdx: 0 } }];
      Game.compactHoles();
      expect(Game.holes[0].screw.color).toBe('red');
    });
  });
});
