// Time and Date formatting utilities

export function formatSecondsCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatTimeAmPm(isoOrDate) {
  if (!isoOrDate) return '--:--';
  const d = new Date(isoOrDate);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDateShort(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function calculateSafeMargin(attended, total, thresholdPct = 75) {
  const att = Number(attended) || 0;
  const tot = Number(total) || 0;
  if (tot === 0) {
    return {
      status: 'neutral',
      currentPct: 0,
      safeMissCount: 0,
      needAttendCount: 0,
      message: 'No sessions conducted yet',
    };
  }

  const currentPct = Math.round((att / tot) * 100);

  if (currentPct >= thresholdPct) {
    // How many more can miss while att / (tot + miss) >= 0.75
    // att >= 0.75 * tot + 0.75 * miss  =>  0.75 * miss <= att - 0.75 * tot
    // miss <= (att - 0.75 * tot) / 0.75 = (4/3 * att) - tot
    const maxMiss = Math.floor((att / (thresholdPct / 100)) - tot);
    const safeMiss = Math.max(0, maxMiss);
    return {
      status: 'safe',
      currentPct,
      safeMissCount: safeMiss,
      needAttendCount: 0,
      message: safeMiss === 0
        ? 'On the edge of 75%! Do not miss the next class.'
        : `You can safely miss ${safeMiss} more class${safeMiss > 1 ? 'es' : ''} and stay ≥75%.`,
    };
  } else {
    // Below 75%: How many consecutive classes needed?
    // (att + x) / (tot + x) >= 0.75
    // att + x >= 0.75 * tot + 0.75 * x
    // 0.25 * x >= 0.75 * tot - att
    // x >= 3 * tot - 4 * att
    const needed = Math.max(1, Math.ceil((thresholdPct * tot - 100 * att) / (100 - thresholdPct)));
    return {
      status: 'danger',
      currentPct,
      safeMissCount: 0,
      needAttendCount: needed,
      message: `Attend the next ${needed} class${needed > 1 ? 'es' : ''} to recover above 75%.`,
    };
  }
}
