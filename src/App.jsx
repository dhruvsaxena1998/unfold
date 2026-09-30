import { useEffect, useLayoutEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { ambience, cue, unlockAudio } from './sound.js'
import { buzz } from './haptics.js'
import { reducedMotion } from './progress.js'
import { themeById } from './themes.js'
import { BREATH_PATTERNS, STARTER_ROUTINES, uid, usePref } from './store.js'
import { Look } from './Look.jsx'
import Home from './Home.jsx'
import StretchRun from './StretchRun.jsx'
import AutoRun from './AutoRun.jsx'
import Editor from './Editor.jsx'
import HistoryView from './HistoryView.jsx'

export default function App() {
  const [view, setView] = useState({ name: 'home' })
  const [themeId, setThemeId] = usePref('theme', 'tide')
  const [sound, setSound] = usePref('sound', { cues: true, ambience: false })
  const [routines, setRoutines] = usePref('routines', STARTER_ROUTINES)
  const [breath, setBreath] = usePref('breath', { minutes: 5, custom: { in: 4, holdIn: 0, out: 6, holdOut: 0 } })
  const [history, setHistory] = usePref('history', [])
  const [goal] = usePref('goal', 180)
  const theme = themeById(themeId)
  const [phase, setPhase] = useState('idle')

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme.id
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.color)
  }, [theme])

  // Screens are history entries, so the phone's back gesture returns home.
  const go = (next) => {
    window.history.pushState({ view: next }, '')
    setView(next)
    window.scrollTo(0, 0)
  }
  const home = () => (view.name === 'home' ? null : window.history.back())
  useEffect(() => {
    const onPop = (e) => setView(e.state?.view ?? { name: 'home' })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => ambience(theme.id, sound.ambience, phase), [theme.id, sound.ambience, phase])

  // Sound and touch for every moment that matters.
  const feedback = (kind, opts = {}) => {
    unlockAudio()
    buzz(kind === 'tick' && opts.final ? 'medium' : kind)
    if (kind === 'start') setPhase('hold')
    if (kind === 'stop') setPhase('rest')
    if (kind === 'finish') setPhase('ended')
    if (sound.cues && kind !== 'tap') cue(theme.id, kind, opts)
  }

  const onSave = (entry) => setHistory((h) => [{ id: uid(), at: Date.now(), ...entry }, ...h].slice(0, 500))

  const pickTheme = (id) => {
    buzz('tap')
    const apply = () => flushSync(() => setThemeId(id))
    if (document.startViewTransition && !reducedMotion()) document.startViewTransition(apply)
    else apply()
  }
  const pickSound = (next) => {
    unlockAudio()
    buzz('tap')
    setSound(next)
  }
  const look = <Look theme={theme.id} onTheme={pickTheme} sound={sound} onSound={pickSound} />
  const shared = { theme, look, feedback, onSave, onHome: home }

  useEffect(() => {
    if (view.name === 'home') setPhase('idle')
  }, [view.name])

  switch (view.name) {
    case 'stretch':
      return <StretchRun key="stretch" {...shared} />
    case 'routine': {
      const routine = routines.find((r) => r.id === view.id)
      return routine ? <AutoRun key={routine.id} kind="routine" routine={routine} {...shared} /> : null
    }
    case 'breath': {
      const pattern = view.id === 'custom' ? { ...breath.custom, id: 'custom', name: 'Your pattern' } : BREATH_PATTERNS.find((p) => p.id === view.id)
      return <AutoRun key={pattern.id} kind="breath" pattern={pattern} minutes={breath.minutes} {...shared} />
    }
    case 'edit':
      return (
        <Editor
          routine={routines.find((r) => r.id === view.id)}
          onHome={home}
          onSave={(r) => {
            setRoutines((all) => (all.some((x) => x.id === r.id) ? all.map((x) => (x.id === r.id ? r : x)) : [...all, r]))
            home()
          }}
          onDelete={(id) => {
            setRoutines((all) => all.filter((x) => x.id !== id))
            home()
          }}
        />
      )
    case 'history':
      return <HistoryView history={history} onClear={() => setHistory([])} onHome={home} />
    default:
      return <Home theme={theme} look={look} routines={routines} breath={breath} setBreath={setBreath} history={history} goal={goal} go={go} />
  }
}
