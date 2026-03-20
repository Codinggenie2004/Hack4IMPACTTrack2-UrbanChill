import React, { useState, useCallback } from 'react';
import TopBar from './components/TopBar';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import AuthModal from './components/AuthModal';
import { resolveCity } from './utils/cityConfigs';
import { generateZones } from './utils/generateZones';
import { getRisk } from './utils/riskHelpers';
import { getRecommendations } from './utils/claudeAPI';
import { LanguageContext } from './context/LanguageContext';

export default function App() {
  const [cityName, setCityName] = useState('');
  const [center, setCenter] = useState({ lat: 19.076, lng: 72.8777 });
  const [zoom, setZoom] = useState(12);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [afterMode, setAfterMode] = useState(false);
  const [activeTab, setActiveTab] = useState('zone');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const { lang } = React.useContext(LanguageContext) || { lang: 'en' };
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchCityData = useCallback(async (city) => {
    try {
      const res = await fetch(`http://localhost:5000/api/city/${city.key}`);
      if (!res.ok) throw new Error('Failed to load city data');
      const data = await res.json();
      const newZones = data.zones;
      
      setZones(newZones);
      setLastUpdated(new Date());

      // Compute stats
      const temps = newZones.map((z) => z.temp);
      const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
      const maxTemp = Math.max(...temps).toFixed(1);
      const atRiskZones = temps.filter((t) => t >= 36).length;
      const avgGreenCover = (
        newZones.reduce((a, z) => a + z.greenCover, 0) / newZones.length
      ).toFixed(1);

      setStats({ avgTemp, maxTemp, atRiskZones, avgGreenCover });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSearch = useCallback(async (input) => {
    const city = resolveCity(input);
    if (!city) {
      alert(`City "${input}" not found. Try: Mumbai, Delhi, Chennai, Bangalore, Hyderabad, Kolkata, or Bhubaneswar.`);
      return;
    }

    setLoading(true);
    setCityName(city.name);
    setCenter({ lat: city.lat, lng: city.lng });
    setZoom(city.zoom);
    setSelectedZone(null);
    setRecommendations(null);
    setAfterMode(false);

    await fetchCityData(city);
    setLoading(false);
  }, [fetchCityData]);

  // Polling Effect
  React.useEffect(() => {
    if (!cityName) return;
    const city = resolveCity(cityName);
    if (!city) return;

    // Poll every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      fetchCityData(city);
    }, 300000);

    return () => clearInterval(intervalId);
  }, [cityName, fetchCityData]);

  const handleZoneClick = useCallback(async (zone) => {
    setSelectedZone(zone);
    setActiveTab('zone');
    setRecLoading(true);
    setRecommendations(null);

    try {
      const recs = await getRecommendations(zone, lang);
      setRecommendations(recs);
    } catch {
      // fallback handled in claudeAPI.js
    } finally {
      setRecLoading(false);
    }
  }, []);

  const handleZoneSelectFromOverview = useCallback((zone) => {
    setSelectedZone(zone);
    setActiveTab('zone');
    handleZoneClick(zone);
  }, [handleZoneClick]);

  return (
    <div className="app-layout">
      <TopBar onSearch={handleSearch} stats={stats} loading={loading} />
      <div className="main-area">
        <MapView
          center={center}
          zoom={zoom}
          zones={zones}
          afterMode={afterMode}
          onZoneClick={handleZoneClick}
          selectedZone={selectedZone}
        />
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedZone={selectedZone}
          recommendations={recommendations}
          recLoading={recLoading}
          zones={zones}
          cityName={cityName}
          onZoneSelect={handleZoneSelectFromOverview}
          afterMode={afterMode}
        />
      </div>
      <BottomBar afterMode={afterMode} onToggle={setAfterMode} lastUpdated={lastUpdated} />
      <AuthModal />
    </div>
  );
}
