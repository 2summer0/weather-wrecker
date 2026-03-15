# Weather Wrecker — Specification

---

## 1. Project Overview

Title: Weather Wrecker

Concept:
여행을 갔을 때 비가 온 날을 기록하는 photo-centered archive website.

Languages:
- English
- Korean

Navigation:
HOME → MAIN (single transition only)

---

## 2. HOME Page

- black background
- centered title text
- click anywhere → navigate to MAIN

State:
HOME_IDLE

---

## 3. MAIN Page (Fixed Canvas)

MAIN은 scroll 없는 fixed canvas 구조.

Layers:

1. BackgroundFXLayer
   - rain particle
   - lightning flash
   - background only

2. CanvasLayer
   - images placed randomly

3. SidePanelLayer (Right Side Panel / Drawer)
   - white background
   - not affected by FX

---

## 4. Assets Structure

Rule:
eventId = cover image filename (without extension)

Example:
tekapo.jpg → eventId = tekapo

Structure:

/assets
  tekapo.jpg
  /tekapo
    meta.json
    gallery_01.jpg
    gallery_02.jpg
    video.mp4 (optional)
    video.gif (fallback)

---

## 5. Event Data (meta.json)

Required fields:

- id
- date
- location { en, ko }
- weather { en, ko }
- diary { en, ko }

Optional:
- gallery[]
- video { mp4, gif }

---

## 6. Random Layout Rules

On MAIN load:

- place 13 images randomly
- keep original aspect ratio
- overlap allowed
- assign random z-index
- clamp position inside viewport
- images must remain visible

z-index behavior:
- clicking image → set to max z-index

---

## 7. Side Panel (Right Drawer)

Open:
- image click

Close:
- click empty canvas
- X button
- ESC (desktop only)

Behavior:
- panel scroll enabled
- MAIN canvas never scrolls

Fields:
- date
- location
- weather
- diary text
- gallery images
- video (mp4 → gif fallback)

---

## 8. Interaction Rules

### Desktop

Hover:
- rotate image ±15deg (random direction)

Click vs Drag rule:
- press + move → DRAGGING
- press + release → CLICK (open panel)

Drag:
- reposition image
- clamp inside viewport

---

### Mobile

- no hover
- no drag

Tap behavior:
1st tap → TAP_PREVIEW (subtle tilt/scale)
2nd tap → open Side Panel

Only Side Panel scrolls.

---

## 9. Background Effects

Rain:
- fast particle animation

Lightning:
- flash interval random (5–20s)
- background only
- must NOT affect Side Panel

---

## 10. Weather Wrecker

Top directional Weather Wrecker

Text:
Wherever the Weather Wrecker goes, rain follows.
So don’t blame the forecast.
You just chose to travel with me.
Thanks for getting soaked with me,
and let’s travel again soon.

---

## 11. State Model

Pages:
- HOME
- MAIN

Main States:
- MAIN_IDLE
- DRAGGING (desktop)
- TAP_PREVIEW (mobile)
- PANEL_OPEN

---

## 12. Constraints

- mobile required
- fixed canvas layout
- background FX isolated from Side Panel