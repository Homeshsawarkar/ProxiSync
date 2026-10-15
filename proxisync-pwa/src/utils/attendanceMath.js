// Attendance calculations & spare/needed classes helper
// Minimum required attendance percentage: 75%
export const ATTENDANCE_THRESHOLD = 75;

export function calculateAttendanceStats(attended, total) {
  const att = Number(attended) || 0;
  const tot = Number(total) || 0;

  if (tot === 0) {
    return {
      percentage: 0,
      isBelowThreshold: false,
      spareClasses: 0,
      neededClasses: 0,
      summaryText: 'No sessions conducted yet'
    };
  }

  const percentage = Math.round((att / tot) * 100);
  const isBelowThreshold = percentage < ATTENDANCE_THRESHOLD;

  if (!isBelowThreshold) {
    // How many classes can the student miss and still stay at or above 75%?
    // att / (tot + miss) >= 0.75  ==>  miss <= (att / 0.75) - tot
    const maxTotalAllowed = Math.floor(att / 0.75);
    const spare = Math.max(0, maxTotalAllowed - tot);
    return {
      percentage,
      isBelowThreshold,
      spareClasses: spare,
      neededClasses: 0,
      summaryText: spare === 0 ? 'On the margin (0 spare)' : `${spare} ${spare === 1 ? 'class' : 'classes'} spare`
    };
  } else {
    // How many consecutive classes must the student attend to reach 75%?
    // (att + x) / (tot + x) >= 0.75  ==>  att + x >= 0.75*tot + 0.75*x  ==>  0.25*x >= 0.75*tot - att
    // x >= (0.75*tot - att) / 0.25
    const needed = Math.ceil((0.75 * tot - att) / 0.25);
    return {
      percentage,
      isBelowThreshold,
      spareClasses: 0,
      neededClasses: Math.max(1, needed),
      summaryText: `Needs ${needed} more`
    };
  }
}
