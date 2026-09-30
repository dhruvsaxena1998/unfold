---
name: Unfold
description: Unfold, a calm stretch and breathing timer. Its default theme, Tide, reads the hold as a harbour tide gauge; the hold floods up an enamel staff, rest is slack water.
colors:
  ink: "#10181c"
  ink-raised: "#172227"
  rule: "#2b3a40"
  enamel: "#e9ece6"
  enamel-shade: "#d3d8d1"
  red: "#c8322b"
  red-light: "#f06a5c"
  air: "#c3cdc9"
  water-deep: "#0c3337"
  sea: "#0f3b40"
  surface: "#1f6a6e"
  muted: "#9db2b0"
  slack: "#1c6668"
  slack-light: "#7fcfc6"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "min(44cqh, calc((100cqw - var(--e-w) - 2.8rem - 16px) / (var(--chars) * 0.5)))"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "2.8rem"
    fontWeight: 700
    lineHeight: 1
  figure-lead:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "4rem"
    fontWeight: 600
    lineHeight: 0.95
    fontFeature: "tnum"
  figure:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "2.2rem"
    fontWeight: 600
    lineHeight: 1.05
    fontFeature: "tnum"
  staff-mark:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "min(2.6rem, calc(var(--bh) * 0.9cqh))"
    fontWeight: 700
    lineHeight: 0.8
    fontFeature: "tnum"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1
  face-status:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.1rem, 4.2cqh, 2rem)"
    fontWeight: 600
    letterSpacing: "0.06em"
  table-figure:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    fontFeature: "tnum"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  none: "0"
  sm: "3px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "20px"
  lg: "28px"
components:
  button-primary:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "16px 18px 14px"
  button-primary-engaged:
    backgroundColor: "transparent"
    textColor: "{colors.enamel}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "16px 18px 14px"
  button-primary-disabled:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.muted}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.enamel}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "46px"
  button-secondary-armed:
    backgroundColor: "transparent"
    textColor: "{colors.red-light}"
  stepper-button:
    backgroundColor: "transparent"
    textColor: "{colors.enamel}"
    rounded: "{rounded.sm}"
    size: "46px"
  sheet-done:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "44px"
  target-flag:
    backgroundColor: "{colors.red}"
    textColor: "{colors.enamel}"
    rounded: "{rounded.none}"
    padding: "3px 8px 2px"
  tide-strip:
    backgroundColor: "{colors.enamel-shade}"
    rounded: "{rounded.none}"
    height: "10px"
---

# Design System: Unfold

Unfold ships five themes; this document leads with the default, **Tide**, and the Themes section covers the other four.

## Default theme: Tide

## Overview

**Creative North Star: "The Harbour Tide Board"**

Tide reads a stretch the way a harbour master reads the water. The hold is a flood tide rising up a painted enamel gauge staff; the rest is slack water, the level holding while the colour turns teal. The screen is two fixed regions that never move between states: a gauge field (pale air above, harbour water rising from below, the staff standing in it) and a dark ink board carrying labelled figures, the target control, and an almanac tide table. State changes by fill, level, and colour, never by rearranging.

The material is painted metal and printed almanac: flat enamel, black and red E-graduations, tabular condensed numerals, hairline rules between figures. It is built to be read from a mat one to two metres away, often in pain, so the numeral is enormous, every figure is labelled, and nothing flashes, celebrates, or alarms. The only movement is the water: a slow ease as the level settles and a gentle swell along its surface.

On phones (760px and below) the app is exactly one viewport with no page scroll: the gauge fills the screen, a figure strip sits beneath it, and everything else lives in a native bottom sheet.

**Key Characteristics:**
- A vertical enamel gauge staff with alternating ink and red E-marks is the signature object.
- The hold numeral is split by the waterline: ink above, enamel below.
- Rest is slack teal; red is a marking colour, not a state colour.
- Every figure wears an uppercase label; every changing number is tabular Barlow Condensed.
- Fixed regions; flat surfaces; 3px corners at most.

## Colors

A cold harbour palette: ink and deep sea water, enamel white, one marking red, and a slack-water teal for rest.

### Primary
- **Staff Enamel** (`{colors.enamel}`): the gauge staff face, primary text on ink, the primary action fill, the numeral where it is submerged. The brightest surface in the system.
- **Staff Shade Enamel** (`{colors.enamel-shade}`): tide-table hold strips that met target (or all strips when no target is set).

### Secondary
- **E-Mark Red** (`{colors.red}`): alternate E-graduation blocks on the staff, the target line, and the target flag behind its label. Also the text-selection fill.
- **Signal Red Light** (`{colors.red-light}`): the focus ring on every control and the armed state of the destructive Clear button. The only red on the dark board.

### Tertiary
- **Slack Teal** (`{colors.slack}`): the dry (above-water) numeral and status while resting.
- **Slack Teal Light** (`{colors.slack-light}`): the wet numeral, the board state line and square, and the live Rest figure while resting.

### Neutral
- **Harbour Ink** (`{colors.ink}`): app background, board, bottom sheet, the dry numeral while holding, and the ink E-marks.
- **Raised Ink** (`{colors.ink-raised}`): current tide-table row, disabled primary fill, engaged primary hover.
- **Board Rule** (`{colors.rule}`): 1px dividers between figures and table rows, secondary button borders, sheet top edge.
- **Sea Mist** (`{colors.muted}`): labels, the idle state square, rest columns, the resting Last Rest figure, secondary text.
- **Air** (`{colors.air}`): the field above the water line, behind the staff.
- **Surface Water** (`{colors.surface}`), **Harbour Sea** (`{colors.sea}`), **Deep Water** (`{colors.water-deep}`): the water gradient, top to bottom; surface also fills the swell.

### Named Rules
**The Marking Red Rule.** E-Mark Red paints the staff's alternate E-blocks, the target line, and its flag; Signal Red Light is limited to focus rings and the armed Clear confirmation. Red never marks a timer state.

**The Slack Water Rule.** Rest is shown in slack teal, with the swell paused and the water level held where the hold left it. Rest is never red and never ink-on-enamel.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif), self-hosted via Fontsource at 500, 600, 700
**Body Font:** Barlow (with system-ui, sans-serif), 500 and 600

**Character:** Barlow Condensed is signwriter's lettering for gauge boards and almanac figures: tall, narrow, legible at distance. Barlow carries the small print, labels and button text, in the same family voice.

### Hierarchy
- **Display** (600, fitted to the staff by container units, 0.9, -0.02em, tabular): the hold or rest numeral on the staff face. Tenths ride at 0.32em and 55% opacity.
- **Headline** (700, 2.8rem, 1): the board state line (Ready, Holding, Resting, Session done), preceded by a 0.42em state square.
- **Figure Lead** (600, 4rem, 0.95, tabular): the Rest/Last rest figure on the desktop board; unit in a 0.4em small.
- **Figure** (600, 2.2rem, 1.05, tabular): Session, Reps, Time held. Phone figure strip uses 2rem.
- **Staff Mark** (700, up to 2.6rem, 0.8, tabular): the metre numerals beside each E-block, coloured like their block.
- **Title** (700, 1.9rem, 1): the primary action label.
- **Face Status** (600, clamp 1.1–2rem, 0.06em, uppercase): the status and unit lines above and below the numeral; the unit line is smaller (clamp 0.95–1.4rem) at 70% opacity.
- **Table Figure** (600, 1.15rem, tabular): tide-table cells; the table heading uses the same size uppercase at 0.08em.
- **Body** (500, 0.95rem, 1.5): the empty-table sentence and rare prose.
- **Label** (600, 0.8rem, 0.08em, uppercase, Sea Mist): figure labels, the Target hold label, table headers (0.75rem). Phone figure labels drop to 0.7rem.

### Named Rules
**The Labelled Figure Rule.** Every figure wears a label: an uppercase Barlow label in Sea Mist above or beside a Barlow Condensed value. A bare number is not allowed on the board.

**The Tabular Numeral Rule.** Every number that changes while you watch sets in Barlow Condensed with tabular figures, so digits never shift width.

## Layout

Two fixed regions in a full-height grid (100svh): the gauge field takes the flexible column, the board a fixed `minmax(360px, 420px)` column on the right. The board stacks the state line, the figures grid (Last rest spanning three columns above Session / Reps / Time held), the primary action, then a scrolling extras column (target stepper, tide table, and the Finish/Clear pair pinned last). Board padding is fluid, `clamp(20px, 3vw, 36px)`, with a 28px section gap and 20px within extras.

The staff is centred in the field at `clamp(260px, 64%, 640px)` wide and full height; it is a size container, so its numerals scale with it. A dark instruction bar runs across the foot of the field ("Tap anywhere or press Space" plus the current action), respecting the bottom safe area. The whole field is one tap target.

At 760px and below, the app is exactly one viewport and never scrolls. The grid becomes one column: gauge on top (staff widens to `min(94%, 480px)`), then a compact board row with the figure strip (Last rest / Session / Reps at 1.3fr 1fr 0.7fr) and a "Log & target" button. The state line and Time held are hidden; the target stepper, tide table, and Finish/Clear move into a native `<dialog>` bottom sheet (max 560px wide, 86svh tall).

Spacing rhythm is 6 / 12 / 20 / 28px, with 4px for the tight gap inside stacked buttons and 14px on phone gaps.

### Named Rules
**The Fixed Regions Rule.** Regions never move or resize between idle, hold, rest, and ended. States change fill, level, and colour only.

**The One Viewport Rule.** On phones the timer is one screen with no page scroll; anything that does not fit goes into the bottom sheet, never below the fold.

## Elevation & Depth

The system is flat. Depth comes from the physical scene, not from UI chrome: water rising in front of the air, and the numeral duplicated and clipped so it reads ink above the waterline and enamel below it. The only shadow belongs to the staff, a real object standing in water. Overlays use a translucent scrim rather than a shadow.

### Shadow Vocabulary
- **Staff Stand** (`box-shadow: 0 0 0 1px rgb(16 24 28 / 0.12), 0 18px 40px -18px rgb(16 24 28 / 0.45)`): the enamel staff only.
- **Engaged Outline** (`box-shadow: inset 0 0 0 2px var(--enamel)`): the primary action while a hold is running; an inset stroke, not a lift.

### Named Rules
**The Painted Board Rule.** Board controls, figures, table, and sheet carry no drop shadows. The staff is the one object with depth.

## Shapes

Rectangles throughout. Controls have barely-softened 3px corners; the staff, E-blocks, target flag, tide strips, state square, and sheet are square-cornered. Dividers are 1px Board Rule hairlines; the target line is a 3px red rule and the waterline a 2px pale teal edge. The E-graduation is a spine plus three prongs per block, drawn with gradients rather than images. Icons are inline SVG strokes, 20px, 2.2 weight, square caps.

## Components

### Buttons
Painted, plain, and big enough to hit with an imprecise tap.
- **Shape:** gently squared corners (3px).
- **Primary:** Staff Enamel fill, Harbour Ink text, Title type, with a Barlow 0.85rem hint line beneath ("or tap the gauge · Space"). Hover brightens the fill; 0.2s ease-out.
- **Engaged (holding):** transparent with a 2px inset enamel stroke and enamel text; hover fills Raised Ink.
- **Disabled:** Raised Ink fill, Sea Mist text.
- **Secondary (Finish session, Clear):** transparent, 1px Board Rule border, Barlow 600 0.95rem, 46px minimum height, side by side at 12px gap. Hover lifts the border to Sea Mist. Clear arms on first tap: border and text turn Signal Red Light and the label reads "Tap again to clear" for three seconds.
- **Log & target (phone):** transparent, 1px Board Rule border, stacked 20px list icon over a 0.75rem label.
- **Done (sheet):** Staff Enamel fill, Harbour Ink text, 44px high.
- **Focus:** every control shows a 3px Signal Red Light outline at 3px offset; the gauge draws it inset (-6px).

### Target Stepper
- Two 46px square secondary buttons (minus and plus SVG strokes) around a tabular Barlow Condensed 1.6rem output reading "Off" or "20 s". Steps of 5s, 0 to 180s. Sits in a row with the Target hold label, on a Board Rule top hairline.

### Tide Table
- Almanac grid: Rep, Hold strip, hold time, Rest. Uppercase Label headers over a Board Rule hairline; each row divided by the same hairline, Table Figure type.
- Each hold is a 10px square-ended strip sized relative to the longest hold, in Staff Shade Enamel; holds short of target turn slate. Rest cells are Sea Mist. The current row fills Raised Ink. Newest first.

### Bottom Sheet (phone)
- Native `<dialog>` anchored to the bottom, Harbour Ink with a Board Rule top edge, a dark scrim behind. A header states reps and time held beside the Done button, then the target stepper, tide table, and Finish/Clear. Enters with a 0.32s rise-and-fade; tapping the scrim closes it.

### Gauge Staff (signature)
- Enamel board with alternating ink and red E-blocks (5s, 10s, or 30s per block depending on scale), each with its metre numeral. The water level follows the hold: towards the target line when one is set, otherwise one minute per staff, extending in 30s steps for long holds. Holding speeds the swell; resting pauses it and holds the level; idle and ended ebb to the foot.
- The target line crosses the staff with a red flag ("Target 20 sec"); on reaching it the line turns enamel and the flag reads "Target reached".
- The numeral face is rendered twice, clipped at the waterline: dry face in ink (slack teal at rest), wet face in enamel (slack teal light at rest).

## Do's and Don'ts

### Do:
- **Do** keep the gauge field and board in the same place in every state; change fill, water level, and colour only.
- **Do** label every figure with an uppercase Barlow label (0.8rem, 600, 0.08em) in Sea Mist.
- **Do** set every changing number in Barlow Condensed with tabular figures.
- **Do** show rest in slack teal (#1c6668 dry, #7fcfc6 wet and on the board) with the swell paused.
- **Do** keep E-Mark Red (#c8322b) to the staff's E-marks, the target line, and its flag, and Signal Red Light (#f06a5c) to focus rings and the armed Clear.
- **Do** keep phones at one viewport with no page scroll, and put secondary material in the native bottom sheet.
- **Do** ease the water level slowly (1.8s, cubic-bezier(0.16, 1, 0.3, 1)) and switch water and swell motion off under reduced motion.

### Don't:
- **Don't** use red for the hold, the rest, or any other timer state; the target flag is the only red on the staff that isn't an E-mark.
- **Don't** replace the staff with a ring, dial, or progress bar; the tide gauge is the timer.
- **Don't** add drop shadows to board controls, figures, table, or sheet; only the staff stands in depth.
- **Don't** round corners past 3px, or round the staff, strips, or flag at all.
- **Don't** add streaks, celebrations, badges, or alarm-style colour; the target cue is a soft chime and a short vibration.
- **Don't** push the tide table or controls below the fold on phones.

## Themes

Tide (above) is the default world. Four sibling worlds share its layout, the labelled-figure and tabular-numeral rules, and the board anatomy; each re-sets the board tokens (`--bg`, `--raised`, `--rule`, `--fg`, `--muted`, `--accent`, `--accent-hover`, `--on-accent`, `--rest`, `--focus`, `--select`, `--strip`, `--strip-short`, `--dim-fg`, `--dim-rule`, `--scrim`, `--display`, `--text`) on `:root[data-theme]` and replaces only the gauge field. Code: `src/themes.js`, `src/gauges/*.jsx`, `src/themes/*.css`.

**Two scales in every theme.** Each gauge draws the current rep *and* the whole session against its goal. The gauges take one model (`src/model.js`): `phase`, `level` (rep, 1 = its goal), `restMs`, `session` (live 0..1), `banked` (finished holds only), `sessionGoal`, `reps[]`, `marks[]`, `face`, `tap`.

| Theme | Rep | Session | Palette | Type | Corners |
|---|---|---|---|---|---|
| **Tide** | Enamel staff floods to the target line | The harbour behind the staff rises toward "High water", and more swell layers come in | ink #10181c, enamel #e9ece6, red #c8322b | Barlow Condensed / Barlow | 3px |
| **Bloom** | The blob swells toward its orbit, then exhales at rest | The blob's resting size grows through the session toward a faint full-bloom ring | cocoa ground #171213; three flat cut-paper layers, no gradients: hold persimmon #f2875a / clay #b84a33 / oxblood #6e2a24, rest celadon #a3c9b3 / #5f8a77 / #2f4a40 | Nunito 600–800 | pills |
| **Vessel** (light) | A small glass fills to its fill line; at rest it tips and pours into the bottle | The bottle fills to the session goal (quarter marks on its left) | fog #f4f7f9, navy #13233a, cerulean #1f5fa8 | Manrope 400–800 | 10px |
| **Dawn** | The sun's flat halo rings widen to a dashed ring, and fade at rest | The sun climbs from first light to "High morning"; the sky is printed in seven hard woodblock bands that warm from slate through rose-brown to apricot, and the far hills take the sky's blue | slate ink #121824, sun #ffe3ad, accent #f2b35e, rest blue hour #9cc3e6 (a colour-blend wash over the scene) | Bricolage Grotesque 500–700 | 6px |
| **Grove** | A sapling is planted for each rep and grows leaves, then a bud once it reaches its goal; planned reps show as empty plots | The tree grows a trunk and branches and leafs out, then blossoms at the goal | sage sky #eef3e4, forest board #15201a, leaf #5f9a52, blossom #f4b6c2 | Bitter 600–700 | 8px |

**Motion rule.** Anything driven by the clock is written every frame with no CSS transition while it moves; a transition that restarts every frame freezes the value. Transitions only carry discrete changes: the bottle rising when a glass is poured, leaves and buds popping in (0.7s overshoot), and levels easing back at idle. Reduced motion stops the wobble, waves, bubbles, sway and eases.

**Type tuning.** `--display-tune` scales board display sizes (state line, figures, primary action, list titles) per face so every theme reads equally roomy: Tide 1.06 (condensed), Bloom 0.94, Vessel 0.9, Dawn 0.92, Grove 0.92. Floors: uppercase labels ≥ 0.75rem, secondary text ≥ 0.9rem, gauge status lines ≥ 0.85rem.

**Theme & sound control.** Swatches are named miniatures in a five-column grid; the sound toggles are labelled buttons ("Cues", "Ambience") with an On/Off state line in the accent.

**Screens.** Home keeps the field | board layout: the field shows today's held time in the current theme; the board lists Free stretch, Routines (start and edit), Breathing (length, three presets, your own pattern), recent history and Theme & sound. Sessions use the timer layout; the board header has Home. The editor and history are single centred columns (max 640px). On phones Home scrolls; timer screens stay at one viewport.

**Auto-run controls.** Routines: tap anywhere or Space to pause and resume, Continue at a wait-for-tap between exercises, and Back, +10 s and Skip (on phones a full-width row under the figures). Soft ticks play in the last three seconds of every timed step.

**Sound and touch.** All Web Audio. Theme cues on start, stop, target and finish; breathing turns use the same voices at half volume; the countdown tick is shared by every theme. Ambience is off by default. Each bed is a different kind of sound, not one noise through different filters: Tide surf (separate waves that rise, break bright and wash out), Bloom a two-chord pad, Vessel a babbling brook of bubbles (busier while filling), Dawn birdsong (three calls, panned) over a breeze, Grove rain pattering on leaves. Levels were balanced by measurement to within about 6 dB. Haptics go through `web-haptics` (`src/haptics.js`): selection on taps, nudge on hold start, soft on rest, success on the target and at the end, light on ticks. iOS only allows haptics inside a tap, so automatic changes rely on sound there.

## Brand

**Mark: Space.** Three rounded vertebral blocks; the top one, in vermilion, lifts and tilts open: room being made between them. It is drawn from the idea of unfolding, not from any theme. Palette: ink #1f1b18, paper #f2ece2, vermilion #e04a2a (the only part that moves). The app icon is the ink colourway; paper is the alternate. The favicon crops tight to the blocks and rounds the ground so it holds at 16 px.

**Wordmark:** "unfold", lowercase, Manrope 800, tracking -0.035em, in every theme (it does not follow the theme's face). In the Home header the mark is inline SVG: the two lower blocks take the theme's text colour (`currentColor`), the top block stays vermilion.

Files: `designs/unfold/` (concept sheet, `unfold-space-ink.svg`/`-paper.svg`, 1024 PNGs, `unfold-mark.svg`, `unfold-favicon.svg`; the other four concepts are kept for reference). Shipped: `public/icon.svg`, `favicon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`. The Held seed mark in `designs/logo/` is retired.
