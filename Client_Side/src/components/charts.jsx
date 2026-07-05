import React, { useState, useEffect, useRef, useMemo } from 'react';

/* EduManage — Charts (pure SVG, theme-aware) */

// Smooth area + line chart
function LineChart({ data, height = 200, accent = 'var(--accent)', yMax = 4, yLabel, fmt = (v) => v }) {
  const ref = useRef(null);
  const [w, setW] = useState(560);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width));
    ro.observe(ref.current); return () => ro.disconnect();
  }, []);
  const padL = 36, padB = 28, padT = 14, padR = 12;
  const iw = Math.max(10, w - padL - padR), ih = height - padB - padT;
  const n = data.length;
  const x = i => padL + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = v => padT + ih - (v / yMax) * ih;
  const pts = data.map((d, i) => [x(i), y(d.gpa ?? d.value)]);
  // smooth path
  const line = pts.map((p, i) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const prev = pts[i - 1];
    const cx = (prev[0] + p[0]) / 2;
    return `C ${cx} ${prev[1]} ${cx} ${p[1]} ${p[0]} ${p[1]}`;
  }).join(' ');
  const area = `${line} L ${pts[pts.length-1][0]} ${padT+ih} L ${pts[0][0]} ${padT+ih} Z`;
  const gid = useMemo(() => 'g' + Math.random().toString(36).slice(2), []);
  const ticks = 4;
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.26"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const gv = (yMax / ticks) * i;
          const gy = y(gv);
          return (
            <g key={i}>
              <line x1={padL} y1={gy} x2={w - padR} y2={gy} stroke="var(--border)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 4'}/>
              <text x={padL - 8} y={gy + 4} textAnchor="end" fontSize="10.5" fill="var(--muted)">{fmt(gv)}</text>
            </g>
          );
        })}
        <path d={area} fill={`url(#${gid})`}/>
        <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="4.5" fill="var(--surface)" stroke={accent} strokeWidth="2.5"/>
            <text x={p[0]} y={padT + ih + 18} textAnchor="middle" fontSize="10.5" fill="var(--muted)">{data[i].term ?? data[i].label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Vertical bar chart
function BarChart({ data, height = 200, accent = 'var(--accent)' }) {
  const ref = useRef(null);
  const [w, setW] = useState(560);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width));
    ro.observe(ref.current); return () => ro.disconnect();
  }, []);
  const padL = 30, padB = 26, padT = 12, padR = 8;
  const iw = Math.max(10, w - padL - padR), ih = height - padB - padT;
  const max = Math.max(...data.map(d => d.value), 1);
  const bw = iw / data.length;
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }}>
        {[0, 0.5, 1].map((f, i) => (
          <line key={i} x1={padL} y1={padT + ih - f * ih} x2={w - padR} y2={padT + ih - f * ih} stroke="var(--border)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 4'}/>
        ))}
        {data.map((d, i) => {
          const bh = (d.value / max) * ih;
          const bx = padL + i * bw + bw * 0.22;
          const bw2 = bw * 0.56;
          const by = padT + ih - bh;
          return (
            <g key={i}>
              <rect x={bx} y={by} width={bw2} height={bh} rx="5" fill={d.color || accent} opacity={d.dim ? 0.4 : 1} style={{ transition: 'height .5s, y .5s' }}/>
              <text x={bx + bw2 / 2} y={by - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-2)">{d.value}</text>
              <text x={bx + bw2 / 2} y={padT + ih + 16} textAnchor="middle" fontSize="10.5" fill="var(--muted)">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Donut chart with center label
function DonutChart({ data, size = 168, thickness = 22, centerTop, centerSub }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thickness}/>
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .6s' }}/>
            );
            offset += len;
            return el;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>{centerTop ?? total}</div>
            {centerSub && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{centerSub}</div>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 4 }}>{d.value}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{Math.round(d.value/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal bars (ranked list)
function HBars({ data, accent = 'var(--accent)' }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{d.label}</span>
            <span style={{ fontWeight: 700 }}>{d.value}{d.suffix || ''}</span>
          </div>
          <div style={{ height: 8, borderRadius: 6, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (d.value / max * 100) + '%', borderRadius: 6, background: d.color || accent, transition: 'width .6s cubic-bezier(.22,.61,.36,1)' }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// Progress ring (small)
function Ring({ value, max = 4, size = 120, thickness = 11, color = 'var(--accent)', label, sub }) {
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  const len = Math.min(value / max, 1) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thickness}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={`${len} ${c}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray .7s' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>{label}</div>
          {sub && <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export { LineChart, BarChart, DonutChart, HBars, Ring };
