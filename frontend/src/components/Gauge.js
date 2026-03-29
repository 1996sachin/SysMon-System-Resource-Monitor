import React from 'react';

const COLORS = {
  green:  '#3fb950',
  blue:   '#58a6ff',
  yellow: '#d29922',
  red:    '#f85149',
  purple: '#bc8cff',
  cyan:   '#39d0d8',
  orange: '#f0883e',
};

function getColor(pct, customColor) {
  if (customColor) return COLORS[customColor] || customColor;
  if (pct >= 90) return COLORS.red;
  if (pct >= 70) return COLORS.yellow;
  return COLORS.green;
}

export default function Gauge({ value = 0, size = 100, color, label, sublabel }) {
  const pct    = Math.min(100, Math.max(0, value));
  const r      = 40;
  const cx     = 54;
  const cy     = 54;
  const stroke = 6;
  const circ   = 2 * Math.PI * r;
  // 270° arc (start top-left, end top-right)
  const arcLen = circ * 0.75;
  const offset = arcLen - (pct / 100) * arcLen;
  const c      = getColor(pct, color);

  return (
    <div className="gauge-wrap" style={{ width: size }}>
      <svg
        className="gauge-svg"
        viewBox="0 0 108 90"
        width={size}
        height={size * 0.83}
      >
        {/* Background arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#161b22"
          strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ - arcLen}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
        />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ - arcLen}`}
          strokeDashoffset={offset + circ * 0.125}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1), stroke 0.4s' }}
          filter={`drop-shadow(0 0 4px ${c}88)`}
        />
        {/* Center value */}
        <text x={cx} y={cy - 4} className="gauge-text"
          style={{ fill: '#e6edf3', fontSize: 18, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>
          {Math.round(pct)}
        </text>
        <text x={cx} y={cy + 12} className="gauge-text"
          style={{ fill: '#8b949e', fontSize: 9, fontFamily: 'Space Mono, monospace' }}>
          %
        </text>
      </svg>
      {label    && <div style={{ textAlign:'center', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.7px', color:'#8b949e' }}>{label}</div>}
      {sublabel && <div style={{ textAlign:'center', fontSize:10, color:'#484f58', marginTop:2 }}>{sublabel}</div>}
    </div>
  );
}
