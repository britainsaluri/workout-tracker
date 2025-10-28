# Weight Suggestion UI Mockups

## Visual Reference Guide
Exact pixel-perfect mockups for implementation reference.

---

## 1. High Confidence Suggestion (Green)

### Full Card View
```
┌───────────────────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 💡 SUGGESTED WEIGHT                              [×] ┃ │
│ ┃                                                       ┃ │
│ ┃ 155 lbs        (+10 from last week)             ✅   ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────────────────────────────────────┐  ┃ │
│ ┃ │ Last week:                                      │  ┃ │
│ ┃ │ 145×20, 145×20, 145×19                          │  ┃ │
│ ┃ └─────────────────────────────────────────────────┘  ┃ │
│ ┃                                                       ┃ │
│ ┃ ▸ Why this weight?                                   ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────┐  ┌─────────────────┐            ┃ │
│ ┃ │    ✓ Accept     │  │    ✎ Modify     │            ┃ │
│ ┃ └─────────────────┘  └─────────────────┘            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└───────────────────────────────────────────────────────────┘

Colors:
- Border: 4px solid #10B981 (green) on left
- Background: Linear gradient #D1FAE5 → #FFFFFF
- Accept button: #4F46E5 (indigo)
- Modify button: #F3F4F6 (gray) with border
```

### Expanded Explanation
```
┌───────────────────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 💡 SUGGESTED WEIGHT                              [×] ┃ │
│ ┃                                                       ┃ │
│ ┃ 155 lbs        (+10 from last week)             ✅   ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────────────────────────────────────┐  ┃ │
│ ┃ │ Last week:                                      │  ┃ │
│ ┃ │ 145×20, 145×20, 145×19                          │  ┃ │
│ ┃ └─────────────────────────────────────────────────┘  ┃ │
│ ┃                                                       ┃ │
│ ┃ ▾ Why this weight?                                   ┃ │
│ ┃ ┌─────────────────────────────────────────────────┐  ┃ │
│ ┃ │ You hit the top of the target range on all     │  ┃ │
│ ┃ │ sets!                                            │  ┃ │
│ ┃ │                                                  │  ┃ │
│ ┃ │ • Average reps: 19.7                            │  ┃ │
│ ┃ │ • Target range: 18-20                           │  ┃ │
│ ┃ │ • Increase: 6.9%                                │  ┃ │
│ ┃ └─────────────────────────────────────────────────┘  ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────┐  ┌─────────────────┐            ┃ │
│ ┃ │    ✓ Accept     │  │    ✎ Modify     │            ┃ │
│ ┃ └─────────────────┘  └─────────────────┘            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└───────────────────────────────────────────────────────────┘

Explanation panel:
- Background: #F9FAFB (light gray)
- Border-radius: 8px
- Padding: 12px
- Bullet points: Left-aligned with 16px indent
```

---

## 2. Medium Confidence Suggestion (Yellow)

```
┌───────────────────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 💡 SUGGESTED WEIGHT                              [×] ┃ │
│ ┃                                                       ┃ │
│ ┃ 152.5 lbs      (+7.5 from last week)            ℹ️   ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────────────────────────────────────┐  ┃ │
│ ┃ │ Last week:                                      │  ┃ │
│ ┃ │ 145×19, 145×18, 145×18                          │  ┃ │
│ ┃ └─────────────────────────────────────────────────┘  ┃ │
│ ┃                                                       ┃ │
│ ┃ ▸ Why this weight?                                   ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────┐  ┌─────────────────┐            ┃ │
│ ┃ │    ✓ Accept     │  │    ✎ Modify     │            ┃ │
│ ┃ └─────────────────┘  └─────────────────┘            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└───────────────────────────────────────────────────────────┘

Colors:
- Border: 4px solid #F59E0B (yellow) on left
- Background: Linear gradient #FEF3C7 → #FFFFFF
- Icon: ℹ️ (info)
```

---

## 3. Low Confidence Suggestion (Red)

```
┌───────────────────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 💡 SUGGESTED WEIGHT                              [×] ┃ │
│ ┃                                                       ┃ │
│ ┃ 145 lbs        (No change - master this)        ⚠️   ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────────────────────────────────────┐  ┃ │
│ ┃ │ Last week:                                      │  ┃ │
│ ┃ │ 145×18 (only 1 set completed)                   │  ┃ │
│ ┃ └─────────────────────────────────────────────────┘  ┃ │
│ ┃                                                       ┃ │
│ ┃ ▸ Why this weight?                                   ┃ │
│ ┃                                                       ┃ │
│ ┃ ┌─────────────────┐  ┌─────────────────┐            ┃ │
│ ┃ │    ✓ Use This   │  │  Enter Manually │            ┃ │
│ ┃ └─────────────────┘  └─────────────────┘            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└───────────────────────────────────────────────────────────┘

Colors:
- Border: 4px solid #EF4444 (red) on left
- Background: Linear gradient #FEE2E2 → #FFFFFF
- Icon: ⚠️ (warning)
- Button text: "Use This" instead of "Accept"
```

---

## 4. Accepted State

```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐  │
│ │ ✅  Using suggested weight: 155 lbs       [Change]  │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘

Colors:
- Background: #D1FAE5 (light green)
- Text: #065F46 (dark green)
- Border-radius: 8px
- Padding: 12px
- Height: Auto (collapsed from full card)
```

---

## 5. Modified State

```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐  │
│ │ ℹ️  Using custom weight: 150 lbs          [Change]  │  │
│ │    (Suggested was 155 lbs)                          │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘

Colors:
- Background: #FEF3C7 (light yellow)
- Text: #78350F (dark yellow)
- Border-radius: 8px
- Padding: 12px
```

---

## 6. Compact/Collapsed View

```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐  │
│ │ 💡 155 lbs (+10) ✅  [Accept] [Details ▾]           │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘

Colors:
- Background: #F3F4F6 (light gray)
- Height: 48px (one-line)
- Buttons: Inline, compact (36px height)
```

---

## 7. Dismissed State (Hidden)

```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐  │
│ │ 💡 View weight suggestion                            │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘

Styling:
- Single line, small text
- Link style (blue, underlined on hover)
- Optional: Show only on hover or in "?" help menu
```

---

## 8. Mobile View (375px width)

```
┌─────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 💡 SUGGESTED       [×]    ┃ │
│ ┃    WEIGHT                  ┃ │
│ ┃                            ┃ │
│ ┃ 155 lbs              ✅    ┃ │
│ ┃ (+10 from last week)       ┃ │
│ ┃                            ┃ │
│ ┃ ┌────────────────────────┐ ┃ │
│ ┃ │ Last week:             │ ┃ │
│ ┃ │ 145×20, 145×20,        │ ┃ │
│ ┃ │ 145×19                 │ ┃ │
│ ┃ └────────────────────────┘ ┃ │
│ ┃                            ┃ │
│ ┃ ▸ Why this weight?         ┃ │
│ ┃                            ┃ │
│ ┃ ┌────────────────────────┐ ┃ │
│ ┃ │      ✓ Accept          │ ┃ │
│ ┃ └────────────────────────┘ ┃ │
│ ┃ ┌────────────────────────┐ ┃ │
│ ┃ │      ✎ Modify          │ ┃ │
│ ┃ └────────────────────────┘ ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────┘

Changes for mobile:
- Title wraps to 2 lines
- Weight and change on separate lines
- Buttons stack vertically
- Full width buttons (no side-by-side)
- Increased padding for touch
```

---

## 9. Set Input Auto-fill Animation

### Before Accept
```
Set 1: [____] lbs × [____] reps [○]
Set 2: [____] lbs × [____] reps [○]
Set 3: [____] lbs × [____] reps [○]
```

### During Accept (Green pulse)
```
Set 1: [155] lbs × [____] reps [○]  ← Pulse green
       ^^^^
Set 2: [155] lbs × [____] reps [○]  ← Pulse green
       ^^^^
Set 3: [155] lbs × [____] reps [○]  ← Pulse green
       ^^^^
```

### After Accept (Filled)
```
Set 1: [155] lbs × [____] reps [○]
Set 2: [155] lbs × [____] reps [○]
Set 3: [155] lbs × [____] reps [○]
```

Animation:
```css
@keyframes pulse-green {
  0%, 100% {
    background: white;
    border-color: #E5E7EB;
  }
  50% {
    background: #D1FAE5;
    border-color: #10B981;
  }
}
/* Duration: 1 second */
```

---

## 10. Explanation Panel Expand Animation

### Collapsed (Initial)
```
┌─────────────────────────────────────────────┐
│ ▸ Why this weight?                          │
└─────────────────────────────────────────────┘
```

### Expanding (Animation)
```
┌─────────────────────────────────────────────┐
│ ▾ Why this weight?                          │
│ ┌─────────────────────────────────────────┐ │
│ │                                          │ │ ← Slides down
│ │ (content fading in)                      │ │
│ │                                          │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Expanded (Final)
```
┌─────────────────────────────────────────────┐
│ ▾ Why this weight?                          │
│ ┌─────────────────────────────────────────┐ │
│ │ You hit the top of the target range on  │ │
│ │ all sets!                                │ │
│ │                                          │ │
│ │ • Average reps: 19.7                    │ │
│ │ • Target range: 18-20                   │ │
│ │ • Increase: 6.9%                        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

Animation:
- Duration: 200ms
- Easing: ease-out
- Icon rotates: ▸ → ▾
- Panel slides down with fade-in

---

## 11. Dismiss Animation

### Initial
```
┌─────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 💡 SUGGESTED WEIGHT              [×] ┃ │
│ ┃ (full card content)                   ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────────────┘
```

### Animating Out
```
┌─────────────────────────────────────────────┐
│        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│        ┃ 💡 SUGGESTED WEIGHT           [× │ → Slides right
│ (fading)                                    │    + fades out
│        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
└─────────────────────────────────────────────┘
```

### After Dismiss (Removed)
```
┌─────────────────────────────────────────────┐
│ (card removed from DOM)                      │
└─────────────────────────────────────────────┘
```

Animation:
- Duration: 300ms
- Transform: translateX(100%)
- Opacity: 1 → 0
- Easing: ease-out

---

## 12. Complete Exercise Card Context

### Full Exercise Card with Suggestion

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ [A1] Barbell Bench Press           1    │ │ ← Exercise Header
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Tempo: 211 | 3×18-20 | Rest: 1m         │ │ ← Exercise Details
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 💡 SUGGESTED WEIGHT              [×] ┃ │ ← SUGGESTION CARD
│ ┃                                       ┃ │
│ ┃ 155 lbs (+10) ✅                      ┃ │
│ ┃ Last week: 145×20, 145×20, 145×19    ┃ │
│ ┃ [Accept] [Modify]                     ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                              │
│ COMPLETE EACH SET                            │ ← Set Header
│                                              │
│ Set 1  [____] lbs  [____] reps  [○]         │ ← Set Inputs
│ Set 2  [____] lbs  [____] reps  [○]         │
│ Set 3  [____] lbs  [____] reps  [○]         │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ PREVIOUS SESSION                        │ │ ← Previous Results
│ │ 145×20, 145×20, 145×19                  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Spacing & Sizing Reference

### Component Dimensions

```
Suggestion Card:
├── Padding: 16px (desktop), 12px (mobile)
├── Border-radius: 12px
├── Shadow: 0 2px 8px rgba(0,0,0,0.1)
├── Left border: 4px solid (color varies)
│
├── Header:
│   ├── Height: 24px
│   ├── Margin-bottom: 12px
│   │
│   ├── Icon: 20px
│   ├── Label: 11px, uppercase, 700 weight
│   └── Dismiss button: 44×44px (touch target)
│
├── Weight Row:
│   ├── Height: Auto (wraps on mobile)
│   ├── Gap: 12px
│   │
│   ├── Weight value: 28px (desktop), 24px (mobile)
│   ├── Weight unit: 16px
│   ├── Change badge: 14px, padding 4px 8px
│   └── Confidence icon: 20px
│
├── Detail Box:
│   ├── Background: #F9FAFB
│   ├── Border-radius: 8px
│   ├── Padding: 12px
│   ├── Margin-bottom: 12px
│   │
│   ├── Label: 12px, 600 weight
│   └── Value: 14px, 500 weight
│
├── Explanation:
│   ├── Toggle button: 44px height (full width)
│   ├── Icon: 12px (rotates 90deg on expand)
│   └── Panel: 8px padding, 8px border-radius
│
└── Actions:
    ├── Button height: 48px (desktop), full width
    ├── Gap: 8px
    ├── Border-radius: 8px
    ├── Font-size: 16px, 600 weight
    │
    ├── Accept button:
    │   ├── Background: #4F46E5
    │   ├── Color: white
    │   └── Active: scale(0.98), #4338CA
    │
    └── Modify button:
        ├── Background: #F3F4F6
        ├── Border: 2px solid #E5E7EB
        ├── Color: #374151
        └── Active: scale(0.98), #E5E7EB
```

---

## Color Palette Reference

```
Confidence Levels:
├── High (90%+):
│   ├── Border: #10B981 (Green-600)
│   ├── Background: #D1FAE5 (Green-100)
│   ├── Text: #065F46 (Green-900)
│   └── Icon: ✅
│
├── Medium (70-89%):
│   ├── Border: #F59E0B (Yellow-600)
│   ├── Background: #FEF3C7 (Yellow-100)
│   ├── Text: #78350F (Yellow-900)
│   └── Icon: ℹ️
│
└── Low (<70%):
    ├── Border: #EF4444 (Red-600)
    ├── Background: #FEE2E2 (Red-100)
    ├── Text: #991B1B (Red-900)
    └── Icon: ⚠️

UI Elements:
├── Primary: #4F46E5 (Indigo-600)
├── Primary-dark: #4338CA (Indigo-700)
├── Success: #10B981 (Green-600)
├── Warning: #F59E0B (Yellow-600)
├── Danger: #EF4444 (Red-600)
├── Text-primary: #1F2937 (Gray-800)
├── Text-secondary: #6B7280 (Gray-500)
├── Background: #F3F4F6 (Gray-100)
├── Border: #E5E7EB (Gray-200)
└── Shadow: rgba(0, 0, 0, 0.1)
```

---

## Typography Reference

```
Font Stack:
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif

Sizes & Weights:
├── Suggestion Label: 11px, 700 weight, uppercase
├── Weight Value: 28px (desktop), 24px (mobile), 700 weight
├── Weight Unit: 16px, 600 weight
├── Change Badge: 14px, 600 weight
├── Detail Label: 12px, 600 weight
├── Detail Value: 14px, 500 weight
├── Explanation Text: 14px, 400 weight
├── Button Text: 16px, 600 weight
└── Icon Text: 20px (emoji)

Line Heights:
├── Headers: 1.3
├── Body text: 1.5
└── Buttons: 1.2
```

---

## Implementation Checklist

### HTML Structure
- [ ] Outer container with confidence class
- [ ] Header with title and dismiss button
- [ ] Body with weight row, detail box, explanation
- [ ] Actions with accept and modify buttons
- [ ] All buttons have min 44×44px touch targets
- [ ] ARIA labels for accessibility

### CSS Styling
- [ ] Auto-inject styles via `injectSuggestionCardStyles()`
- [ ] Three confidence variants (high, medium, low)
- [ ] Responsive breakpoints (mobile, tablet, desktop)
- [ ] Touch-friendly button sizes
- [ ] Smooth animations (200-300ms)
- [ ] Color contrast WCAG AA compliant

### JavaScript Functionality
- [ ] Import from `/src/ui/suggestionCard.js`
- [ ] Check `shouldShowSuggestion()` before rendering
- [ ] Call `renderSuggestionCard()` with callbacks
- [ ] Handle accept → auto-fill inputs
- [ ] Handle modify → prompt for custom weight
- [ ] Handle dismiss → animate out and save state
- [ ] Save to localStorage.suggestionStates

---

**Ready for Implementation** ✅

These mockups provide pixel-perfect visual references for implementing the suggestion card UI. All dimensions, colors, and interactions are specified for consistent implementation.

**Last Updated:** 2025-10-28T18:30:00Z
