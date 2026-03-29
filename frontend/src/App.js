import React, { useState, useEffect } from 'react';
import { useSystemMonitor, WS_URL } from './hooks/useSystemMonitor';
import CpuPanel     from './components/CpuPanel';
import RamPanel     from './components/RamPanel';
import DiskPanel    from './components/DiskPanel';
import GpuPanel     from './components/GpuPanel';
import StackPanel   from './components/StackPanel';
import ProcessTable from './components/ProcessTable';
import NetworkPanel from './components/NetworkPanel';
import HistoryChart from './components/HistoryChart';

const TABS = [
  { id:'overview', icon:'🖥️',  label:'Overview'   },
  { id:'cpu',      icon:'⚡',  label:'CPU'         },
  { id:'memory',   icon:'🧠',  label:'Memory'      },
  { id:'storage',  icon:'💾',  label:'Storage'     },
  { id:'graphics', icon:'🎮',  label:'Graphics'    },
  { id:'stacks',   icon:'📊',  label:'Stacks'      },
  { id:'network',  icon:'🌐',  label:'Network'     },
  { id:'processes',icon:'⚙️',  label:'Processes'   },
];

function useTime() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t;
}

function StatCard({ label, value, unit, sub, color }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color || 'var(--accent)' }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value} {unit && <span className="unit">{unit}</span>}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function App() {
  const { data, status, history } = useSystemMonitor();
  const [tab, setTab] = useState('overview');
  const now = useTime();

  if (!data) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">
            {status === 'connecting' ? 'Connecting to system monitor…' : 'Reconnecting…'}
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>
            {WS_URL}
          </div>
        </div>
      </div>
    );
  }

  const { cpu, ram, disks, gpus, network, processes, stacks, platform: plat } = data;
  const primaryDisk = disks?.[0];

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="logo-icon">SYS</div>
          <h1>Sys<span>Mon</span></h1>
        </div>
        <div className="header-meta">
          {plat && (
            <span className="platform-badge">
              {plat.system} {plat.release} · {plat.node}
            </span>
          )}
          <div className="ws-status">
            <div className={`ws-dot ${status}`} />
            {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Reconnecting'}
          </div>
          <div className="header-time">
            {now.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      {/* ── Nav Tabs ── */}
      <nav className="nav-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      <main className="main">
        {/* ─── OVERVIEW ─── */}
        {tab === 'overview' && (
          <>
            <div className="grid-4">
              <StatCard
                label="⚡ CPU Usage"
                value={`${cpu?.percent?.toFixed(1) ?? '—'}`}
                unit="%"
                sub={`${cpu?.count_logical ?? '?'} threads · ${cpu?.freq_current ?? '?'} MHz`}
                color={cpu?.percent >= 90 ? 'var(--danger)' : cpu?.percent >= 70 ? 'var(--warn)' : 'var(--accent2)'}
              />
              <StatCard
                label="🧠 RAM Usage"
                value={`${ram?.percent?.toFixed(1) ?? '—'}`}
                unit="%"
                sub={`${ram?.used_gb ?? '?'} / ${ram?.total_gb ?? '?'} GB`}
                color="var(--accent)"
              />
              <StatCard
                label="💾 Disk Usage"
                value={`${primaryDisk?.percent?.toFixed(1) ?? '—'}`}
                unit="%"
                sub={`${primaryDisk?.used_gb ?? '?'} / ${primaryDisk?.total_gb ?? '?'} GB`}
                color={primaryDisk?.percent >= 90 ? 'var(--danger)' : 'var(--cyan)'}
              />
              <StatCard
                label="🌐 Net Recv"
                value={network?.bytes_recv_mb > 1024
                  ? (network.bytes_recv_mb / 1024).toFixed(2)
                  : network?.bytes_recv_mb?.toFixed(1) ?? '—'}
                unit={network?.bytes_recv_mb > 1024 ? 'GB' : 'MB'}
                sub={`Sent: ${network?.bytes_sent_mb?.toFixed(1) ?? '?'} MB`}
                color="var(--accent2)"
              />
            </div>

            <div className="full-width">
              <HistoryChart history={history} />
            </div>

            <div className="grid-2">
              <CpuPanel cpu={cpu} />
              <RamPanel ram={ram} />
            </div>

            <div className="grid-2">
              <GpuPanel gpus={gpus} />
              <StackPanel stacks={stacks} />
            </div>

            <div className="grid-2">
              <DiskPanel disks={disks} />
              <NetworkPanel network={network} />
            </div>

            <div className="full-width">
              <ProcessTable processes={processes} />
            </div>
          </>
        )}

        {/* ─── CPU TAB ─── */}
        {tab === 'cpu' && (
          <>
            <div className="grid-2">
              <CpuPanel cpu={cpu} />
              <div>
                <HistoryChart history={history} />
              </div>
            </div>
            <div className="grid-4">
              <StatCard label="Usage"     value={`${cpu?.percent?.toFixed(1)}`}   unit="%" color="var(--accent2)" />
              <StatCard label="Cores"     value={cpu?.count_physical}              unit="physical" color="var(--accent)" />
              <StatCard label="Threads"   value={cpu?.count_logical}               unit="logical"  color="var(--accent)" />
              <StatCard label="Frequency" value={cpu?.freq_current}                unit="MHz"      color="var(--cyan)" />
            </div>
          </>
        )}

        {/* ─── MEMORY TAB ─── */}
        {tab === 'memory' && (
          <>
            <div className="grid-2">
              <RamPanel ram={ram} />
              <HistoryChart history={history} />
            </div>
            <div className="grid-4">
              <StatCard label="Total"     value={ram?.total_gb}     unit="GB" color="var(--accent)" />
              <StatCard label="Used"      value={ram?.used_gb}      unit="GB" color="var(--warn)" />
              <StatCard label="Available" value={ram?.available_gb} unit="GB" color="var(--accent2)" />
              <StatCard label="Swap Used" value={ram?.swap_used_gb} unit="GB" color="var(--purple)" />
            </div>
          </>
        )}

        {/* ─── STORAGE TAB ─── */}
        {tab === 'storage' && (
          <div className="grid-2">
            <DiskPanel disks={disks} />
            <div>
              {disks?.map((d, i) => (
                <div key={i} className="card fade-in" style={{ marginBottom:16 }}>
                  <div className="card-header">
                    <div className="card-title">💾 {d.mountpoint}</div>
                    <span className={`tag ${d.percent >= 90 ? 'tag-red' : d.percent >= 70 ? 'tag-yellow' : 'tag-green'}`}>
                      {d.percent}%
                    </span>
                  </div>
                  <div className="grid-3">
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase' }}>Total</div>
                      <div style={{ fontFamily:'var(--mono)', fontSize:24, fontWeight:700, color:'var(--text)' }}>{d.total_gb}</div>
                      <div style={{ fontSize:10, color:'var(--text2)' }}>GB</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase' }}>Used</div>
                      <div style={{ fontFamily:'var(--mono)', fontSize:24, fontWeight:700, color:'var(--warn)' }}>{d.used_gb}</div>
                      <div style={{ fontSize:10, color:'var(--text2)' }}>GB</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase' }}>Free</div>
                      <div style={{ fontFamily:'var(--mono)', fontSize:24, fontWeight:700, color:'var(--accent2)' }}>{d.free_gb}</div>
                      <div style={{ fontSize:10, color:'var(--text2)' }}>GB</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── GRAPHICS TAB ─── */}
        {tab === 'graphics' && (
          <div className="grid-2">
            <GpuPanel gpus={gpus} />
            <div className="card fade-in">
              <div className="card-header">
                <div className="card-title">🎮 GPU Info</div>
              </div>
              {gpus?.length > 0 ? gpus.map((g, i) => (
                <div key={i} style={{ marginBottom:12 }}>
                  {[
                    { label:'Name',        val: g.name },
                    { label:'Driver',      val: g.driver || 'N/A' },
                    { label:'Load',        val: `${g.load_percent}%` },
                    { label:'VRAM Used',   val: `${g.memory_used_mb} MB` },
                    { label:'VRAM Total',  val: `${g.memory_total_mb} MB` },
                    { label:'Temperature', val: g.temperature != null ? `${g.temperature}°C` : 'N/A' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
                      <span style={{ color:'var(--text2)' }}>{label}</span>
                      <span style={{ fontFamily:'var(--mono)', color:'var(--purple)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              )) : (
                <div className="no-gpu">No discrete GPU detected</div>
              )}
            </div>
          </div>
        )}

        {/* ─── STACKS TAB ─── */}
        {tab === 'stacks' && (
          <div className="grid-2-1">
            <StackPanel stacks={stacks} />
            <div>
              <div className="card fade-in">
                <div className="card-header">
                  <div className="card-title">📦 Stack Summary</div>
                </div>
                {stacks && Object.entries(stacks)
                  .filter(([,s]) => s.count > 0)
                  .sort(([,a],[,b]) => b.count - a.count)
                  .map(([name, s]) => (
                  <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
                    <span style={{ color:'var(--text)' }}>{name}</span>
                    <div style={{ display:'flex', gap:12 }}>
                      <span style={{ fontFamily:'var(--mono)', color:'var(--accent)', fontSize:11 }}>{s.cpu}%</span>
                      <span style={{ fontFamily:'var(--mono)', color:'var(--accent2)', fontSize:11 }}>{s.mem} MB</span>
                      <span style={{ fontFamily:'var(--mono)', color:'var(--text2)', fontSize:11 }}>{s.count} procs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── NETWORK TAB ─── */}
        {tab === 'network' && (
          <div className="grid-2">
            <NetworkPanel network={network} />
            <div className="card fade-in">
              <div className="card-header">
                <div className="card-title">🌐 Network Details</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { label:'Total Sent',     val:`${network?.bytes_sent_mb?.toFixed(1)} MB`, color:'var(--accent)'  },
                  { label:'Total Received', val:`${network?.bytes_recv_mb?.toFixed(1)} MB`, color:'var(--accent2)' },
                  { label:'Packets Sent',   val:network?.packets_sent?.toLocaleString(),     color:'var(--accent)'  },
                  { label:'Packets Recv',   val:network?.packets_recv?.toLocaleString(),     color:'var(--accent2)' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:14 }}>
                    <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase', marginBottom:6 }}>{label}</div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:700, color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PROCESSES TAB ─── */}
        {tab === 'processes' && (
          <div className="full-width">
            <ProcessTable processes={processes} />
          </div>
        )}
      </main>
    </div>
  );
}
