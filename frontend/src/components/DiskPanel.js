import React from 'react';

function diskColor(pct) {
  if (pct >= 90) return 'fill-red';
  if (pct >= 70) return 'fill-yellow';
  return 'fill-cyan';
}

export default function DiskPanel({ disks }) {
  if (!disks || disks.length === 0) return null;

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">💾</span> Storage (ROM)</div>
        <span className="tag tag-blue">{disks.length} partition{disks.length > 1 ? 's' : ''}</span>
      </div>

      <div>
        {disks.map((d, i) => (
          <div key={i} className="disk-item">
            <div className="disk-header">
              <div>
                <div className="disk-path">{d.mountpoint}</div>
                <div className="disk-fs">{d.device} · {d.fstype}</div>
              </div>
              <span className={`tag ${d.percent >= 90 ? 'tag-red' : d.percent >= 70 ? 'tag-yellow' : 'tag-green'}`}>
                {d.percent}%
              </span>
            </div>
            <div className="progress-bar" style={{ height:5 }}>
              <div className={`progress-fill ${diskColor(d.percent)}`} style={{ width:`${d.percent}%` }} />
            </div>
            <div className="disk-sizes">
              <div className="disk-size">Used: <span>{d.used_gb} GB</span></div>
              <div className="disk-size">Free: <span>{d.free_gb} GB</span></div>
              <div className="disk-size">Total: <span>{d.total_gb} GB</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
