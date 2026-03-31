import { Sound } from './sound.js';
import { Particles } from './particles.js';
import { Storage } from './storage.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { PowerUps } from './powerups.js';
import { UI } from './ui.js';

// Wire up circular dependencies via late binding
Game.renderer = Renderer;
Game.ui = UI;

// ========== INITIALIZATION ==========
function initGame() {
  // Initialize subsystems
  Sound.init();
  Particles.init();
  Storage.load();

  // Attach event listeners (replacing inline onclick handlers)
  // Start screen
  document.querySelector('#btnPlay').addEventListener('click', () => UI.startLastLevel());
  document.querySelector('#btnLevels').addEventListener('click', () => UI.showScreen('levelSelect'));
  document.querySelector('#menuMuteBtn').addEventListener('click', () => Sound.toggle());

  // Level select
  document.querySelector('#btnBack').addEventListener('click', () => UI.showScreen('startScreen'));

  // Game screen header
  document.querySelector('#gameMuteBtn').addEventListener('click', () => Sound.toggle());
  document.querySelector('#btnPause').addEventListener('click', () => UI.pauseGame());

  // Power-ups
  document.querySelector('#puUndo').addEventListener('click', () => PowerUps.undo());
  document.querySelector('#puExtra').addEventListener('click', () => PowerUps.extraSlots());
  document.querySelector('#puCutter').addEventListener('click', () => PowerUps.boltCutter());
  document.querySelector('#puHint').addEventListener('click', () => PowerUps.hint());

  // Win modal
  document.querySelector('#btnNextLevel').addEventListener('click', () => UI.nextLevel());
  document.querySelector('#btnReplayWin').addEventListener('click', () => Game.restartLevel());
  document.querySelector('#btnLevelsWin').addEventListener('click', () => {
    UI.showScreen('levelSelect');
    UI.closeModals();
  });

  // Lose modal
  document.querySelector('#btnRetryLose').addEventListener('click', () => Game.restartLevel());
  document.querySelector('#btnLevelsLose').addEventListener('click', () => {
    UI.showScreen('levelSelect');
    UI.closeModals();
  });

  // Pause overlay
  document.querySelector('#btnResume').addEventListener('click', () => UI.resumeGame());
  document.querySelector('#btnRestartPause').addEventListener('click', () => Game.restartLevel());
  document.querySelector('#btnLevelsPause').addEventListener('click', () => {
    UI.showScreen('levelSelect');
    UI.closeModals();
  });

  // Handle window resize for board scaling
  let resizeTimeout;
  window.addEventListener('resize', () => {
    Particles.resize();
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (document.getElementById('gameScreen').classList.contains('active')) {
        Game.scaleBoard();
      }
    }, 100);
  });

  // Resume audio context on first user interaction
  const resumeAudio = () => {
    Sound.resume();
  };
  document.addEventListener('click', resumeAudio, { once: true });
  document.addEventListener('touchstart', resumeAudio, { once: true });

  // Prevent double-tap zoom on iOS
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Show start screen
  UI.showScreen('startScreen');
}

// Boot the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
