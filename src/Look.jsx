import { THEMES } from './themes.js'

// Each theme's swatch is a miniature of its gauge, drawn in its own colours.
const GLYPHS = {
  tide: (
    <>
      <rect x="4" y="4" width="28" height="28" fill="#c3cdc9" />
      <rect x="11" y="4" width="14" height="28" fill="#e9ece6" />
      <path d="M11 7h5v2h-3v2h3v2h-5z M11 15h5v2h-3v2h3v2h-5z" fill="#c8322b" />
      <rect x="4" y="21" width="28" height="11" fill="#0f3b40" />
    </>
  ),
  bloom: (
    <>
      <rect x="4" y="4" width="28" height="28" fill="#171213" />
      <path d="M18 5.5c7.4 0 12.4 4.4 11.9 11.6-.5 7.4-5.7 12.5-12.6 12-6.9-.5-11.4-5.6-10.8-12.3C7.1 9.9 11.4 5.5 18 5.5z" fill="#6e2a24" />
      <path d="M18 8.2c5.9 0 9.8 3.5 9.4 9.2-.4 5.8-4.5 9.9-10 9.5-5.4-.4-8.9-4.5-8.5-9.8C9.3 11.8 12.8 8.2 18 8.2z" fill="#b84a33" />
      <path d="M18.4 10.6c4.4 0 7.2 2.7 6.9 6.9-.3 4.3-3.3 7.3-7.4 7-4-.3-6.6-3.4-6.2-7.3.4-3.9 2.9-6.6 6.7-6.6z" fill="#f2875a" />
    </>
  ),
  vessel: (
    <>
      <rect x="4" y="4" width="28" height="28" fill="#e6edf1" />
      <path d="M15 7h6v4c0 2 5 3 5 6v11c0 1.2-.8 2-2 2H12c-1.2 0-2-.8-2-2V17c0-3 5-4 5-6z" fill="#ffffff" stroke="#7f98ab" strokeWidth="1.2" />
      <path d="M10.6 20h14.8v8c0 1-.7 1.6-1.6 1.6H12.2c-.9 0-1.6-.6-1.6-1.6z" fill="#3f86cf" />
      <rect x="14.5" y="5" width="7" height="3" rx="1" fill="#1d3a5f" />
    </>
  ),
  dawn: (
    <>
      <rect x="4" y="4" width="28" height="28" fill="#2a4262" />
      <rect x="4" y="12" width="28" height="4" fill="#5b5a6a" />
      <rect x="4" y="16" width="28" height="3" fill="#94665a" />
      <rect x="4" y="19" width="28" height="13" fill="#c9744d" />
      <circle cx="18" cy="20" r="5.5" fill="#ffe3ad" />
      <path d="M4 22.5c6-2.5 12-1 18-1.8s7.5-.8 10 .3V32H4z" fill="#5a5a60" />
      <path d="M4 26c7-2 13-.6 19-1.2s6.5-.6 9 .2V32H4z" fill="#121824" />
    </>
  ),
  grove: (
    <>
      <rect x="4" y="4" width="28" height="28" fill="#dfe9d6" />
      <path d="M4 29c6-4 22-4 28 0v3H4z" fill="#7a5a3f" />
      <path d="M18 28V16" stroke="#6b4a32" strokeWidth="1.8" />
      <circle cx="18" cy="13" r="6.5" fill="#5f9a52" />
      <circle cx="14" cy="16" r="4" fill="#78b163" />
      <circle cx="22.5" cy="15.5" r="4" fill="#4a8443" />
      <circle cx="21" cy="11" r="1.3" fill="#f4b6c2" />
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
            <svg viewBox="4 4 28 28" aria-hidden="true">{GLYPHS[t.id]}</svg>
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
