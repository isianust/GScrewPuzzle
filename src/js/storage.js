import { Levels } from './levels.js';

// ========== STORAGE MANAGER ==========
export const Storage = {
  /** Default save data structure */
  defaults: {
    unlockedLevel: 1,
    stars: {},
    lastLevel: 1,
    totalScore: 0
  },

  data: null,

  /** Load saved data from localStorage */
  load() {
    this.data = { ...this.defaults };
    try {
      const saved = localStorage.getItem('screwPuzzleSave');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = { ...this.defaults, ...parsed };
      }
    } catch (e) {
      // If localStorage fails, use defaults
    }
  },

  /** Save current data to localStorage */
  save() {
    try {
      localStorage.setItem('screwPuzzleSave', JSON.stringify(this.data));
    } catch (e) {
      // Silent fail if storage is full or unavailable
    }
  },

  /** Record stars for a level and unlock next */
  setStars(level, stars) {
    const prev = this.data.stars[level] || 0;
    if (stars > prev) {
      this.data.stars[level] = stars;
    }
    // Unlock next level
    if (level >= this.data.unlockedLevel) {
      this.data.unlockedLevel = Math.min(level + 1, Levels.length);
    }
    this.data.lastLevel = level;
    this.data.totalScore += stars;
    this.save();
  },

  /** Get stars for a specific level */
  getStars(level) {
    return this.data.stars[level] || 0;
  },

  /** Check if a level is unlocked */
  isUnlocked(level) {
    return level <= this.data.unlockedLevel;
  },

  /** Update last played level */
  setLastLevel(level) {
    this.data.lastLevel = level;
    this.save();
  }
};
