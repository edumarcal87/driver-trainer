import { useState, useEffect, useCallback } from 'react';
import { evaluateBadges, getStoredBadges, storeBadges } from '../data/badges';

/**
 * Hook that manages badge evaluation and toast queue.
 */
export default function useBadges(sessionLog) {
  const [badgeToast, setBadgeToast] = useState(null);
  const [badgeQueue, setBadgeQueue] = useState([]);

  // Show one toast at a time
  useEffect(() => {
    if (!badgeToast && badgeQueue.length > 0) {
      setBadgeToast(badgeQueue[0]);
      setBadgeQueue(q => q.slice(1));
    }
  }, [badgeToast, badgeQueue]);

  const checkBadges = useCallback((updatedLog) => {
    const prevBadgeIds = getStoredBadges();
    const { newlyUnlocked } = evaluateBadges(updatedLog, prevBadgeIds);
    if (newlyUnlocked.length > 0) {
      const allUnlockedIds = [...prevBadgeIds, ...newlyUnlocked.map(b => b.id)];
      storeBadges(allUnlockedIds);
      setBadgeQueue(q => [...q, ...newlyUnlocked]);
    }
  }, []);

  const dismissToast = useCallback(() => setBadgeToast(null), []);

  return { badgeToast, dismissToast, checkBadges };
}
