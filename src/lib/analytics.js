/**
 * Google Tag Manager integration.
 * Container: GTM-52F4LH9W
 * 
 * Pushes events to dataLayer for:
 * - Screen views (virtual pageviews)
 * - Exercise interactions (start, complete, abandon)
 * - UI interactions (clicks on key elements)
 * - User state changes (login, signup, upgrade)
 * - Feature engagement (telemetry import, badges, programs)
 */

const GTM_ID = 'GTM-52F4LH9W';

// ═══════════════════════════════════
// GTM INITIALIZATION
// ═══════════════════════════════════

export function initGTM() {
  if (typeof window === 'undefined') return;
  if (window._gtmInitialized) return;

  // dataLayer init
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  // GTM script injection
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);

  // noscript iframe fallback
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);

  window._gtmInitialized = true;
}

// ═══════════════════════════════════
// DATALAYER PUSH
// ═══════════════════════════════════

function push(event, data = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

// ═══════════════════════════════════
// SCREEN VIEWS
// ═══════════════════════════════════

export function trackScreenView(screenName, extra = {}) {
  push('screen_view', {
    screen_name: screenName,
    ...extra,
  });
}

// ═══════════════════════════════════
// EXERCISE EVENTS
// ═══════════════════════════════════

export function trackExerciseStart(exerciseId, exerciseName, pedal, source = 'free_training') {
  push('exercise_start', {
    exercise_id: exerciseId,
    exercise_name: exerciseName,
    pedal_type: pedal || 'brake',
    exercise_source: source,
  });
}

export function trackExerciseComplete(exerciseId, exerciseName, score, grade, pedal, isNewBest = false) {
  push('exercise_complete', {
    exercise_id: exerciseId,
    exercise_name: exerciseName,
    score,
    grade,
    pedal_type: pedal || 'brake',
    is_new_best: isNewBest,
  });
}

export function trackExerciseAbandon(exerciseId, exerciseName) {
  push('exercise_abandon', {
    exercise_id: exerciseId,
    exercise_name: exerciseName,
  });
}

// ═══════════════════════════════════
// PROGRAM EVENTS
// ═══════════════════════════════════

export function trackProgramStart(programName, weekIdx, sessionIdx) {
  push('program_start', {
    program_name: programName,
    week: weekIdx + 1,
    session: sessionIdx + 1,
  });
}

export function trackProgramComplete(programName, weekIdx, sessionIdx, avgScore, passRate) {
  push('program_complete', {
    program_name: programName,
    week: weekIdx + 1,
    session: sessionIdx + 1,
    avg_score: avgScore,
    pass_rate: passRate,
  });
}

// ═══════════════════════════════════
// UI INTERACTIONS
// ═══════════════════════════════════

export function trackClick(elementName, category = 'ui', extra = {}) {
  push('ui_click', {
    element_name: elementName,
    click_category: category,
    ...extra,
  });
}

// ═══════════════════════════════════
// USER EVENTS
// ═══════════════════════════════════

export function trackLogin(method = 'email') {
  push('user_login', { method });
}

export function trackSignup(method = 'email') {
  push('user_signup', { method });
}

export function trackUpgrade(plan = 'premium') {
  push('user_upgrade', { plan });
}

// ═══════════════════════════════════
// FEATURE ENGAGEMENT
// ═══════════════════════════════════

export function trackTelemetryImport(sim, zonesCount) {
  push('telemetry_import', {
    simulator: sim,
    zones_created: zonesCount,
  });
}

export function trackBadgeUnlock(badgeId, badgeName, rarity) {
  push('badge_unlock', {
    badge_id: badgeId,
    badge_name: badgeName,
    rarity,
  });
}

export function trackShare(contentType, extra = {}) {
  push('content_share', {
    content_type: contentType,
    ...extra,
  });
}

export function trackThemeChange(theme) {
  push('theme_change', { theme });
}

export function trackGamepadConnect(wheelName) {
  push('gamepad_connect', { wheel_name: wheelName || 'unknown' });
}
