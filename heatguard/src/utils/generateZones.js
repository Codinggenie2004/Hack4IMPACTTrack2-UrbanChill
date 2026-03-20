const LAND_USES = ['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Green Space'];

const ZONE_NAME_PREFIXES = [
  'Central', 'North', 'South', 'East', 'West',
  'Old Town', 'New Town', 'Cantonment', 'Lake', 'Market',
  'Station', 'Port', 'Garden', 'Tech Park', 'University',
  'Airport', 'River', 'Hill', 'Temple', 'Fort',
  'Mall', 'Bridge', 'Colony', 'Nagar', 'Bazaar'
];

export function generateZones(cityKey, centerLat, centerLng) {
  const zones = [];
  const GRID = 5;
  const SPREAD = 0.06;
  const startLat = centerLat - (GRID / 2) * SPREAD;
  const startLng = centerLng - (GRID / 2) * SPREAD;

  // Use city key as seed-like modifier for deterministic-ish results per city
  const seed = cityKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const idx = row * GRID + col;
      const pseudoRand = (n) => {
        const x = Math.sin(seed * 9301 + idx * 49297 + n * 233) * 10000;
        return x - Math.floor(x);
      };

      const lat = startLat + row * SPREAD + (pseudoRand(1) - 0.5) * 0.01;
      const lng = startLng + col * SPREAD + (pseudoRand(2) - 0.5) * 0.01;
      const temp = +(28 + pseudoRand(3) * 16).toFixed(1);
      const greenCover = +(5 + pseudoRand(4) * 55).toFixed(1);
      const density = Math.round(3000 + pseudoRand(5) * 45000);
      const aqi = Math.round(40 + pseudoRand(6) * 180);
      const humidity = Math.round(30 + pseudoRand(7) * 60);
      const landUse = LAND_USES[Math.floor(pseudoRand(8) * LAND_USES.length)];
      const namePrefix = ZONE_NAME_PREFIXES[idx % ZONE_NAME_PREFIXES.length];

      zones.push({
        id: `z_${row}_${col}`,
        name: `${namePrefix} District ${String.fromCharCode(65 + row)}${col + 1}`,
        lat,
        lng,
        temp,
        greenCover,
        density,
        aqi,
        humidity,
        landUse,
      });
    }
  }
  return zones;
}
