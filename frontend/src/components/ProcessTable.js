import React, { useState } from 'react';

function statusColor(s) {
  if (s === 'running')  return 'var(--accent2)';
  if (s === 'sleeping') return 'var(--text3)';
  if (s === 'stopped')  return 'var(--danger)';
  return 'var(--text2)';
}

export default function ProcessTable({ processes }) {
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState('cpu_percent');
  const [sortDir, setSortDir] = useState(-1); // -1 = desc

  if (!processes) return null;

  const toggle = (key) => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(-1); }
  };

  const filtered = processes
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir * (a[sortKey] > b[sortKey] ? 1 : -1));

  const SortBtn = ({ k, label }) => (
    <th onClick={() => toggle(k)} style={{ cursor:'pointer', userSelect:'none' }}>
      {label} {sortKey === k ? (sortDir < 0 ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">⚙️</span> Processes</div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter…"
          style={{
            background:'var(--bg3)', border:'1px solid var(--border2)',
            borderRadius:6, padding:'4px 10px', color:'var(--text)',
            fontSize:12, fontFamily:'var(--sans)', outline:'none', width:140,
          }}
        />
      </div>

      <div style={{ overflowX:'auto', maxHeight:380, overflowY:'auto' }}>
        <table className="process-table">
          <thead>
            <tr>
              <th>PID</th>
              <th>Name</th>
              <SortBtn k="cpu_percent" label="CPU" />
              <SortBtn k="memory_mb"   label="MEM" />
              <th>Status</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.pid}>
                <td style={{ color:'var(--text2)' }}>{p.pid}</td>
                <td className="name-col">{p.name}</td>
                <td><span className="cpu-badge">{p.cpu_percent.toFixed(1)}%</span></td>
                <td><span className="mem-badge">{p.memory_mb.toFixed(1)} MB</span></td>
                <td>
                  <span style={{ color: statusColor(p.status), fontSize:10, fontFamily:'var(--sans)', fontWeight:600 }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ color:'var(--text2)', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {p.username || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
