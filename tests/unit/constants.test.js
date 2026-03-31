import { COLORS, COLOR_HEX, COLOR_DARK, COLOR_LIGHT, BOARD_W, BOARD_H, SCREW_RENDER_SIZE, BASE_HOLE_COUNT } from '../../src/js/constants.js';

describe('Constants', () => {
  it('all constants are exported and have correct types', () => {
    expect(typeof BOARD_W).toBe('number');
    expect(typeof BOARD_H).toBe('number');
    expect(typeof SCREW_RENDER_SIZE).toBe('number');
    expect(typeof BASE_HOLE_COUNT).toBe('number');
    expect(Array.isArray(COLORS)).toBe(true);
    expect(typeof COLOR_HEX).toBe('object');
    expect(typeof COLOR_DARK).toBe('object');
    expect(typeof COLOR_LIGHT).toBe('object');
  });

  it('COLORS array has 6 elements with correct values', () => {
    expect(COLORS).toHaveLength(6);
    expect(COLORS).toEqual(['red', 'blue', 'green', 'yellow', 'purple', 'orange']);
  });

  it('COLOR_HEX has keys matching COLORS', () => {
    for (const c of COLORS) {
      expect(COLOR_HEX).toHaveProperty(c);
      expect(typeof COLOR_HEX[c]).toBe('string');
    }
  });

  it('COLOR_DARK has keys matching COLORS', () => {
    for (const c of COLORS) {
      expect(COLOR_DARK).toHaveProperty(c);
      expect(typeof COLOR_DARK[c]).toBe('string');
    }
  });

  it('COLOR_LIGHT has keys matching COLORS', () => {
    for (const c of COLORS) {
      expect(COLOR_LIGHT).toHaveProperty(c);
      expect(typeof COLOR_LIGHT[c]).toBe('string');
    }
  });

  it('BOARD_W is 400', () => {
    expect(BOARD_W).toBe(400);
  });

  it('BOARD_H is 480', () => {
    expect(BOARD_H).toBe(480);
  });

  it('SCREW_RENDER_SIZE is 36', () => {
    expect(SCREW_RENDER_SIZE).toBe(36);
  });

  it('BASE_HOLE_COUNT is 7', () => {
    expect(BASE_HOLE_COUNT).toBe(7);
  });
});
