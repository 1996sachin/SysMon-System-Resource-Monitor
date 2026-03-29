import React from 'react';
import Gauge from './Gauge';

export default function RamPanel({ ram }) {
  if (!ram) return null;
  const fillClass = ram.percent >= 90 ? 'fill-red' : ram.percent >= 70 ? 'fill-yellow' : 'fill-blue';

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">🧠</span> Memory (RAM)</div>
        <span className="tag tag-blue">{ram.total_gb} GB total</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:20 }}>
        <Gauge value={ram.percent} size={110} color="blue" label="Usage" />
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { label:'Used',      val:`${ram.used_gb} GB`,      pct: ram.percent,    cls:'fill-blue'  },
            { label:'Available', val:`${ram.available_gb} GB`, pct: (ram.available_gb/ram.total_gb)*100, cls:'fill-green' },
            { label:'Swap Used', val:`${ram.swap_used_gb} GB`, pct: ram.swap_percent, cls:'fill-purple' },
          ].map(({ label, val, pct, cls }) => (
            <div key={label}>
              <div className="progress-label">
                <span>{label}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:11 }}>{val}</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${cls}`} style={{ width:`${Math.min(pct,100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
        {[
          { label:'Used',  val:ram.used_gb,      unit:'GB', color:'var(--accent)' },
          { label:'Free',  val:ram.available_gb, unit:'GB', color:'var(--accent2)' },
          { label:'Swap',  val:ram.swap_total_gb,unit:'GB', color:'var(--purple)' },
        ].map(({ label, val, unit, color }) => (
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{label}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:18, fontWeight:700, color }}>
              {val} <span style={{ fontSize:11, color:'var(--text2)' }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
