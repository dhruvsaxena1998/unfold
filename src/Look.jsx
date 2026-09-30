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
      <rect x="4" y="4" width="28" height="28" fill="#1c1424" />
      <path d="M18 8c6 0 10 3.5 9.6 9.4-.4 6-4.6 10.2-10.2 9.8C11.5 26.8 8 22.6 8.6 17 9.2 11.4 12.6 8 18 8z" fill="#f59a86" />
      <path d="M15 11.5c2 -1 4.6-.8 6 .6" stroke="#ffd8bf" strokeWidth="1.6" fill="none" strokeLinecap="round" />
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
      <rect x="4" y="4" width="28" height="28" fill="#3a4a8c" />
      <rect x="4" y="16" width="28" height="16" fill="#e0806e" />
      <circle cx="18" cy="21" r="6" fill="#ffd9a0" />
      <path d="M4 24c6-3 12-1 18-2s8-1 10 0v10H4z" fill="#15122a" />
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
