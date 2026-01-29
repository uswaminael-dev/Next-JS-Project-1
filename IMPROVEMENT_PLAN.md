# VibeVault · Improvement Plan

A roadmap to make the mood board **more realistic**, **aesthetic**, and **delightful**. Use this as a guide—tackle items in any order.

---

## 1. More Realistic Polaroids

**Goal:** Cards should feel like real Polaroids on a board.

| Idea | What to do |
|------|------------|
| **Thick bottom “frame”** | Give the caption area a noticeably thicker bottom border (classic Polaroid: more white below the image than on sides). Use padding so it looks like the iconic frame. |
| **Paper texture** | Add a very subtle noise/grain overlay on the white card (CSS `filter` or a tiny repeating SVG/PNG) so it doesn’t look flat. |
| **Authentic proportions** | Use a Polaroid-like aspect for the image (e.g. 1 : 1.2 or 4 : 5) and keep the caption strip proportional. |
| **Soft shadow & edge** | Slightly softer, more diffused shadow; optional very light inner shadow or border so the card has a physical “edge.” |
| **Optional “tape” or “pin”** | A few cards could have a small CSS/SVG strip (washi tape) or pin in a corner to sell the “pinned to a board” look. |

---

## 2. Layout & Background

**Goal:** Less rigid grid, more organic “mood board” feel.

| Idea | What to do |
|------|------------|
| **Masonry grid** | Switch from a fixed column grid to a masonry layout (e.g. CSS columns or a lib like `react-masonry-css`) so cards stack by height and feel less uniform. |
| **Scattered / pinned** | Optional “scattered” mode: cards have random position (or drag-to-place) and rotation, like photos on a corkboard. |
| **Corkboard background** | Add an option (or alternate theme): cork/brown texture as background instead of only gradient. |
| **Paper / bulletin** | Alternative: lined or graph paper, or a soft bulletin-board texture. |
| **Stronger rotation** | Slightly wider rotation range (e.g. -12° to +12°) so the “messy” look is more obvious. |

---

## 3. Interactions & Polish

**Goal:** Small details that make the app feel alive and reliable.

| Idea | What to do |
|------|------------|
| **Click to enlarge** | Clicking a card opens a lightbox/full-screen view (image + caption). Close with overlay click or Escape. |
| **Edit caption** | Let users edit the caption after adding (e.g. small “edit” icon or click-on-caption to toggle edit mode). |
| **Delete confirmation** | Optional: “Remove this memory?” confirm dialog or undo toast so accidental deletes are recoverable. |
| **Success feedback** | Brief toast or animation when a memory is added (“Pinned!”) so the action feels acknowledged. |
| **Image loading** | Show a placeholder (blur or skeleton) while the image loads; handle errors (broken URL) with a fallback icon/message. |
| **Keyboard** | Escape to close lightbox; optional shortcut to focus the URL input. |

---

## 4. Extra Features (Optional)

**Goal:** Deeper personalization without cluttering the core.

| Idea | What to do |
|------|------------|
| **Date on card** | Optional “date added” (e.g. “Jan 29”) in small type on the card. |
| **Drag to reorder** | In grid mode, drag cards to reorder; persist order in localStorage. |
| **Export board** | “Export as image”: render the board (or a selection) to a PNG so users can save or share. |
| **Themes** | Toggle between “warm” (current amber), “cool” (soft blue/gray), “cork”, etc. |
| **Tags or colors** | Optional tag or color dot per card for filtering (e.g. “travel”, “food”) or just visual grouping. |

---

## 5. Visual & Typography Tweaks

**Goal:** Cohesive, “premium” look that still feels playful.

| Idea | What to do |
|------|------------|
| **Caption font** | You already use Caveat; consider slightly larger caption size or a second handwritten font for variety. |
| **Header** | Optional: light texture or a small illustration in the header area to reinforce the “board” metaphor. |
| **Consistent radius** | Align border-radius on cards, form, and buttons (e.g. all “rounded-2xl” or all “rounded-[1.25rem]”) for a calmer look. |
| **Color accents** | Keep amber as primary; add one secondary (e.g. soft green or blue) for tags, toasts, or highlights. |

---

## Suggested Order to Implement

1. **Quick wins:** Thick Polaroid frame, image loading/error state, delete confirmation or undo toast.  
2. **Big visual impact:** Masonry layout, paper texture on cards, click-to-enlarge.  
3. **Nice-to-have:** Edit caption, optional date on card, export, themes.

---

## Tech Notes

- **Masonry:** `react-masonry-css` or CSS `columns` + `break-inside: avoid`.  
- **Lightbox:** Modal with `next/image` or a simple full-screen div; trap focus and handle Escape.  
- **Texture:** Small PNG/SVG grain or `background-image: url(...)` with low opacity.  
- **Drag:** Consider `@dnd-kit` or Framer Motion `drag` for reorder; persist order in the same `memories` array.

You can copy sections of this into your `spec.md` or use it as a checklist and tick items off as you go.
