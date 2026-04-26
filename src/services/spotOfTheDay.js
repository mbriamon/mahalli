// spotOfTheDay.js
// Picks a deterministic "spot of the day" from the full spots list
// Uses the current date as a seed so it changes daily but is
// consistent for all users on the same day

export function getSpotOfTheDay(spots) {
  if (!spots || spots.length === 0) return null;

  // seed based on year + day of year so it changes daily
  const now       = new Date();
  const start     = new Date(now.getFullYear(), 0, 0);
  const diff      = now - start;
  const oneDay    = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const seed      = now.getFullYear() * 1000 + dayOfYear;

  // pick deterministically from the list
  const index = seed % spots.length;
  return spots[index];
}

