import React, { useState, useEffect, useRef, useCallback } from 'react';

// Korean characters to use as "sand"
const KOREAN_CHARS = '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후';

// Particle class for each character grain
class SandParticle {
  constructor(char, x, y, fontSize) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.fontSize = fontSize;
    this.width = fontSize * 0.9;
    this.height = fontSize;
    this.settled = false;
    this.opacity = 1;
    this.hue = 30 + Math.random() * 30; // Sandy colors
  }

  update(gravity, hourglass) {
    if (this.settled) return;

    // Apply gravity
    this.vy += gravity;
    this.vy = Math.min(this.vy, 8); // Terminal velocity

    // Add slight horizontal drift
    this.vx += (Math.random() - 0.5) * 0.3;
    this.vx *= 0.95; // Damping

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Check collision with hourglass walls
    const bounds = hourglass.getBoundsAt(this.y);
    if (bounds) {
      // Left wall
      if (this.x - this.width / 2 < bounds.left) {
        this.x = bounds.left + this.width / 2;
        this.vx = Math.abs(this.vx) * 0.3;
      }
      // Right wall
      if (this.x + this.width / 2 > bounds.right) {
        this.x = bounds.right - this.width / 2;
        this.vx = -Math.abs(this.vx) * 0.3;
      }
    }

    // Check if settled at bottom
    if (this.y > hourglass.bottomSettleY) {
      this.y = hourglass.bottomSettleY;
      this.vy = 0;
      this.settled = true;
      // Adjust bottomSettleY for next particle
      hourglass.bottomSettleY -= this.height * 0.3;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = `hsl(${this.hue}, 60%, 70%)`;
    ctx.font = `bold ${this.fontSize}px "Pretendard", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.char, this.x, this.y);
    ctx.restore();
  }
}

// Hourglass shape definition
class Hourglass {
  constructor(centerX, centerY, width, height) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
    this.neckWidth = width * 0.08;
    this.neckHeight = height * 0.05;

    // Calculate key Y positions
    this.topY = centerY - height / 2;
    this.bottomY = centerY + height / 2;
    this.neckTopY = centerY - this.neckHeight / 2;
    this.neckBottomY = centerY + this.neckHeight / 2;

    // Settle position for bottom particles
    this.bottomSettleY = this.bottomY - 20;
    this.initialBottomSettleY = this.bottomSettleY;
  }

  reset() {
    this.bottomSettleY = this.initialBottomSettleY;
  }

  // Get left and right bounds at a given Y position
  getBoundsAt(y) {
    const halfWidth = this.width / 2;

    if (y < this.topY || y > this.bottomY) {
      return null;
    }

    let widthAtY;

    if (y <= this.neckTopY) {
      // Top chamber - triangle narrowing down
      const progress = (y - this.topY) / (this.neckTopY - this.topY);
      widthAtY = halfWidth * (1 - progress) + this.neckWidth * progress;
    } else if (y <= this.neckBottomY) {
      // Neck - constant narrow width
      widthAtY = this.neckWidth;
    } else {
      // Bottom chamber - triangle widening
      const progress = (y - this.neckBottomY) / (this.bottomY - this.neckBottomY);
      widthAtY = this.neckWidth * (1 - progress) + halfWidth * progress;
    }

    return {
      left: this.centerX - widthAtY,
      right: this.centerX + widthAtY
    };
  }

  draw(ctx) {
    ctx.save();

    // Draw hourglass outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const hw = this.width / 2;

    ctx.beginPath();
    // Top left
    ctx.moveTo(this.centerX - hw, this.topY);
    // Top right
    ctx.lineTo(this.centerX + hw, this.topY);
    // Right side down to neck
    ctx.lineTo(this.centerX + this.neckWidth, this.neckTopY);
    // Through neck
    ctx.lineTo(this.centerX + this.neckWidth, this.neckBottomY);
    // Right side to bottom
    ctx.lineTo(this.centerX + hw, this.bottomY);
    // Bottom
    ctx.lineTo(this.centerX - hw, this.bottomY);
    // Left side up from bottom
    ctx.lineTo(this.centerX - this.neckWidth, this.neckBottomY);
    // Through neck
    ctx.lineTo(this.centerX - this.neckWidth, this.neckTopY);
    // Left side to top
    ctx.lineTo(this.centerX - hw, this.topY);

    ctx.stroke();

    // Add glass effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw stand
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.fillRect(this.centerX - hw - 10, this.topY - 15, this.width + 20, 10);
    ctx.fillRect(this.centerX - hw - 10, this.bottomY + 5, this.width + 20, 10);

    ctx.restore();
  }
}

export default function TextHourglass() {
  const canvasRef = useRef(null);
  const [duration, setDuration] = useState(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [particles, setParticles] = useState([]);

  const hourglassRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const totalParticlesRef = useRef(0);
  const releasedParticlesRef = useRef(0);

  // Initialize hourglass and particles
  const initializeHourglass = useCallback((canvas) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const width = Math.min(canvas.width * 0.5, 300);
    const height = Math.min(canvas.height * 0.8, 500);

    hourglassRef.current = new Hourglass(centerX, centerY, width, height);

    // Create initial particles in top chamber
    const hourglass = hourglassRef.current;
    const newParticles = [];
    const fontSize = 16;
    const particleCount = Math.floor(duration * 8); // More particles for longer duration
    totalParticlesRef.current = particleCount;

    // Fill top chamber with particles
    for (let i = 0; i < particleCount; i++) {
      const row = Math.floor(i / 12);
      const col = i % 12;
      const y = hourglass.topY + 30 + row * fontSize * 0.8;

      if (y < hourglass.neckTopY - fontSize) {
        const bounds = hourglass.getBoundsAt(y);
        if (bounds) {
          const availableWidth = bounds.right - bounds.left - 20;
          const x = bounds.left + 10 + (col / 11) * availableWidth;
          const char = KOREAN_CHARS[Math.floor(Math.random() * KOREAN_CHARS.length)];
          const particle = new SandParticle(char, x, y, fontSize);
          particle.settled = true; // Start settled in top
          particle.inTop = true; // Flag to track if still in top chamber
          newParticles.push(particle);
        }
      }
    }

    particlesRef.current = newParticles;
    releasedParticlesRef.current = 0;
  }, [duration]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const hourglass = hourglassRef.current;
    if (!canvas || !hourglass) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw hourglass
    hourglass.draw(ctx);

    // Update timer
    if (isRunning && startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      // Calculate how many particles should have fallen
      const progress = elapsed / duration;
      const shouldRelease = Math.floor(progress * totalParticlesRef.current);

      // Release particles from top
      let released = 0;
      for (const particle of particlesRef.current) {
        if (particle.inTop && released < shouldRelease) {
          if (particle.settled) {
            particle.settled = false;
            particle.inTop = false;
            particle.vy = 1;
            // Move to neck position
            particle.x = hourglass.centerX + (Math.random() - 0.5) * hourglass.neckWidth;
          }
          released++;
        }
      }

      if (remaining === 0) {
        setIsRunning(false);
      }
    }

    // Update and draw particles
    const gravity = 0.3;
    for (const particle of particlesRef.current) {
      if (!particle.inTop) {
        particle.update(gravity, hourglass);
      }
      particle.draw(ctx);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isRunning, duration]);

  // Start timer
  const handleStart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    hourglassRef.current?.reset();
    initializeHourglass(canvas);
    startTimeRef.current = Date.now();
    setTimeLeft(duration);
    setIsRunning(true);
  }, [duration, initializeHourglass]);

  // Reset
  const handleReset = useCallback(() => {
    setIsRunning(false);
    startTimeRef.current = null;
    setTimeLeft(0);

    const canvas = canvasRef.current;
    if (canvas) {
      hourglassRef.current?.reset();
      initializeHourglass(canvas);
    }
  }, [initializeHourglass]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = 550 * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = '550px';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      initializeHourglass(canvas);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [initializeHourglass]);

  // Animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
    }
    return `${secs}.${ms}s`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '40px 20px',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '28px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
        padding: '36px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow effects */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            한글 모래시계
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px',
            marginTop: '8px',
            marginBottom: '0',
          }}>
            Korean Text Hourglass Timer
          </p>
        </div>

        {/* Timer Display */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            background: isRunning
              ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
              : 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {isRunning ? formatTime(timeLeft) : formatTime(duration)}
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
            }}
          />
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Duration Input */}
          <div>
            <label style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              <span>Duration (seconds)</span>
              <span style={{ color: '#F59E0B' }}>{duration}s</span>
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              disabled={isRunning}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.1)',
                appearance: 'none',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.5 : 1,
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <button
              onClick={handleStart}
              disabled={isRunning}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: isRunning
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(34, 211, 238, 0.2) 100%)',
                border: `1px solid ${isRunning ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.4)'}`,
                borderRadius: '12px',
                color: isRunning ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isRunning ? 'Running...' : 'Start'}
            </button>
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.6,
          }}>
            한글 글자들이 모래처럼 떨어지는 타이머입니다.
            각 글자는 물리 시뮬레이션을 통해 모래시계 벽면과 충돌하며 아래로 떨어집니다.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.3)',
            margin: 0,
          }}>
            Canvas Physics Simulation
          </p>
        </div>
      </div>
    </div>
  );
}
