'use client';

import { useRef, useState, type PointerEvent } from 'react';

/** Decorative only: no device APIs, telemetry, timers or animation loop. */
export function LabScene({
  label,
  hint,
  caption,
}: {
  label: string;
  hint: string;
  caption: string;
}) {
  const layer = useRef<SVGSVGElement>(null);
  const [lit, setLit] = useState(false);
  function reset() {
    layer.current?.style.removeProperty('--scene-x');
    layer.current?.style.removeProperty('--scene-y');
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reset();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    layer.current?.style.setProperty(
      '--scene-x',
      `${((event.clientX - rect.left) / rect.width - 0.5) * 10}px`,
    );
    layer.current?.style.setProperty(
      '--scene-y',
      `${((event.clientY - rect.top) / rect.height - 0.5) * 8}px`,
    );
  }
  return (
    <figure className="lab-scene">
      <div className="scene-heading">
        <span>DEVICE LAB / STUDIO</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5" />
        </svg>
      </div>
      <button
        type="button"
        className="scene-control"
        aria-label={`${hint}. ${label}`}
        aria-describedby="scene-hint"
        aria-pressed={lit}
        onClick={() => setLit((value) => !value)}
        onPointerMove={move}
        onPointerLeave={reset}
        onBlur={reset}
      >
        <svg
          ref={layer}
          className="scene-art"
          viewBox="0 0 520 370"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <ellipse cx="265" cy="307" rx="213" ry="40" className="scene-shadow" />
          <path d="m22 273 219-78 255 83-210 78Z" className="scene-desk" />
          <path d="m22 273 264 83 210-78M286 356v8" className="scene-line" />
          <g className="scene-monitor">
            <path d="m250 202 1 41 39 13 33-12-39-12-1-41" className="scene-hardware" />
            <path d="m104 58 269 37v145l-269-47Z" className="scene-hardware" />
            <path d="m116 72 245 34v116l-245-41Z" className="scene-display" />
            <path d="m128 86 220 31M128 96l105 15" className="scene-line" />
            <path d="m147 153 31-26 31 37 37-36 34 45 48-37" className="scene-signal" />
            <path d="m146 164 182 31" className="scene-line" strokeDasharray="3 7" />
            <circle cx="239" cy="207" r="3" className="scene-light" />
            <path d="m116 72 245 34v116l-245-41Z" className="scene-screen-glow" />
          </g>
          <g className="scene-keyboard">
            <path d="m85 242 146-34 105 46-144 41-107-42Z" className="scene-hardware" />
            <path d="m85 242 107 43 144-41M192 285v10" className="scene-line" />
            {Array.from({ length: 4 }, (_, row) =>
              Array.from({ length: 9 }, (_, col) => (
                <path
                  key={`${row}-${col}`}
                  d={`m${103 + col * 15 + row * 17} ${241 - col * 3.5 + row * 7} 10-2 11 4-10 3Z`}
                  className={(row + col) % 4 === 0 ? 'scene-key scene-key-accent' : 'scene-key'}
                />
              )),
            )}
          </g>
          <g className="scene-mouse">
            <path
              d="M383 252c-14-5-28 4-32 18s2 23 16 28 31-4 34-17-4-24-18-29Z"
              className="scene-hardware"
            />
            <path d="m383 252-11 26-21-8m21 8 29 3" className="scene-line" />
            <path d="m379 261-3 7" className="scene-signal" />
            <ellipse cx="377" cy="281" rx="42" ry="28" className="scene-click-ring" />
          </g>
          <g className="scene-orbit" strokeDasharray="3 7">
            <path d="M70 205C10 92 112 6 241 29M400 89c98 35 120 117 58 150" />
          </g>
          <g className="scene-chip">
            <rect x="32" y="120" width="54" height="44" rx="12" />
            <path d="m47 142 8 8 16-17" />
          </g>
          <g className="scene-chip scene-chip-violet">
            <rect x="401" y="141" width="68" height="50" rx="12" />
            <path d="M414 166h7l5-12 8 25 7-20 5 7h10" />
          </g>
          <circle cx="416" cy="58" r="7" className="scene-light" />
          <path d="M87 306v14m-7-7h14" className="scene-signal" />
        </svg>
        <span id="scene-hint" className="scene-hint">
          {hint}
          <span aria-hidden="true">↗</span>
        </span>
      </button>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
