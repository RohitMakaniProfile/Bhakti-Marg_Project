'use client'

// Outer div: static opacity + 3D tilt. Inner span: only float animation.
// This prevents animation from overriding the opacity.
const MANTRAS = [
  { text: 'राधे राधे', top:  8, left:  2, size: 5.2, op: 0.14, dur: 22, delay:  0, rx: 16, ry: -12 },
  { text: 'राधे राधे', top: 72, left: 66, size: 5.8, op: 0.12, dur: 28, delay:  4, rx: 12, ry:  10 },
  { text: 'राधे राधे', top: 44, left: 78, size: 4.8, op: 0.13, dur: 20, delay:  7, rx: 22, ry:  -8 },
  { text: 'राधे राधे', top: 84, left:  4, size: 5.0, op: 0.12, dur: 25, delay: 12, rx:  8, ry:  15 },
  { text: 'राधे राधे', top: 30, left: 53, size: 4.2, op: 0.11, dur: 30, delay:  2, rx: 20, ry: -20 },
  { text: 'राधे राधे', top: 60, left: 26, size: 5.0, op: 0.12, dur: 24, delay:  9, rx: 15, ry:   8 },
  { text: 'राधे राधे', top: 18, left: 70, size: 4.2, op: 0.11, dur: 19, delay: 14, rx: 10, ry: -15 },
  { text: 'राधे राधे', top: 91, left: 38, size: 4.5, op: 0.11, dur: 26, delay:  3, rx: 25, ry:   5 },
  { text: 'राधे',      top: 22, left: 34, size: 3.2, op: 0.17, dur: 18, delay:  5, rx: 14, ry: -10 },
  { text: 'राधे',      top: 55, left:  7, size: 2.8, op: 0.15, dur: 22, delay: 11, rx:  8, ry:  12 },
  { text: 'राधे',      top: 77, left: 84, size: 3.2, op: 0.15, dur: 20, delay:  6, rx: 20, ry:  -5 },
  { text: 'राधे',      top: 40, left: 14, size: 2.6, op: 0.18, dur: 16, delay:  8, rx:  5, ry:  18 },
  { text: 'राधे',      top: 64, left: 47, size: 3.0, op: 0.15, dur: 21, delay: 15, rx: 16, ry: -12 },
  { text: 'राधे',      top: 12, left: 87, size: 2.6, op: 0.14, dur: 17, delay:  1, rx: 10, ry:   6 },
  { text: 'ॐ',         top:  5, left: 44, size: 4.2, op: 0.20, dur: 20, delay:  0, rx:  0, ry:   0 },
  { text: 'ॐ',         top: 50, left: 91, size: 3.6, op: 0.18, dur: 24, delay:  7, rx:  5, ry:  -5 },
  { text: 'ॐ',         top: 80, left: 21, size: 4.5, op: 0.19, dur: 18, delay: 13, rx: -5, ry:   5 },
  { text: 'ॐ',         top: 35, left:  3, size: 3.0, op: 0.17, dur: 22, delay:  3, rx:  8, ry:  -8 },
  { text: 'ॐ',         top: 70, left: 61, size: 3.8, op: 0.18, dur: 26, delay: 10, rx: -8, ry:   8 },
  { text: 'ॐ',         top: 94, left: 74, size: 2.8, op: 0.16, dur: 19, delay:  5, rx: 12, ry: -12 },
  { text: 'राधे राधे', top:  3, left: 59, size: 2.0, op: 0.09, dur: 35, delay:  2, rx: 25, ry: -20 },
  { text: 'राधे राधे', top: 48, left: 37, size: 1.8, op: 0.08, dur: 32, delay: 16, rx: 20, ry:  15 },
  { text: 'राधे राधे', top: 87, left: 54, size: 2.2, op: 0.09, dur: 38, delay:  8, rx: 30, ry: -25 },
  { text: 'राधे',      top: 58, left: 77, size: 2.2, op: 0.12, dur: 28, delay:  4, rx: 22, ry: -18 },
  { text: 'राधे',      top: 15, left: 51, size: 2.0, op: 0.11, dur: 30, delay: 11, rx: 15, ry:  10 },
]

export default function FloatingMantras() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {MANTRAS.map((m, i) => (
        <div
          key={i}
          className="absolute font-hindi whitespace-nowrap"
          style={{
            top: `${m.top}%`,
            left: `${m.left}%`,
            fontSize: `${m.size}rem`,
            /* opacity is here — OUTSIDE the animation — so it won't be overridden */
            opacity: m.op,
            transform: `perspective(700px) rotateX(${m.rx}deg) rotateY(${m.ry}deg)`,
          }}
        >
          <span
            className="mantra-inner"
            style={{
              animationDuration: `${m.dur}s`,
              animationDelay: `${-m.delay}s`,
              color: '#e8952a',
              textShadow: `
                0 1px 0 rgba(240,140,20,0.7),
                0 2px 0 rgba(180,80,0,0.5),
                0 3px 0 rgba(120,40,0,0.35),
                0 5px 12px rgba(0,0,0,0.6),
                0 0 30px rgba(245,158,11,0.4)
              `,
            }}
          >
            {m.text}
          </span>
        </div>
      ))}
    </div>
  )
}
