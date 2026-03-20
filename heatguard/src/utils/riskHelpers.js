export function getRisk(temp) {
  if (temp < 32) return { label: 'LOW', color: '#3fb950' };
  if (temp < 36) return { label: 'MODERATE', color: '#d29922' };
  if (temp < 40) return { label: 'HIGH', color: '#f85149' };
  return { label: 'CRITICAL', color: '#ff006e' };
}

export function getAQILabel(aqi) {
  if (aqi <= 50) return { label: 'Good', color: '#3fb950' };
  if (aqi <= 100) return { label: 'Moderate', color: '#d29922' };
  if (aqi <= 150) return { label: 'Unhealthy', color: '#f85149' };
  return { label: 'Very Unhealthy', color: '#ff006e' };
}

export function getGreenCoverStatus(pct) {
  if (pct >= 30) return { label: 'Adequate', color: '#3fb950' };
  if (pct >= 15) return { label: 'Low', color: '#d29922' };
  return { label: 'Critical', color: '#f85149' };
}

export function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
