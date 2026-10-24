import { useId, useState } from "react";

import "./AnimatedLikeIcon.css";

// Fireworks fired when the icon is switched on; --d staggers each one.
const ROCKETS = [
  { color: "#ff4d6d", dx: 0, dy: -82, d: 0 },
  { color: "#ffd166", dx: -52, dy: -60, d: 0.12 },
  { color: "#ff2fa6", dx: 52, dy: -60, d: 0.2 },
  { color: "#a64ee0", dx: -90, dy: -30, d: 0.3 },
  { color: "#ffd166", dx: 90, dy: -30, d: 0.38 },
  { color: "#7df9ff", dx: 0, dy: -127, d: 0.45 },
];

const SPARKS = [
  { x: 100, y: -30, color: "#ff4d6d", d: 0.35 },
  { x: 48, y: -8, color: "#ffd166", d: 0.47 },
  { x: 152, y: -8, color: "#ff2fa6", d: 0.55 },
  { x: 10, y: 22, color: "#a64ee0", d: 0.65 },
  { x: 190, y: 22, color: "#ffd166", d: 0.73 },
  { x: 100, y: -75, color: "#7df9ff", d: 0.8 },
];

const RAYS = Array.from({ length: 12 }, (_, index) => index * 30);

const VIEW_WIDTH = 128;
const VIEW_HEIGHT = 156;

/**
 * Castle like icon. Purely visual: the parent button owns the click, aria-pressed
 * and label. Fills in when `liked` is true and fires fireworks on the off-to-on change.
 * `size` is the icon height in px.
 */
export default function AnimatedLikeIcon({ liked = false, size = 24, className = "" }) {
  const gradientId = `like-fx-${useId().replace(/:/g, "")}`;

  // Adjusting state during render keeps already-liked items from animating on load.
  const [tracked, setTracked] = useState({ liked, burst: false });
  if (tracked.liked !== liked) {
    setTracked({ liked, burst: liked });
  }

  return (
    <svg
      viewBox={`36 18 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      width={(size * VIEW_WIDTH) / VIEW_HEIGHT}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`like-fx${liked ? " liked" : ""}${tracked.burst ? " burst" : ""} ${className}`}
      style={{ "--like-fx-fill": `url(#${gradientId})` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff4d6d" />
          <stop offset=".5" stopColor="#ff2fa6" />
          <stop offset="1" stopColor="#a64ee0" />
        </linearGradient>
      </defs>

      {ROCKETS.map((rocket) => (
        <circle
          key={`${rocket.dx}-${rocket.dy}`}
          className="rk"
          r="3"
          cx="100"
          cy="52"
          fill={rocket.color}
          style={{ "--dx": `${rocket.dx}px`, "--dy": `${rocket.dy}px`, "--d": `${rocket.d}s` }}
        />
      ))}

      {SPARKS.map((spark) => (
        <g key={`${spark.x}-${spark.y}`} transform={`translate(${spark.x} ${spark.y})`}>
          {RAYS.map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <line
                className="sp"
                x1="7"
                y1="0"
                x2="15"
                y2="0"
                stroke={spark.color}
                style={{ "--d": `${spark.d}s` }}
              />
            </g>
          ))}
        </g>
      ))}

      <g className="castle">
        <g className="body" fillRule="nonzero">
          <rect x="40" y="82" width="30" height="88" />
          <rect x="130" y="82" width="30" height="88" />
          <rect x="80" y="56" width="40" height="114" />
          <rect x="40" y="112" width="120" height="58" />
          <rect x="40" y="72" width="8" height="10" />
          <rect x="52" y="72" width="8" height="10" />
          <rect x="62" y="72" width="8" height="10" />
          <rect x="130" y="72" width="8" height="10" />
          <rect x="142" y="72" width="8" height="10" />
          <rect x="152" y="72" width="8" height="10" />
          <rect x="80" y="46" width="8" height="10" />
          <rect x="92" y="46" width="8" height="10" />
          <rect x="104" y="46" width="8" height="10" />
          <rect x="112" y="46" width="8" height="10" />
        </g>
        <path className="door" d="M90 170V146a10 10 0 0 1 20 0V170Z" />
        <rect className="win" x="51" y="92" width="8" height="14" rx="4" />
        <rect className="win" x="141" y="92" width="8" height="14" rx="4" />
        <rect className="win" x="96" y="70" width="8" height="14" rx="4" />
        <path className="flag" d="M100 46V22L122 30L100 38" />
      </g>
    </svg>
  );
}
