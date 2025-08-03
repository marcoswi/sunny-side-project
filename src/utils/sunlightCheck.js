import SunCalc from 'suncalc';

/**
 * Returns true if the sun is visible from the location, given surroundings.
 * @param {Object} place - The place data with location and surroundingHeights
 * @param {Date} date - The date/time to evaluate
 */
export function isPlaceInSun(place, date) {
  const { lat, lng } = place.location;
  const sunPos = SunCalc.getPosition(date, lat, lng);

  const azimuthDeg = (sunPos.azimuth * 180) / Math.PI + 180; // degrees from N
  const altitudeDeg = (sunPos.altitude * 180) / Math.PI;

  // Map sun azimuth to one of 8 directions
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const angle = azimuthDeg;
  const index = Math.round(angle / 45) % 8;
  const direction = directions[index];

  const blockerHeight = place.surroundingHeights?.[direction] ?? 10; // default to 10m
  const distanceToBlocker = 10; // meters from place to surrounding buildings (adjust as needed)

  const requiredAngle = (Math.atan2(blockerHeight, distanceToBlocker) * 180) / Math.PI;

  return altitudeDeg > requiredAngle;
}
