# Liftr
### Progressive Overload & Complete Fitness Tracking Platform

Liftr is a production-quality, multi-user fitness tracking web application built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **Drizzle ORM**, **Supabase PostgreSQL**, **Recharts**, and **Zustand**.

Design Philosophy: **Neo-Brutalism meets Premium Editorial Fitness Dashboard.**

---

## The Triad Vision

```
WORKOUT PERFORMANCE  +  BODY COMPOSITION  +  NUTRITION
```

- **Workout Tracking:** Live set logging, double progression engine, rest timer, personal records, and historical archives.
- **Body Composition:** Body weight tracking, dynamic BMI calculations, target weight milestones, and anthropometric circumference logs.
- **Nutrition Architecture:** Macro and caloric surplus/deficit architectural foundation (Coming Soon).

---

## Key Features

1. **Live Workout Tracker (Double Progression Engine):**
   - High-yield logging interface: Set #, Previous Session, Target Today, Weight stepper, Rep stepper, Complete Checkbox.
   - Transparent rule-based double progression without external AI dependencies:
     - *Rule 1 & 2:* Rep progression (+1 rep) within prescribed rep bracket.
     - *Rule 3:* Weight step-up (+2.5 kg) when hitting rep ceiling across sets.
     - *Rule 4:* Target repetition on missed rep floor.
     - *Rule 5:* First-time movement baseline establishment.
   - Automatic rest timer with audio, vibration, and background countdown (+15s / +30s).
   - Workout restoration and offline IndexedDB persistence.

2. **Workout Plan Builder:**
   - Multi-day split routines (e.g., Push Pull Legs, Upper / Lower).
   - Custom day naming, exercise reordering, target sets, rep ranges, starting weights, and rest durations.
   - Training phases: Bulking, Recomp, Cutting, Strength, Custom.
   - One-click "Start Workout with this Day" launcher.

3. **Exercise Library:**
   - 12 anatomical muscle groups: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Quadriceps, Hamstrings, Glutes, Calves, Abs, Full Body.
   - 7 equipment categories: Barbell, Dumbbell, Cable, Machine, Bodyweight, Smith Machine, Other.
   - Search, muscle chips, favorites, and custom movement creation.

4. **Strength Analytics & Personal Records:**
   - Epley formula 1RM calculations: `1RM = Weight * (1 + Reps / 30)`.
   - Training volume trajectory charts (`Recharts`).
   - Muscle group working set distribution.
   - Automated Personal Record (PR) hall of fame.

5. **Body Metrics & Dynamic BMI:**
   - Population-standard dynamic BMI: `BMI = Weight (kg) / Height (m)²`.
   - WHO category boundaries with visual marker needle on colored spectrum.
   - Clinical screening disclaimer and circumference tracking (Chest, Waist, Arms, Thighs, Hips, Shoulders, Calves, Custom).

6. **Weight Tracker & Goal Trajectory:**
   - Daily weight logging with duplicate prevention.
   - Prominent Bento Goal card: `79 kg -> 85 kg (+6 kg remaining)`.
   - Rate of change (kg/week) and target horizon guidelines.

7. **Data Sovereignty & Import/Export:**
   - One-click JSON backup download.
   - CSV workout export.
   - Multi-step CSV import wizard with validation and preview.

8. **PWA & Offline Capability:**
   - Web App Manifest (`/manifest.json`) for standalone mobile installation.
   - IndexedDB caching for active workout data and sync operations.

---

## Color Palette

| Purpose | Hex |
|---|---|
| Background | `#090909` |
| Primary Purple | `#8957DC` |
| Pastel Yellow | `#E9D65B` |
| Coral | `#E97860` |
| Mint Green | `#60C27D` |
| Muted Grey | `#A1A9A8` |
| White | `#F5F3EB` |
| Black | `#090909` |

---

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/nish-09/Liftr.git
cd Liftr
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and provide your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Schema & RLS
Run Drizzle migrations:
```bash
npm run db:generate
npm run db:push
```
Execute `src/lib/db/rls.sql` in the Supabase SQL editor to enforce Row Level Security.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Testing & Verification

Run the deterministic test suite verifying progression rules, 1RM, and BMI formulas:
```bash
npx tsx scripts/verify-engine.ts
```
