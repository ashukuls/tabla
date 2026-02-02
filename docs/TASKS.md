# Tasks: Tabla Apps Migration

## Migration Phases

### Phase 1: Project Setup
- [x] Initialize SvelteKit project (`npm create svelte@latest`)
- [x] Configure TypeScript (strict mode)
- [x] Add Tailwind CSS
- [x] Create Firebase project in Google Console
- [x] Install Firebase SDK (`firebase`)
- [x] Configure Firestore with security rules
- [x] Set up Firebase Hosting adapter for SvelteKit
- [x] Set up local development environment
- [ ] Create `.env` file with Firebase config

### Phase 2: Audio System
- [x] Install Tone.js
- [x] Create `TablaPlayer` class with synthesis
- [x] Define synthesis parameters for each bol (dha, ti, ge, na, etc.)
- [x] Tune bass synth (MembraneSynth) for bayan sounds
- [x] Tune treble synth (MetalSynth) for dayan sounds
- [x] Implement combined strokes (dha = bass + treble)
- [x] Implement mobile audio unlock (iOS Safari)
- [ ] Test latency and mobile compatibility

### Phase 3: Tabla Player App
- [x] Create `/player` route
- [x] Design UI for bol input/display
- [x] Implement bol parsing (text → array)
- [x] Create `BolGrid.svelte` component
- [x] Create `PlaybackControls.svelte` component
- [x] Connect to Tone.js sampler
- [x] Add tempo slider
- [x] Implement kaida save to Firestore
- [x] Implement kaida load from Firestore

### Phase 4: Polyrhythm Trainer Migration
- [x] Create `/trainer` route
- [x] Port existing polyrhythm logic to TypeScript
- [x] Replace Web Audio API with Tone.js
- [x] Create Svelte components for grid/controls
- [x] Connect presets to Firestore
- [x] Maintain feature parity with current app
- [ ] Test mobile/desktop grid layouts

### Phase 5: User Features
- [x] Kaida upload form with validation
- [x] Browse public kaidas page
- [x] Search/filter by taal
- [x] Taal selector component
- [ ] (Optional) Firebase Auth integration
- [ ] (Optional) Personal saved kaidas

### Phase 6: Polish
- [ ] PWA manifest and service worker
- [ ] Offline audio sample caching
- [ ] Performance optimization (lazy loading)
- [ ] Mobile responsiveness audit
- [ ] Error handling and user feedback
- [ ] Loading states
- [ ] Analytics (Firebase Analytics)

---

## Open Questions

1. **Authentication** — Require login to upload kaidas, or allow anonymous?
2. **Moderation** — How to handle inappropriate uploads?
3. **Offline support** — How important is PWA/offline capability?
4. **Multiple taals** — Support all common taals or start with teen taal only?
5. **Synthesis tuning** — How realistic should the synth sounds be vs. just functional?

---

## Next Steps

1. [ ] Initialize SvelteKit project with TypeScript + Tailwind
2. [ ] Create Firebase project in Google Console
3. [ ] Build proof-of-concept: Svelte component + Tone.js synthesis
4. [ ] Tune synthesis parameters for realistic tabla sounds
5. [ ] Validate mobile audio latency
6. [ ] Begin Phase 1 implementation

---

## Progress Log

| Date | Phase | Notes |
|------|-------|-------|
| | | |
