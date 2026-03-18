/**
 * Virtual Gamepad — patches navigator.getGamepads() to inject a simulated controller.
 * Works globally — once activated, all readPedal/readSteering/readShifterButtons calls
 * in the app will read from this virtual gamepad.
 */

import { WHEEL_PROFILES } from './wheelProfiles';

// Store the real getGamepads
const _realGetGamepads = navigator.getGamepads.bind(navigator);

// Virtual gamepad state (global singleton)
let _active = false;
let _profileId = 'logitech_g29';
let _axes = new Float64Array(8);
let _buttons = Array.from({ length: 20 }, () => ({ pressed: false, value: 0, touched: false }));
let _id = '';
let _listeners = [];

function _getProfile() {
  return WHEEL_PROFILES.find(p => p.id === _profileId) || WHEEL_PROFILES[0];
}

function _buildGamepadObject() {
  return {
    id: _id,
    index: 0,
    connected: true,
    timestamp: performance.now(),
    mapping: '',
    axes: [..._axes],
    buttons: _buttons.map(b => ({
      pressed: b.pressed,
      value: b.value,
      touched: b.touched,
    })),
    hapticActuators: [],
    vibrationActuator: null,
  };
}

function _patchedGetGamepads() {
  if (!_active) return _realGetGamepads();
  // Return array with virtual at slot 0
  const result = [_buildGamepadObject(), null, null, null];
  return result;
}

export function activateVirtualGamepad(profileId) {
  _profileId = profileId || 'logitech_g29';
  const profile = _getProfile();
  _id = `Virtual ${profile.brand} ${profile.model} (Driver Trainer Simulator)`;

  // Reset axes to "released" state based on profile
  _axes.fill(0);
  const cfg = profile.defaultConfig;
  if (cfg.brake.axisIndex >= 0) _axes[cfg.brake.axisIndex] = cfg.brake.calibMin;
  if (cfg.throttle.axisIndex >= 0) _axes[cfg.throttle.axisIndex] = cfg.throttle.calibMin;
  if (cfg.clutch.axisIndex >= 0) _axes[cfg.clutch.axisIndex] = cfg.clutch.calibMin;
  if (cfg.steering.axisIndex >= 0) _axes[cfg.steering.axisIndex] = 0; // center

  // Reset buttons
  _buttons = Array.from({ length: 20 }, () => ({ pressed: false, value: 0, touched: false }));

  _active = true;
  navigator.getGamepads = _patchedGetGamepads;

  // Fire connection event
  const evt = new Event('gamepadconnected');
  evt.gamepad = _buildGamepadObject();
  window.dispatchEvent(evt);

  _notifyListeners();
}

export function deactivateVirtualGamepad() {
  _active = false;
  navigator.getGamepads = _realGetGamepads;

  const evt = new Event('gamepaddisconnected');
  evt.gamepad = { id: _id, index: 0 };
  window.dispatchEvent(evt);

  _notifyListeners();
}

export function isVirtualActive() { return _active; }
export function getVirtualProfileId() { return _profileId; }
export function getVirtualId() { return _id; }

export function setVirtualAxis(index, value) {
  if (index >= 0 && index < _axes.length) {
    _axes[index] = parseFloat(value);
  }
}

export function pressVirtualButton(index) {
  if (index >= 0 && index < _buttons.length) {
    _buttons[index] = { pressed: true, value: 1, touched: true };
  }
}

export function releaseVirtualButton(index) {
  if (index >= 0 && index < _buttons.length) {
    _buttons[index] = { pressed: false, value: 0, touched: false };
  }
}

export function tapVirtualButton(index, duration = 120) {
  pressVirtualButton(index);
  setTimeout(() => releaseVirtualButton(index), duration);
}

/** Set a pedal by name using the profile's axis config */
export function setVirtualPedal(pedalName, normalizedValue) {
  const profile = _getProfile();
  const cfg = profile.defaultConfig[pedalName];
  if (!cfg || cfg.axisIndex < 0) return;

  // Convert 0-1 normalized to raw axis value
  const raw = cfg.calibMin + (cfg.calibMax - cfg.calibMin) * normalizedValue;
  _axes[cfg.axisIndex] = raw;
}

/** Subscribe to state changes */
export function onVirtualChange(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function _notifyListeners() {
  for (const fn of _listeners) fn({ active: _active, profileId: _profileId });
}

/** Get current virtual state for display */
export function getVirtualState() {
  return {
    active: _active,
    profileId: _profileId,
    profile: _getProfile(),
    axes: [..._axes],
    buttons: _buttons.map(b => ({ ...b })),
    id: _id,
  };
}
