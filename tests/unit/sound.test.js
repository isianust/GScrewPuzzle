import { Sound } from '../../src/js/sound.js';

describe('Sound', () => {
  let mockCtx;

  beforeEach(() => {
    Sound.ctx = null;
    Sound.muted = false;

    mockCtx = {
      createOscillator: vi.fn(() => ({
        type: '',
        frequency: {
          value: 0,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      destination: {},
      currentTime: 0,
      state: 'running',
      resume: vi.fn(),
    };

    // Use a regular function constructor so `new` works correctly
    window.AudioContext = function MockAudioContext() {
      return mockCtx;
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('creates an AudioContext', () => {
      Sound.init();
      expect(Sound.ctx).toBe(mockCtx);
    });
  });

  describe('toggle', () => {
    it('flips muted state from false to true', () => {
      Sound.muted = false;
      Sound.toggle();
      expect(Sound.muted).toBe(true);
    });

    it('flips muted state from true to false', () => {
      Sound.muted = true;
      Sound.toggle();
      expect(Sound.muted).toBe(false);
    });
  });

  describe('play', () => {
    it('does nothing when muted', () => {
      Sound.ctx = mockCtx;
      Sound.muted = true;
      const gen = vi.fn();
      Sound.play(gen);
      expect(gen).not.toHaveBeenCalled();
    });

    it('does nothing when ctx is null', () => {
      Sound.ctx = null;
      Sound.muted = false;
      const gen = vi.fn();
      Sound.play(gen);
      expect(gen).not.toHaveBeenCalled();
    });

    it('calls generator when not muted and ctx exists', () => {
      Sound.ctx = mockCtx;
      Sound.muted = false;
      const gen = vi.fn();
      Sound.play(gen);
      expect(gen).toHaveBeenCalledWith(mockCtx);
    });
  });

  describe('individual sound methods', () => {
    beforeEach(() => {
      Sound.ctx = mockCtx;
      Sound.muted = false;
    });

    it('tap() does not throw', () => {
      expect(() => Sound.tap()).not.toThrow();
    });

    it('unscrew() does not throw', () => {
      expect(() => Sound.unscrew()).not.toThrow();
    });

    it('place() does not throw', () => {
      expect(() => Sound.place()).not.toThrow();
    });

    it('match() does not throw', () => {
      expect(() => Sound.match()).not.toThrow();
    });

    it('plateRemove() does not throw', () => {
      expect(() => Sound.plateRemove()).not.toThrow();
    });

    it('win() does not throw', () => {
      expect(() => Sound.win()).not.toThrow();
    });

    it('lose() does not throw', () => {
      expect(() => Sound.lose()).not.toThrow();
    });

    it('click() does not throw', () => {
      expect(() => Sound.click()).not.toThrow();
    });

    it('snip() does not throw', () => {
      expect(() => Sound.snip()).not.toThrow();
    });
  });
});
