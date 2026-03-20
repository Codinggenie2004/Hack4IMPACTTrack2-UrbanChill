import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { getRisk } from '../utils/riskHelpers';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_OPTS = {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
};

const HEAT_GRADIENT = { 0.2: '#1a472a', 0.4: '#d29922', 0.65: '#f85149', 1.0: '#ff006e' };

export default function MapView({ center, zoom, zones, afterMode, onZoneClick, selectedZone }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersRef = useRef([]);
  const prevZonesRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
    });
    L.tileLayer(TILE_URL, TILE_OPTS).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update view when center/zoom changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom]);

  // Update heatmap and markers when zones or afterMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !zones.length) return;

    // Clear old layers
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Build heat data
    const heatData = zones.map((z) => {
      const temp = afterMode ? +(z.temp * 0.82).toFixed(1) : z.temp;
      const intensity = Math.min(Math.max((temp - 25) / 20, 0), 1);
      return [z.lat, z.lng, intensity];
    });

    // Add heat layer
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 45,
      blur: 30,
      maxZoom: 15,
      gradient: HEAT_GRADIENT,
    }).addTo(map);

    // Create a map for fast lookup of previous zones
    const prevZonesMap = new Map();
    prevZonesRef.current.forEach(z => prevZonesMap.set(z.id, z));

    // Add circle markers
    zones.forEach((zone) => {
      const temp = afterMode ? +(zone.temp * 0.82).toFixed(1) : zone.temp;
      const risk = getRisk(temp);
      const isSelected = selectedZone && selectedZone.id === zone.id;

      // Check if risk worsened compared to last fetch
      let isRiskElevated = false;
      const prevZone = prevZonesMap.get(zone.id);
      if (prevZone) {
        const prevRisk = getRisk(prevZone.temp);
        // Assuming higher temp implies higher risk, if it jumps to a new bracket
        isRiskElevated = (temp > prevZone.temp) && (risk.label !== prevRisk.label) && ['HIGH', 'CRITICAL'].includes(risk.label);
      }

      const markerParams = {
        radius: isSelected ? 10 : 7,
        fillColor: risk.color,
        color: isSelected ? '#e6edf3' : risk.color,
        weight: isSelected ? 2 : 1,
        opacity: 0.9,
        fillOpacity: 0.7,
        className: isRiskElevated ? 'marker-pulse-danger' : '',
      };

      const marker = L.circleMarker([zone.lat, zone.lng], markerParams).addTo(map);

      marker.bindTooltip(
        `<strong>${zone.name}</strong><br/>${temp}°C — ${risk.label}${isRiskElevated ? ' ⚠️ RISK ELEVATED' : ''}`,
        { className: 'dark-tooltip', direction: 'top', offset: [0, -8] }
      );

      marker.on('click', () => onZoneClick(zone));
      markersRef.current.push(marker);
    });

    // Save current zones for next compare
    prevZonesRef.current = zones;

  }, [zones, afterMode, selectedZone]);

  return <div ref={mapRef} className="map-container" id="heatmap" />;
}
