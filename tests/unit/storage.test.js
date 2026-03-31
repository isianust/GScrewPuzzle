import { Storage } from '../../src/js/storage.js';

describe('Storage', () => {
  beforeEach(() => {
    Storage.data = null;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('data is null before load()', () => {
    expect(Storage.data).toBeNull();
  });

  it('after load() with no localStorage, data equals defaults', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
    Storage.load();
    expect(Storage.data).toEqual(Storage.defaults);
  });

  it('after load() with saved data, data merges correctly', () => {
    const saved = { unlockedLevel: 5, stars: { 1: 3, 2: 2 }, lastLevel: 3, totalScore: 10 };
    localStorage.setItem('screwPuzzleSave', JSON.stringify(saved));
    Storage.load();
    expect(Storage.data.unlockedLevel).toBe(5);
    expect(Storage.data.stars).toEqual({ 1: 3, 2: 2 });
    expect(Storage.data.lastLevel).toBe(3);
    expect(Storage.data.totalScore).toBe(10);
  });

  it('load() merges partial saved data with defaults', () => {
    const partial = { unlockedLevel: 3 };
    localStorage.setItem('screwPuzzleSave', JSON.stringify(partial));
    Storage.load();
    expect(Storage.data.unlockedLevel).toBe(3);
    expect(Storage.data.stars).toEqual({});
    expect(Storage.data.lastLevel).toBe(1);
    expect(Storage.data.totalScore).toBe(0);
  });

  describe('setStars', () => {
    beforeEach(() => {
      Storage.data = { ...Storage.defaults, stars: {} };
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});
    });

    it('saves stars and unlocks next level', () => {
      Storage.setStars(1, 3);
      expect(Storage.data.stars[1]).toBe(3);
      expect(Storage.data.unlockedLevel).toBe(2);
    });

    it('does not overwrite higher existing stars', () => {
      Storage.data.stars[1] = 3;
      Storage.setStars(1, 2);
      expect(Storage.data.stars[1]).toBe(3);
    });

    it('calls save() to persist data', () => {
      const saveSpy = vi.spyOn(Storage, 'save');
      Storage.setStars(1, 2);
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('getStars', () => {
    it('returns 0 for unplayed levels', () => {
      Storage.data = { ...Storage.defaults, stars: {} };
      expect(Storage.getStars(5)).toBe(0);
    });

    it('returns stored stars for played levels', () => {
      Storage.data = { ...Storage.defaults, stars: { 3: 2 } };
      expect(Storage.getStars(3)).toBe(2);
    });
  });

  describe('isUnlocked', () => {
    beforeEach(() => {
      Storage.data = { ...Storage.defaults, unlockedLevel: 3 };
    });

    it('returns true for level 1', () => {
      expect(Storage.isUnlocked(1)).toBe(true);
    });

    it('returns true for unlocked levels', () => {
      expect(Storage.isUnlocked(3)).toBe(true);
    });

    it('returns false for locked levels', () => {
      expect(Storage.isUnlocked(4)).toBe(false);
    });
  });

  describe('setLastLevel', () => {
    it('updates lastLevel and calls save', () => {
      Storage.data = { ...Storage.defaults };
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {});
      const saveSpy = vi.spyOn(Storage, 'save');
      Storage.setLastLevel(7);
      expect(Storage.data.lastLevel).toBe(7);
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});
