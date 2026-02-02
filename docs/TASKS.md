# Tasks: Tabla Apps (Next.js)

## Design Principles

- **Mobile-first**: Design for small screens first, enhance for desktop
- **Touch-friendly**: Large tap targets (44px min), swipe gestures where useful
- **Responsive**: Fluid layouts with Tailwind breakpoints (sm/md/lg)
- **Audio on mobile**: Handle iOS Safari audio unlock, minimize latency

## Migration Phases

### Phase 1: Project Setup
- [ ] Initialize Next.js 14+ project with App Router
- [ ] Configure TypeScript (strict mode)
- [ ] Add Tailwind CSS 4
- [ ] Set up Firebase SDK (`firebase`)
- [ ] Create `lib/firebase/config.ts` with env vars
- [ ] Create `lib/firebase/db.ts` with Firestore helpers
- [ ] Configure Firebase Hosting for Next.js
- [ ] Create `.env.local` with Firebase config

### Phase 2: Audio System
- [ ] Install Tone.js
- [ ] Create `lib/audio/tabla.ts` - TablaPlayer class
- [ ] Define synthesis parameters for each bol
- [ ] Tune MembraneSynth for bayan (bass) sounds
- [ ] Tune MetalSynth for dayan (treble) sounds
- [ ] Implement combined strokes (dha = bass + treble)
- [ ] Create `lib/audio/metronome.ts`
- [ ] Implement mobile audio unlock (iOS Safari)
- [ ] Test latency and mobile compatibility

### Phase 3: Core Components
- [ ] Create `components/BolGrid.tsx` - responsive grid (stacks on mobile)
- [ ] Create `components/PlaybackControls.tsx` - large touch targets
- [ ] Create `components/TempoSlider.tsx` - thumb-friendly slider
- [ ] Create `components/TaalSelector.tsx` - dropdown/modal on mobile
- [ ] Create `components/CompositionCard.tsx` - card layout
- [ ] Create `components/AudioUnlockButton.tsx` - iOS Safari unlock
- [ ] Implement bol parser (`lib/parser.ts`)

### Phase 4: Pages/Routes
- [ ] Landing page (`app/page.tsx`)
- [ ] Browse compositions (`app/browse/page.tsx`)
- [ ] Tabla player (`app/player/page.tsx`)
- [ ] Upload/edit composition (`app/upload/page.tsx`)
- [ ] Polyrhythm trainer (`app/trainer/page.tsx`)
- [ ] Metronome (`app/metronome/page.tsx`)
- [ ] Sound lab (`app/lab/page.tsx`)

### Phase 5: Features
- [ ] Composition CRUD (create, read, update, delete)
- [ ] Search/filter compositions by title, taal, tags
- [ ] Sort by newest/oldest/title
- [ ] Inline playback in browse page
- [ ] Edit mode via `?edit={id}` query param
- [ ] Load composition via `?load={id}` in player
- [ ] Polyrhythm pattern calculation (N over D)

### Phase 6: Polish
- [ ] PWA manifest and service worker
- [ ] Offline audio caching
- [ ] Performance optimization (lazy loading)
- [ ] Final mobile/tablet/desktop testing
- [ ] Error handling and user feedback
- [ ] Loading states and skeletons
- [ ] Touch gesture refinements (swipe, long-press)
- [ ] (Optional) Firebase Auth integration
- [ ] (Optional) Firebase Analytics

---

## Project Structure

```
tabla/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── browse/page.tsx
│   ├── player/page.tsx
│   ├── upload/page.tsx
│   ├── trainer/page.tsx
│   ├── metronome/page.tsx
│   └── lab/page.tsx
├── components/
│   ├── BolGrid.tsx
│   ├── PlaybackControls.tsx
│   ├── TempoSlider.tsx
│   ├── TaalSelector.tsx
│   └── CompositionCard.tsx
├── lib/
│   ├── audio/
│   │   ├── tabla.ts
│   │   └── metronome.ts
│   ├── firebase/
│   │   ├── config.ts
│   │   └── db.ts
│   ├── parser.ts
│   └── types.ts
├── data/
│   └── compositions.json
├── scripts/
│   └── seed.ts
└── docs/
```

---

## Open Questions

1. **Authentication** — Require login to upload, or allow anonymous?
2. **Moderation** — How to handle inappropriate uploads?
3. **Offline support** — How important is PWA/offline capability?
4. **Multiple taals** — Support all common taals or start with Teentaal only?

---

## Next Steps

1. [ ] Initialize Next.js project (`npx create-next-app@latest`)
2. [ ] Set up Tailwind CSS 4
3. [ ] Configure Firebase and create env file
4. [ ] Build audio system with Tone.js
5. [ ] Create core components
6. [ ] Implement routes one by one

---

## Progress Log

| Date | Phase | Notes |
|------|-------|-------|
| | | |
