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
    removeScrew: vi.fn(),
  }
}));

import { Renderer } from '../../src/js/renderer.js';
import { Game } from '../../src/js/game.js';

// Helper: setup minimal DOM for renderer tests
function setupDOM() {
  document.body.innerHTML = `
    <div id="board"></div>
    <div id="holesBar"></div>
    <button id="puUndo" class="powerup-btn"></button>
    <button id="puExtra" class="powerup-btn"></button>
    <button id="puCutter" class="powerup-btn"></button>
    <button id="puHint" class="powerup-btn"></button>
    <span id="puCutterCount">2</span>
    <span id="puExtraCount">1</span>
  `;
}

describe('Renderer', () => {
  beforeEach(() => {
    setupDOM();
    // Reset game state
    Game.plates = [];
    Game.screws = [];
    Game.holes = [];
    Game.moveHistory = [];
    Game.cutterCount = 2;
    Game.cutterMode = false;
    Game.extraSlotsUsed = false;
    Game.animating = false;
    Game.won = false;
    Game.lost = false;
    vi.clearAllMocks();
  });

  // ========== renderBoard ==========
  describe('renderBoard', () => {
    it('clears the board before rendering', () => {
      const board = document.getElementById('board');
      board.innerHTML = '<div>old content</div>';
      Renderer.renderBoard();
      // Board should be empty (no plates or screws)
      expect(board.children.length).toBe(0);
    });

    it('renders visible plates sorted by z-index', () => {
      Game.plates = [
        { x: 10, y: 20, w: 100, h: 80, z: 2, id: 0, removed: false },
        { x: 50, y: 60, w: 120, h: 90, z: 1, id: 1, removed: false },
      ];
      Game.screws = [];
      Renderer.renderBoard();
      const board = document.getElementById('board');
      const plates = board.querySelectorAll('.plate');
      expect(plates.length).toBe(2);
      // First plate should be z=1 (lower z rendered first)
      expect(plates[0].dataset.plateId).toBe('1');
      expect(plates[1].dataset.plateId).toBe('0');
    });

    it('does not render removed plates', () => {
      Game.plates = [
        { x: 10, y: 20, w: 100, h: 80, z: 1, id: 0, removed: true },
        { x: 50, y: 60, w: 120, h: 90, z: 1, id: 1, removed: false },
      ];
      Game.screws = [];
      Renderer.renderBoard();
      const plates = document.querySelectorAll('.plate');
      expect(plates.length).toBe(1);
    });

    it('sets plate position and size styles', () => {
      Game.plates = [
        { x: 15, y: 25, w: 110, h: 85, z: 3, id: 0, removed: false }
      ];
      Game.screws = [];
      Renderer.renderBoard();
      const plate = document.querySelector('.plate');
      expect(plate.style.left).toBe('15px');
      expect(plate.style.top).toBe('25px');
      expect(plate.style.width).toBe('110px');
      expect(plate.style.height).toBe('85px');
      expect(plate.style.zIndex).toBe('30'); // z * 10
    });

    it('renders unremoved screws', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }
      ];
      Game.screws = [
        { x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false },
        { x: 60, y: 60, color: 'blue', plateIds: [0], id: 1, removed: true },
      ];
      Game.isScrewAccessible.mockReturnValue(true);
      Renderer.renderBoard();
      const screws = document.querySelectorAll('.screw');
      expect(screws.length).toBe(1);
      expect(screws[0].classList.contains('screw-red')).toBe(true);
    });

    it('marks accessible screws with .accessible class', () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'green', plateIds: [0], id: 0, removed: false }];
      Game.isScrewAccessible.mockReturnValue(true);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      expect(screw.classList.contains('accessible')).toBe(true);
      expect(screw.classList.contains('blocked')).toBe(false);
    });

    it('marks blocked screws with .blocked class', () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'blue', plateIds: [0], id: 0, removed: false }];
      Game.isScrewAccessible.mockReturnValue(false);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      expect(screw.classList.contains('blocked')).toBe(true);
      expect(screw.classList.contains('accessible')).toBe(false);
    });

    it('adds cutter-target class when cutter mode is active and screw is accessible', () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.cutterMode = true;
      Game.isScrewAccessible.mockReturnValue(true);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      expect(screw.classList.contains('cutter-target')).toBe(true);
    });

    it('does not add cutter-target class when cutter mode is off', () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.cutterMode = false;
      Game.isScrewAccessible.mockReturnValue(true);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      expect(screw.classList.contains('cutter-target')).toBe(false);
    });

    it('screw z-index is above its highest parent plate', () => {
      Game.plates = [
        { x: 0, y: 0, w: 100, h: 100, z: 2, id: 0, removed: false },
        { x: 0, y: 0, w: 100, h: 100, z: 3, id: 1, removed: false }
      ];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0, 1], id: 0, removed: false }];
      Game.isScrewAccessible.mockReturnValue(true);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      expect(screw.style.zIndex).toBe('35'); // max(2,3)*10 + 5
    });

    it('accessible screws have click event listeners', () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.isScrewAccessible.mockReturnValue(true);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      screw.click();
      expect(Game.removeScrew).toHaveBeenCalledWith(0);
    });

    it('blocked screws do not have click event listeners triggering removeScrew', () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.isScrewAccessible.mockReturnValue(false);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      screw.click();
      expect(Game.removeScrew).not.toHaveBeenCalled();
    });

    it('renders screw inner structure (screw-inner, screw-rim)', () => {
      Game.plates = [{ x: 0, y: 0, w: 100, h: 100, z: 1, id: 0, removed: false }];
      Game.screws = [{ x: 50, y: 50, color: 'red', plateIds: [0], id: 0, removed: false }];
      Game.isScrewAccessible.mockReturnValue(true);
      Renderer.renderBoard();
      const screw = document.querySelector('.screw');
      expect(screw.querySelector('.screw-inner')).toBeTruthy();
      expect(screw.querySelector('.screw-rim')).toBeTruthy();
    });
  });

  // ========== renderHoles ==========
  describe('renderHoles', () => {
    it('renders correct number of holes', () => {
      Game.holes = [
        { id: 0, screw: null, extra: false },
        { id: 1, screw: null, extra: false },
        { id: 2, screw: null, extra: false },
      ];
      Renderer.renderHoles();
      const holes = document.querySelectorAll('.hole');
      expect(holes.length).toBe(3);
    });

    it('clears previous holes before rendering', () => {
      const bar = document.getElementById('holesBar');
      bar.innerHTML = '<div class="old">old</div>';
      Game.holes = [{ id: 0, screw: null, extra: false }];
      Renderer.renderHoles();
      expect(bar.querySelector('.old')).toBeNull();
    });

    it('renders screws inside occupied holes', () => {
      Game.holes = [
        { id: 0, screw: { color: 'red', screwIdx: 0 }, extra: false },
        { id: 1, screw: null, extra: false },
      ];
      Renderer.renderHoles();
      const holes = document.querySelectorAll('.hole');
      expect(holes[0].querySelector('.hole-screw')).toBeTruthy();
      expect(holes[0].querySelector('.color-red')).toBeTruthy();
      expect(holes[1].querySelector('.hole-screw')).toBeNull();
    });

    it('marks extra holes with .extra class', () => {
      Game.holes = [
        { id: 0, screw: null, extra: false },
        { id: 1, screw: null, extra: true },
      ];
      Renderer.renderHoles();
      const holes = document.querySelectorAll('.hole');
      expect(holes[0].classList.contains('extra')).toBe(false);
      expect(holes[1].classList.contains('extra')).toBe(true);
    });

    it('renders different screw colors', () => {
      Game.holes = [
        { id: 0, screw: { color: 'blue', screwIdx: 0 }, extra: false },
        { id: 1, screw: { color: 'green', screwIdx: 1 }, extra: false },
      ];
      Renderer.renderHoles();
      expect(document.querySelector('.color-blue')).toBeTruthy();
      expect(document.querySelector('.color-green')).toBeTruthy();
    });
  });

  // ========== updatePowerUps ==========
  describe('updatePowerUps', () => {
    it('enables undo when history exists and not animating', () => {
      Game.moveHistory = [{ type: 'move' }];
      Game.animating = false;
      Game.won = false;
      Game.lost = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puUndo').classList.contains('disabled')).toBe(false);
    });

    it('disables undo when no history', () => {
      Game.moveHistory = [];
      Renderer.updatePowerUps();
      expect(document.getElementById('puUndo').classList.contains('disabled')).toBe(true);
    });

    it('disables undo when animating', () => {
      Game.moveHistory = [{ type: 'move' }];
      Game.animating = true;
      Renderer.updatePowerUps();
      expect(document.getElementById('puUndo').classList.contains('disabled')).toBe(true);
    });

    it('disables undo when game is won', () => {
      Game.moveHistory = [{ type: 'move' }];
      Game.won = true;
      Renderer.updatePowerUps();
      expect(document.getElementById('puUndo').classList.contains('disabled')).toBe(true);
    });

    it('enables extra slots when not yet used', () => {
      Game.extraSlotsUsed = false;
      Game.animating = false;
      Game.won = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puExtra').classList.contains('disabled')).toBe(false);
    });

    it('disables extra slots when already used', () => {
      Game.extraSlotsUsed = true;
      Renderer.updatePowerUps();
      expect(document.getElementById('puExtra').classList.contains('disabled')).toBe(true);
    });

    it('enables bolt cutter when count > 0', () => {
      Game.cutterCount = 2;
      Game.animating = false;
      Game.won = false;
      Game.lost = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puCutter').classList.contains('disabled')).toBe(false);
    });

    it('disables bolt cutter when count is 0', () => {
      Game.cutterCount = 0;
      Renderer.updatePowerUps();
      expect(document.getElementById('puCutter').classList.contains('disabled')).toBe(true);
    });

    it('toggles active-mode class based on cutterMode', () => {
      Game.cutterCount = 2;
      Game.cutterMode = true;
      Game.animating = false;
      Game.won = false;
      Game.lost = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puCutter').classList.contains('active-mode')).toBe(true);

      Game.cutterMode = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puCutter').classList.contains('active-mode')).toBe(false);
    });

    it('enables hint when not animating and game not over', () => {
      Game.animating = false;
      Game.won = false;
      Game.lost = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puHint').classList.contains('disabled')).toBe(false);
    });

    it('disables hint when animating', () => {
      Game.animating = true;
      Renderer.updatePowerUps();
      expect(document.getElementById('puHint').classList.contains('disabled')).toBe(true);
    });

    it('updates cutter count text', () => {
      Game.cutterCount = 5;
      Game.animating = false;
      Game.won = false;
      Game.lost = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puCutterCount').textContent).toBe('5');
    });

    it('shows extra count as 0 when used', () => {
      Game.extraSlotsUsed = true;
      Game.animating = false;
      Game.won = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puExtraCount').textContent).toBe('0');
    });

    it('shows extra count as 1 when not used', () => {
      Game.extraSlotsUsed = false;
      Game.animating = false;
      Game.won = false;
      Renderer.updatePowerUps();
      expect(document.getElementById('puExtraCount').textContent).toBe('1');
    });
  });
});
