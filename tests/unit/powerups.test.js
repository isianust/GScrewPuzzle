vi.mock('../../src/js/game.js', () => ({
  Game: {
    plates: [],
    screws: [],
    holes: [],
    moves: 0,
    moveHistory: [],
    cutterCount: 2,
    cutterMode: false,
    extraSlotsUsed: false,
    animating: false,
    won: false,
    lost: false,
    isScrewAccessible: vi.fn(),
    compactHoles: vi.fn(),
    ui: {
      closeModals: vi.fn(),
      updateHeader: vi.fn(),
    },
  }
}));

vi.mock('../../src/js/sound.js', () => ({
  Sound: {
    click: vi.fn(),
  }
}));

vi.mock('../../src/js/renderer.js', () => ({
  Renderer: {
    renderBoard: vi.fn(),
    renderHoles: vi.fn(),
    updatePowerUps: vi.fn(),
  }
}));

import { PowerUps } from '../../src/js/powerups.js';
import { Game } from '../../src/js/game.js';
import { Sound } from '../../src/js/sound.js';
import { Renderer } from '../../src/js/renderer.js';

function resetGameState() {
  Game.plates = [];
  Game.screws = [];
  Game.holes = [];
  Game.moves = 0;
  Game.moveHistory = [];
  Game.cutterCount = 2;
  Game.cutterMode = false;
  Game.extraSlotsUsed = false;
  Game.animating = false;
  Game.won = false;
  Game.lost = false;
  Game.ui = {
    closeModals: vi.fn(),
    updateHeader: vi.fn(),
  };
}

describe('PowerUps', () => {
  beforeEach(() => {
    resetGameState();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="board"></div>';
  });

  // ========== undo ==========
  describe('undo', () => {
    it('does nothing when no move history', () => {
      Game.moveHistory = [];
      PowerUps.undo();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when animating', () => {
      Game.moveHistory = [{ type: 'move' }];
      Game.animating = true;
      PowerUps.undo();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when game is won', () => {
      Game.moveHistory = [{ type: 'move' }];
      Game.won = true;
      PowerUps.undo();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when game is lost', () => {
      Game.moveHistory = [{ type: 'move' }];
      Game.lost = true;
      PowerUps.undo();
      // Even though lost, undo should actually work — let me re-check the code
      // Actually, the code checks: Game.won || Game.lost => return
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('restores a moved screw to the board', () => {
      const snapshot = { x: 50, y: 50, color: 'red', plateIds: [0] };
      Game.screws = [{ x: 0, y: 0, color: 'red', plateIds: [0], id: 0, removed: true }];
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 }, extra: false },
        { id: 1, screw: null, extra: false },
      ];
      Game.moveHistory = [{ type: 'move', screwIdx: 0, holeIdx: 0, screwSnapshot: snapshot }];

      PowerUps.undo();

      expect(Sound.click).toHaveBeenCalled();
      expect(Game.screws[0].removed).toBe(false);
      expect(Game.screws[0].x).toBe(50);
      expect(Game.screws[0].y).toBe(50);
      expect(Game.screws[0].color).toBe('red');
      expect(Game.moveHistory.length).toBe(0);
    });

    it('removes screw from hole when undoing a move', () => {
      const snapshot = { x: 50, y: 50, color: 'blue', plateIds: [0] };
      Game.screws = [{ x: 0, y: 0, color: 'blue', plateIds: [0], id: 0, removed: true }];
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.holes = [
        { id: 0, screw: { color: 'blue', screwIdx: 0 }, extra: false },
        { id: 1, screw: null, extra: false },
      ];
      Game.moveHistory = [{ type: 'move', screwIdx: 0, holeIdx: 0, screwSnapshot: snapshot }];

      PowerUps.undo();

      // The screw should be removed from the hole
      expect(Game.compactHoles).toHaveBeenCalled();
    });

    it('increments move count when undoing', () => {
      const snapshot = { x: 50, y: 50, color: 'red', plateIds: [0] };
      Game.screws = [{ x: 0, y: 0, color: 'red', plateIds: [0], id: 0, removed: true }];
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.holes = [{ id: 0, screw: { color: 'red', screwIdx: 0 }, extra: false }];
      Game.moveHistory = [{ type: 'move', screwIdx: 0, holeIdx: 0, screwSnapshot: snapshot }];
      Game.moves = 1;

      PowerUps.undo();
      expect(Game.moves).toBe(2); // undo counts as a move
    });

    it('restores plates when undoing a move', () => {
      const snapshot = { x: 50, y: 50, color: 'red', plateIds: [0] };
      Game.screws = [{ x: 0, y: 0, color: 'red', plateIds: [0], id: 0, removed: true }];
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: true }];
      Game.holes = [{ id: 0, screw: { color: 'red', screwIdx: 0 }, extra: false }];
      Game.moveHistory = [{ type: 'move', screwIdx: 0, holeIdx: 0, screwSnapshot: snapshot }];

      PowerUps.undo();
      expect(Game.plates[0].removed).toBe(false);
    });

    it('undoes a bolt cutter cut', () => {
      const snapshot = { x: 80, y: 90, color: 'green', plateIds: [1] };
      Game.screws = [
        { x: 0, y: 0, color: 'green', plateIds: [0], id: 0, removed: false },
        { x: 0, y: 0, color: 'green', plateIds: [1], id: 1, removed: true },
      ];
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false },
        { x: 200, y: 0, w: 100, h: 100, z: 1, id: 1, removed: true },
      ];
      Game.holes = [{ id: 0, screw: null, extra: false }];
      Game.moveHistory = [{ type: 'cut', screwIdx: 1, screwSnapshot: snapshot }];
      Game.cutterCount = 1;

      PowerUps.undo();

      expect(Game.screws[1].removed).toBe(false);
      expect(Game.screws[1].x).toBe(80);
      expect(Game.screws[1].y).toBe(90);
      expect(Game.cutterCount).toBe(2); // restored
      expect(Game.plates[1].removed).toBe(false); // restored
    });

    it('re-renders board, holes, and power-ups after undo', () => {
      const snapshot = { x: 50, y: 50, color: 'red', plateIds: [0] };
      Game.screws = [{ x: 0, y: 0, color: 'red', plateIds: [0], id: 0, removed: true }];
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.holes = [{ id: 0, screw: { color: 'red', screwIdx: 0 }, extra: false }];
      Game.moveHistory = [{ type: 'move', screwIdx: 0, holeIdx: 0, screwSnapshot: snapshot }];

      PowerUps.undo();

      expect(Renderer.renderBoard).toHaveBeenCalled();
      expect(Renderer.renderHoles).toHaveBeenCalled();
      expect(Renderer.updatePowerUps).toHaveBeenCalled();
      expect(Game.ui.updateHeader).toHaveBeenCalled();
    });
  });

  // ========== extraSlots ==========
  describe('extraSlots', () => {
    it('does nothing when already used', () => {
      Game.extraSlotsUsed = true;
      PowerUps.extraSlots();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when animating', () => {
      Game.animating = true;
      PowerUps.extraSlots();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when game is won', () => {
      Game.won = true;
      PowerUps.extraSlots();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('adds 3 extra holes', () => {
      Game.holes = [
        { id: 0, screw: null, extra: false },
        { id: 1, screw: null, extra: false },
      ];
      PowerUps.extraSlots();
      expect(Game.holes.length).toBe(5);
      expect(Game.holes[2].extra).toBe(true);
      expect(Game.holes[3].extra).toBe(true);
      expect(Game.holes[4].extra).toBe(true);
    });

    it('marks extraSlotsUsed as true', () => {
      Game.holes = [];
      PowerUps.extraSlots();
      expect(Game.extraSlotsUsed).toBe(true);
    });

    it('plays click sound', () => {
      Game.holes = [];
      PowerUps.extraSlots();
      expect(Sound.click).toHaveBeenCalled();
    });

    it('re-renders holes and updates power-ups', () => {
      Game.holes = [];
      PowerUps.extraSlots();
      expect(Renderer.renderHoles).toHaveBeenCalled();
      expect(Renderer.updatePowerUps).toHaveBeenCalled();
    });

    it('clears lost state if game was lost', () => {
      Game.holes = [];
      Game.lost = true;
      PowerUps.extraSlots();
      expect(Game.lost).toBe(false);
      expect(Game.ui.closeModals).toHaveBeenCalled();
    });

    it('does not clear lost state when game is not lost', () => {
      Game.holes = [];
      Game.lost = false;
      PowerUps.extraSlots();
      // closeModals should not be called from the lost-recovery branch
      expect(Game.ui.closeModals).not.toHaveBeenCalled();
    });
  });

  // ========== boltCutter ==========
  describe('boltCutter', () => {
    it('does nothing when cutterCount is 0', () => {
      Game.cutterCount = 0;
      PowerUps.boltCutter();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when animating', () => {
      Game.animating = true;
      PowerUps.boltCutter();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when game is won', () => {
      Game.won = true;
      PowerUps.boltCutter();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when game is lost', () => {
      Game.lost = true;
      PowerUps.boltCutter();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('toggles cutter mode on', () => {
      Game.cutterMode = false;
      PowerUps.boltCutter();
      expect(Game.cutterMode).toBe(true);
    });

    it('toggles cutter mode off', () => {
      Game.cutterMode = true;
      PowerUps.boltCutter();
      expect(Game.cutterMode).toBe(false);
    });

    it('plays click sound', () => {
      PowerUps.boltCutter();
      expect(Sound.click).toHaveBeenCalled();
    });

    it('re-renders board and updates power-ups', () => {
      PowerUps.boltCutter();
      expect(Renderer.renderBoard).toHaveBeenCalled();
      expect(Renderer.updatePowerUps).toHaveBeenCalled();
    });
  });

  // ========== hint ==========
  describe('hint', () => {
    it('does nothing when animating', () => {
      Game.animating = true;
      PowerUps.hint();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when game is won', () => {
      Game.won = true;
      PowerUps.hint();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('does nothing when game is lost', () => {
      Game.lost = true;
      PowerUps.hint();
      expect(Sound.click).not.toHaveBeenCalled();
    });

    it('plays click sound when activated', () => {
      Game.holes = [];
      Game.screws = [];
      PowerUps.hint();
      expect(Sound.click).toHaveBeenCalled();
    });

    it('priority 1: highlights screw that would complete a match-3', () => {
      // 2 red screws already in holes
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 10 } },
        { id: 1, screw: { color: 'red', screwIdx: 11 } },
        { id: 2, screw: null },
      ];
      // An accessible red screw on the board
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false },
        { x: 60, y: 60, color: 'blue', plateIds: [0], id: 1, removed: false },
      ];
      Game.isScrewAccessible.mockImplementation((idx) => true);

      // Add DOM element for the screw
      document.body.innerHTML = '<div data-screw-idx="0" class="screw"></div><div data-screw-idx="1" class="screw"></div>';

      PowerUps.hint();

      const hinted = document.querySelector('.hint-glow');
      expect(hinted).toBeTruthy();
      expect(hinted.dataset.screwIdx).toBe('0'); // red screw selected (match-3)
    });

    it('priority 2: highlights best color toward completing a set', () => {
      // 1 red in holes
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 10 } },
        { id: 1, screw: null },
        { id: 2, screw: null },
      ];
      // 2 accessible red screws, 1 accessible blue
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false },
        { x: 60, y: 60, color: 'red', plateIds: [0], id: 1, removed: false },
        { x: 70, y: 70, color: 'blue', plateIds: [0], id: 2, removed: false },
      ];
      Game.isScrewAccessible.mockReturnValue(true);

      document.body.innerHTML = '<div data-screw-idx="0" class="screw"></div><div data-screw-idx="1" class="screw"></div><div data-screw-idx="2" class="screw"></div>';

      PowerUps.hint();

      const hinted = document.querySelector('.hint-glow');
      expect(hinted).toBeTruthy();
      expect(hinted.dataset.screwIdx).toBe('0'); // first red screw (best color)
    });

    it('priority 3: highlights any accessible screw when no good matches', () => {
      Game.holes = [
        { id: 0, screw: null },
        { id: 1, screw: null },
      ];
      // Only 1 accessible screw, can't match
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false },
        { x: 60, y: 60, color: 'blue', plateIds: [0], id: 1, removed: false },
        { x: 70, y: 70, color: 'green', plateIds: [0], id: 2, removed: false },
      ];
      Game.isScrewAccessible.mockReturnValue(true);

      document.body.innerHTML = '<div data-screw-idx="0" class="screw"></div><div data-screw-idx="1" class="screw"></div><div data-screw-idx="2" class="screw"></div>';

      PowerUps.hint();

      const hinted = document.querySelector('.hint-glow');
      expect(hinted).toBeTruthy();
    });

    it('skips non-accessible screws', () => {
      Game.holes = [{ id: 0, screw: null }];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false },
        { x: 60, y: 60, color: 'blue', plateIds: [0], id: 1, removed: false },
      ];
      // Only second screw is accessible
      Game.isScrewAccessible.mockImplementation((idx) => idx === 1);

      document.body.innerHTML = '<div data-screw-idx="0" class="screw"></div><div data-screw-idx="1" class="screw"></div>';

      PowerUps.hint();

      const hinted = document.querySelector('.hint-glow');
      expect(hinted).toBeTruthy();
      expect(hinted.dataset.screwIdx).toBe('1');
    });

    it('skips removed screws', () => {
      Game.holes = [{ id: 0, screw: null }];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: true },
        { x: 60, y: 60, color: 'blue', plateIds: [0], id: 1, removed: false },
      ];
      Game.isScrewAccessible.mockReturnValue(true);

      document.body.innerHTML = '<div data-screw-idx="0" class="screw"></div><div data-screw-idx="1" class="screw"></div>';

      PowerUps.hint();

      const hinted = document.querySelector('.hint-glow');
      expect(hinted).toBeTruthy();
      expect(hinted.dataset.screwIdx).toBe('1');
    });

    it('removes existing hint-glow classes before applying new one', () => {
      Game.holes = [{ id: 0, screw: null }];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false },
      ];
      Game.isScrewAccessible.mockReturnValue(true);

      document.body.innerHTML = '<div data-screw-idx="0" class="screw hint-glow"></div>';

      PowerUps.hint();

      // The previous hint-glow should have been removed and re-added
      const hintedElements = document.querySelectorAll('.hint-glow');
      expect(hintedElements.length).toBe(1);
    });

    it('does nothing visually when no accessible screws exist', () => {
      Game.holes = [{ id: 0, screw: null }];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: true },
      ];
      Game.isScrewAccessible.mockReturnValue(false);

      document.body.innerHTML = '<div data-screw-idx="0" class="screw"></div>';

      PowerUps.hint();

      const hinted = document.querySelector('.hint-glow');
      expect(hinted).toBeNull();
    });
  });
});
