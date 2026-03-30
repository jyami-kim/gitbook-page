import React, { useState, useEffect, useRef, useCallback } from 'react';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

// Korean content explaining Pretext
const PRETEXT_CONTENT = `Pretext는 Cheng Lou가 만든 혁신적인 텍스트 레이아웃 라이브러리입니다. 기존 브라우저에서 텍스트 높이를 측정하려면 DOM에 렌더링한 후 getBoundingClientRect()나 offsetHeight를 호출해야 했습니다. 이 과정에서 Layout Reflow가 발생하는데, 이는 브라우저에서 가장 비용이 큰 연산 중 하나입니다.

Pretext는 이 문제를 완전히 다른 방식으로 해결합니다. Canvas의 measureText를 사용해 글자 너비를 캐시하고, 이후의 모든 레이아웃 계산은 순수한 산술 연산으로 처리합니다. 결과적으로 같은 500개 텍스트를 0.05ms에 처리할 수 있으며, Reflow는 단 한 번도 발생하지 않습니다. 이는 300-600배의 성능 향상입니다.

Pretext의 핵심 기능 중 하나는 layoutNextLine() 함수입니다. 이 함수는 각 줄마다 다른 너비를 지정할 수 있어서, 장애물을 피해 텍스트가 흐르는 레이아웃을 구현할 수 있습니다. 전통적인 CSS로는 float 속성 정도만 사용할 수 있었지만, Pretext를 사용하면 임의의 모양 주변으로 텍스트를 배치할 수 있습니다.

지금 보고 있는 이 페이지가 바로 그 예시입니다. 마우스를 움직이면 텍스트가 실시간으로 포인터를 피해 다시 배치됩니다. 클릭하면 원형 장애물이 생성되고 서서히 사라집니다. 모든 계산은 DOM 조작 없이 Pretext만으로 이루어지며, 60fps의 부드러운 애니메이션이 가능합니다.

Pretext는 다국어를 완벽하게 지원합니다. 한글, 중국어, 일본어, 아랍어, 이모지까지 모두 정확하게 측정하고 줄바꿈합니다. 이는 브라우저의 폰트 엔진을 ground truth로 사용하여 테스트했기 때문에 가능합니다.

React, Vue, Canvas, WebGL, 심지어 서버사이드에서도 동작합니다. 의존성 없는 순수 TypeScript로 작성되어 번들 크기도 단 몇 KB에 불과합니다. 현대 웹 개발에서 텍스트 레이아웃의 새로운 가능성을 열어주는 라이브러리입니다.

Cheng Lou는 React Motion의 창시자이자 Meta에서 ReasonML 개발을 이끌었던 개발자입니다. 현재는 Midjourney의 프론트엔드 아키텍처를 구축하고 있습니다. Pretext는 Claude와 함께 개발되었으며, 브라우저의 실제 동작을 ground truth로 사용하여 반복적인 테스트와 검증을 거쳤습니다.

텍스트 레이아웃은 웹 개발에서 가장 어려운 문제 중 하나입니다. 브라우저마다 렌더링 방식이 다르고, 폰트마다 메트릭이 다르며, 언어마다 줄바꿈 규칙이 다릅니다. Pretext는 이 모든 복잡성을 추상화하여 개발자가 창의적인 레이아웃에 집중할 수 있게 해줍니다.`;

// Configuration
const BODY_FONT = '18px "Georgia", "Noto Serif KR", serif';
const LINE_HEIGHT = 28;
const PADDING_X = 60;
const PADDING_TOP = 140;
const MIN_SLOT_WIDTH = 60;
const ORB_H_PAD = 18;
const ORB_V_PAD = 8;

// Mouse trail and orb settings
const MOUSE_RADIUS = 45;
const TRAIL_POINT_LIFETIME = 1500; // ms
const TRAIL_POINT_RADIUS = 25;
const ORB_GROW_DURATION = 1500; // ms - slower grow
const ORB_STAY_DURATION = 3000; // ms - longer stay
const ORB_FADE_DURATION = 2000; // ms - slower fade

// Gradient orb colors
const ORB_GRADIENTS = [
  { from: '#c4a35a', to: '#8b6914', glow: 'rgba(196, 163, 90, 0.5)' },
  { from: '#a35ac4', to: '#6b148b', glow: 'rgba(163, 90, 196, 0.5)' },
  { from: '#5ac4a3', to: '#148b6b', glow: 'rgba(90, 196, 163, 0.5)' },
  { from: '#c45a7a', to: '#8b1444', glow: 'rgba(196, 90, 122, 0.5)' },
  { from: '#5a8bc4', to: '#14458b', glow: 'rgba(90, 139, 196, 0.5)' },
];

// Calculate the horizontal interval blocked by a circle for a vertical band
function circleIntervalForBand(cx, cy, r, bandTop, bandBottom, hPad, vPad) {
  if (r <= 0) return null;

  const top = bandTop - vPad;
  const bottom = bandBottom + vPad;

  if (top >= cy + r || bottom <= cy - r) {
    return null;
  }

  let minDy;
  if (cy >= top && cy <= bottom) {
    minDy = 0;
  } else if (cy < top) {
    minDy = top - cy;
  } else {
    minDy = cy - bottom;
  }

  if (minDy >= r) {
    return null;
  }

  const maxDx = Math.sqrt(r * r - minDy * minDy);

  return {
    left: cx - maxDx - hPad,
    right: cx + maxDx + hPad
  };
}

// Carve available slots from base region
function carveTextLineSlots(base, blocked) {
  let slots = [{ left: base.left, right: base.right }];

  for (const iv of blocked) {
    const next = [];
    for (const s of slots) {
      if (iv.right <= s.left || iv.left >= s.right) {
        next.push(s);
        continue;
      }
      if (iv.left > s.left) {
        next.push({ left: s.left, right: iv.left });
      }
      if (iv.right < s.right) {
        next.push({ left: iv.right, right: s.right });
      }
    }
    slots = next;
  }

  return slots.filter(s => s.right - s.left >= MIN_SLOT_WIDTH);
}

// Layout text with obstacles
function layoutTextWithObstacles(prepared, region, lineHeight, circleObs) {
  const lines = [];
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineTop = region.y;
  let textExhausted = false;

  while (lineTop + lineHeight <= region.y + region.height && !textExhausted) {
    const bandTop = lineTop;
    const bandBottom = lineTop + lineHeight;
    const blocked = [];

    for (const c of circleObs) {
      const iv = circleIntervalForBand(
        c.cx, c.cy, c.r,
        bandTop, bandBottom,
        c.hPad, c.vPad
      );
      if (iv !== null) {
        blocked.push(iv);
      }
    }

    const slots = carveTextLineSlots(
      { left: region.x, right: region.x + region.width },
      blocked
    );

    if (slots.length === 0) {
      lineTop += lineHeight;
      continue;
    }

    slots.sort((a, b) => a.left - b.left);

    for (const slot of slots) {
      const slotWidth = slot.right - slot.left;
      const line = layoutNextLine(prepared, cursor, slotWidth);

      if (line === null) {
        textExhausted = true;
        break;
      }

      lines.push({
        x: Math.round(slot.left),
        y: Math.round(lineTop),
        text: line.text,
        width: line.width
      });

      cursor = line.end;
    }

    lineTop += lineHeight;
  }

  return lines;
}

export default function TextFlow() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [orbs, setOrbs] = useState([]);
  const [trailPoints, setTrailPoints] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [preparedText, setPreparedText] = useState(null);
  const [lines, setLines] = useState([]);
  const [layoutTime, setLayoutTime] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 800, height: 900 });

  const orbsRef = useRef(orbs);
  const trailRef = useRef(trailPoints);
  const mousePosRef = useRef(mousePos);
  const animationRef = useRef(null);
  const lastTrailTime = useRef(0);

  useEffect(() => { orbsRef.current = orbs; }, [orbs]);
  useEffect(() => { trailRef.current = trailPoints; }, [trailPoints]);
  useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);

  // Prepare text once
  useEffect(() => {
    document.fonts.ready.then(() => {
      try {
        const prepared = prepareWithSegments(PRETEXT_CONTENT, BODY_FONT);
        setPreparedText(prepared);
      } catch (e) {
        console.error('Pretext prepare error:', e);
      }
    });
  }, []);

  // Layout function
  const performLayout = useCallback(() => {
    if (!preparedText) return;

    const startTime = performance.now();
    const now = Date.now();

    // Build obstacle list
    const circleObs = [];

    // Add mouse position as obstacle
    if (mousePosRef.current.x > 0) {
      circleObs.push({
        cx: mousePosRef.current.x,
        cy: mousePosRef.current.y,
        r: MOUSE_RADIUS,
        hPad: 12,
        vPad: 6
      });
    }

    // Add trail points as obstacles (with fading radius)
    for (const point of trailRef.current) {
      const age = now - point.createdAt;
      const lifeRatio = 1 - (age / TRAIL_POINT_LIFETIME);
      if (lifeRatio > 0) {
        circleObs.push({
          cx: point.x,
          cy: point.y,
          r: TRAIL_POINT_RADIUS * lifeRatio,
          hPad: 10 * lifeRatio,
          vPad: 4 * lifeRatio
        });
      }
    }

    // Add orbs as obstacles
    for (const orb of orbsRef.current) {
      const age = now - orb.createdAt;
      let radius = 0;
      let opacity = 1;

      if (age < ORB_GROW_DURATION) {
        // Growing phase
        const progress = age / ORB_GROW_DURATION;
        const eased = 1 - Math.pow(1 - progress, 3);
        radius = orb.targetRadius * eased;
      } else if (age < ORB_GROW_DURATION + ORB_STAY_DURATION) {
        // Stay phase
        radius = orb.targetRadius;
      } else if (age < ORB_GROW_DURATION + ORB_STAY_DURATION + ORB_FADE_DURATION) {
        // Fading phase
        const fadeProgress = (age - ORB_GROW_DURATION - ORB_STAY_DURATION) / ORB_FADE_DURATION;
        const eased = Math.pow(fadeProgress, 2);
        radius = orb.targetRadius * (1 - eased);
        opacity = 1 - eased;
      }

      orb.currentRadius = radius;
      orb.opacity = opacity;

      if (radius > 0) {
        circleObs.push({
          cx: orb.x,
          cy: orb.y,
          r: radius,
          hPad: ORB_H_PAD,
          vPad: ORB_V_PAD
        });
      }
    }

    // Perform layout
    const newLines = layoutTextWithObstacles(
      preparedText,
      {
        x: PADDING_X,
        y: PADDING_TOP,
        width: pageSize.width - PADDING_X * 2,
        height: pageSize.height - PADDING_TOP - 60
      },
      LINE_HEIGHT,
      circleObs
    );

    const endTime = performance.now();
    setLayoutTime(endTime - startTime);
    setLines(newLines);
  }, [preparedText, pageSize]);

  // Draw trail on canvas
  const drawTrail = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();

    // Draw trail points - matching cursor color
    for (const point of trailRef.current) {
      const age = now - point.createdAt;
      const lifeRatio = 1 - (age / TRAIL_POINT_LIFETIME);

      if (lifeRatio > 0) {
        const radius = TRAIL_POINT_RADIUS * lifeRatio;
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, radius
        );
        gradient.addColorStop(0, `rgba(232, 228, 220, ${0.25 * lifeRatio})`);
        gradient.addColorStop(0.5, `rgba(232, 228, 220, ${0.1 * lifeRatio})`);
        gradient.addColorStop(1, 'rgba(232, 228, 220, 0)');

        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Draw mouse cursor glow
    if (mousePosRef.current.x > 0) {
      const gradient = ctx.createRadialGradient(
        mousePosRef.current.x, mousePosRef.current.y, 0,
        mousePosRef.current.x, mousePosRef.current.y, MOUSE_RADIUS
      );
      gradient.addColorStop(0, 'rgba(232, 228, 220, 0.15)');
      gradient.addColorStop(0.5, 'rgba(232, 228, 220, 0.05)');
      gradient.addColorStop(1, 'rgba(232, 228, 220, 0)');

      ctx.beginPath();
      ctx.arc(mousePosRef.current.x, mousePosRef.current.y, MOUSE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const now = Date.now();

    // Clean up expired trail points
    setTrailPoints(prev => prev.filter(p => now - p.createdAt < TRAIL_POINT_LIFETIME));

    // Clean up expired orbs
    setOrbs(prev => prev.filter(orb => {
      const age = now - orb.createdAt;
      return age < ORB_GROW_DURATION + ORB_STAY_DURATION + ORB_FADE_DURATION;
    }));

    performLayout();
    drawTrail();

    animationRef.current = requestAnimationFrame(animate);
  }, [performLayout, drawTrail]);

  // Start animation
  useEffect(() => {
    if (preparedText) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [preparedText, animate]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Add trail points (throttled)
    const now = Date.now();
    if (now - lastTrailTime.current > 50) {
      lastTrailTime.current = now;
      setTrailPoints(prev => [...prev, { x, y, createdAt: now }]);
    }
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: -1000, y: -1000 });
  }, []);

  // Handle click - add orb
  const handleClick = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gradientIndex = Math.floor(Math.random() * ORB_GRADIENTS.length);
    const newOrb = {
      id: Date.now(),
      x,
      y,
      targetRadius: 60 + Math.random() * 40,
      currentRadius: 0,
      opacity: 1,
      createdAt: Date.now(),
      gradientIndex
    };
    setOrbs(prev => [...prev, newOrb]);
  }, []);

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      setPageSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = pageSize.width;
      canvas.height = pageSize.height;
    }
  }, [pageSize]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at 50% 30%, #0f0f14 0%, #0a0a0c 100%)',
        overflow: 'hidden',
        cursor: 'none',
      }}
    >
      {/* Trail Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 32,
        left: 0,
        right: 0,
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 400,
          color: '#e8e4dc',
          margin: 0,
          letterSpacing: '-0.5px',
          fontStyle: 'italic',
          fontFamily: 'Georgia, "Noto Serif KR", serif',
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          The Editorial Engine
        </h1>
        <p style={{
          color: 'rgba(232, 228, 220, 0.4)',
          fontSize: '13px',
          marginTop: '8px',
          fontFamily: '-apple-system, sans-serif',
        }}>
          마우스를 움직여보세요 · 클릭하면 Orb 생성
        </p>
      </div>

      {/* Stats */}
      <div style={{
        position: 'absolute',
        top: 32,
        right: 32,
        display: 'flex',
        gap: '24px',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '10px',
            color: 'rgba(232, 228, 220, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Layout
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#c4a35a',
            fontFamily: '-apple-system, sans-serif',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {layoutTime.toFixed(2)}ms
          </div>
        </div>
      </div>

      {/* Orbs - Glowing ring style */}
      {orbs.map(orb => {
        if (orb.currentRadius <= 0 || orb.opacity <= 0) return null;
        return (
          <div
            key={orb.id}
            style={{
              position: 'absolute',
              left: orb.x - orb.currentRadius,
              top: orb.y - orb.currentRadius,
              width: orb.currentRadius * 2,
              height: orb.currentRadius * 2,
              borderRadius: '50%',
              background: 'transparent',
              border: `2px solid rgba(232, 228, 220, ${0.6 * orb.opacity})`,
              boxShadow: `
                0 0 ${20 * orb.opacity}px rgba(232, 228, 220, ${0.3 * orb.opacity}),
                0 0 ${40 * orb.opacity}px rgba(232, 228, 220, ${0.15 * orb.opacity}),
                inset 0 0 ${20 * orb.opacity}px rgba(232, 228, 220, ${0.05 * orb.opacity})
              `,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Text Lines */}
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: line.x,
            top: line.y,
            color: '#e8e4dc',
            font: BODY_FONT,
            lineHeight: `${LINE_HEIGHT}px`,
            whiteSpace: 'pre',
            pointerEvents: 'none',
            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
          }}
        >
          {i === 0 ? (
            <>
              <span style={{
                float: 'left',
                fontSize: '54px',
                fontWeight: 'bold',
                color: '#c4a35a',
                lineHeight: '0.85',
                marginRight: '8px',
                marginTop: '2px',
                fontFamily: 'Georgia, serif',
                textShadow: '0 0 30px rgba(196, 163, 90, 0.5)',
              }}>
                {line.text[0]}
              </span>
              {line.text.slice(1)}
            </>
          ) : line.text}
        </div>
      ))}

      {/* Custom Cursor */}
      {mousePos.x > 0 && (
        <div
          style={{
            position: 'absolute',
            left: mousePos.x - 6,
            top: mousePos.y - 6,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'rgba(232, 228, 220, 0.8)',
            boxShadow: '0 0 20px rgba(232, 228, 220, 0.5)',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: '11px',
          color: 'rgba(232, 228, 220, 0.25)',
          fontFamily: '-apple-system, sans-serif',
          margin: 0,
        }}>
          Powered by <span style={{ color: 'rgba(196, 163, 90, 0.6)' }}>@chenglou/pretext</span>
        </p>
      </div>
    </div>
  );
}
