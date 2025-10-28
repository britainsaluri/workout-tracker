# Weight Suggestion UI/UX Design Specification

## Overview
This document defines the user interface and interaction patterns for displaying progressive overload weight suggestions in Week 2 workouts.

---

## 1. Display Location & Visibility Rules

### Location Hierarchy
```
Exercise Card (A1, A2, etc.)
├── Exercise Header
├── Exercise Details (Tempo, Sets/Reps, Rest)
├── 💡 Suggestion Card ← NEW COMPONENT
│   ├── Suggestion Header (weight, change)
│   ├── Performance Summary (Week 1 data)
│   └── Action Buttons (Accept/Modify/Dismiss)
└── Set Input Fields
    ├── Set 1 (pre-filled if accepted)
    ├── Set 2 (pre-filled if accepted)
    └── Set 3
```

### Visibility Rules
- **Show when:**
  - Current workout is Week 2 (or later)
  - Exercise exists in Week 1 with completed data
  - Calculation produces valid suggestion

- **Hide when:**
  - Current workout is Week 1
  - No Week 1 data exists for exercise
  - User has dismissed suggestion
  - User has already started entering weights

---

## 2. Visual Design Mockups

### Mobile Layout (< 600px)

```
┌─────────────────────────────────────────────┐
│ [A1] Barbell Bench Press                    │
│ Tempo: 211 | 3×18-20 | Rest: 1m             │
├─────────────────────────────────────────────┤
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 💡 SUGGESTED WEIGHT            [×]      │ │
│ │                                          │ │
│ │ 155 lbs (+10 from last week)    ✅      │ │
│ │                                          │ │
│ │ Last week: 145×20, 145×20, 145×19       │ │
│ │ ▸ Why this weight?                      │ │
│ │                                          │ │
│ │ [    Accept    ] [   Modify   ]         │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Set 1: [____] lbs × [____] reps [○]         │
│ Set 2: [____] lbs × [____] reps [○]         │
│ Set 3: [____] lbs × [____] reps [○]         │
└─────────────────────────────────────────────┘
```

### Tablet/Desktop Layout (≥ 600px)

```
┌──────────────────────────────────────────────────────────────┐
│ [A1] Barbell Bench Press                                     │
│ Tempo: 211 | Sets/Reps: 3×18-20 | Rest: 1m                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 💡 SUGGESTED WEIGHT                                  [×] │ │
│ │                                                           │ │
│ │ 155 lbs (+10 from last week)                       ✅    │ │
│ │                                                           │ │
│ │ Performance Analysis:                                     │ │
│ │ • Week 1: 145×20, 145×20, 145×19 (All sets completed)   │ │
│ │ • Confidence: High (consistent performance)              │ │
│ │ • Increase: +10 lbs based on successful completion       │ │
│ │                                                           │ │
│ │ [    Accept Suggestion    ] [  Modify  ] [  Dismiss  ]   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ Set 1: [____] lbs × [____] reps [○]                          │
│ Set 2: [____] lbs × [____] reps [○]                          │
│ Set 3: [____] lbs × [____] reps [○]                          │
└──────────────────────────────────────────────────────────────┘
```

### Compact/Collapsed View

```
┌─────────────────────────────────────────────┐
│ [A1] Barbell Bench Press                    │
│ Tempo: 211 | 3×18-20 | Rest: 1m             │
├─────────────────────────────────────────────┤
│ 💡 155 lbs (+10) ✅ [Accept] [Details ▾]    │
├─────────────────────────────────────────────┤
│ Set 1: [____] lbs × [____] reps [○]         │
│ Set 2: [____] lbs × [____] reps [○]         │
│ Set 3: [____] lbs × [____] reps [○]         │
└─────────────────────────────────────────────┘
```

---

## 3. Confidence Level Indicators

### Visual Design

```
┌─────────────────────────────────────────────┐
│ HIGH CONFIDENCE                              │
├─────────────────────────────────────────────┤
│ 💡 155 lbs (+10) ✅                         │
│ Based on solid performance                   │
│ Week 1: All sets completed within range     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ MEDIUM CONFIDENCE                            │
├─────────────────────────────────────────────┤
│ 💡 155 lbs (+10) ℹ️                         │
│ Estimated based on partial data              │
│ Week 1: Some sets incomplete                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ LOW CONFIDENCE                               │
├─────────────────────────────────────────────┤
│ 💡 155 lbs (+10) ⚠️                         │
│ Limited data - starting point only           │
│ Week 1: Minimal completion data             │
└─────────────────────────────────────────────┘
```

### Confidence Level Mapping

| Confidence | Icon | Color | Background | Description |
|-----------|------|-------|-----------|-------------|
| High (90%+) | ✅ | Green (#10B981) | Light green (#D1FAE5) | All sets completed, consistent performance |
| Medium (70-89%) | ℹ️ | Yellow (#F59E0B) | Light yellow (#FEF3C7) | Most sets completed, some variance |
| Low (<70%) | ⚠️ | Orange (#EF4444) | Light orange (#FEE2E2) | Limited data, high uncertainty |

---

## 4. Interactive States

### State 1: Initial Display (Collapsed)
```jsx
<SuggestionCard state="collapsed">
  💡 155 lbs (+10) ✅ [Accept] [Details ▾]
</SuggestionCard>
```

### State 2: Expanded View
```jsx
<SuggestionCard state="expanded">
  💡 SUGGESTED WEIGHT                    [×]

  155 lbs (+10 from last week)          ✅

  Last week: 145×20, 145×20, 145×19
  ▸ Why this weight?

  [    Accept    ] [   Modify   ]
</SuggestionCard>
```

### State 3: Explanation Expanded
```jsx
<SuggestionCard state="explanation-shown">
  💡 SUGGESTED WEIGHT                    [×]

  155 lbs (+10 from last week)          ✅

  Last week: 145×20, 145×20, 145×19

  ▾ Why this weight?
  ┌─────────────────────────────────────────┐
  │ • All 3 sets completed successfully     │
  │ • Average reps: 19.7 (near max of 20)   │
  │ • +10 lbs = ~6.9% increase (optimal)    │
  │ • Target: 155×18-20 reps                │
  └─────────────────────────────────────────┘

  [    Accept    ] [   Modify   ]
</SuggestionCard>
```

### State 4: Accepted (Pre-filled)
```jsx
<SuggestionCard state="accepted">
  ✅ Using suggested weight: 155 lbs [Change]
</SuggestionCard>

Set 1: [155] lbs × [____] reps [○]
Set 2: [155] lbs × [____] reps [○]
Set 3: [155] lbs × [____] reps [○]
```

### State 5: Modified
```jsx
<SuggestionCard state="modified">
  ℹ️ Using custom weight: 150 lbs
  (Suggested was 155 lbs)
</SuggestionCard>

Set 1: [150] lbs × [____] reps [○]
Set 2: [150] lbs × [____] reps [○]
Set 3: [150] lbs × [____] reps [○]
```

### State 6: Dismissed
```jsx
// Card hidden, show subtle "View suggestion" link
<div class="suggestion-dismissed">
  <a>💡 View suggestion</a>
</div>
```

---

## 5. User Interaction Flows

### Flow 1: Accept Suggestion
```
User sees suggestion → Taps "Accept" → Weights pre-filled → User enters reps
```

### Flow 2: Modify Suggestion
```
User sees suggestion → Taps "Modify" → Modal opens → User enters custom weight → Confirm → Weights pre-filled
```

### Flow 3: Reject/Dismiss
```
User sees suggestion → Taps "×" (dismiss) → Card hidden → Manual entry as usual
```

### Flow 4: View Explanation
```
User sees suggestion → Taps "Why this weight?" → Explanation expands → User reads → Makes decision
```

### Flow 5: Re-evaluate After Modification
```
User modified weight → After completing sets → Next week shows adjusted suggestion
```

---

## 6. Component Structure (React Native)

### File Structure
```
/src/components/
├── SuggestionCard/
│   ├── index.tsx
│   ├── SuggestionCard.tsx
│   ├── SuggestionHeader.tsx
│   ├── PerformanceSummary.tsx
│   ├── ConfidenceIndicator.tsx
│   ├── ActionButtons.tsx
│   ├── ExplanationPanel.tsx
│   └── styles.ts
└── ExerciseCard/
    └── (existing exercise card components)
```

### Component Hierarchy
```jsx
<SuggestionCard>
  <SuggestionHeader
    weight={155}
    change={10}
    unit="lbs"
    confidence="high"
    onDismiss={handleDismiss}
  />

  <PerformanceSummary
    week1Data={[
      { set: 1, weight: 145, reps: 20 },
      { set: 2, weight: 145, reps: 20 },
      { set: 3, weight: 145, reps: 19 }
    ]}
  />

  <ExplanationPanel
    isExpanded={showExplanation}
    explanation={{
      completionRate: 100,
      avgReps: 19.7,
      percentIncrease: 6.9,
      reasoning: "All sets completed near maximum reps"
    }}
  />

  <ActionButtons
    onAccept={handleAccept}
    onModify={handleModify}
    onDismiss={handleDismiss}
  />
</SuggestionCard>
```

---

## 7. CSS Styling (React Native StyleSheet)

### Color System
```typescript
const COLORS = {
  // Confidence levels
  high: {
    text: '#10B981',      // Green-600
    bg: '#D1FAE5',        // Green-100
    border: '#34D399'     // Green-400
  },
  medium: {
    text: '#F59E0B',      // Yellow-600
    bg: '#FEF3C7',        // Yellow-100
    border: '#FBBF24'     // Yellow-400
  },
  low: {
    text: '#EF4444',      // Red-600
    bg: '#FEE2E2',        // Red-100
    border: '#F87171'     // Red-400
  },

  // UI elements
  primary: '#007AFF',     // iOS Blue
  secondary: '#8E8E93',   // iOS Gray
  success: '#34C759',     // iOS Green
  background: '#F2F2F7',  // iOS Background
  card: '#FFFFFF',        // Card background
  text: '#000000',        // Primary text
  textSecondary: '#3C3C43', // Secondary text
  border: '#C6C6C8'       // Border color
};
```

### Base Styles
```typescript
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Suggestion Card Container
  suggestionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },

  // Confidence variants
  suggestionCardHigh: {
    backgroundColor: COLORS.high.bg,
    borderWidth: 1,
    borderColor: COLORS.high.border,
  },

  suggestionCardMedium: {
    backgroundColor: COLORS.medium.bg,
    borderWidth: 1,
    borderColor: COLORS.medium.border,
  },

  suggestionCardLow: {
    backgroundColor: COLORS.low.bg,
    borderWidth: 1,
    borderColor: COLORS.low.border,
  },

  // Header
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  suggestionIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  suggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: COLORS.textSecondary,
  },

  suggestionWeight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  suggestionChange: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  changePositive: {
    color: COLORS.success,
  },

  changeNeutral: {
    color: COLORS.secondary,
  },

  changeNegative: {
    color: COLORS.low.text,
  },

  confidenceIndicator: {
    fontSize: 18,
  },

  dismissButton: {
    padding: 4,
    marginLeft: 'auto',
  },

  dismissButtonText: {
    fontSize: 18,
    color: COLORS.secondary,
  },

  // Performance Summary
  performanceSummary: {
    marginTop: 8,
    marginBottom: 12,
  },

  performanceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  performanceLabel: {
    fontWeight: '600',
  },

  // Explanation Panel
  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  explanationToggleText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  explanationIcon: {
    fontSize: 12,
    marginRight: 6,
  },

  explanationPanel: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },

  explanationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  explanationBullet: {
    fontSize: 14,
    marginRight: 8,
    color: COLORS.textSecondary,
  },

  explanationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Touch target
  },

  acceptButton: {
    backgroundColor: COLORS.primary,
  },

  modifyButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  acceptButtonText: {
    color: '#FFFFFF',
  },

  modifyButtonText: {
    color: COLORS.primary,
  },

  // Compact/Collapsed View
  suggestionCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 12,
  },

  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  compactWeight: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  compactChange: {
    fontSize: 14,
    marginLeft: 4,
  },

  compactButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  compactButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    minHeight: 32,
  },

  compactButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Accepted State
  suggestionAccepted: {
    backgroundColor: COLORS.high.bg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  acceptedText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.high.text,
    flex: 1,
  },

  changeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  changeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Dismissed State
  suggestionDismissed: {
    padding: 8,
    marginBottom: 12,
  },

  dismissedLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
```

### Responsive Breakpoints
```typescript
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const BREAKPOINTS = {
  mobile: width < 600,
  tablet: width >= 600 && width < 1024,
  desktop: width >= 1024,
};

// Responsive styles
export const getResponsiveStyles = () => {
  const { mobile, tablet, desktop } = BREAKPOINTS;

  return StyleSheet.create({
    suggestionCard: {
      padding: mobile ? 12 : 16,
      marginBottom: mobile ? 8 : 12,
    },

    suggestionHeader: {
      flexDirection: mobile ? 'column' : 'row',
      alignItems: mobile ? 'flex-start' : 'center',
    },

    actionButtons: {
      flexDirection: mobile ? 'column' : 'row',
      gap: mobile ? 8 : 12,
    },

    explanationPanel: {
      padding: mobile ? 8 : 12,
    },
  });
};
```

---

## 8. Animation & Transitions

### Entrance Animation
```typescript
import { Animated } from 'react-native';

const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(-20)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start();
}, []);

// Apply to suggestion card
<Animated.View
  style={{
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  }}
>
  <SuggestionCard />
</Animated.View>
```

### Expand/Collapse Animation
```typescript
const heightAnim = useRef(new Animated.Value(0)).current;

const toggleExpand = () => {
  Animated.timing(heightAnim, {
    toValue: isExpanded ? 0 : 100,
    duration: 200,
    useNativeDriver: false,
  }).start();

  setIsExpanded(!isExpanded);
};
```

### Dismiss Animation
```typescript
const dismissAnim = useRef(new Animated.Value(0)).current;

const handleDismiss = () => {
  Animated.timing(dismissAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start(() => {
    onDismiss();
  });
};

// Apply transform
<Animated.View
  style={{
    opacity: dismissAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [{
      translateX: dismissAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100],
      }),
    }],
  }}
>
  <SuggestionCard />
</Animated.View>
```

---

## 9. Accessibility Features

### Screen Reader Support
```jsx
<View
  accessible={true}
  accessibilityLabel={`Suggested weight: ${weight} ${unit}, increase of ${change} ${unit} from last week`}
  accessibilityHint="Double tap to accept suggestion or explore modification options"
  accessibilityRole="button"
>
  <SuggestionCard />
</View>
```

### Touch Targets
- Minimum size: 44×44 pixels (iOS) / 48×48 pixels (Android)
- Adequate spacing between interactive elements (8-12px)
- Clear visual feedback on press

### Color Contrast
- Text: WCAG AA compliant (4.5:1 ratio minimum)
- Buttons: 3:1 ratio minimum for interactive elements
- Icons: Clear and distinguishable from background

### Focus Management
```jsx
const acceptButtonRef = useRef(null);

useEffect(() => {
  if (shouldFocus) {
    acceptButtonRef.current?.focus();
  }
}, [shouldFocus]);

<TouchableOpacity
  ref={acceptButtonRef}
  accessible={true}
  accessibilityRole="button"
>
  <Text>Accept</Text>
</TouchableOpacity>
```

---

## 10. Error & Edge Cases

### No Week 1 Data
```jsx
// No suggestion card shown
// User enters weights manually as usual
```

### Calculation Failure
```jsx
<View style={styles.suggestionError}>
  <Text>⚠️ Unable to calculate suggestion</Text>
  <Text style={styles.errorSubtext}>
    Enter weights manually for this exercise
  </Text>
</View>
```

### Incomplete Week 1 Data
```jsx
<SuggestionCard confidence="low">
  ⚠️ 155 lbs (+10) - Limited data

  Week 1: 145×20 (only 1 set completed)

  This is an estimated starting point.

  [    Use This    ] [  Enter Manually  ]
</SuggestionCard>
```

### Network/Loading State
```jsx
<View style={styles.suggestionLoading}>
  <ActivityIndicator size="small" color={COLORS.primary} />
  <Text>Calculating suggestion...</Text>
</View>
```

---

## 11. Implementation Checklist

### Phase 1: Core Components
- [ ] Create `SuggestionCard` component
- [ ] Create `SuggestionHeader` component
- [ ] Create `PerformanceSummary` component
- [ ] Create `ActionButtons` component
- [ ] Implement basic styling

### Phase 2: Interactions
- [ ] Accept suggestion (pre-fill weights)
- [ ] Modify suggestion (modal/dialog)
- [ ] Dismiss suggestion (hide card)
- [ ] View explanation (expand/collapse)
- [ ] Re-show dismissed suggestion

### Phase 3: Confidence System
- [ ] Implement confidence calculation
- [ ] Add confidence indicators (icons, colors)
- [ ] Display confidence explanations
- [ ] Style variants for each level

### Phase 4: Responsive Design
- [ ] Mobile layout (< 600px)
- [ ] Tablet layout (600-1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Compact/collapsed view
- [ ] Touch optimization

### Phase 5: Animations
- [ ] Entrance animation
- [ ] Expand/collapse animation
- [ ] Dismiss animation
- [ ] Button press feedback
- [ ] Loading states

### Phase 6: Accessibility
- [ ] Screen reader support
- [ ] Touch target sizing
- [ ] Color contrast validation
- [ ] Focus management
- [ ] Keyboard navigation

### Phase 7: Testing
- [ ] Unit tests for components
- [ ] Integration tests for interactions
- [ ] Visual regression tests
- [ ] Accessibility tests
- [ ] Performance tests

---

## 12. Future Enhancements

### Version 1.1
- Swipe gestures to accept/dismiss
- Haptic feedback on interactions
- Customizable suggestion algorithm
- Suggestion history view

### Version 1.2
- AI-powered suggestions (ML model)
- Personalized confidence thresholds
- Suggestion trends/analytics
- Export suggestion data

### Version 2.0
- Multi-week progression visualization
- Predictive modeling for future weeks
- Integration with fitness tracking APIs
- Social features (compare with others)

---

## 13. Design Tokens

### Typography
```typescript
export const TYPOGRAPHY = {
  suggestionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  suggestionWeight: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 20,
    fontWeight: 'bold',
  },

  suggestionChange: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 16,
    fontWeight: '600',
  },

  performanceText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 14,
    fontWeight: '400',
  },

  explanationText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 16,
    fontWeight: '600',
  },
};
```

### Spacing
```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};
```

### Border Radius
```typescript
export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 9999,
};
```

### Shadows
```typescript
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
```

---

## 14. Example Implementation

### Complete SuggestionCard Component
```tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';

interface SuggestionCardProps {
  suggestedWeight: number;
  change: number;
  unit: 'lbs' | 'kg';
  confidence: 'high' | 'medium' | 'low';
  week1Performance: Array<{ set: number; weight: number; reps: number }>;
  onAccept: (weight: number) => void;
  onModify: () => void;
  onDismiss: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestedWeight,
  change,
  unit,
  confidence,
  week1Performance,
  onAccept,
  onModify,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getConfidenceIcon = () => {
    switch (confidence) {
      case 'high': return '✅';
      case 'medium': return 'ℹ️';
      case 'low': return '⚠️';
    }
  };

  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high': return COLORS.high;
      case 'medium': return COLORS.medium;
      case 'low': return COLORS.low;
    }
  };

  const getChangeColor = () => {
    if (change > 0) return styles.changePositive;
    if (change < 0) return styles.changeNegative;
    return styles.changeNeutral;
  };

  const formatPerformance = () => {
    return week1Performance
      .map(p => `${p.weight}×${p.reps}`)
      .join(', ');
  };

  const confidenceColors = getConfidenceColor();

  return (
    <Animated.View
      style={[
        styles.suggestionCard,
        { backgroundColor: confidenceColors.bg },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.suggestionHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.suggestionIcon}>💡</Text>
          <Text style={styles.suggestionLabel}>SUGGESTED WEIGHT</Text>
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          accessible={true}
          accessibilityLabel="Dismiss suggestion"
          accessibilityRole="button"
        >
          <Text style={styles.dismissButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Weight Display */}
      <View style={styles.weightRow}>
        <Text style={styles.suggestionWeight}>
          {suggestedWeight} {unit}
        </Text>
        <Text style={[styles.suggestionChange, getChangeColor()]}>
          ({change > 0 ? '+' : ''}{change} from last week)
        </Text>
        <Text style={styles.confidenceIndicator}>
          {getConfidenceIcon()}
        </Text>
      </View>

      {/* Performance Summary */}
      <View style={styles.performanceSummary}>
        <Text style={styles.performanceText}>
          <Text style={styles.performanceLabel}>Last week: </Text>
          {formatPerformance()}
        </Text>
      </View>

      {/* Explanation Toggle */}
      <TouchableOpacity
        style={styles.explanationToggle}
        onPress={() => setShowExplanation(!showExplanation)}
      >
        <Text style={styles.explanationIcon}>
          {showExplanation ? '▾' : '▸'}
        </Text>
        <Text style={styles.explanationToggleText}>
          Why this weight?
        </Text>
      </TouchableOpacity>

      {/* Explanation Panel */}
      {showExplanation && (
        <View style={styles.explanationPanel}>
          <View style={styles.explanationItem}>
            <Text style={styles.explanationBullet}>•</Text>
            <Text style={styles.explanationText}>
              All {week1Performance.length} sets completed successfully
            </Text>
          </View>
          <View style={styles.explanationItem}>
            <Text style={styles.explanationBullet}>•</Text>
            <Text style={styles.explanationText}>
              Average reps: {
                (week1Performance.reduce((sum, p) => sum + p.reps, 0) /
                 week1Performance.length).toFixed(1)
              }
            </Text>
          </View>
          <View style={styles.explanationItem}>
            <Text style={styles.explanationBullet}>•</Text>
            <Text style={styles.explanationText}>
              {change > 0 ? '+' : ''}{change} {unit} = ~
              {((change / week1Performance[0].weight) * 100).toFixed(1)}% increase
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => onAccept(suggestedWeight)}
          accessible={true}
          accessibilityLabel={`Accept suggested weight of ${suggestedWeight} ${unit}`}
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, styles.acceptButtonText]}>
            Accept
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.modifyButton]}
          onPress={onModify}
          accessible={true}
          accessibilityLabel="Modify suggested weight"
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, styles.modifyButtonText]}>
            Modify
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Color constants (same as above)
const COLORS = {
  high: {
    text: '#10B981',
    bg: '#D1FAE5',
    border: '#34D399'
  },
  medium: {
    text: '#F59E0B',
    bg: '#FEF3C7',
    border: '#FBBF24'
  },
  low: {
    text: '#EF4444',
    bg: '#FEE2E2',
    border: '#F87171'
  },
  primary: '#007AFF',
  secondary: '#8E8E93',
  success: '#34C759',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#3C3C43',
  border: '#C6C6C8'
};

// Styles (same as above StyleSheet)
const styles = StyleSheet.create({
  // ... (all styles from section 7)
});
```

---

## 15. Testing Scenarios

### Visual Testing
- [ ] Test on iPhone SE (smallest screen)
- [ ] Test on iPhone 15 Pro (standard)
- [ ] Test on iPad (tablet)
- [ ] Test in landscape orientation
- [ ] Test with large text (accessibility)
- [ ] Test with dark mode

### Interaction Testing
- [ ] Accept suggestion flow
- [ ] Modify suggestion flow
- [ ] Dismiss suggestion flow
- [ ] Re-show dismissed suggestion
- [ ] Expand/collapse explanation
- [ ] Multiple exercises with suggestions
- [ ] Mixed exercises (some with, some without suggestions)

### Edge Case Testing
- [ ] No Week 1 data
- [ ] Incomplete Week 1 data
- [ ] Very large weight increases
- [ ] Very small weight increases
- [ ] Negative changes (deload)
- [ ] Same weight recommendation
- [ ] Calculation errors
- [ ] Network timeout

---

## Summary

This UI design provides:
1. **Clear visual hierarchy** with confidence indicators
2. **Touch-friendly interactions** for mobile
3. **Progressive disclosure** (compact → expanded → explanation)
4. **Accessible design** with screen reader support
5. **Smooth animations** for polished UX
6. **Responsive layouts** for all screen sizes
7. **Error handling** for edge cases
8. **Future-proof architecture** for enhancements

The design balances **usability** (quick accept/dismiss) with **transparency** (detailed explanations) to build user trust in the suggestion system.
