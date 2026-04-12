# Landing Implementation Notes

## Usage notes (`ContainerScroll`)

- **Component:** `src/components/ui/container-scroll-animation.tsx`
- **Props:**
  - `titleComponent: React.ReactNode` (heading and supporting content)
  - `children: React.ReactNode` (visual content rendered in animated card)
- **State/behavior:**
  - Uses `useScroll` + `useTransform` from `framer-motion`
  - Uses `useReducedMotion` fallback to reduce movement when user prefers reduced motion
- **Responsive behavior:**
  - Mobile and desktop dimensions are controlled with Tailwind breakpoints (`md:` classes)
  - Card/section heights adapt between mobile and desktop

## Where animation components are used

1. **Hero section:** `src/components/sections/hero-scroll-demo.tsx`
2. **Additional landing section:** `src/components/sections/feature-scroll-demo.tsx`
3. **Composed into page:** `src/App.tsx`

## Default component path guidance

- In this React + Vite setup, source files live under `src`, so shared UI components are located at `src/components/ui`.
- This aligns with the logical `/components/ui` convention and keeps imports consistent via `@/components/ui/...`.
- If a different path is used, prefer migrating to `components/ui` for easier reuse, onboarding, and shadcn ecosystem compatibility.

## Setup steps when prerequisites are missing

If this project did not exist, use the following setup sequence:

1. Create React + TypeScript app
  - `npm create vite@latest web -- --template react-ts`
2. Install Tailwind CSS
  - `npm install -D tailwindcss postcss autoprefixer`
  - `npx tailwindcss init -p`
3. Ensure TypeScript is present
  - `npm install -D typescript @types/react @types/react-dom`
4. Initialize shadcn metadata/settings
  - `npx shadcn@latest init`
5. Add path aliases (`@/* -> src/*`) in TS config and Vite config
6. Install `framer-motion` and add animation components
  - `npm install framer-motion`

## Clarification checklist answers

- **Data/props passed to component:** `titleComponent` and `children`
- **State management requirements:** Local animation/viewport state only; no global store needed
- **Required assets:** Hero image (remote URL currently), optional custom branded illustrations
- **Expected responsive behavior:** Smooth and readable on mobile/tablet/desktop with Tailwind breakpoints
- **Best integration location:** Hero and one additional landing section to establish a reusable visual pattern
