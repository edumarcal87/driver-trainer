import { useState, useEffect } from 'react';
import { detectWheelProfile, getWheelShifterConfig, saveWheelCalibration, loadWheelCalibration } from '../utils/wheelProfiles';
import { getDefaultPedalConfig } from '../utils/gamepad';

/**
 * Hook that manages gamepad connection, wheel profile detection, calibration.
 * Returns { gpConnected, gpName, wheelProfile, inputMode, setInputMode, pedalConfigs, setPedalConfigs, shifterConfig }
 */
export default function useGamepad(initialConfigs) {
  const [gpConnected, setGpConnected] = useState(false);
  const [gpName, setGpName] = useState('');
  const [wheelProfile, setWheelProfile] = useState(null);
  const [shifterConfig, setShifterConfig] = useState({ upshift: 4, downshift: 5, hShifterBase: 12, hShifterReverse: 18 });
  const [inputMode, setInputMode] = useState(() => {
    try { const v = localStorage.getItem('bt_inputMode'); return v ? JSON.parse(v) : 'keyboard'; }
    catch { return 'keyboard'; }
  });
  const [pedalConfigs, setPedalConfigs] = useState(initialConfigs || getDefaultPedalConfig());

  // Persist input mode
  useEffect(() => { try { localStorage.setItem('bt_inputMode', JSON.stringify(inputMode)); } catch {} }, [inputMode]);

  // Persist pedal configs + save wheel calibration
  useEffect(() => {
    try { localStorage.setItem('bt_pedalConfigs', JSON.stringify(pedalConfigs)); } catch {}
    if (gpName && gpConnected) saveWheelCalibration(gpName, pedalConfigs);
  }, [pedalConfigs, gpName, gpConnected]);

  // Gamepad connect/disconnect
  useEffect(() => {
    const handleConnect = (e) => {
      const id = e.gamepad.id;
      setGpConnected(true);
      setGpName(id);
      setInputMode('gamepad');

      const profile = detectWheelProfile(id);
      setWheelProfile(profile);

      const savedCalib = loadWheelCalibration(id);
      if (savedCalib) {
        setPedalConfigs(savedCalib);
      } else if (profile) {
        setPedalConfigs(profile.defaultConfig);
      }

      if (profile) {
        setShifterConfig(profile.shifter);
      } else {
        setShifterConfig(getWheelShifterConfig(id));
      }
    };
    const handleDisconnect = () => { setGpConnected(false); setGpName(''); setWheelProfile(null); };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    // Check already connected
    const gps = navigator.getGamepads();
    for (const gp of gps) {
      if (gp) { handleConnect({ gamepad: gp }); break; }
    }
    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, []);

  return { gpConnected, gpName, wheelProfile, inputMode, setInputMode, pedalConfigs, setPedalConfigs, shifterConfig };
}
