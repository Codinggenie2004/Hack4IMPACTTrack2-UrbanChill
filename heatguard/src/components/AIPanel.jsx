import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { exportReport } from '../utils/pdfExport';

const TYPE_COLORS = {
  TREES: '#3fb950',
  'COOL PAVEMENT': '#388bfd',
  'ROOFTOP GARDEN': '#d29922',
  'GREEN WALL': '#3fb950',
  'WATER FEATURE': '#388bfd',
  PARK: '#3fb950',
};

export default function AIPanel({ recommendations, loading, zone, cityName }) {
  const { user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="ai-panel">
        <div className="ai-title">AI Recommendations</div>
        <div className="ai-loading">
          <div className="ai-spinner" />
          <span>Analysing zone data...</span>
        </div>
      </div>
    );
  }

  if (!recommendations) return null;

  const { interventions, summary, projected_temp_reduction, priority } = recommendations;

  const handleExport = () => {
    if (!user) return alert('Please log in to export reports.');
    exportReport(cityName, zone, `report-zone-${zone.id}`);
  };

  return (
    <div className="ai-panel fade-in" id={`report-zone-${zone.id}`}>
      <div className="ai-title">AI Recommendations</div>

      {interventions &&
        interventions.map((item, i) => {
          const typeColor = TYPE_COLORS[item.type] || 'var(--accent)';
          return (
            <div className="intervention-card" key={i}>
              <span
                className="intervention-type"
                style={{
                  background: typeColor + '22',
                  color: typeColor,
                }}
              >
                {item.type}
              </span>
              <div className="intervention-action">{item.action}</div>
              <div className="intervention-impact">📊 {item.impact}</div>
            </div>
          );
        })}

      {summary && (
        <div className="ai-summary-card">
          <div className="ai-summary-text">{summary}</div>
          {projected_temp_reduction && (
            <div className="ai-projected">
              🌡️ Projected: {projected_temp_reduction}
            </div>
          )}
        </div>
      )}
      <button 
        onClick={handleExport} 
        className="btn" 
        style={{ marginTop: '15px', width: '100%', opacity: user ? 1 : 0.5 }}
      >
        {user ? 'Export Report (PDF)' : 'Login to Export'}
      </button>
    </div>
  );
}
