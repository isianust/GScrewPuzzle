import { COLOR_HEX, COLORS } from './constants.js';

// ========== PARTICLE SYSTEM (Canvas-based) ==========
export const Particles = {
  canvas: null,
  ctx: null,
  particles: [],
  running: false,

  /** Initialize the particle canvas */
  init() {
    this.canvas = document.getElementById('particleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  /** Resize canvas to match window */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  /**
   * Spawn particles at a position
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @param {string} color - Color name or hex
   * @param {number} count - Number of particles
   * @param {string} type - 'sparkle', 'explode', or 'confetti'
   */
  spawn(x, y, color, count, type) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.8;
      let speed, size, gravity, decay;

      switch (type) {
        case 'confetti':
          speed = 3 + Math.random() * 5;
          size = 3 + Math.random() * 5;
          gravity = 0.1;
          decay = 0.008 + Math.random() * 0.012;
          break;
        case 'explode':
          speed = 2 + Math.random() * 4;
          size = 2.5 + Math.random() * 3;
          gravity = 0.04;
          decay = 0.018 + Math.random() * 0.02;
          break;
        case 'shimmer':
          speed = 0.3 + Math.random() * 0.8;
          size = 1 + Math.random() * 2;
          gravity = -0.02;
          decay = 0.02 + Math.random() * 0.03;
          break;
        default: // sparkle
          speed = 1.5 + Math.random() * 3;
          size = 1.5 + Math.random() * 2.5;
          gravity = 0.03;
          decay = 0.02 + Math.random() * 0.025;
      }

      const particleColor = type === 'confetti'
        ? COLOR_HEX[COLORS[Math.floor(Math.random() * COLORS.length)]]
        : (COLOR_HEX[color] || color || '#ffffff');

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'confetti' ? 4 : 1),
        size,
        color: particleColor,
        life: 1.0,
        decay,
        gravity,
        type,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    if (!this.running) {
      this.running = true;
      this.animate();
    }
  },

  /** Convenience: small sparkle burst */
  sparkle(x, y, color) {
    this.spawn(x, y, color, 14, 'sparkle');
  },

  /** Convenience: medium explosion */
  explode(x, y, color) {
    this.spawn(x, y, color, 28, 'explode');
  },

  /** Convenience: confetti shower */
  confetti(x, y) {
    this.spawn(x, y, '#fff', 50, 'confetti');
  },

  /** Convenience: subtle shimmer */
  shimmer(x, y, color) {
    this.spawn(x, y, color, 6, 'shimmer');
  },

  /** Animation loop for particles */
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and filter dead particles
    this.particles = this.particles.filter(p => p.life > 0.01);

    if (this.particles.length === 0) {
      this.running = false;
      return;
    }

    for (const p of this.particles) {
      // Physics update
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99; // Air resistance
      p.life -= p.decay;
      p.rotation += p.rotSpeed;

      // Render
      const alpha = Math.max(0, Math.min(1, p.life));
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;

      if (p.type === 'confetti') {
        // Rectangular confetti piece
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation * Math.PI / 180);
        this.ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
        this.ctx.restore();
      } else if (p.type === 'shimmer') {
        // Glowing dot
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        this.ctx.fill();
        // Glow
        this.ctx.globalAlpha = alpha * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * alpha * 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Circle particle (sparkle & explode)
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        this.ctx.fill();

        // Optional inner glow for explode
        if (p.type === 'explode') {
          this.ctx.globalAlpha = alpha * 0.5;
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * alpha * 0.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
};
