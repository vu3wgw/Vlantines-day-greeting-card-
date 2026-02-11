# Valentine's Day Viral Hook - Video Creator

A viral Valentine's Day video generator that creates cinematic, GitHub Unwrapped-style animations from couples' photos and memories.

## 🎯 Project Vision

Create a **viral-ready video creator** that transforms couples' photos into stunning, shareable Valentine's Day videos with:
- **GitHub Unwrapped-style animations** (cinematic camera work, smooth transitions, particle effects)
- **Multiple premium video styles** (story montages, arrow journey animations, unwrapped reveals)
- **Easy customization** (just upload photos, add dates & captions, pick a style)
- **Social media optimization** (9:16 vertical format, 30-60 second duration)

## 🏗️ Tech Stack

- **Remotion** - React-based video composition framework
- **Next.js 14** - Full-stack web app (App Router)
- **TypeScript** - Type-safe development
- **TailwindCSS** - Styling
- **Zod** - Schema validation
- **Remotion Lambda** - Cloud video rendering (planned)

## 📁 Project Structure

```
my-better-t-app/
├── apps/
│   └── web/               # Next.js web app
│       ├── src/app/       # App router pages
│       ├── src/components/# UI components
│       └── public/        # Static assets
│
└── packages/
    └── video/             # Remotion video compositions
        ├── src/
        │   ├── compositions/      # Main video compositions
        │   │   ├── ValentineVideo.tsx
        │   │   ├── CupidJourney.tsx
        │   │   └── ValentineUnwrapped.tsx
        │   ├── story/             # Premium story animations
        │   │   └── ValentineStory.tsx
        │   ├── github-unwrapped/  # GitHub Unwrapped 2023 (reference)
        │   │   ├── Main.tsx
        │   │   ├── UnwrappedDemo.tsx
        │   │   ├── TopLanguages/
        │   │   ├── Spaceship.tsx
        │   │   └── config.ts
        │   ├── cinematic/         # Cinematic camera & animation system (PLANNED)
        │   └── Root.tsx           # Composition registry
        └── public/
            └── languages/         # Language icons for GitHub Unwrapped
```

---

## ✅ Completed Features

### Phase 1: Basic Valentine's Video ✓
- [x] Image slideshow with captions & dates
- [x] Romantic transitions (fade, zoom, pan)
- [x] Couple name overlay
- [x] Background music integration
- [x] Fixed duration calculation (5 images = 45s)

### Phase 2: Premium Animations ✓
- [x] **Spring physics system** - Bouncy, natural animations
- [x] **Kinetic typography** - Text with momentum and motion blur
- [x] **Sticker system** - Floating hearts, sparkles, Polaroid frames
- [x] **Premium transitions** - Wipe, slide, crossfade with spring physics
- [x] **Multiple video styles**:
  - `ValentineVideo` - Original slideshow
  - `ValentineStory` - Vox-style narrative (60s)
  - `PremiumValentineStory` - High-quality variant

### Phase 3: GitHub Unwrapped Integration ✓
- [x] Imported entire GitHub Unwrapped 2023 codebase
- [x] Fixed blank page issue (commented out broken composition)
- [x] **Fixed Zod enum bug** (`LanguagesEnum.Enum` → `LanguagesEnum.enum`)
- [x] GitHubUnwrapped composition now working in Remotion Studio
- [x] Analyzed animation techniques:
  - Camera rig systems (chase cam, bird's eye, orbit)
  - `remapSpeed()` for acceleration/deceleration
  - Path following with `@remotion/paths`
  - Parallax cloud layers
  - Particle systems

---

## 🚧 Current Status: GitHub Unwrapped Analysis Complete

**Just Fixed:**
- Remotion Studio was showing blank page → Fixed by isolating GitHubUnwrapped composition
- Runtime error in `constants.tsx` → Fixed Zod enum access pattern (uppercase `Enum` → lowercase `enum`)
- Build now successful: "Built in 1442ms"

**What's Working:**
- Remotion Studio loads at http://localhost:3003
- Can preview all Valentine compositions
- GitHubUnwrapped composition now functional and selectable

**Next Immediate Step:**
User should verify GitHubUnwrapped appears in Studio dropdown and plays correctly.

---

## 🎬 Planned: Cupid Journey Cinematic (Act 2 of Project)

See `~/.claude/plans/glistening-zooming-cookie.md` for full implementation plan.

### Concept
A **GitHub Unwrapped-inspired** 60-second cinematic animation:
1. **Act 1: The Shot (8s)** - Cupid draws bow, releases arrow in slow-motion
2. **Act 2: The Journey (40s)** - Arrow soars through clouds, flying over relationship milestones (user's photo dates), with **dynamic camera switching** (chase cam, bird's eye, side profile)
3. **Act 3: The Impact (12s)** - Arrow pierces target, roses bloom, "Happy Valentine's Day" reveal

### Technical Approach
Adapting GitHub Unwrapped techniques:
- **Camera rig system** with multiple perspectives (chase, orbit, side)
- **Arrow path following** using `@remotion/paths` (like rocket in GitHub Unwrapped)
- **Parallax cloud layers** with varying scroll speeds
- **Speed remapping** for slow-motion impact
- **Particle system** for rose petals (inspired by star particles)
- **Spring physics** for rose blooming animation

### Required Assets (User to Provide)
SVGs needed:
- `cupid.svg` - Character with bow drawn
- `arrow.svg` - Side view with separable tip/shaft/fletching
- `target.svg` - Bullseye with concentric circles
- `rose-bud.svg`, `rose-half.svg`, `rose-full.svg` - Bloom stages
- `rose-petal.svg` - Single petal for particle scatter
- `cloud-1.svg`, `cloud-2.svg`, `cloud-3.svg` - Background clouds
- `milestone-frame.svg` - Decorative photo frame border

---

## 📋 What's Left to Do

### Immediate Tasks (Next Session)
1. [ ] **Verify GitHubUnwrapped composition**
   - User confirms it appears in Studio dropdown
   - Test playback of animation
   - Ensure all scenes render correctly

2. [ ] **Create Cupid Journey composition** (Phase 1)
   - Set up `cinematic/` folder structure
   - Implement `remapSpeed` utility (from GitHub Unwrapped)
   - Create arrow path generation system
   - Build camera rig architecture

### Short-Term (This Week)
3. [ ] **Act 1: The Shot** (Cupid Journey)
   - Cupid bow draw animation
   - Arrow release with slow-motion
   - Vertical ascent through clouds

4. [ ] **Act 2: The Journey** (Cupid Journey)
   - Implement 3 camera perspectives (chase, bird's eye, side)
   - Camera transition system with smooth overlaps
   - Milestone marker positioning from user photo dates
   - Parallax cloud system (4 layers)

5. [ ] **Act 3: The Impact** (Cupid Journey)
   - Target approach zoom
   - Slow-motion impact animation
   - Rose bloom sequence (staggered springs)
   - Petal scatter particle system (50 petals)
   - Final text reveal (couple names + relationship duration)

### Medium-Term (Next 2 Weeks)
6. [ ] **Web App Integration**
   - Build upload flow for photos
   - Add style selector (ValentineVideo vs CupidJourney vs Unwrapped)
   - Connect to Remotion Lambda for cloud rendering
   - Payment integration (free tier + premium)

7. [ ] **Valentine Unwrapped Adaptation**
   - Create `ValentineUnwrappedComplete` composition
   - Adapt TopLanguages → TopMemories (user photos as "planets")
   - Adapt rocket journey → heart/cupid journey
   - Custom color schemes (warm/romantic vs GitHub's tech colors)

### Long-Term (Launch Ready)
8. [ ] **Performance Optimization**
   - Render time < 3 minutes for 60s video
   - Optimize particle counts
   - Image optimization/CDN setup

9. [ ] **Social Media Presets**
   - 9:16 vertical (Instagram Stories, TikTok)
   - 1:1 square (Instagram Feed)
   - 16:9 horizontal (YouTube, Facebook)

10. [ ] **Marketing & Distribution**
    - Landing page with examples
    - SEO optimization
    - Social media templates
    - Referral system

---

## 🐛 Known Issues

### Active Issues
- **Version mismatch warning** - Remotion packages split between 4.0.409 (15 packages) and 4.0.410 (5 packages)
  - Status: Warning only, not blocking
  - Fix: Align all packages to same version in package.json

### Resolved Issues
- ✅ Blank Remotion Studio page → Fixed by isolating GitHubUnwrapped
- ✅ Zod enum runtime error → Fixed `LanguagesEnum.Enum` → `LanguagesEnum.enum`
- ✅ Font loading delays → Using `delayRender/continueRender` pattern

---

## 📊 Progress Tracking

**Overall Progress: ~35% Complete**

| Feature | Status | Progress |
|---------|--------|----------|
| Basic Valentine Video | ✅ Done | 100% |
| Premium Animations | ✅ Done | 100% |
| GitHub Unwrapped Integration | ✅ Done | 100% |
| Cupid Journey (Cinematic) | 🚧 Planned | 0% |
| Valentine Unwrapped | 🚧 Planned | 0% |
| Web App Upload Flow | 📅 TODO | 0% |
| Cloud Rendering | 📅 TODO | 0% |
| Payment/Monetization | 📅 TODO | 0% |

**Current Sprint:** GitHub Unwrapped analysis complete, preparing to start Cupid Journey implementation.

---

## 🎨 Design Philosophy

**Viral-First Design:**
- Keep videos 30-60 seconds (optimal for social sharing)
- High production value (cinematic cameras, smooth animations)
- Emotional storytelling (couples' memories with narrative arc)
- Surprise & delight (unexpected camera angles, particle effects)

**Technical Excellence:**
- Smooth 30fps playback
- Spring physics for natural motion
- Proper easing (no linear animations)
- Performance-optimized (fast renders)

**User Experience:**
- Dead simple: upload photos → pick style → generate video
- No video editing skills required
- Multiple export formats (vertical, square, horizontal)
- Preview before rendering (Remotion Studio integration)

---

## 📚 Key Learnings from GitHub Unwrapped

1. **Camera Systems** - Multiple perspectives (chase, orbit, side) create cinematic feel
2. **Path Following** - `@remotion/paths` makes complex motion easy
3. **Speed Remapping** - `remapSpeed()` allows slow-motion without frame duplication
4. **Particle Systems** - Simple physics + spring animations = convincing effects
5. **Scene Transitions** - Negative offsets in `<Series>` create smooth overlaps
6. **Font Loading** - Use `delayRender/continueRender` for async resources

---

## 🚀 Launch Checklist (Future)

- [ ] Domain purchase & hosting
- [ ] Remotion Lambda setup
- [ ] Payment integration (Stripe)
- [ ] Email collection for waitlist
- [ ] Example videos on landing page
- [ ] Social media accounts setup
- [ ] Press kit / media outreach
- [ ] Launch on Product Hunt
- [ ] Reddit/Twitter announcements

---

## 🔗 Resources

- **Remotion Docs:** https://remotion.dev
- **GitHub Unwrapped 2023:** https://githubunwrapped.com
- **Plan File:** `~/.claude/plans/glistening-zooming-cookie.md`
- **Remotion Studio:** http://localhost:3003

---

**Last Updated:** 2026-01-27
**Next Review:** After Cupid Journey Act 1 completion
