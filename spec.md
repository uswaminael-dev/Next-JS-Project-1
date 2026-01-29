# Project: VibeVault 

## Goal
A personal "Mood Board" application where I can save visual memories as digital Polaroids. The design should feel organic, messy, and playful.

## Visual Style (The "Vibe")
- **Background:** A soft textured pattern (like corkboard or graph paper) or a soft pastel gradient.
- **Font:** Use a Google Font that looks handwritten (like 'Caveat' or 'Permanent Marker') for captions.
- **Layout:** Masonry grid or scattered layout. The cards should not be perfectly straight—some should tilt left, some right.

## Features
1.  **The Polaroid Card:**
    - A white card with a thick bottom border (classic Polaroid style).
    - The image goes at the top.
    - A handwritten caption goes at the bottom.
    - **Interaction:** When I hover over a card, it should straighten up and get slightly bigger (scale up).

2.  **The "Add Memory" Bar:**
    - A simple input field to paste an Image URL.
    - A short input for the "Caption".
    - A button says "Snap 📸".

3.  **Data Persistence:**
    - Save the polaroids to the browser's LocalStorage so they don't disappear when I refresh the page.

## Tech Stack
- Next.js & Tailwind CSS.
- Framer Motion (Crucial for the "floating" and "hover" effects).
- Lucide React (for icons).