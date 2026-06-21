# Catalyst Landing: Design, Styling & Content Strategy

The single-scroll waitlist landing for **Catalyst**, an autonomous-but-approved X (Twitter) growth assistant. This document is the source of truth for what the page says, where every piece of text sits, the fonts and sizes it uses, the color system, and the motion. It mirrors the code in `apps/example`; when copy or styling changes, update this file in the same commit.

- Live: https://catalyst-waitlist.aayushgiri1234.workers.dev
- Entry point: `app/page.tsx` renders `components/CatalystLanding.tsx`
- Design name in code comments: "Iridescent Spec Room"

---

## 1. Positioning & content strategy

**Product in one line:** Catalyst reads Reddit, Hacker News, and Google News in your niche, drafts posts in your voice from what's actually happening, and queues them. You spend about ten minutes a day approving the good ones. Every post waits for your approval.

**Audience:** Solo founders, DevRel engineers, and technical creators in crypto, AI, and devtools. People for whom X is pipeline, hiring, and reputation, not a hobby.

**Voice:** Plain, confident, restrained. Monochrome visual language to match. The page reads like a filed engineering artifact (spec sheet "markings" on every section).

### Strategy principles

1. **Benefit-led, concrete copy.** Headlines name the payoff or the control, not abstract cleverness. Specifics over adjectives ("ten minutes a day," "about ten minutes").
2. **Positive framing of control.** The differentiator (you stay the author) is phrased as empowerment: "You approve every post," "Every post waits for your call." We avoid leading with "Nothing posts..." because a sentence that opens on "Nothing" reads negative.
3. **Control is the differentiator.** Competitors lean on monetization and automation. Catalyst leans on restraint: human-approved, single platform, no virality theater. Keep that spine; do not bolt on revenue/payout claims.
4. **Co-writer, not ghostwriter.** "It amplifies you, never replaces you." The draft is a starting point; the human decision is always real.
5. **Low friction.** "No card. No spam. Just early access." Email is the only required field.
6. **Desire first, control as the closer.** Lead with the dream (it reads your world and writes in your exact voice), then use the control story as the trust builder near the decision, not the opener. The hero and how-it-works create wanting; Control and FAQ close it.
7. **Show momentum before signup.** A live signup counter and the referral mechanic ("+5 spots per friend") appear before signup, not only in the post-signup card. When the real count is small the counter shows a qualitative line instead of a weak number; it never fabricates.

### Banned words and punctuation (house style)

- **No em dashes** anywhere (prose, labels, comments). Use commas, colons, semicolons, or the middle dot `·` for decorative separators.
- Banned words: "genuinely," "straightforward," "crucially," "moreover," "furthermore," "delve," "unlock," "ecosystem" (as buzzword), "seamlessly," "holistic," "transformative."
- Plain statement headings. No emoji unless requested.

---

## 2. Design tokens

All tokens live in `lib/theme.ts` (exported as `THEME`, aliased `PAPER_THEME`). Direction: minimal monochrome. Near-black canvas, white type, gray support, white primary action. The only color on the page is the green status dot.

### Color

| Token | Value | Use |
|---|---|---|
| `bg` | `#0a0a0a` | Page canvas |
| `bgAlt` | `#161616` | Footer background |
| `fg` | `#f4f4f5` | Primary text |
| `muted` | `rgba(244,244,245,0.52)` | Body / secondary text |
| `faint` | `rgba(244,244,245,0.34)` | Labels, captions, mono markings |
| `border` | `rgba(255,255,255,0.10)` | Hairlines, input borders |
| `borderStrong` | `rgba(255,255,255,0.20)` | Emphasis dividers |
| `accent` / `accentMint` | `#ffffff` | Brightest emphasis (reads as white) |
| `accentCyan` | `#9a9aa0` | Tonal gray for gradients/dots |
| `accentPeach` | `#6e6e74` | Darker tonal gray |
| `live` / `success` | `#34d399` | The single permitted color: live/beta status dot |
| `inputBg` / `codeBg` | `#141414` | Input fields |
| `btnBg` / `btnBorder` | `#ffffff` | Primary button background |
| `btnFg` | `#0a0a0a` | Primary button text |
| `danger` | `#ff6b6b` | Form errors |
| `warning` | `#e0b341` | Reserved |
| `overlay` | `rgba(0,0,0,0.72)` | Modal scrim |

> Note: the `accent*` names are kept for structural compatibility but are now grayscale. `accentMint` is pure white, used for the brightest emphasis (the Approve step, signature dots).

`radius`: 8px (inputs/buttons). `modalRadius`: 12px.

### Type families

Loaded via `next/font/google` in `app/layout.tsx`:

- **Inter** (weights 400, 500, 600, 700, 800, 900), CSS var `--font-inter`
- **IBM Plex Mono** (weights 400, 500), CSS var `--font-ibm-plex-mono`

Theme aliases:

| Token | Family | Notes |
|---|---|---|
| `displayFont` | Inter | Headlines |
| `uiFont` | Inter | Body, buttons, inputs |
| `serifFont` | Inter | **Currently aliased to Inter.** Components that use `serifFont` for italic emphasis render Inter italic, not a true serif. |
| `monoFont` | IBM Plex Mono | All labels, markings, captions, file tags |

`ctaLabel`: "Join the waitlist" (the primary button text).

### Type scale (actual clamps in code)

| Element | Size | Weight | Line | Tracking |
|---|---|---|---|---|
| Hero H1 | `clamp(48px, 11vw, 132px)` | 800 | 0.94 | -0.045em |
| Hero subhead | `clamp(16px, 1.7vw, 20px)` | 400 | 1.6 | normal |
| Section H2 (How / Control) | `clamp(28px, 5vw, 52px)` | 700 | 1.04 | -0.025em |
| CTA H2 | `clamp(34px, 6vw, 72px)` | 800 | 0.98 | -0.04em |
| Stage title (How) | `clamp(20px, 2.6vw, 27px)` | 600 | 1.12 | -0.015em |
| Clause statement (Control) | `clamp(23px, 3.4vw, 38px)` | 600 | 1.12 | -0.02em |
| Body copy | 14px | 400 | 1.6 | normal |
| Mono labels | 10-11.5px | 400/500 | n/a | 0.06-0.2em, uppercase |
| Footer watermark | 24vw | 800 | 1 | -0.04em |

### Layout rhythm

- Standard section: `max-width: 1180px`, padding `clamp(72px,10vw,128px) clamp(20px,5vw,72px)`, centered.
- Hero: `min-height: 100svh`, `max-width: 1180px`, padding `96px clamp(20px,5vw,48px) 72px`.
- CTA: `max-width: 720px`, padding `clamp(72px,11vw,150px) clamp(20px,5vw,48px)`.
- Signup form column: `max-width: 560px`.

---

## 3. Global styling (`app/globals.css`)

- **Canvas:** `html, body` set to `#0a0a0a` / `#f4f4f5`, Inter, antialiased, `overflow-x: hidden`, `scroll-behavior: smooth`.
- **Selection:** `::selection` is white-on-translucent-white.
- **Film grain** (`.grain`): fixed full-screen SVG fractal-noise overlay, `mix-blend-mode: overlay`, opacity 0.04, z-index 9999, non-interactive. One shared instance rendered in `CatalystLanding`.
- **Blueprint grid** (`.hero-grid`): 56x56px faint white grid behind the hero, radially masked so it fades at the edges.
- **Emphasis word** (`.iris-text`): recedes to gray `rgba(244,244,245,0.42)` instead of popping. Used on the de-emphasized word inside hero/CTA headlines.
- **Stroke numerals** (`.stroke-num`): outlined (1px text-stroke), transparent fill. The big step numbers.
- **Glass panel** (`.glass`): translucent white + blur. Available utility.

### Layout helper classes

- `.audit-row` (How it works): CSS grid `clamp(72px,9vw,116px) 28px 1fr` (gutter numeral / spine / content). Collapses to `22px 1fr` under 760px and hides `.rail-gutter`.
- `.clause` (Control): CSS grid `minmax(140px,220px) 1fr` (marker / statement+sub). Collapses to one column under 720px.
- `.hide-sm`: hidden under 760px.
- `.wl-input:focus, .wl-input:focus-within`: border brightens to `rgba(255,255,255,0.55)` with a 3px translucent ring. Applied to inputs and the handle wrapper.

### Keyframes

| Name | Effect | Used by |
|---|---|---|
| `wlRise` | opacity 0 + translateY(28px) -> settle | `.reveal` entrance (load-time) |
| `wlPop` | scale 0.96 + translateY(8px) -> settle | Referral success card |
| `wlFadeIn` | opacity 0 -> 1 | Utility |
| `floatBob` | translateY 0 -> -10px loop (7s) | Signup glass box hover loop |
| `dotPulse` | opacity 1 -> 0.4 loop (2.4s) | Live/beta status dots, bright node |
| `spineFlow` | light streak travels down (5s) | How-it-works timeline spine |
| `tickerScroll` | translateX 0 -> -50% (36s) | Marquee |
| `scrollBob` | small vertical bob | Reserved scroll hint |
| `mdEnter` | opacity + translateY(8px) (0.4s) | Draft card content swap |
| `mdFlash` | scale-in then fade (0.82s) | Draft card approve/skip overlay |

All motion is disabled under `prefers-reduced-motion: reduce` (global override killing animation, transition, smooth scroll).

---

## 4. Page structure & order

`CatalystLanding` (a client component) holds one shared `signup` state. Submitting the form in either the hero or the CTA flips both to the referral success card, and `useReferralPosition` keeps the live queue position updated.

Render order, top to bottom:

1. `.grain` overlay (fixed, full-page)
2. **Header** (sticky)
3. **Hero** (`#top`), with the live `LiveCount`
4. **HowItWorks** (`#how`)
5. **TrustStrip / Control** (`#control`)
6. **Marquee** (scrolling ticker)
7. **Faq** (`#faq`)
8. **Cta** (`#join`), with the live `LiveCount`
9. **Footer**

The new live counter is served by `GET /api/waitlist/count` (`{ count }`, 10s edge cache, reuses `WaitlistDb.totalSignups()`).

---

## 5. Section-by-section: text, position, fonts

Positions below are relative to the section. "Mono" = IBM Plex Mono uppercase label. "Display" = Inter heavy.

### 5.1 Header (`components/sections/Header.tsx`)

Sticky, `top: 0`, z-index 100, translucent `rgba(10,10,10,0.6)` + 10px backdrop blur. Inner bar `max-width: 1200px`, height 68px, content space-between. Floats in on load via `.reveal`.

- **Left (logo):** a 28px white rounded square with lowercase **"c"** (Inter 800, black on white), then wordmark **"Catalyst"** (Inter 600, 18px). Links to `#top`.
- **Right:** **"Private beta"** (mono, 11px, 0.2em tracking, `faint`).

### 5.2 Hero (`components/sections/Hero.tsx`)

Full-viewport, centered column, text-centered. Blueprint grid behind. Content `max-width: 1180px`. Elements stagger in from the bottom on load (delays in parentheses).

1. **Status badge** (60ms): pill, `border` outline, mono 11.5px, `muted`. Green pulsing dot + text **"Now in private beta · v0.4"**. Margin-bottom 12px (tightened so the counter groups under it).
2. **Live counter** (110ms): `LiveCount` (see 5.14), green pulsing dot + count or qualitative line. Margin-bottom `clamp(28px,4vw,44px)`.
3. **H1** (160ms): Inter 800, `clamp(48px,11vw,132px)`, line 0.94, tracking -0.045em, `max-width: 1000px`, balanced wrap. Two A/B copies (switched by `?hero=`, default qualified):
   - Qualified: **"Post `daily` on X, in a voice that's unmistakably yours."** (`.iris-text` on **daily**)
   - Volume: **"Never `run out` of things to post on X."** (`.iris-text` on **run out**)
4. **Subhead** (280ms): Inter, `clamp(16px,1.7vw,20px)`, line 1.6, `muted`, `max-width: 660px`. "in your voice" is italic, `fg`.
   - Qualified: "Catalyst reads Reddit, Hacker News, and Google News in your niche, drafts posts `in your voice` from what's actually happening, and queues them up. You spend about ten minutes a day approving the good ones. Every post still waits for your call."
   - Volume: "Catalyst turns what's happening in your niche into posts `in your voice`, ready to ship. You just pick the good ones."
5. **Signup box** (400ms): `FloatingSignup`, `max-width: 560px`, margin-top `clamp(32px,4vw,52px)`. See 5.9.

The A/B variant is read client-side from `?hero=volume` / `?hero=qualified` after mount (default qualified, so SSR and first paint match). It is a clearly commented block in `Hero.tsx`; delete it and keep one headline/subhead to retire the test.

### 5.3 How it works (`components/sections/HowItWorks.tsx`, `#how`)

Standard section. Client component (for the interactive card).

- **SectionMark:** `[ 01 ]` / "How it works" / "Loop" over a masked hairline carrying the centered file tag **"· catalyst.loop ·"** (mono, `faint`). See 5.10.
- **H2:** **"A loop you can audit, end to end."** Display 700, `clamp(28px,5vw,52px)`, `max-width: 760px`.
- **Audit rail:** four rows on a 3-column grid (big numeral / glowing spine with traveling light / content). Each row reveals on load with a 70ms stagger.

The four stages (mono eyebrow `NN / Tag · annotation`, then display title, then 14px `muted` body):

| # | Eyebrow | Title | Body |
|---|---|---|---|
| 01 | `01 / Harvest · scans your niche` | "It reads what you'd read" | "Catalyst tracks the releases, threads, and arguments in your corner of crypto, AI, and devtools across Reddit, Hacker News, Google News, and X, the same sources you'd open if you had the time. Every draft starts from something real and current." |
| 02 | `02 / Draft · from your past posts` | "It writes `in your voice`" | "Catalyst drafts from how you actually write: your phrasing, your takes, your restraint. It amplifies your voice. It does not swap it for a generic high-engagement one. This is not an AI tweet generator." |
| 03 (bright) | `03 / Approve` | "You approve, or you don't" | "Open the dashboard, read the queue, ship what's good, kill what isn't. The decision is always a human one." |
| 04 | `04 / Learn · ships on schedule` | "It posts on your call, then sharpens" | "Approved drafts post on schedule. Your edits are the training: what you approve, change, and reject tightens your voice, so the queue needs less from you each week, not more." |

**Step 03 is the emphasis step** ("bright"): white outlined numeral, larger pulsing white node, title with a left white border. Below it, a `max-width: 340px` column:
- Mono line (white/`accentMint`, 10.5px): **"You approve every post · ~10 min/day"**
- A **static example draft** (`StaticDraft`, defined in `HowItWorks.tsx`) with a faint mono caption **"A real draft Catalyst wrote for a devtools founder this week"**, so visitors who never click still see a draft. Same card chrome as the interactive one, no buttons.
- The **interactive draft card** (see 5.11), the "try it yourself" follow-on.

> The boxy radial-gradient halo that used to sit behind step 03 has been removed; emphasis now comes from the node, numeral, and border only.

- **Closing line** (centered, mono, `faint`): **"↺ The loop only moves when you say go"**.

### 5.4 Control / "You are in control" (`components/sections/TrustStrip.tsx`, `#control`)

Standard section.

- **SectionMark:** `[ 02 ]` / "You are in control" / "Control" / file tag **"· catalyst.control ·"**.
- **H2:** **"Built for people who guard their account."** Display 700, `clamp(28px,5vw,52px)`, `max-width: 760px`.
- **Three clauses** on the `.clause` grid (marker column / statement+sub). Each has a hairline above, a colored dot + `NN · Marker` mono label, a display statement (with italic emphasis), and a 14px `muted` sub. Clause 01 is "bright" (extra glow + brighter hairline).

| Marker | Statement | Sub |
|---|---|---|
| `01 · In control` | "You approve `every post`" | "No auto-post mode, no silent timer. Drafts wait in your queue until you say go. Approve what's good, skip the rest, on your schedule." |
| `02 · In your voice` | "It amplifies you, `never replaces you`" | "The point is to sound like you on a day you can't write, not like an AI tweet generator chasing numbers. If a draft doesn't sound like you, reject it, and it learns." |
| `03 · Scoped on purpose` | "`One platform`, done right" | "One platform, done seriously. No LinkedIn cross-posting, no follower promises, no virality theater. Just consistent posts you'd put your name on." |

- **Signature line** (centered, mono, dot-prefixed, separated, like an invoice total): `◆ Spec` rendered as a round `faint` dot + "Spec", then four tokens each with a colored dot:
  **No auto-posting · No follower guarantees · Built for X · Human-approved**
- **Audience line** (centered, Inter, `muted`, `max-width: 680px`):
  > "Built for solo founders, DevRel engineers, and technical creators in crypto, AI, and devtools. For people whose X account is pipeline, hiring, and reputation, not a hobby."
- **Disclaimer** (centered, mono, `faint`, 10.5px): **"We never post without an explicit approval click · Not affiliated with X"**.

### 5.5 Marquee (`Marquee` in `CatalystLanding.tsx`)

Full-width ticker between Control and CTA. Top+bottom hairline borders, faint background, edge-masked, 36s infinite scroll (pauses on hover). Items are mono 12px, 0.16em, `muted`, separated by a white `◆` diamond. Two copies of the strip for a seamless loop.

Items: **Sounds like you, not a bot · You approve every post · No auto-post, ever · Built for X, done right · Researched from Reddit, HN, and Google News · A loop you can audit · Your voice, amplified**

### 5.6 FAQ (`components/sections/Faq.tsx`, `#faq`)

New section, placed between the Marquee and the CTA so objections are handled right before the signup ask. Standard section frame.

- **SectionMark:** `[ 03 ]` / "Common questions" / "FAQ" / file tag **"· catalyst.faq ·"**. (How is `[01]`, Control is `[02]`; nothing after Control was numbered, so no other marks needed renumbering.)
- **H2:** **"What people ask before they join."** Display 700, `clamp(28px,5vw,52px)`, `max-width: 760px`.
- **Four Q&As**, each with a top hairline, a faint mono index (`01`-`04`), the question (Inter 600, `clamp(19px,2.4vw,24px)`), and the answer (14px `muted`, `max-width: 64ch`). Reveal-staggered 70ms.
  1. "Will this get my account flagged?" / "No. Catalyst never posts on its own. Every post goes out only after you click approve, from your normal posting behavior, on your schedule."
  2. "Will my posts sound like AI?" / "That is the one thing we optimize against. Catalyst drafts from how you already write: your phrasing, your takes, your restraint. If a draft does not sound like you, reject it, and it learns."
  3. "Do I have to post every day?" / "No. You approve what is good and skip the rest. Some days that is three posts, some days it is none. The queue waits for you."
  4. "What if I do not have time to review?" / "Drafts sit in your queue until you get to them. Nothing expires into an auto-post. The loop only moves when you say go."

### 5.7 CTA (`components/sections/Cta.tsx`, `#join`)

Centered, `max-width: 720px`, top hairline, faint radial depth glow behind.

- **Eyebrow** (mono, 11px, 0.18em, `faint`): **"Early access"**.
- **H2:** **"Stay consistent on X `without it becoming a second job.`"** Display 800, `clamp(34px,6vw,72px)`, line 0.98, tracking -0.04em. The second clause uses `.iris-text`.
- **Body** (Inter, `clamp(15px,1.6vw,18px)`, `muted`, `max-width: 520px`):
  > "Let Catalyst do the reading and the first draft, sourced from what's actually happening in your niche. You keep your voice, your judgment, and about ten minutes a day. Every post waits for your approval."
- **Live counter:** `LiveCount` (see 5.14), centered, above the form.
- **Signup box** (`FloatingSignup`, `max-width: 560px`); its form carries the referral line (see 5.12).

### 5.8 Footer (`components/sections/Footer.tsx`)

`bgAlt` background, top hairline, a giant ghosted **"Catalyst"** watermark (24vw, opacity ~0.045) bleeding off the bottom.

- **Brand block** (`max-width: 440px`): "c" mark + **"Catalyst"** wordmark; mono tagline **"Consistency on X, in your voice, on your call"**; description (Inter, `muted`, 13.5px): "Catalyst drafts and schedules your X posts in your voice. You approve every one before it goes out."
- **Columns:**
  - *Product:* How it works (`#how`), Control (`#control`), Join the waitlist (`#join`)
  - *Catalyst:* Built for X, Human-approved, Private beta (static, `faint`)
- **Bottom bar** (mono, `faint`, 10.5px, space-between):
  - **"© 2026 Catalyst · Built for X · Human-approved"**
  - A pill with green pulsing dot: **"Private waitlist open"**
  - **"Built for people who'd rather build than post"**

### 5.9 FloatingSignup (`components/FloatingSignup.tsx`)

A 3D floating glass box wrapping the signup flow. Three nested layers so concerns do not collide:
- `.float-scene` provides perspective (1500px).
- `.float-bob` runs the continuous 7s hover loop (translate only).
- `.float-card` is the static `rotateX(7deg)` tilt with glass fill, blur, inset highlight, and a soft drop shadow; plus a radial contact shadow on the "floor" (`::after`).

On hover: the bob pauses, the card levels out (`rotateX(0)`), lifts 6px, and scales 1.012 with a deeper shadow.

Inside the card:
- **Eyebrow** (`.float-eyebrow`): mono 11px, `faint`, with a green dot before it (`::before`), text **"Join the waitlist"**.
- Before submit: the `SignupForm`. After success: the `ReferralCard` replaces the form in the same box (no jump).

### 5.10 SectionMark (`components/sections/SectionMark.tsx`)

Reusable "spec sheet markings" above each major section: a mono row `[ NN ]` / label / aside, then a centered-masked iridescent hairline carrying a centered file-tag chip (background `bg` so it sits on the line). Margin-bottom 36px. Makes the whole page read as one filed engineering artifact.

### 5.11 Interactive draft card (`MiniDraft` in `HowItWorks.tsx`)

A live demo of the Approve step. Monochrome card (`rgba(0,0,0,0.28)`, `border`, radius 12) showing a fake tweet with avatar, **"You"**, **"@yourhandle"**, and a `N/4` queue counter.

State and behavior:
- Cycles through 4 sample drafts (`DRAFTS`).
- **Approve** (white solid button): flashes an overlay "Approved · queued" with a `✓` in a mint ring, then `mdEnter`-animates the next draft in. Increments a session "approved" tally.
- **Edit** (outline button): swaps the text for an editable textarea (mint border). Buttons become **Save** (commits, counts as approved/"Edited · queued") and **Cancel**.
- **Skip** (outline button): flashes a muted "Skipped" with `×`, then advances.
- Buttons (`.md-btn`) lift on hover (`translateY(-1px)`, slight brightness) and depress on click (`scale(0.96)`). Interactions are locked (`busy`) during the ~820ms flash.
- Footer micro-status (mono, `faint`, 10px): "Try it · approve, edit, or skip" then "{n} approved here · go on, it's a demo".

### 5.12 SignupForm (`components/SignupForm.tsx`)

Two-row form, left-aligned, 8px gaps. Email is the only required field.

- **Row 1:** email input (`you@email.com`, flex-grows) + primary submit button. Button label is `ctaLabel` **"Join the waitlist"**, switching to **"Reserving…"** while submitting. Button is white (`btnBg`) with black text.
- **Row 2 (handle):** a single bordered wrapper (`.wl-input`, focus-within ring) containing a **fixed, non-editable `@`** (mono-adjacent, `muted`, `user-select: none`) followed by a borderless transparent input. Placeholder **"yourhandle (optional)"**. Any leading `@` the user types or pastes is stripped so it never doubles. The whole field spans the row.
- **Honeypot:** a visually hidden `website_url` input (off-screen). Bots that auto-fill it are rejected. Do not remove; the trap depends on the form sending this field.
- **Typo suggestion:** if `validateEmail` returns a suggestion, an inline line offers "Did you mean `<fixed>`?" with a "no, send anyway" fallback.
- **Errors:** inline, `danger` color; the email border turns `danger` when touched + errored.
- **Reassurance footer** (mono, centered, `faint`, 11.5px): **"No card. No spam. Just early access."**
- **Referral line** (mono, centered, `faint`, 11px, just under the reassurance): **"Every friend who joins with your link moves you up 5 spots."** Surfaces the referral loop before signup. Appears in both the hero and the CTA because both render this one form. The `5` matches `config.referral.jumpsPerReferral`.

Submitted JSON: `{ email, x_handle?, source: "landing", ref?, website_url }`. The API (`app/api/waitlist/route.ts`) strips a leading `@` from `x_handle`, trims, and caps at 40 chars.

### 5.13 ReferralCard (success state) (`components/ReferralCard.tsx`)

Replaces the form in the floating box after signup. Animates in with `wlPop`.

- **Eyebrow** (mono, `accent`/white): **"You're on the list"**.
- **Position:** huge Inter 800 number **"#{position}."** (44px compact / 56px), with a white period accent.
- **Body** (14px, `muted`, `max-width: 420px`): confirmation sent to the email; "Every friend who joins with your link moves you up `5 spots`. Your position updates live." (The live position comes from `useReferralPosition`; the "5 spots" copy is currently static.)
- Share-to-X uses this text (the one place "nothing posts" survives, intentionally, because it is the user's own boast): "I just joined the Catalyst waitlist. Autonomous X growth in my own voice, and nothing posts without my approval. Skip the line with my link:"

### 5.14 LiveCount (`components/LiveCount.tsx`)

Client component for live social proof, rendered in the Hero (under the badge) and the CTA (above the form). Fetches `GET /api/waitlist/count` once on mount.

- Renders a green pulsing dot (`live`, `dotPulse`) + a mono `faint` line.
- **Reveal threshold** (`REVEAL_THRESHOLD = 50`): at or above it, shows **"{count} founders already in line"** with the number counting up once on first reveal. Below it (or while loading, or if the fetch fails), shows the qualitative line **"Be one of the first founders in line"**. The count is never fabricated.
- **Reduced-motion guard:** the count-up is JS-driven (requestAnimationFrame, easeOutCubic ~850ms), so it checks `matchMedia('(prefers-reduced-motion: reduce)')` and snaps straight to the final number when reduced motion is set. The global CSS guard only covers CSS animations, so this explicit check is required.
- Props: `t` (theme), `align` ("center" default, "start" available).

---

## 6. Motion summary

- **Load entrance:** every `.reveal` element rises 28px and fades in over 0.85s (`cubic-bezier(0.16,0.84,0.3,1)`). Hero staggers badge -> counter -> H1 -> subhead -> signup (60 / 110 / 160 / 280 / 400ms); header rises at 0ms; audit rows stagger 70ms; clauses stagger 80ms; FAQ items stagger 70ms.
- **Live counter count-up:** when the count is shown, it animates from 0 to the real number once on first reveal (JS requestAnimationFrame, easeOutCubic ~850ms), with its own `matchMedia` reduced-motion guard that snaps to the final value.
- **Ambient loops:** signup box bob (7s), status dots pulse (2.4s), timeline spine light (5s), marquee scroll (36s).
- **On interaction:** signup box levels and lifts on hover; draft-card buttons lift/depress; draft swaps animate; mono dots glow.
- **Reduced motion:** all CSS motion is removed via the global override; the JS count-up additionally checks `matchMedia` and skips straight to the number.

---

## 7. Responsive behavior

- Type scales fluidly via `clamp()`; no fixed desktop-only sizes on headings.
- Under **760px:** the audit rail drops its giant-numeral gutter (`.rail-gutter` hidden), grid collapses to `22px 1fr`; `.hide-sm` elements hidden.
- Under **720px:** control clauses collapse to a single column.
- Hero uses `100svh` (small-viewport unit) so mobile browser chrome does not clip it.
- All form rows wrap (`flex-wrap`) so email/button and the handle field stack on narrow screens.

---

## 8. Where to change things

| Want to change... | Edit |
|---|---|
| Colors, radius, fonts, CTA label | `lib/theme.ts` |
| Loaded font families/weights, page `<title>`, OG | `app/layout.tsx` |
| Animations, grid helpers, grain, grid, focus ring | `app/globals.css` |
| Hero copy + A/B variant (`?hero=volume`) | `components/sections/Hero.tsx` |
| Live signup counter (label, threshold) | `components/LiveCount.tsx` |
| Signup count data | `app/api/waitlist/count/route.ts` |
| FAQ questions | `components/sections/Faq.tsx` |
| Steps + interactive card + static example draft | `components/sections/HowItWorks.tsx` |
| Control clauses + spec tokens | `components/sections/TrustStrip.tsx` |
| Marquee items | `components/CatalystLanding.tsx` (`Marquee`) |
| Final CTA copy | `components/sections/Cta.tsx` |
| Footer links/taglines | `components/sections/Footer.tsx` |
| Form fields, placeholders, reassurance | `components/SignupForm.tsx` |
| Success/referral copy | `components/ReferralCard.tsx` |
| Section markings (index/label/file tag) | `components/sections/SectionMark.tsx` |
| Brand name/tagline/SEO/email-from | `waitlist.config.ts` |
