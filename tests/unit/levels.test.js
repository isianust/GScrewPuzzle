import { Levels } from '../../src/js/levels.js';
import { COLORS } from '../../src/js/constants.js';

describe('Levels', () => {
  it('has 15 levels', () => {
    expect(Levels).toHaveLength(15);
  });

  Levels.forEach((level, idx) => {
    describe(`Level ${idx + 1}`, () => {
      it('has plates array, screws array, and par number', () => {
        expect(Array.isArray(level.plates)).toBe(true);
        expect(Array.isArray(level.screws)).toBe(true);
        expect(typeof level.par).toBe('number');
      });

      it('each plate has x, y, w, h, z as numbers', () => {
        for (const plate of level.plates) {
          expect(typeof plate.x).toBe('number');
          expect(typeof plate.y).toBe('number');
          expect(typeof plate.w).toBe('number');
          expect(typeof plate.h).toBe('number');
          expect(typeof plate.z).toBe('number');
        }
      });

      it('each screw has x, y (numbers), color (valid string), and plateIds (array of numbers)', () => {
        for (const screw of level.screws) {
          expect(typeof screw.x).toBe('number');
          expect(typeof screw.y).toBe('number');
          expect(typeof screw.color).toBe('string');
          expect(COLORS).toContain(screw.color);
          expect(Array.isArray(screw.plateIds)).toBe(true);
          for (const pid of screw.plateIds) {
            expect(typeof pid).toBe('number');
          }
        }
      });

      it('all screw plateIds reference valid plate indices', () => {
        for (const screw of level.screws) {
          for (const pid of screw.plateIds) {
            expect(pid).toBeGreaterThanOrEqual(0);
            expect(pid).toBeLessThan(level.plates.length);
          }
        }
      });

      it('each color appears a multiple of 3 times (solvability)', () => {
        const colorCounts = {};
        for (const screw of level.screws) {
          colorCounts[screw.color] = (colorCounts[screw.color] || 0) + 1;
        }
        for (const color in colorCounts) {
          expect(colorCounts[color] % 3).toBe(0);
        }
      });

      it('par is a positive integer', () => {
        expect(level.par).toBeGreaterThan(0);
        expect(Number.isInteger(level.par)).toBe(true);
      });
    });
  });
});
