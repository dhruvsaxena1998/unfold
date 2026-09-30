# Product

**Name:** Unfold (stretch & breathe). Renamed from Held on 2026-09-30; repo github.com/dhruvsaxena1998/unfold.

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite (user-specified). No backend, no persistence: a refresh clearing the session is acceptable.

## Users and job

One person doing rehab stretches for a slipped (herniated) disc. They start a hold, count it up, stop it, rest a few seconds, and start the next hold. They glance at the screen from a mat, sometimes lying down, on a phone on the floor or a laptop nearby.

## What it does

A count-up timer that inverts a stopwatch's priorities:
- **Hold** (the lap) is the primary figure: counts up from zero each time it starts.
- **Rest** (the gap between holds) is tracked automatically and shown secondary.
- **Session total** (all holds + rests) is shown as well.
- Optional **target hold**: pure count-up by default; when a target is set, a soft beep/vibration marks reaching it. The hold keeps counting past it.
- Sessions are one flat list of reps; no exercise names.

## Constraints

- Readable from 1–2 m away; operable with one imprecise tap or the spacebar.
- Nothing stored about the session; no accounts. Only the chosen theme and sound preferences are kept on the device (localStorage).
- Five visual themes (Tide default, Bloom, Vessel, Dawn, Grove) share one layout and behaviour; each has its own synthesised cues and an optional ambient bed (off by default).
- Calm: this is used while in pain; no gamification, streaks, or alarms.

## Routines and breathing (agreed 2026-09-30, built)

Grow from a stretch timer into a calm rehab + breathing app. Three modes share the five themes:

- **Stretch**: today's manual tap-to-hold / tap-to-rest timer, unchanged.
- **Routine**: named, saved sequences of exercises; each step has its own hold, rest and reps and runs automatically. Controls while running: pause/resume (tap), skip / back (rep or exercise), +10 s on the current hold, and an optional "wait for tap between exercises" per routine (else it continues after the rest). Ships 2–3 generic editable starters (e.g. "Hold 10 / rest 5 × 10", "Long holds 30 / 15 × 5"); no medical claims.
- **Breathing**: presets Box 4-4-4-4, 4-7-8, and slow even breathing 5.5 / 5.5, plus custom in / hold / out / hold and a session length. Gauges map to the breath (blob swells on inhale, bottle fills and empties, sun rises and sets).

Guidance: soft countdown ticks in the last 3 s before every phase change, on top of each theme's cues.

Storage (supersedes "nothing stored"): routines, breathing presets, theme and sound preferences, and a quiet history of past sessions on the device (date, mode or routine, reps, time held, duration). Facts only: no pain scores, notes, streaks or badges.

Haptics: use the `web-haptics` package (npm, v0.0.6, github.com/lochie/web-haptics) through its React hook for taps on controls, phase changes, the target, and the countdown. It is early (0.0.x), so wrap it in one small module. Before relying on it, check on an iPhone whether it can fire on automatic phase changes with no tap involved.

Every theme shows two scales at once: the current rep and the whole session's goal (session goal setting in free stretch; total planned hold time in a routine; the chosen length for breathing). Home shows today's held time against the stretch session goal.
