import React from 'react';
import Gauge from './Gauge';

export default function GpuPanel({ gpus }) {
  if (!gpus) return null;

  if (gpus.length === 0) {
    return (
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title"><span className="icon">🎮</span> Graphics (GPU)</div>
        </div>
        <div className="no-gpu">
          <div style={{ fontSize:28, marginBottom:8 }}>🎮</div>
          <div>No discrete GPU detected</div>
          <div style={{ fontSize:11, marginTop:4 }}>Integrated graphics or GPUtil not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">🎮</span> Graphics (GPU)</div>
        <span className="tag tag-blue">{gpus.length} GPU{gpus.length > 1 ? 's' : ''}</span>
      </div>

      {gpus.map((g, i) => (
        <div key={i} className="gpu-card">
          <div className="gpu-name">{g.name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <Gauge value={g.load_percent} size={90} color="purple" label="Load" />
            <div style={{ flex:1 }}>
              <div className="gpu-stats">
                <div>
                  <div className="gpu-stat-label">VRAM Used</div>
                  <div className="gpu-stat-val">{g.memory_used_mb} <span style={{ fontSize:11, color:'var(--text2)' }}>MB</span></div>
                </div>
                <div>
                  <div className="gpu-stat-label">VRAM Total</div>
                  <div className="gpu-stat-val">{g.memory_total_mb} <span style={{ fontSize:11, color:'var(--text2)' }}>MB</span></div>
                </div>
                {g.temperature != null && (
                  <div>
                    <div className="gpu-stat-label">Temp</div>
                    <div className="gpu-stat-val" style={{ color: g.temperature > 80 ? 'var(--danger)' : 'var(--purple)' }}>
                      {g.temperature}°C
                    </div>
                  </div>
                )}
                <div>
                  <div className="gpu-stat-label">VRAM %</div>
                  <div className="gpu-stat-val">{g.memory_percent}%</div>
                </div>
              </div>
              <div className="progress-bar" style={{ marginTop:10, height:4 }}>
                <div className="progress-fill fill-purple" style={{ width:`${g.memory_percent}%` }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
