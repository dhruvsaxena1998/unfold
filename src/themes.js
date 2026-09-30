import Bloom from './gauges/Bloom.jsx'
import Dawn from './gauges/Dawn.jsx'
import Grove from './gauges/Grove.jsx'
import Tide from './gauges/Tide.jsx'
import Vessel from './gauges/Vessel.jsx'

// `color` feeds the browser's theme-color; `log` titles the rep table.
export const THEMES = [
  { id: 'tide', name: 'Tide', gauge: Tide, log: 'Tide table', color: '#10181c' },
  { id: 'bloom', name: 'Bloom', gauge: Bloom, log: 'Breath log', color: '#1c1424' },
  { id: 'vessel', name: 'Vessel', gauge: Vessel, log: 'Pours', color: '#f4f7f9' },
  { id: 'dawn', name: 'Dawn', gauge: Dawn, log: 'Daybook', color: '#1a1630' },
  { id: 'grove', name: 'Grove', gauge: Grove, log: 'Planting', color: '#15201a' },
]

export const themeById = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0]
