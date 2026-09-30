import { THEMES } from './themes.js'

// Each theme's swatch is a miniature of its gauge, drawn in its own colours on
// one 48-unit grid (1 unit = 1px at full size) so the five read as a set.
const BLOB = 'M1-13.5C8.5-13 13.5-7.5 13-.5 12.5 7 7 12.5-.5 12.5-8 12.5-13 7-13-.5-13-8-7.5-14 1-13.5Z'
const E = (y, fill) => <path d={`M17 ${y}h8v2h-5.5v1.5h5.5v2h-5.5v1.5h5.5v2h-8z`} fill={fill} />
const SAPLING = 'M0 0v-4.5M0-3c-.8-1.6-2.6-2.2-3.8-1.4.8 1.3 2.4 1.8 3.8 1.4zM0-3.6c.8-1.6 2.6-2.2 3.8-1.4-.8 1.3-2.4 1.8-3.8 1.4z'

const GLYPHS = {
  tide: (
    <>
      <rect width="48" height="48" fill="#c3cdc9" />
      <rect x="31" width="2" height="48" fill="#10181c" opacity="0.1" />
      <rect x="17" width="14" height="48" fill="#e9ece6" />
      {E(3, '#c8322b')}
      {E(12, '#10181c')}
      {E(21, '#c8322b')}
      {E(30, '#10181c')}
      <path d="M0 33c8-1.6 16 1.2 24 0s16-1.4 24 0v15H0z" fill="#1f6a6e" />
      <path d="M0 36.5c8-1.2 16 1 24 0s16-1.1 24 0V48H0z" fill="#0f3b40" />
      <path d="M0 41.5c8-.8 16 .8 24 0s16-.8 24 0V48H0z" fill="#0c3337" />
      <path d="M0 33c8-1.6 16 1.2 24 0s16-1.4 24 0" fill="none" stroke="#7fcfc6" strokeWidth="1" />
    </>
  ),
  bloom: (
    <>
      <rect width="48" height="48" fill="#171213" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="#6d5550" strokeWidth="0.8" strokeDasharray="0.8 2.4" />
      <path d={BLOB} fill="#6e2a24" transform="translate(26 22.5) rotate(40) scale(1.02)" />
      <path d={BLOB} fill="#b84a33" transform="translate(22 25.5) rotate(165) scale(0.86)" />
      <path d={BLOB} fill="#f2875a" transform="translate(24.5 24) rotate(285) scale(0.64)" />
    </>
  ),
  vessel: (
    <>
      <rect width="48" height="48" fill="#eef3f7" />
      <path d="M5 23.5h2.5M5 29.5h2.5M5 35.5h2.5" stroke="#56687c" strokeWidth="1" />
      <path d="M16 9.5v3.2c0 2.8-7 3.6-7 8.3v17c0 2.2 1.8 4 4 4h14c2.2 0 4-1.8 4-4V21c0-4.7-7-5.5-7-8.3V9.5z" fill="#ffffff" stroke="#8aa3b8" strokeWidth="1.5" />
      <path d="M9.75 29.5h20.5V38c0 1.8-1.45 3.25-3.25 3.25H13A3.25 3.25 0 0 1 9.75 38z" fill="#1f5fa8" />
      <path d="M9.75 29.5h20.5" stroke="#9fd0f5" strokeWidth="1" />
      <rect x="15" y="5" width="10" height="5" rx="1.5" fill="#13233a" />
      <path d="M34.5 31h8l-1.1 11h-5.8z" fill="#ffffff" stroke="#8aa3b8" strokeWidth="1.2" />
      <path d="M35.3 36.5h6.4l-.6 4.9h-5.2z" fill="#3f86cf" />
    </>
  ),
  dawn: (
    <>
      <rect width="48" height="48" fill="#e39c5f" />
      <rect width="48" height="12" fill="#3f5f88" />
      <rect y="12" width="48" height="4" fill="#5f7394" />
      <rect y="16" width="48" height="4" fill="#7d7b8f" />
      <rect y="20" width="48" height="4" fill="#9a8589" />
      <rect y="24" width="48" height="4" fill="#b58f7f" />
      <rect y="28" width="48" height="4" fill="#cc9670" />
      <circle cx="24" cy="30" r="14" fill="#ffe3ad" opacity="0.12" />
      <circle cx="24" cy="30" r="10" fill="#ffe3ad" opacity="0.2" />
      <circle cx="24" cy="30" r="6.5" fill="#ffe3ad" />
      <path d="M0 34c10-4 18-3 26-1.5S40 31 48 29v19H0z" fill="#3e5873" />
      <path d="M0 39c12-3 22-1 30-2s12-2 18-1v12H0z" fill="#26374c" />
      <path d="M0 44c14-3 30-1 48-3v7H0z" fill="#121824" />
    </>
  ),
  grove: (
    <>
      <rect width="48" height="48" fill="#eef3e4" />
      <path d="M-2 48v-7q26-16 52 0v7z" fill="#6b4a32" />
      <path d="M-2 41q26-16 52 0" fill="none" stroke="#7fb35f" strokeWidth="2" />
      <path d={SAPLING} fill="#78b163" stroke="#6b4a32" strokeWidth="0.3" transform="translate(9 38.2)" />
      <path d={SAPLING} fill="#78b163" stroke="#6b4a32" strokeWidth="0.3" transform="translate(39 38.2)" />
      <path d="M22.4 34c.4-4 .2-7.4-1.8-10.6l1.6-.8c1.4 2 2.2 4 2.5 6 .8-2.2 2.2-3.8 4.4-5l.9 1.4c-2.6 1.6-3.8 4-3.8 9z" fill="#6b4a32" />
      <circle cx="28.5" cy="19.5" r="7" fill="#4a8443" />
      <circle cx="19.5" cy="19" r="7" fill="#5f9a52" />
      <circle cx="24.5" cy="13" r="8" fill="#5f9a52" />
      <circle cx="19" cy="14.5" r="4.5" fill="#78b163" />
      <circle cx="28.5" cy="10.5" r="1.25" fill="#f4b6c2" />
      <circle cx="16.5" cy="20.5" r="1.25" fill="#f4b6c2" />
      <circle cx="31" cy="20" r="1.25" fill="#f29fb0" />
    </>
  ),
}

export function Look({ theme, onTheme, sound, onSound }) {
  return (
    <div className="look">
      <div className="themes" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={t.id === theme}
            className="swatch"
            title={t.name}
            onClick={() => onTheme(t.id)}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">{GLYPHS[t.id]}</svg>
            <span className="look-name">{t.name}</span>
          </button>
        ))}
      </div>
      <div className="sounds" role="group" aria-label="Sound">
        <button
          type="button"
          aria-pressed={sound.cues}
          title="Cues: a soft sound at each start, stop and target"
          onClick={() => onSound({ ...sound, cues: !sound.cues })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
            {sound.cues ? <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
          </svg>
          <span className="sound-text">
            <span>Cues</span>
            <small>{sound.cues ? 'On' : 'Off'}</small>
          </span>
        </button>
        <button
          type="button"
          aria-pressed={sound.ambience}
          title="Ambience: a quiet background bed for the theme"
          onClick={() => onSound({ ...sound, ambience: !sound.ambience })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9c3-2.5 6-2.5 9 0s6 2.5 9 0M3 15c3-2.5 6-2.5 9 0s6 2.5 9 0" />
            {!sound.ambience && <path d="M4 20L20 4" />}
          </svg>
          <span className="sound-text">
            <span>Ambience</span>
            <small>{sound.ambience ? 'On' : 'Off'}</small>
          </span>
        </button>
      </div>
    </div>
  )
}
