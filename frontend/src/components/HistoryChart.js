import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function fmt(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-style" style={{ padding:'8px 12px' }}>
      <div style={{ marginBottom:4, color:'var(--text2)', fontSize:10 }}>{fmt(label)}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontSize:11 }}>
          {p.name}: <strong>{p.value?.toFixed(1)}%</strong>
        </div>
      ))}
    </div>
  );
};

export default function HistoryChart({ history }) {
  if (!history || history.length === 0) return null;

  const recent = history.slice(-60);

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title"><span className="icon">📈</span> Resource History</div>
        <span style={{ fontSize:11, color:'var(--text2)', fontFamily:'var(--mono)' }}>
          last {recent.length}s
        </span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recent} margin={{ top:4, right:4, bottom:0, left:-20 }}>
            <defs>
              {[
                ['cpu',  '#58a6ff'],
                ['ram',  '#3fb950'],
                ['disk', '#39d0d8'],
              ].map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis
              dataKey="time"
              tickFormatter={fmt}
              tick={{ fill:'#8b949e', fontSize:9, fontFamily:'Space Mono' }}
              tickLine={false}
              axisLine={{ stroke:'#21262d' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill:'#8b949e', fontSize:9, fontFamily:'Space Mono' }}
              tickLine={false}
              axisLine={{ stroke:'#21262d' }}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize:11, fontFamily:'Outfit', color:'#8b949e', paddingTop:8 }}
              iconType="circle"
              iconSize={8}
            />
            <Area type="monotone" dataKey="cpu"  name="CPU"  stroke="#58a6ff" fill="url(#grad-cpu)"  strokeWidth={1.5} dot={false} />
            <Area type="monotone" dataKey="ram"  name="RAM"  stroke="#3fb950" fill="url(#grad-ram)"  strokeWidth={1.5} dot={false} />
            <Area type="monotone" dataKey="disk" name="Disk" stroke="#39d0d8" fill="url(#grad-disk)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
