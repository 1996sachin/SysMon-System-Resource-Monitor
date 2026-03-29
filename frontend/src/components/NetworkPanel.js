import React from 'react';

export default function NetworkPanel({ network }) {
  if (!network) return null;
  const ifaces = Object.entries(network.interfaces || {}).slice(0, 6);

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">🌐</span> Network</div>
      </div>

      <div className="net-stats">
        <div className="net-stat">
          <div className="label">↑ Sent</div>
          <div className="value sent-color">
            {network.bytes_sent_mb > 1024
              ? `${(network.bytes_sent_mb / 1024).toFixed(2)}`
              : network.bytes_sent_mb.toFixed(1)}
            <span style={{ fontSize:12, color:'var(--text2)', marginLeft:4 }}>
              {network.bytes_sent_mb > 1024 ? 'GB' : 'MB'}
            </span>
          </div>
          <div className="sub">{network.packets_sent.toLocaleString()} pkts</div>
        </div>
        <div className="net-stat">
          <div className="label">↓ Received</div>
          <div className="value recv-color">
            {network.bytes_recv_mb > 1024
              ? `${(network.bytes_recv_mb / 1024).toFixed(2)}`
              : network.bytes_recv_mb.toFixed(1)}
            <span style={{ fontSize:12, color:'var(--text2)', marginLeft:4 }}>
              {network.bytes_recv_mb > 1024 ? 'GB' : 'MB'}
            </span>
          </div>
          <div className="sub">{network.packets_recv.toLocaleString()} pkts</div>
        </div>
      </div>

      {ifaces.length > 0 && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
          <div className="section-title">Interfaces</div>
          {ifaces.map(([name, s]) => (
            <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:11 }}>
              <span style={{ fontFamily:'var(--mono)', color:'var(--text)', fontWeight:600 }}>{name}</span>
              <div style={{ display:'flex', gap:16 }}>
                <span style={{ color:'var(--accent)', fontFamily:'var(--mono)' }}>↑ {s.bytes_sent_mb.toFixed(1)} MB</span>
                <span style={{ color:'var(--accent2)', fontFamily:'var(--mono)' }}>↓ {s.bytes_recv_mb.toFixed(1)} MB</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
