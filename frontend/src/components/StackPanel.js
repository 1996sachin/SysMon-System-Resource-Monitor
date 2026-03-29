import React, { useState } from 'react';

const STACK_COLORS = {
  Python:   '#3fb950',
  'Node.js':'#f0883e',
  Java:     '#d29922',
  Rust:     '#f85149',
  Go:       '#39d0d8',
  Browser:  '#58a6ff',
  Database: '#bc8cff',
  System:   '#8b949e',
  Other:    '#484f58',
};

const STACK_ICONS = {
  Python:   '🐍',
  'Node.js':'🟩',
  Java:     '☕',
  Rust:     '🦀',
  Go:       '🐹',
  Browser:  '🌐',
  Database: '🗄️',
  System:   '⚙️',
  Other:    '📦',
};

export default function StackPanel({ stacks }) {
  const [sortBy, setSortBy] = useState('cpu');

  if (!stacks) return null;

  const entries = Object.entries(stacks)
    .map(([name, s]) => ({ name, ...s }))
    .filter(s => s.cpu > 0 || s.mem > 0)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const maxCpu = Math.max(...entries.map(e => e.cpu), 1);
  const maxMem = Math.max(...entries.map(e => e.mem), 1);

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">📊</span> Stack Usage</div>
        <div style={{ display:'flex', gap:6 }}>
          {['cpu', 'mem'].map(k => (
            <button
              key={k}
              className={`btn ${sortBy === k ? 'btn-primary' : ''}`}
              style={{ padding:'3px 10px', fontSize:11 }}
              onClick={() => setSortBy(k)}
            >
              {k === 'cpu' ? 'CPU' : 'MEM'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'auto 16px', gap:'0 8px', fontSize:10, color:'var(--text2)', marginBottom:6 }}>
        <div></div>
        <div style={{ textAlign:'right' }}>#</div>
      </div>

      {entries.length === 0 ? (
        <div style={{ color:'var(--text2)', fontSize:12, textAlign:'center', padding:'20px 0' }}>
          No active stacks detected
        </div>
      ) : entries.map(s => {
        const color = STACK_COLORS[s.name] || '#8b949e';
        const barPct = sortBy === 'cpu'
          ? (s.cpu / maxCpu) * 100
          : (s.mem / maxMem) * 100;
        return (
          <div key={s.name} className="stack-item">
            <div className="stack-name" style={{ color }}>
              {STACK_ICONS[s.name] || '📦'} {s.name}
            </div>
            <div className="stack-bar-wrap">
              <div
                className="stack-bar-fill"
                style={{ width: `${barPct}%`, background: color, boxShadow:`0 0 6px ${color}66` }}
              />
            </div>
            <div className="stack-cpu-val">
              {sortBy === 'cpu' ? `${s.cpu}%` : `${s.mem} MB`}
            </div>
            <div className="stack-mem-val" style={{ fontSize:10 }}>
              {sortBy === 'cpu' ? `${s.mem} MB` : `${s.cpu}%`}
            </div>
            <div className="stack-count">{s.count}</div>
          </div>
        );
      })}

      <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)', fontSize:10, color:'var(--text3)' }}>
        Sorted by {sortBy === 'cpu' ? 'CPU usage' : 'memory usage'} · showing active stacks only
      </div>
    </div>
  );
}
