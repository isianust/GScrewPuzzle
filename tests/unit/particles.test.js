import { Particles } from '../../src/js/particles.js';

describe('Particles', () => {
  let mockCtx;

  beforeEach(() => {
    // Reset particles state
    Particles.particles = [];
    Particles.running = false;
    Particles.canvas = null;
    Particles.ctx = null;

    // Create mock canvas context
    mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
    };

    // Create mock canvas element
    const mockCanvas = {
      getContext: vi.fn(() => mockCtx),
      width: 0,
      height: 0,
    };

    document.getElementById = vi.fn((id) => {
      if (id === 'particleCanvas') return mockCanvas;
      return null;
    });

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    // Mock requestAnimationFrame to not actually loop
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('initializes canvas and context', () => {
      Particles.init();
      expect(Particles.canvas).toBeTruthy();
      expect(Particles.ctx).toBe(mockCtx);
    });

    it('resizes canvas to window dimensions', () => {
      Particles.init();
      expect(Particles.canvas.width).toBe(1024);
      expect(Particles.canvas.height).toBe(768);
    });

    it('attaches resize listener', () => {
      const addEventSpy = vi.spyOn(window, 'addEventListener');
      Particles.init();
      expect(addEventSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('resize', () => {
    it('sets canvas dimensions to match window', () => {
      Particles.init();
      window.innerWidth = 800;
      window.innerHeight = 600;
      Particles.resize();
      expect(Particles.canvas.width).toBe(800);
      expect(Particles.canvas.height).toBe(600);
    });
  });

  describe('spawn', () => {
    beforeEach(() => {
      Particles.init();
    });

    it('creates particles with correct count', () => {
      Particles.spawn(100, 200, 'red', 10, 'sparkle');
      expect(Particles.particles.length).toBe(10);
    });

    it('sets particle position near spawn coordinates', () => {
      // Note: if running is false, spawn triggers animate() which updates physics once
      Particles.running = true; // prevent animate from running
      Particles.spawn(150, 250, 'blue', 1, 'sparkle');
      expect(Particles.particles[0].x).toBe(150);
      expect(Particles.particles[0].y).toBe(250);
    });

    it('sparkle type particles have correct properties', () => {
      Particles.running = true; // prevent animate from modifying life
      Particles.spawn(100, 100, 'red', 1, 'sparkle');
      const p = Particles.particles[0];
      expect(p.type).toBe('sparkle');
      expect(p.life).toBe(1.0);
      expect(p.gravity).toBeGreaterThanOrEqual(0.03);
    });

    it('confetti type particles get random colors', () => {
      Particles.spawn(100, 100, '#fff', 20, 'confetti');
      const p = Particles.particles[0];
      expect(p.type).toBe('confetti');
      expect(p.color).toBeTruthy();
    });

    it('explode type has correct type set', () => {
      Particles.spawn(100, 100, 'green', 5, 'explode');
      expect(Particles.particles[0].type).toBe('explode');
    });

    it('shimmer type has negative gravity (floats upward)', () => {
      Particles.spawn(100, 100, 'yellow', 1, 'shimmer');
      expect(Particles.particles[0].gravity).toBeLessThan(0);
    });

    it('starts animation loop if not already running', () => {
      expect(Particles.running).toBe(false);
      Particles.spawn(100, 100, 'red', 5, 'sparkle');
      expect(Particles.running).toBe(true);
    });

    it('does not restart animation if already running', () => {
      Particles.running = true;
      const animateSpy = vi.spyOn(Particles, 'animate');
      Particles.spawn(100, 100, 'red', 5, 'sparkle');
      expect(animateSpy).not.toHaveBeenCalled();
    });

    it('accumulates particles across multiple spawns', () => {
      Particles.running = true; // prevent animate from being called
      Particles.spawn(100, 100, 'red', 3, 'sparkle');
      Particles.spawn(200, 200, 'blue', 4, 'sparkle');
      expect(Particles.particles.length).toBe(7);
    });

    it('each particle has velocity, size, rotation properties', () => {
      Particles.spawn(100, 100, 'red', 1, 'sparkle');
      const p = Particles.particles[0];
      expect(typeof p.vx).toBe('number');
      expect(typeof p.vy).toBe('number');
      expect(typeof p.size).toBe('number');
      expect(typeof p.rotation).toBe('number');
      expect(typeof p.rotSpeed).toBe('number');
      expect(typeof p.decay).toBe('number');
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      Particles.init();
    });

    it('sparkle() spawns 14 sparkle particles', () => {
      Particles.sparkle(100, 200, 'red');
      expect(Particles.particles.length).toBe(14);
      expect(Particles.particles[0].type).toBe('sparkle');
    });

    it('explode() spawns 28 explode particles', () => {
      Particles.explode(100, 200, 'blue');
      expect(Particles.particles.length).toBe(28);
      expect(Particles.particles[0].type).toBe('explode');
    });

    it('confetti() spawns 50 confetti particles', () => {
      Particles.confetti(100, 200);
      expect(Particles.particles.length).toBe(50);
      expect(Particles.particles[0].type).toBe('confetti');
    });

    it('shimmer() spawns 6 shimmer particles', () => {
      Particles.shimmer(100, 200, 'green');
      expect(Particles.particles.length).toBe(6);
      expect(Particles.particles[0].type).toBe('shimmer');
    });
  });

  describe('animate', () => {
    beforeEach(() => {
      Particles.init();
    });

    it('clears canvas before rendering', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 1, vy: 1, size: 2, color: '#fff', life: 1, decay: 0.1, gravity: 0.03, type: 'sparkle', rotation: 0, rotSpeed: 1 }
      ];
      Particles.animate();
      expect(mockCtx.clearRect).toHaveBeenCalled();
    });

    it('stops running when no particles remain', () => {
      Particles.particles = [];
      Particles.running = true;
      Particles.animate();
      expect(Particles.running).toBe(false);
    });

    it('filters out dead particles (life <= 0.01)', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 1, vy: 1, size: 2, color: '#fff', life: 0.005, decay: 0.1, gravity: 0.03, type: 'sparkle', rotation: 0, rotSpeed: 1 },
        { x: 100, y: 100, vx: 1, vy: 1, size: 2, color: '#fff', life: 0.5, decay: 0.1, gravity: 0.03, type: 'sparkle', rotation: 0, rotSpeed: 1 }
      ];
      Particles.animate();
      expect(Particles.particles.length).toBe(1);
    });

    it('updates particle physics (position, velocity, life)', () => {
      const p = { x: 100, y: 100, vx: 2, vy: 3, size: 2, color: '#fff', life: 1, decay: 0.1, gravity: 0.05, type: 'sparkle', rotation: 0, rotSpeed: 5 };
      Particles.particles = [p];
      Particles.animate();
      expect(p.x).toBe(102); // x + vx
      expect(p.y).toBe(103); // y + vy
      expect(p.vy).toBeCloseTo(3.05); // vy + gravity
      expect(p.life).toBeCloseTo(0.9); // life - decay
      expect(p.rotation).toBe(5); // rotation + rotSpeed
    });

    it('applies air resistance to horizontal velocity', () => {
      const p = { x: 100, y: 100, vx: 10, vy: 0, size: 2, color: '#fff', life: 1, decay: 0.01, gravity: 0, type: 'sparkle', rotation: 0, rotSpeed: 0 };
      Particles.particles = [p];
      Particles.animate();
      expect(p.vx).toBeCloseTo(10 * 0.99);
    });

    it('renders confetti as rectangles (uses save/restore)', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 1, vy: 1, size: 3, color: '#f00', life: 0.8, decay: 0.01, gravity: 0.1, type: 'confetti', rotation: 45, rotSpeed: 5 }
      ];
      Particles.animate();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('renders shimmer with glow effect (two arc calls)', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 0.5, vy: 0.5, size: 2, color: '#ff0', life: 0.8, decay: 0.02, gravity: -0.02, type: 'shimmer', rotation: 0, rotSpeed: 0 }
      ];
      Particles.animate();
      // Shimmer draws two arcs: the dot and the glow
      expect(mockCtx.arc).toHaveBeenCalledTimes(2);
    });

    it('renders explode with inner glow (white center)', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 2, vy: 2, size: 3, color: '#0f0', life: 0.9, decay: 0.02, gravity: 0.04, type: 'explode', rotation: 0, rotSpeed: 0 }
      ];
      Particles.animate();
      // Explode draws main arc + inner glow arc
      expect(mockCtx.arc).toHaveBeenCalledTimes(2);
    });

    it('renders sparkle as single circle', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 1, vy: 1, size: 2, color: '#fff', life: 0.8, decay: 0.02, gravity: 0.03, type: 'sparkle', rotation: 0, rotSpeed: 0 }
      ];
      Particles.animate();
      expect(mockCtx.arc).toHaveBeenCalledTimes(1);
    });

    it('requests next animation frame when particles exist', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 1, vy: 1, size: 2, color: '#fff', life: 0.8, decay: 0.01, gravity: 0.03, type: 'sparkle', rotation: 0, rotSpeed: 0 }
      ];
      Particles.animate();
      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('resets globalAlpha to 1 after rendering', () => {
      Particles.particles = [
        { x: 100, y: 100, vx: 1, vy: 1, size: 2, color: '#fff', life: 0.5, decay: 0.01, gravity: 0.03, type: 'sparkle', rotation: 0, rotSpeed: 0 }
      ];
      Particles.animate();
      expect(mockCtx.globalAlpha).toBe(1);
    });
  });
});
