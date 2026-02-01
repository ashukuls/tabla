# Tasks: Tabla Apps Migration

## Migration Phases

### Phase 1: Project Setup
- [ ] Initialize SvelteKit project (`npm create svelte@latest`)
- [ ] Configure TypeScript (strict mode)
- [ ] Add Tailwind CSS
- [ ] Create Firebase project in Google Console
- [ ] Install Firebase SDK (`firebase`)
- [ ] Configure Firestore with security rules
- [ ] Set up Firebase Hosting adapter for SvelteKit
- [ ] Set up local development environment
- [ ] Create `.env` file with Firebase config

### Phase 2: Audio System
- [ ] Install Tone.js
- [ ] Create `TablaPlayer` class
- [ ] Source/record tabla samples (at least: dha, ti, ge, na)
- [ ] Add samples to `static/samples/tabla/`
- [ ] Create audio engine abstraction
- [ ] Implement mobile audio unlock (iOS Safari)
- [ ] Test latency and mobile compatibility

### Phase 3: Tabla Player App
- [ ] Create `/player` route
- [ ] Design UI for bol input/display
- [ ] Implement bol parsing (text → array)
- [ ] Create `BolGrid.svelte` component
- [ ] Create `PlaybackControls.svelte` component
- [ ] Connect to Tone.js sampler
- [ ] Add tempo slider
- [ ] Implement kaida save to Firestore
- [ ] Implement kaida load from Firestore

### Phase 4: Polyrhythm Trainer Migration
- [ ] Create `/trainer` route
- [ ] Port existing polyrhythm logic to TypeScript
- [ ] Replace Web Audio API with Tone.js
- [ ] Create Svelte components for grid/controls
- [ ] Connect presets to Firestore
- [ ] Maintain feature parity with current app
- [ ] Test mobile/desktop grid layouts

### Phase 5: User Features
- [ ] Kaida upload form with validation
- [ ] Browse public kaidas page
- [ ] Search/filter by taal
- [ ] Taal selector component
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
3. **Sample licensing** — Record custom or use existing samples?
4. **Offline support** — How important is PWA/offline capability?
5. **Multiple taals** — Support all common taals or start with teen taal only?

---

## Next Steps

1. [ ] Initialize SvelteKit project with TypeScript + Tailwind
2. [ ] Create Firebase project in Google Console
3. [ ] Source or record initial tabla samples
4. [ ] Build proof-of-concept: Svelte component + Tone.js + one sample
5. [ ] Validate mobile audio latency
6. [ ] Begin Phase 1 implementation

---

## Progress Log

| Date | Phase | Notes |
|------|-------|-------|
| | | |
