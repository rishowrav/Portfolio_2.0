# Rahimul Islam Showrav - Personal Portfolio (Hero Section)

An immersive, production-quality personal portfolio hero section built with **Next.js (App Router)**, **React**, **GSAP**, **Tailwind CSS**, and an interactive canvas-driven full-screen face-following character effect.

Live Localhost Preview: **[http://localhost:3000](http://localhost:3000)**

---

## ✨ Features

- **Exact Mockup Fidelity**:
  - Crisp white/light background with authentic soft-blue organic backdrop blob behind Rahimul Islam Showrav.
  - Authentic geometric details: 2-row dot grid above "Hello, I'm", concentric curved corner line arcs, right-side 4 vertical dots, and 3 vibrant blue action burst lines over the shoulder.
  - Whimsical handwritten phrase *"Let’s build something great!"* with hand-drawn curved arrow pointing to Showrav.
  - Fixed-anchor character posture centered at the bottom of the hero, matching the mockup's scale, proportions, and composition 1:1.
- **Slightly Larger Centered Header**:
  - Centered `RS` logo with enlarged scale (`h-10 sm:h-12 md:h-14`) for premium visual prominence.
  - Left navigation items: `Home` (with solid bright blue active underline indicator), `About`, `Skills`.
  - Right navigation items: `Projects`, `Resume`, `Contact`.
  - Perfectly balanced and centered on desktop, with an animated slide-out drawer on mobile screens.
- **Full-Screen Pointer & Touch Tracking (Mandatory)**:
  - Tracks cursor movement anywhere across the **entire viewport** (header, text, buttons, background, edges, and corners).
  - On mobile & touch devices: tracks finger movement anywhere across the full screen with seamless touch interaction.
  - **Horizontal Yaw**: Smoothly scrubs through authentic photoshoot frames from `facemovement` (Frame 40 = look left, Frame 80 = look center, Frame 120 = look right).
  - **Vertical Pitch (Up/Down)**: Natural head tilt (`rotateX`) looking up when pointer is high on the screen, looking down when pointer is low.
  - **Corners / Diagonals**: Combines horizontal turning + vertical tilt + subtle roll for realistic diagonal gaze.
  - **Rock-Solid Body Anchor**: The neck and head follow the pointer while the body, belt, and hands in pockets remain fixed in the center.
  - When pointer leaves or touch ends: GSAP lerp smoothly returns the face to the neutral center forward pose.
  - Non-blocking: 100% passive listeners so navigation, button clicks, and scrolling work with zero hindrance.
- **0.5s Logo Intro Experience**:
  - Displays `logo.png` centered on first visit for ~0.5s with a smooth GSAP curtain reveal.
  - Stored in `sessionStorage` so it doesn't repeat on refresh during the same browsing session.
  - Includes a discreet floating **"Replay Intro"** button in the bottom-right corner to re-test the intro at any time.

---

## 📁 Recommended Next.js File Structure

```
Showrav portfolio/
├── public/
│   ├── facemovement/           # 160 WebP transparent cutout character frames
│   │   ├── frame-001.webp
│   │   └── ...
│   ├── logo.png                # Centered RS header logo
│   └── mockup.png              # Visual reference mockup
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind & custom typography/motion styles
│   │   ├── layout.tsx          # Root layout & Google Fonts (Inter + Caveat)
│   │   └── page.tsx            # Main page assembly & intro replay state
│   ├── components/
│   │   ├── Header.tsx          # Centered logo + 3 left / 3 right nav links
│   │   ├── MobileMenu.tsx      # Slide-out responsive mobile navigation
│   │   ├── Hero.tsx            # Hero typography, CTAs, dot grid & layout
│   │   ├── InteractiveCharacter.tsx # Full-screen canvas face-tracking engine
│   │   ├── IntroAnimation.tsx  # 0.5s GSAP intro overlay & sessionStorage
│   │   ├── BackgroundDecorations.tsx # Curved arcs & right edge vertical dots
│   │   └── DoodleArrow.tsx     # Handwritten doodle & shoulder sparks
│   ├── config/
│   │   └── portfolio.ts        # 🎯 Central file to edit content, links & menus
│   └── types/
│       └── index.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🎯 Quick Customization Guide (Where to Edit)

All texts, menu links, social accounts, and colors are centralized in `src/config/portfolio.ts`:

- **Menu Labels & Links:** Edit `navigation.leftMenu` and `navigation.rightMenu`.
- **Name, Role & Bio:** Edit `personal.firstName`, `personal.lastName`, `personal.role`, and `personal.bio`.
- **CTA Buttons:** Edit `personal.primaryCta` and `personal.secondaryCta`.
- **Social Links:** Edit `socialLinks` (GitHub, LinkedIn, Twitter, Email).
- **Brand Colors:** In `tailwind.config.js`, modify `brand.500` (`#1d64ec`).

---

## 🚢 Uploading to GitHub

```bash
git init
git add .
git commit -m "feat: complete interactive hero section matching mockup"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
git push -u origin main
```
