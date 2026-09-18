# How to Add the Educational Video to Landing Page

## Quick Start (3 Steps)

### Step 1: Get Your Video File
Create or source a professional 60-90 second educational video showing:
- Employee with aging asset → spinal health impact
- Asset decomposition → environmental damage  
- Global impact → climate effects

**See `VIDEO_CONTENT_GUIDE.md` for complete production guide**

### Step 2: Host the Video

**Option A: YouTube (Recommended)**
1. Upload to YouTube
2. Get the video URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
3. Create embed URL: `https://www.youtube.com/embed/VIDEO_ID`

**Option B: Vimeo**
1. Upload to Vimeo
2. Get the embed URL from settings

**Option C: Self-hosted**
1. Upload MP4 file to your hosting (Vercel, AWS S3, etc.)
2. Get the direct URL

**Option D: Any Video CDN**
1. CloudFlare Stream
2. AWS CloudFront
3. Bunny CDN

### Step 3: Update Landing Page

Edit `src/app/landing/page.tsx`:

```tsx
<VideoPlayer
  title="Asset Lifecycle Impact"
  description="Learn how aging assets affect employee health, environmental health, and your bottom line"
  videoUrl="https://your-video-url.mp4" // ← Add your video URL here
  posterImage="https://your-poster-image.jpg" // ← Optional: add poster image
/>
```

**Examples:**

**YouTube:**
```tsx
<VideoPlayer
  title="Asset Lifecycle Impact"
  description="Learn how aging assets affect employee health, environmental health, and your bottom line"
  videoUrl="https://www.youtube.com/embed/abc123xyz789"
  posterImage="https://img.youtube.com/vi/abc123xyz789/maxresdefault.jpg"
/>
```

**Vimeo:**
```tsx
<VideoPlayer
  title="Asset Lifecycle Impact"
  description="Learn how aging assets affect employee health, environmental health, and your bottom line"
  videoUrl="https://vimeo.com/123456789"
/>
```

**Self-hosted MP4:**
```tsx
<VideoPlayer
  title="Asset Lifecycle Impact"
  description="Learn how aging assets affect employee health, environmental health, and your bottom line"
  videoUrl="/videos/asset-lifecycle-impact.mp4"
  posterImage="/images/video-poster.jpg"
/>
```

---

## VideoPlayer Component Features

The professional `VideoPlayer` component provides:

✅ **Beautiful Placeholder** - Shows what the video should contain until video is added
✅ **Smart Controls** - Play, pause, mute, fullscreen (on hover)
✅ **Mobile Responsive** - Works on all devices
✅ **Professional Styling** - Dark background with premium feel
✅ **Auto-fallback** - Shows placeholder if no video URL provided
✅ **Easy Integration** - Just pass videoUrl prop

---

## Placeholder Content

When no video URL is provided, the component shows:

**Title & Description**
- "Asset Lifecycle Impact"
- "Learn how aging assets affect employee health..."

**Key Points Listed:**
- ✓ Employee spinal health with aging assets
- ✓ Environmental impact of asset decomposition
- ✓ Carbon & methane emissions in landfills
- ✓ Global ecosystem effects

**Visual Design:**
- Professional dark background
- Animated play button
- Educational styling
- Call-to-action: "Replace this placeholder with your educational video file"

---

## Before & After

### Before (Inappropriate Placeholder)
```tsx
<iframe
  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&loop=1"
  title="Asset Health System Demo"
/>
```
❌ Unprofessional
❌ Distracting
❌ Wrong message

### After (Professional Educational)
```tsx
<VideoPlayer
  title="Asset Lifecycle Impact"
  description="Learn how aging assets affect employee health, environmental health, and your bottom line"
  videoUrl="https://your-video-url.mp4"
/>
```
✅ Professional
✅ Educational
✅ Correct message
✅ Engaging

---

## Video Specifications

### Recommended Format
- **Codec:** H.264 (MP4)
- **Resolution:** 1920x1080 (minimum), 4K recommended
- **Frame Rate:** 24fps or 30fps
- **Duration:** 60-90 seconds
- **File Size:** Under 50MB for web

### Audio
- Narration (professional voice)
- Background music
- Sound effects (minimal)
- Clear, audible at low volumes

---

## Testing

After adding your video URL:

1. **Test locally:**
   - `npm run dev`
   - Navigate to `http://localhost:3001`
   - Verify video loads and plays

2. **Test controls:**
   - Click play/pause
   - Try mute toggle
   - Test fullscreen
   - Check on mobile

3. **Browser compatibility:**
   - Chrome ✅
   - Firefox ✅
   - Safari ✅
   - Edge ✅

---

## Troubleshooting

### Video doesn't load?
- ✅ Check URL is correct and publicly accessible
- ✅ Verify video format is MP4
- ✅ Check CORS headers if self-hosted
- ✅ Try a different video hosting service

### Video plays but no sound?
- ✅ Check audio is embedded in video file
- ✅ Verify browser hasn't muted the tab
- ✅ Check volume levels in system

### Poster image doesn't show?
- ✅ Poster image is optional (video thumbnail appears during load)
- ✅ If you want poster, ensure image URL is accessible
- ✅ Image should be same aspect ratio as video (16:9)

### Performance issues?
- ✅ Compress video file (under 50MB)
- ✅ Use video hosting service (YouTube, Vimeo)
- ✅ Enable lazy loading (use placeholder initially)
- ✅ Consider lower resolution for mobile

---

## Next Steps

1. **Produce Video** (1-4 weeks)
   - Follow `VIDEO_CONTENT_GUIDE.md`
   - Create script and storyboard
   - Shoot/source footage
   - Edit and finalize

2. **Host Video** (1 day)
   - Choose hosting platform
   - Upload video
   - Get public URL

3. **Update Landing Page** (5 minutes)
   - Add videoUrl to VideoPlayer component
   - Test locally
   - Deploy to production

4. **Monitor** (Ongoing)
   - Check video analytics (if using YouTube/Vimeo)
   - Monitor engagement metrics
   - Update if needed

---

## Video Content Requirements

The video should show:

### Scene 1: Young Assets (Healthy)
- Employee with ergonomic chair
- Good posture
- Productive, comfortable
- **Message:** New assets support health

### Scene 2: Aging Assets (Deteriorating)
- Same employee after 5-7 years
- Worn chair, poor ergonomics
- Visible discomfort (slouching, holding back)
- **Message:** Aging assets damage health

**On-Screen:** Health impact metrics
- 45% higher musculoskeletal disorder risk
- 28 predicted health cases/year
- $420K annual health costs

### Scene 3: Disposal Impact
- Asset being dismantled
- Materials going to landfill
- Animated methane decomposition
- **Message:** Disposal creates environmental damage

**On-Screen:** Environmental metrics
- 45.8 kg methane per organization
- 1,245 tonnes CO₂e annually
- 65% methane escape rate

### Scene 4: Global Impact
- Methane in atmosphere
- Climate effects (melting ice, wildfires, flooding)
- Ecosystem damage
- **Message:** Environmental impact affects everyone

**On-Screen:** Climate metrics
- Methane GWP: 28-84x CO₂
- 60% carbon reduction possible
- Global temperature rise

### Scene 5: Solution (Positive)
- Asset being recycled/reused instead
- Ecosystem recovering
- Dashboard showing savings
- **Message:** There's a better way

**Final Message:**
- "One Platform... Three Impacts"
- Dashboard metrics
- Call to action: "Start Your Free Trial"

---

## Questions?

See `VIDEO_CONTENT_GUIDE.md` for detailed production specifications
