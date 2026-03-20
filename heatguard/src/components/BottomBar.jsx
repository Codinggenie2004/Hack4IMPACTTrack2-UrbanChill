import React from 'react';

export default function BottomBar({ afterMode, onToggle, lastUpdated }) {
  const getMinutesAgo = () => {
    if (!lastUpdated) return '';
    const diff = Math.floor((new Date() - lastUpdated) / 60000);
    return diff === 0 ? 'just now' : `${diff} mins ago`;
  };

  return (
    <div className="bottombar">
      <div className="toggle-group">
        <button
          className={`toggle-btn ${!afterMode ? 'active' : ''}`}
          onClick={() => onToggle(false)}
          id="toggle-current"
        >
          Current
        </button>
        <button
          className={`toggle-btn ${afterMode ? 'active' : ''}`}
          onClick={() => onToggle(true)}
          id="toggle-after"
        >
          After Interventions
        </button>
      </div>

      <span className="bottombar-note">
        {afterMode
          ? '🌿 Showing projected temperatures after green interventions (18% avg reduction)'
          : '📡 Showing current surface temperature data'}
        {lastUpdated && !afterMode && (
          <span style={{ marginLeft: '10px', color: 'var(--accent)', opacity: 0.8 }}>
            (Last updated: {getMinutesAgo()})
          </span>
        )}
      </span>

      <span className="bottombar-brand">UrbanChill × HeatGuard</span>
    </div>
  );
}
