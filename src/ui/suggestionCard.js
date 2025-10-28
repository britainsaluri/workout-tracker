/**
 * Weight Suggestion Card UI Component
 *
 * Displays progressive overload weight suggestions for Week 2+ workouts
 * with confidence indicators and user interaction controls.
 *
 * @module ui/suggestionCard
 * @version 1.0.0
 */

import { suggestionEngine, getSuggestionForExercise } from '../utils/weightSuggestions.js';

/**
 * Render a suggestion card for an exercise
 *
 * @param {Object} suggestion - Suggestion data from SuggestionEngine
 * @param {Function} onAccept - Callback when user accepts suggestion
 * @param {Function} onModify - Callback when user wants to modify suggestion
 * @param {Function} onDismiss - Callback when user dismisses suggestion
 * @returns {HTMLElement} Suggestion card DOM element
 *
 * @example
 * const suggestion = getSuggestionForExercise("sheet1", 1, "A1", "3x18-20");
 * const card = renderSuggestionCard(suggestion, handleAccept, handleModify, handleDismiss);
 * container.appendChild(card);
 */
export function renderSuggestionCard(suggestion, onAccept, onModify, onDismiss) {
  if (!suggestion) return null;

  // Create card container
  const card = document.createElement('div');
  card.className = `suggestion-card confidence-${suggestion.confidence}`;
  card.setAttribute('data-exercise-id', suggestion.exerciseId);
  card.setAttribute('data-suggestion-state', 'active');

  // Get confidence icon
  const confidenceIcon = getConfidenceIcon(suggestion.confidence);

  // Format previous results for display
  const previousResults = formatPreviousResults(suggestion.week1Results.sets);

  // Get reason message
  const reasonMessage = suggestionEngine.getReasonMessage(suggestion.reason);

  // Build card HTML
  card.innerHTML = `
    <div class="suggestion-header">
      <div class="suggestion-title">
        <span class="suggestion-icon">💡</span>
        <span class="suggestion-label">SUGGESTED WEIGHT</span>
      </div>
      <button
        class="suggestion-dismiss"
        aria-label="Dismiss suggestion"
        title="Dismiss suggestion"
      >
        <span>✕</span>
      </button>
    </div>

    <div class="suggestion-body">
      <div class="suggestion-weight-row">
        <div class="suggested-weight">
          <span class="weight-value">${suggestion.suggestedWeight}</span>
          <span class="weight-unit">lbs</span>
        </div>
        <div class="weight-change ${suggestion.increaseAmount > 0 ? 'positive' : suggestion.increaseAmount < 0 ? 'negative' : 'neutral'}">
          ${suggestion.increaseAmount > 0 ? '+' : ''}${suggestion.increaseAmount} from last week
        </div>
        <div class="confidence-badge">
          ${confidenceIcon}
        </div>
      </div>

      <div class="suggestion-detail">
        <div class="detail-label">Last week:</div>
        <div class="detail-value">${previousResults}</div>
      </div>

      <div class="suggestion-explanation">
        <button class="explanation-toggle" type="button">
          <span class="toggle-icon">▸</span>
          <span class="toggle-text">Why this weight?</span>
        </button>
        <div class="explanation-panel" style="display: none;">
          <div class="explanation-content">
            <p>${reasonMessage}</p>
            <ul>
              <li>Average reps: ${suggestion.week1Results.avgReps}</li>
              <li>Target range: ${suggestion.week1Results.targetRange}</li>
              <li>Increase: ${suggestion.increasePercentage}%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="suggestion-actions">
      <button class="btn-accept" type="button">
        <span class="btn-icon">✓</span>
        <span class="btn-text">Accept</span>
      </button>
      <button class="btn-modify" type="button">
        <span class="btn-icon">✎</span>
        <span class="btn-text">Modify</span>
      </button>
    </div>
  `;

  // Attach event listeners
  attachCardEventListeners(card, suggestion, onAccept, onModify, onDismiss);

  return card;
}

/**
 * Attach event listeners to suggestion card buttons
 *
 * @param {HTMLElement} card - Card DOM element
 * @param {Object} suggestion - Suggestion data
 * @param {Function} onAccept - Accept callback
 * @param {Function} onModify - Modify callback
 * @param {Function} onDismiss - Dismiss callback
 */
function attachCardEventListeners(card, suggestion, onAccept, onModify, onDismiss) {
  // Accept button
  const acceptBtn = card.querySelector('.btn-accept');
  acceptBtn.addEventListener('click', () => {
    handleAcceptSuggestion(suggestion.exerciseId, suggestion.suggestedWeight);
    if (onAccept) onAccept(suggestion);

    // Update card state
    updateCardState(card, 'accepted', suggestion.suggestedWeight);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  });

  // Modify button
  const modifyBtn = card.querySelector('.btn-modify');
  modifyBtn.addEventListener('click', () => {
    handleModifySuggestion(suggestion.exerciseId, suggestion.suggestedWeight);
    if (onModify) onModify(suggestion);
  });

  // Dismiss button
  const dismissBtn = card.querySelector('.suggestion-dismiss');
  dismissBtn.addEventListener('click', () => {
    handleDismissSuggestion(suggestion.exerciseId);
    if (onDismiss) onDismiss(suggestion);

    // Animate out and remove
    animateCardDismiss(card);
  });

  // Explanation toggle
  const toggleBtn = card.querySelector('.explanation-toggle');
  const panel = card.querySelector('.explanation-panel');
  const icon = card.querySelector('.toggle-icon');

  toggleBtn.addEventListener('click', () => {
    const isExpanded = panel.style.display !== 'none';

    if (isExpanded) {
      panel.style.display = 'none';
      icon.textContent = '▸';
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      panel.style.display = 'block';
      icon.textContent = '▾';
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  });
}

/**
 * Handle accepting a weight suggestion
 * Automatically fills weight inputs for all sets
 *
 * @param {string} exerciseId - Exercise identifier
 * @param {number} weight - Suggested weight to apply
 */
export function handleAcceptSuggestion(exerciseId, weight) {
  // Find all weight inputs for this exercise
  const exerciseCard = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
  if (!exerciseCard) return;

  // Find all weight input fields within the exercise card
  const weightInputs = exerciseCard.querySelectorAll('.weight-input');

  weightInputs.forEach(input => {
    input.value = weight;

    // Trigger input event to save state
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);

    // Add visual feedback
    input.classList.add('suggestion-applied');
    setTimeout(() => {
      input.classList.remove('suggestion-applied');
    }, 1000);
  });

  // Save to localStorage
  saveSuggestionState(exerciseId, 'accepted', weight);

  console.log(`[SuggestionCard] Accepted suggestion for ${exerciseId}: ${weight} lbs`);
}

/**
 * Handle modifying a weight suggestion
 * Opens a modal/prompt for custom weight input
 *
 * @param {string} exerciseId - Exercise identifier
 * @param {number} suggestedWeight - Original suggested weight
 */
export function handleModifySuggestion(exerciseId, suggestedWeight) {
  // Prompt user for custom weight
  const customWeight = prompt(
    `Enter custom weight for ${exerciseId}\n(Suggested: ${suggestedWeight} lbs)`,
    suggestedWeight
  );

  if (customWeight !== null && !isNaN(parseFloat(customWeight))) {
    const weight = parseFloat(customWeight);

    // Apply custom weight
    handleAcceptSuggestion(exerciseId, weight);

    // Save as modified
    saveSuggestionState(exerciseId, 'modified', weight);

    console.log(`[SuggestionCard] Modified suggestion for ${exerciseId}: ${weight} lbs`);
  }
}

/**
 * Handle dismissing a weight suggestion
 * Hides the suggestion card but allows re-showing
 *
 * @param {string} exerciseId - Exercise identifier
 */
export function handleDismissSuggestion(exerciseId) {
  // Save dismissed state
  saveSuggestionState(exerciseId, 'dismissed', null);

  console.log(`[SuggestionCard] Dismissed suggestion for ${exerciseId}`);
}

/**
 * Update suggestion card visual state
 *
 * @param {HTMLElement} card - Card DOM element
 * @param {string} state - New state ('accepted', 'modified', 'dismissed')
 * @param {number} weight - Applied weight
 */
function updateCardState(card, state, weight) {
  card.setAttribute('data-suggestion-state', state);

  if (state === 'accepted') {
    // Replace card content with acceptance message
    const body = card.querySelector('.suggestion-body');
    body.innerHTML = `
      <div class="suggestion-accepted">
        <span class="accepted-icon">✅</span>
        <span class="accepted-text">Using suggested weight: ${weight} lbs</span>
      </div>
    `;

    // Hide actions
    const actions = card.querySelector('.suggestion-actions');
    actions.style.display = 'none';
  }
}

/**
 * Animate suggestion card dismissal
 *
 * @param {HTMLElement} card - Card DOM element
 */
function animateCardDismiss(card) {
  card.style.transition = 'opacity 0.3s, transform 0.3s';
  card.style.opacity = '0';
  card.style.transform = 'translateX(100%)';

  setTimeout(() => {
    card.remove();
  }, 300);
}

/**
 * Save suggestion state to localStorage
 *
 * @param {string} exerciseId - Exercise identifier
 * @param {string} action - Action taken ('accepted', 'modified', 'dismissed')
 * @param {number|null} weight - Applied weight
 */
function saveSuggestionState(exerciseId, action, weight) {
  try {
    const stateStr = localStorage.getItem('workoutTrackerState');
    const state = stateStr ? JSON.parse(stateStr) : {};

    if (!state.suggestionStates) {
      state.suggestionStates = {};
    }

    state.suggestionStates[exerciseId] = {
      action,
      weight,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('workoutTrackerState', JSON.stringify(state));
  } catch (error) {
    console.error('[SuggestionCard] Failed to save suggestion state:', error);
  }
}

/**
 * Check if suggestion was already dismissed
 *
 * @param {string} exerciseId - Exercise identifier
 * @returns {boolean} True if dismissed
 */
export function isSuggestionDismissed(exerciseId) {
  try {
    const stateStr = localStorage.getItem('workoutTrackerState');
    if (!stateStr) return false;

    const state = JSON.parse(stateStr);
    const suggestionStates = state.suggestionStates || {};

    return suggestionStates[exerciseId]?.action === 'dismissed';
  } catch (error) {
    return false;
  }
}

/**
 * Get confidence icon based on confidence level
 *
 * @param {string} confidence - Confidence level ('high', 'medium', 'low')
 * @returns {string} Emoji icon
 */
function getConfidenceIcon(confidence) {
  const icons = {
    'high': '✅',
    'medium': 'ℹ️',
    'low': '⚠️'
  };

  return icons[confidence] || '❓';
}

/**
 * Format previous results for display
 *
 * @param {Array<{weight: number, reps: number}>} sets - Week 1 set data
 * @returns {string} Formatted string (e.g., "145×20, 145×20, 145×19")
 */
function formatPreviousResults(sets) {
  if (!sets || sets.length === 0) {
    return 'No previous data';
  }

  return sets.map(set => `${set.weight}×${set.reps}`).join(', ');
}

/**
 * Create compact suggestion card (collapsed view)
 *
 * @param {Object} suggestion - Suggestion data
 * @param {Function} onExpand - Callback when user expands
 * @returns {HTMLElement} Compact card DOM element
 */
export function renderCompactSuggestionCard(suggestion, onExpand) {
  const card = document.createElement('div');
  card.className = `suggestion-card-compact confidence-${suggestion.confidence}`;
  card.setAttribute('data-exercise-id', suggestion.exerciseId);

  const confidenceIcon = getConfidenceIcon(suggestion.confidence);

  card.innerHTML = `
    <div class="compact-left">
      <span class="compact-icon">💡</span>
      <span class="compact-weight">${suggestion.suggestedWeight} lbs</span>
      <span class="compact-change">(+${suggestion.increaseAmount})</span>
      <span class="compact-confidence">${confidenceIcon}</span>
    </div>
    <div class="compact-right">
      <button class="btn-compact-accept" type="button">Accept</button>
      <button class="btn-compact-expand" type="button">Details ▾</button>
    </div>
  `;

  // Event listeners
  card.querySelector('.btn-compact-accept').addEventListener('click', (e) => {
    e.stopPropagation();
    handleAcceptSuggestion(suggestion.exerciseId, suggestion.suggestedWeight);
  });

  card.querySelector('.btn-compact-expand').addEventListener('click', () => {
    if (onExpand) onExpand(suggestion);
  });

  return card;
}

/**
 * Batch render suggestions for multiple exercises
 * Performance optimized for 5-10 exercises (<100ms)
 *
 * @param {Map<string, Object>} suggestions - Map of exerciseId -> suggestion
 * @param {Function} onAccept - Accept callback
 * @param {Function} onModify - Modify callback
 * @param {Function} onDismiss - Dismiss callback
 * @returns {DocumentFragment} Fragment with all cards
 */
export function renderSuggestionCardsBatch(suggestions, onAccept, onModify, onDismiss) {
  const fragment = document.createDocumentFragment();

  suggestions.forEach((suggestion, exerciseId) => {
    // Skip if dismissed
    if (isSuggestionDismissed(exerciseId)) {
      return;
    }

    const card = renderSuggestionCard(suggestion, onAccept, onModify, onDismiss);
    if (card) {
      fragment.appendChild(card);
    }
  });

  return fragment;
}

/**
 * Add CSS styles for suggestion cards dynamically
 * Called once on module load
 */
export function injectSuggestionCardStyles() {
  const styleId = 'suggestion-card-styles';

  // Check if already injected
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Suggestion Card Container */
    .suggestion-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
    }

    /* Confidence Level Styling */
    .suggestion-card.confidence-high {
      border-left: 4px solid #10B981;
      background: linear-gradient(to right, #D1FAE5 0%, #FFFFFF 10%);
    }

    .suggestion-card.confidence-medium {
      border-left: 4px solid #F59E0B;
      background: linear-gradient(to right, #FEF3C7 0%, #FFFFFF 10%);
    }

    .suggestion-card.confidence-low {
      border-left: 4px solid #EF4444;
      background: linear-gradient(to right, #FEE2E2 0%, #FFFFFF 10%);
    }

    /* Header */
    .suggestion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .suggestion-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suggestion-icon {
      font-size: 20px;
    }

    .suggestion-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6B7280;
    }

    .suggestion-dismiss {
      background: none;
      border: none;
      font-size: 24px;
      color: #9CA3AF;
      cursor: pointer;
      padding: 4px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .suggestion-dismiss:active {
      transform: scale(0.95);
    }

    /* Body */
    .suggestion-body {
      margin-bottom: 16px;
    }

    .suggestion-weight-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .suggested-weight {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .weight-value {
      font-size: 28px;
      font-weight: 700;
      color: #1F2937;
    }

    .weight-unit {
      font-size: 16px;
      font-weight: 600;
      color: #6B7280;
    }

    .weight-change {
      font-size: 14px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .weight-change.positive {
      color: #10B981;
      background: #D1FAE5;
    }

    .weight-change.negative {
      color: #EF4444;
      background: #FEE2E2;
    }

    .weight-change.neutral {
      color: #6B7280;
      background: #F3F4F6;
    }

    .confidence-badge {
      font-size: 20px;
      margin-left: auto;
    }

    /* Detail */
    .suggestion-detail {
      padding: 12px;
      background: #F9FAFB;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .detail-label {
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 14px;
      font-weight: 500;
      color: #1F2937;
    }

    /* Explanation */
    .suggestion-explanation {
      margin-bottom: 12px;
    }

    .explanation-toggle {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      cursor: pointer;
      color: #4F46E5;
      font-weight: 500;
      font-size: 14px;
      min-height: 44px;
      width: 100%;
      text-align: left;
    }

    .toggle-icon {
      font-size: 12px;
      transition: transform 0.2s;
    }

    .explanation-panel {
      padding: 12px;
      background: #F9FAFB;
      border-radius: 8px;
      margin-top: 8px;
    }

    .explanation-content p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 8px;
    }

    .explanation-content ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .explanation-content li {
      font-size: 13px;
      color: #6B7280;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }

    .explanation-content li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #9CA3AF;
    }

    /* Actions */
    .suggestion-actions {
      display: flex;
      gap: 8px;
    }

    .suggestion-actions button {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-accept {
      background: #4F46E5;
      border: none;
      color: white;
    }

    .btn-accept:active {
      transform: scale(0.98);
      background: #4338CA;
    }

    .btn-modify {
      background: #F3F4F6;
      border: 2px solid #E5E7EB;
      color: #374151;
    }

    .btn-modify:active {
      transform: scale(0.98);
      background: #E5E7EB;
    }

    /* Accepted State */
    .suggestion-accepted {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #D1FAE5;
      border-radius: 8px;
    }

    .accepted-icon {
      font-size: 24px;
    }

    .accepted-text {
      font-size: 16px;
      font-weight: 600;
      color: #065F46;
    }

    /* Compact Card */
    .suggestion-card-compact {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-left: 3px solid transparent;
    }

    .suggestion-card-compact.confidence-high {
      border-left-color: #10B981;
    }

    .suggestion-card-compact.confidence-medium {
      border-left-color: #F59E0B;
    }

    .suggestion-card-compact.confidence-low {
      border-left-color: #EF4444;
    }

    .compact-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .compact-icon {
      font-size: 18px;
    }

    .compact-weight {
      font-size: 16px;
      font-weight: 600;
      color: #1F2937;
    }

    .compact-change {
      font-size: 14px;
      color: #10B981;
    }

    .compact-confidence {
      font-size: 16px;
    }

    .compact-right {
      display: flex;
      gap: 8px;
    }

    .compact-right button {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      min-height: 36px;
      border: none;
    }

    .btn-compact-accept {
      background: #4F46E5;
      color: white;
    }

    .btn-compact-expand {
      background: #F3F4F6;
      color: #374151;
    }

    /* Visual Feedback */
    .suggestion-applied {
      animation: pulse-green 1s ease-out;
    }

    @keyframes pulse-green {
      0%, 100% {
        background: white;
        border-color: var(--border);
      }
      50% {
        background: #D1FAE5;
        border-color: #10B981;
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .suggestion-actions {
        flex-direction: column;
      }

      .weight-value {
        font-size: 24px;
      }

      .suggestion-card {
        padding: 12px;
      }
    }
  `;

  document.head.appendChild(style);
}

// Auto-inject styles on module load
if (typeof document !== 'undefined') {
  injectSuggestionCardStyles();
}
