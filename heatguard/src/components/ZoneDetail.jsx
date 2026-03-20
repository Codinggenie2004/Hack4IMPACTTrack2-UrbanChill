import React from 'react';
import { getRisk, getAQILabel, getGreenCoverStatus, formatNumber } from '../utils/riskHelpers';

export default function ZoneDetail({ zone, afterMode }) {
  const displayTemp = afterMode ? +(zone.temp * 0.82).toFixed(1) : zone.temp;
  const risk = getRisk(displayTemp);
  const aqiInfo = getAQILabel(zone.aqi);
  const greenInfo = getGreenCoverStatus(zone.greenCover);

  return (
    <div className="zone-detail">
      <div className="zone-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 className="zone-name">{zone.name}</h2>
          <span
            className="zone-badge"
            style={{ background: risk.color + '22', color: risk.color }}
          >
            {risk.label}
          </span>
        </div>
        <div className="zone-coords">
          {zone.lat.toFixed(4)}°N, {zone.lng.toFixed(4)}°E
        </div>
        <div className="zone-land-use">🏗️ {zone.landUse}</div>
      </div>

      <div className="zone-metrics">
        <div className="metric-card">
          <span className="metric-label">Surface Temp</span>
          <span className="metric-value" style={{ color: risk.color }}>
            {displayTemp}°C
          </span>
          {afterMode && (
            <span className="metric-sub" style={{ color: 'var(--accent)' }}>
              ↓ from {zone.temp}°C
            </span>
          )}
        </div>

        <div className="metric-card">
          <span className="metric-label">Green Cover</span>
          <span className="metric-value" style={{ color: greenInfo.color }}>
            {zone.greenCover}%
          </span>
          <span className="metric-sub">{greenInfo.label}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Air Quality</span>
          <span className="metric-value" style={{ color: aqiInfo.color }}>
            {zone.aqi}
          </span>
          <span className="metric-sub">{aqiInfo.label}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Humidity</span>
          <span className="metric-value">{zone.humidity}%</span>
        </div>

        <div className="metric-card" style={{ gridColumn: '1 / -1' }}>
          <span className="metric-label">Population Density</span>
          <span className="metric-value">
            {formatNumber(zone.density)} <span style={{ fontSize: '11px', color: 'var(--muted)' }}>people/km²</span>
          </span>
        </div>
      </div>
    </div>
  );
}
