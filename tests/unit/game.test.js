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
});
