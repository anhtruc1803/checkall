import type { Category } from '@/lib/tools/registry';

/** Server-rendered illustrations, kept separate from the shared navigation icons. */
export function CategoryArt({ category }: { category: Category }) {
  return (
    <svg
      className="category-art"
      viewBox="0 0 120 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="60" cy="61" rx="39" ry="5" className="art-shadow" stroke="none" />
      {category === 'screen' && (
        <>
          <rect x="27" y="10" width="66" height="42" rx="5" className="art-surface" />
          <path d="M52 52v8m16-8v8M44 60h32M34 18h52v26H34Z" />
          <path d="M43 25h9v9h-9zm18 0h9v9h-9z" className="art-accent" />
          <path d="M78 26v8" className="art-detail" />
        </>
      )}
      {category === 'keyboard' && (
        <g transform="rotate(-8 60 36)">
          <rect x="17" y="18" width="86" height="36" rx="6" className="art-surface" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3, 4, 5, 6].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={24 + col * 10}
                y={25 + row * 7}
                width="6"
                height="4"
                rx="1"
                className={(row + col) % 4 === 0 ? 'art-accent' : 'art-detail'}
              />
            )),
          )}
          <path d="M46 47h28" />
        </g>
      )}
      {category === 'mouse' && (
        <>
          <ellipse cx="60" cy="36" rx="37" ry="28" strokeDasharray="2 6" className="art-detail" />
          <rect x="43" y="10" width="34" height="48" rx="17" className="art-surface" />
          <path d="M60 11v19H43m17 0h17" />
          <path d="M60 19v5" className="art-accent" />
          <path d="m87 15 8 2-4 7m-4-7-8 10" />
        </>
      )}
      {category === 'audio' && (
        <>
          <rect x="16" y="21" width="22" height="34" rx="4" className="art-surface" />
          <circle cx="27" cy="43" r="6" />
          <circle cx="27" cy="28" r="2" />
          <path d="M48 33v10m8-19v28m8-36v44m8-33v22m8-15v8" className="art-accent" />
          <path d="M91 25a22 22 0 0 1 0 24m7-31a32 32 0 0 1 0 38" className="art-detail" />
        </>
      )}
      {category === 'camera' && (
        <>
          <path
            d="m43 20 5-8h24l5 8h15a6 6 0 0 1 6 6v26H22V26a6 6 0 0 1 6-6Z"
            className="art-surface"
          />
          <circle cx="60" cy="35" r="17" />
          <circle cx="60" cy="35" r="10" className="art-accent" />
          <path d="M60 28a7 7 0 0 1 7 7M85 27h5" />
          <path d="M15 14v-5h10m80 5v-5H95M15 56v6h10m80-6v6H95" className="art-detail" />
        </>
      )}
      {category === 'gamepad' && (
        <>
          <path
            d="M37 19h46c9 0 16 29 13 35s-11 3-24-9H48C35 57 27 60 24 54s4-35 13-35Z"
            className="art-surface"
          />
          <path d="M38 27v16m-8-8h16" />
          <circle cx="53" cy="42" r="5" className="art-accent" />
          <circle cx="68" cy="42" r="5" className="art-accent" />
          <circle cx="82" cy="29" r="2" />
          <circle cx="88" cy="35" r="2" />
          <path d="M54 26h12" className="art-detail" />
        </>
      )}
      {category === 'device' && (
        <>
          <rect x="31" y="8" width="58" height="50" rx="7" className="art-surface" />
          <rect x="44" y="19" width="32" height="28" rx="4" />
          <path d="M52 26h16v14H52Z" className="art-accent" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${47 + i * 8} 14v5m0 28v5M38 ${23 + i * 7}h6m32 0h6`} />
          ))}
          <path d="M22 23h-8m8 10h-5m5 10h-8m84-20h8m-8 10h5m-5 10h8" className="art-detail" />
        </>
      )}
      {category === 'browser' && (
        <>
          <rect x="19" y="9" width="82" height="50" rx="6" className="art-surface" />
          <path d="M19 21h82M27 15h1m6 0h1m6 0h1M28 30h18m-18 7h12m-12 7h17" />
          <circle cx="72" cy="39" r="14" />
          <ellipse cx="72" cy="39" rx="6" ry="14" className="art-accent" />
          <path d="M58 39h28" />
        </>
      )}
    </svg>
  );
}
