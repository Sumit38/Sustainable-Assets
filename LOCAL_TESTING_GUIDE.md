# Local Testing Guide

## ✅ Quick Start Testing (5 Minutes)

### **Current Status:**
- ✅ Dev server running on `http://localhost:3001`
- ✅ Landing page deployed
- ✅ Professional video player integrated
- ✅ All routes configured

---

## 🧪 **Test 1: Landing Page** (Immediate)

### **What to Check:**
1. Navigate to: `http://localhost:3001`
2. **Hero Section:**
   - [ ] Title displays: "Transform Asset Management Into Strategic Value"
   - [ ] Subtitle visible with value proposition
   - [ ] "Start Free Trial" button visible
   - [ ] "Learn More" button visible
   - [ ] "No credit card required • Free for 30 days" message shows

3. **Video Player Placeholder:**
   - [ ] Dark professional background
   - [ ] Title: "Asset Lifecycle Impact"
   - [ ] Description text visible
   - [ ] Blue info box with "📹 Educational Video Ready"
   - [ ] Shows 4 bullet points:
     - ✓ Employee spinal health with aging assets
     - ✓ Environmental impact of asset decomposition
     - ✓ Carbon & methane emissions in landfills
     - ✓ Global ecosystem effects
   - [ ] Message: "Replace this placeholder with your educational video file"

4. **Problem Statement Section (Scroll Down):**
   - [ ] Heading: "The Hidden Cost of Asset Failure"
   - [ ] Three cards showing:
     - "$2.5M+" - Average annual impact
     - "45%" - Employee health issues
     - "72 hrs/yr" - Unplanned downtime

5. **Solution Section:**
   - [ ] Heading: "How We Solve This"
   - [ ] Three solution cards:
     - Real-Time Monitoring
     - Predictive Analytics
     - Cost Optimization

6. **"What You'll Achieve" Section:**
   - [ ] Four metrics:
     - 35% Cost Reduction
     - 40% Less Downtime
     - 50% Better Employee Health
     - 60% Carbon Reduction

7. **Navigation:**
   - [ ] Logo in top-left
   - [ ] "Sign In" button in top-right
   - [ ] "Get Started" button in top-right

---

## 🧪 **Test 2: Responsive Design**

### **Test on Different Screen Sizes:**

1. **Desktop (1920x1080):**
   - [ ] Two-column layout (text left, video right)
   - [ ] All content visible without scrolling hero
   - [ ] Navigation aligned properly

2. **Tablet (768x1024):**
   - [ ] Layout still readable
   - [ ] Video scales properly
   - [ ] Text wraps correctly

3. **Mobile (375x812):**
   - [ ] Single-column layout (text above video)
   - [ ] Video full width
   - [ ] Touch-friendly buttons
   - [ ] No horizontal scrolling

**How to Test:**
- Open browser DevTools (F12)
- Click device toolbar icon (top-left)
- Toggle between Mobile, Tablet, Desktop
- Verify layout works on each

---

## 🧪 **Test 3: Navigation Links**

### **Click Test:**
1. **"Sign In" button** (top-right)
   - [ ] Redirects to `/auth/signin`
   - [ ] Sign in form displays
   - [ ] Email/password fields present

2. **"Get Started" button** (top-right)
   - [ ] Redirects to `/auth/signup`
   - [ ] Sign up form displays
   - [ ] Name/email/password fields present

3. **"Start Free Trial" button** (hero section)
   - [ ] Redirects to `/auth/signup`

4. **"Learn More" button** (hero section)
   - [ ] Scrolls to features section

5. **Logo** (top-left)
   - [ ] Clicking doesn't cause errors
   - [ ] Stays on landing page

---

## 🧪 **Test 4: Video Player Component**

### **Placeholder Behavior:**
1. **Visual Check:**
   - [ ] Placeholder displays (no video URL provided)
   - [ ] Professional dark background
   - [ ] Play icon visible in center
   - [ ] Text is readable on dark background

2. **Click Play Button:**
   - [ ] Shows message (no video to play)
   - [ ] Doesn't cause errors
   - [ ] Can close/dismiss

3. **Hover Effects:**
   - [ ] Hover over video area
   - [ ] Controls appear on hover (if video playing)
   - [ ] Smooth transitions

---

## 🧪 **Test 5: Video Integration** (When You Add Video)

### **After Adding Your Video URL:**
```tsx
<VideoPlayer
  title="Asset Lifecycle Impact"
  description="Learn how aging assets affect..."
  videoUrl="https://your-video-url.mp4"
/>
```

1. **Video Loads:**
   - [ ] Video appears instead of placeholder
   - [ ] Poster image shows (if provided)
   - [ ] No "Failed to load" errors

2. **Playback Controls:**
   - [ ] Play/pause button works
   - [ ] Video plays smoothly
   - [ ] Audio is clear
   - [ ] No buffering issues

3. **Controls:**
   - [ ] Mute button works
   - [ ] Volume controls function
   - [ ] Fullscreen works
   - [ ] Progress bar seekable

4. **Mobile Playback:**
   - [ ] Video plays on mobile
   - [ ] Touch controls responsive
   - [ ] Fullscreen works on mobile

---

## 🧪 **Test 6: Performance**

### **Check Console for Errors:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. [ ] No JavaScript errors
5. [ ] No 404 errors
6. [ ] No console warnings

### **Performance Check:**
1. Open DevTools → Performance tab
2. Record page load
3. [ ] Page loads in < 3 seconds
4. [ ] Largest Contentful Paint < 2.5s
5. [ ] No janky scrolling

---

## 🧪 **Test 7: Cross-Browser Testing**

### **Test in Multiple Browsers:**

1. **Chrome:**
   - [ ] Landing page loads
   - [ ] Video player works
   - [ ] No errors in console

2. **Firefox:**
   - [ ] Landing page loads
   - [ ] Styling correct
   - [ ] Video player functional

3. **Safari:**
   - [ ] Landing page displays
   - [ ] Video compatibility
   - [ ] Controls work

4. **Edge:**
   - [ ] All features functional
   - [ ] Layout correct

---

## 🧪 **Test 8: Auth Flow** (Optional - Requires Supabase)

### **If Auth is Working:**
1. Click "Sign In"
2. Enter demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123456`
3. [ ] Login succeeds
4. [ ] Redirects to dashboard or welcome page
5. [ ] See business KPI cards
6. [ ] Logout button works

### **If Auth Not Working (Expected):**
- [ ] Error message displays clearly
- [ ] Doesn't break the app
- [ ] Landing page still accessible

---

## 🧪 **Test 9: Styling & Branding**

### **Visual Consistency:**
1. [ ] Colors match brand (blues, grays)
2. [ ] Typography is clean and readable
3. [ ] Spacing is consistent
4. [ ] Buttons have hover effects
5. [ ] Cards have shadow effects
6. [ ] Text contrast is high enough

### **Dark Mode (if supported):**
1. [ ] Landing page readable in dark mode
2. [ ] Video player visible in dark mode
3. [ ] No elements disappear

---

## 🧪 **Test 10: Content Accuracy**

### **Verify Numbers:**
- [ ] $2.5M+ - Average annual impact (correct)
- [ ] 45% - Employee health issues (correct)
- [ ] 72 hrs/yr - Unplanned downtime (correct)
- [ ] 35% Cost Reduction (achievable)
- [ ] 40% Less Downtime (achievable)
- [ ] 50% Better Employee Health (achievable)
- [ ] 60% Carbon Reduction (achievable)

### **Verify Text:**
- [ ] No typos on landing page
- [ ] All headings match mockups
- [ ] Descriptions make sense
- [ ] CTAs are clear

---

## 📋 **Complete Testing Checklist**

```
LANDING PAGE
□ Hero section displays correctly
□ Video player placeholder shows
□ Navigation bar present
□ Problem statement visible
□ Solution section visible
□ "What You'll Achieve" section visible
□ Features section visible
□ ROI section visible
□ CTA buttons functional
□ Footer displays

RESPONSIVE DESIGN
□ Works on desktop (1920x1080)
□ Works on tablet (768x1024)
□ Works on mobile (375x812)
□ No horizontal scrolling on mobile

NAVIGATION
□ Sign In button works
□ Get Started button works
□ Learn More button works
□ Links navigate correctly
□ No 404 errors

VIDEO PLAYER
□ Placeholder displays professionally
□ Title and description visible
□ Educational info box shows
□ Play button visible
□ No JavaScript errors

PERFORMANCE
□ Page loads in < 3 seconds
□ No console errors
□ No broken images
□ Smooth scrolling

CROSS-BROWSER
□ Chrome: ✅
□ Firefox: ✅
□ Safari: ✅
□ Edge: ✅

STYLING
□ Colors correct
□ Typography readable
□ Spacing consistent
□ Hover effects work
□ Buttons styled properly

CONTENT
□ All metrics correct
□ No typos
□ Text makes sense
□ CTAs clear
```

---

## 🐛 **Troubleshooting**

### **If Something Doesn't Work:**

**Issue: Page doesn't load**
- Solution: Refresh browser (Ctrl+R or Cmd+R)
- Solution: Clear cache (Ctrl+Shift+Del)
- Solution: Try incognito/private window

**Issue: Video player shows error**
- Solution: Check browser console (F12)
- Solution: This is expected - placeholder will show until video URL added
- Solution: See `HOW_TO_ADD_VIDEO.md` for video setup

**Issue: Page looks broken on mobile**
- Solution: Try different mobile size in DevTools
- Solution: Check if browser zoom is reset (Ctrl+0)
- Solution: Try different browser

**Issue: Navigation doesn't work**
- Solution: Check browser console for errors
- Solution: Verify URL changes (look at address bar)
- Solution: Try F5 refresh

**Issue: Styling looks different**
- Solution: Clear browser cache
- Solution: Hard refresh (Ctrl+Shift+R)
- Solution: Try different browser

---

## ✅ **Success Criteria**

Your landing page is working correctly if:
- ✅ All sections display properly
- ✅ Video player placeholder shows
- ✅ Navigation works
- ✅ No JavaScript errors
- ✅ Responsive on all screen sizes
- ✅ Professional appearance
- ✅ Clear call-to-actions

---

## 🎯 **What's Next After Testing**

1. **Create Your Video** (Using VIDEO_CONTENT_GUIDE.md)
2. **Host Your Video** (YouTube, Vimeo, or self-hosted)
3. **Add Video URL** (See HOW_TO_ADD_VIDEO.md)
4. **Test Video Playback** (Follow Test 5 above)
5. **Deploy to Production** (Vercel)

---

## 📝 **Testing Notes**

Record any issues you find:
- [ ] Issue: _______________
- [ ] Expected: _______________
- [ ] Actual: _______________
- [ ] Severity: Critical / High / Medium / Low

Then report to development team for fixes.

---

## 🚀 **Ready to Test?**

1. Open: `http://localhost:3001`
2. Go through checklist above
3. Note any issues
4. Report back with findings

**Happy Testing!** 🎉
