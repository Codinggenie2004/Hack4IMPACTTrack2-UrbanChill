export const CITY_CONFIGS = {
  mumbai:      { name: 'Mumbai',      lat: 19.076,  lng: 72.8777, zoom: 12 },
  delhi:       { name: 'Delhi',       lat: 28.6139, lng: 77.2090, zoom: 12 },
  chennai:     { name: 'Chennai',     lat: 13.0827, lng: 80.2707, zoom: 12 },
  bangalore:   { name: 'Bangalore',   lat: 12.9716, lng: 77.5946, zoom: 12 },
  hyderabad:   { name: 'Hyderabad',   lat: 17.3850, lng: 78.4867, zoom: 12 },
  kolkata:     { name: 'Kolkata',     lat: 22.5726, lng: 88.3639, zoom: 12 },
  bhubaneswar: { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, zoom: 12 },
};

export function resolveCity(input) {
  const key = input.trim().toLowerCase();
  if (CITY_CONFIGS[key]) return { key, ...CITY_CONFIGS[key] };
  // fuzzy match
  const found = Object.entries(CITY_CONFIGS).find(
    ([k, v]) => v.name.toLowerCase().startsWith(key)
  );
  if (found) return { key: found[0], ...found[1] };
  return null;
}
