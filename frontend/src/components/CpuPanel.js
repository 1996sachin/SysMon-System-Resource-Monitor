import React from 'react';
import Gauge from './Gauge';

function colorForPct(p) {
  if (p >= 90) return '#f85149';
  if (p >= 70) return '#d29922';
  return '#3fb950';
}

function ProgressBar({ value, color }) {
  return (
    <div className="progress-bar" style={{ height: 3 }}>
      <div className="progress-fill" style={{ width: `${value}%`, background: color, boxShadow: `0 0 4px ${color}88` }} />
    </div>
  );
}

export default function CpuPanel({ cpu }) {
  if (!cpu) return null;
  const cores = cpu.per_core || [];

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">⚡</span> CPU</div>
        <div style={{ display:'flex', gap:8 }}>
          {cpu.freq_current && (
            <span className="tag tag-blue">{cpu.freq_current} MHz</span>
          )}
          <span className="tag tag-green">{cpu.count_logical} threads</span>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:20 }}>
        <Gauge value={cpu.percent} size={110} label="Usage" />
        <div style={{ flex:1 }}>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, color:'var(--text2)', marginBottom:4 }}>Processor</div>
            <div style={{ fontSize:12, color:'var(--text)', fontWeight:500, wordBreak:'break-word' }}>
              {cpu.processor || cpu.architecture}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Physical</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:700, color:'var(--accent)' }}>
                {cpu.count_physical}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Logical</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:700, color:'var(--accent)' }}>
                {cpu.count_logical}
              </div>
            </div>
            {cpu.freq_max && (
              <div>
                <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Max Freq</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:700, color:'var(--text2)' }}>
                  {cpu.freq_max} MHz
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {cores.length > 0 && (
        <div style={{ marginTop:16 }}>
          <div className="section-title">Per-Core Usage</div>
          <div className="core-grid">
            {cores.map((pct, i) => {
              const c = colorForPct(pct);
              return (
                <div key={i} className="core-item">
                  <div className="core-label">C{i}</div>
                  <div className="core-val" style={{ color: c }}>{Math.round(pct)}</div>
                  <ProgressBar value={pct} color={c} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
