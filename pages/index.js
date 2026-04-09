import { useState, useEffect, useRef } from 'react';

const STATUS_COLORS = {
  operational: '#22c55e',
  degraded: '#f59e0b',
  outage: '#ef4444',
};

const STATUS_LABELS = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
};

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #000; }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.5); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countdownShrink {
    from { width: 100%; }
    to   { width: 0%; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  .service-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s ease;
    border-bottom: 1px solid #1f1f1f;
    animation: fadeIn 0.3s ease both;
  }
  .service-row:last-child { border-bottom: none; }
  .service-row:hover { background: #161616; }

  .metric-card {
    background: #111;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    flex: 1;
    min-width: 130px;
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    animation: fadeIn 0.4s ease both;
    cursor: default;
  }
  .metric-card:hover {
    transform: translateY(-3px);
    border-color: #333;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }

  .incident-row {
    padding: 12px 0;
    border-bottom: 1px solid #1a1a1a;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 6px;
    padding-left: 8px;
    padding-right: 8px;
  }
  .incident-row:last-child { border-bottom: none; }
  .incident-row:hover { background: #161616; }

  .expand-detail {
    overflow: hidden;
    transition: max-height 0.25s ease, opacity 0.25s ease;
  }

  .refresh-btn {
    background: #1a1a1a;
    border: 1px solid #333;
    color: #aaa;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .refresh-btn:hover {
    background: #222;
    color: #fff;
    border-color: #555;
  }

  .filter-btn {
    background: transparent;
    border: 1px solid #333;
    color: #888;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .filter-btn.active, .filter-btn:hover {
    background: #222;
    border-color: #555;
    color: #fff;
  }
`;

function PulseDot({ status }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 10, height: 10 }}>
      <span style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: STATUS_COLORS[status],
        opacity: status !== 'operational' ? 1 : 0.3,
        animation: status !== 'operational' ? 'pulse 1.4s ease infinite' : 'none',
      }} />
      <span style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: STATUS_COLORS[status],
      }} />
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: '0.82rem', fontWeight: 500,
      color: STATUS_COLORS[status],
    }}>
      <PulseDot status={status} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function ServiceRow({ name, status, uptime, latency, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="service-row"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, color: '#e5e7eb', fontSize: '0.95rem' }}>{name}</div>
        <div
          className="expand-detail"
          style={{ maxHeight: expanded ? 40 : 0, opacity: expanded ? 1 : 0 }}
        >
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>
            Uptime: <span style={{ color: '#22c55e' }}>{uptime}%</span>
            &nbsp;·&nbsp;
            Latency: <span style={{ color: latency > 200 ? '#f59e0b' : '#60a5fa' }}>{latency}ms</span>
          </div>
        </div>
        {!expanded && (
          <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: 2 }}>
            Click to expand
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <StatusBadge status={status} />
        <span style={{ color: '#4b5563', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color, index }) {
  const [count, setCount] = useState(0);
  const target = parseFloat(value);

  useEffect(() => {
    let start = 0;
    const steps = 40;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(2)));
    }, 25);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="metric-card" style={{ animationDelay: `${index * 80}ms` }}>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.9rem', fontWeight: 700, color: color }}>
        {count}
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#6b7280' }}> {unit}</span>
      </div>
    </div>
  );
}

function CountdownBar({ seconds, total }) {
  return (
    <div style={{ height: 2, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
      <div style={{
        height: '100%',
        background: '#3b82f6',
        width: `${(seconds / total) * 100}%`,
        transition: 'width 1s linear',
        borderRadius: 2,
      }} />
    </div>
  );
}

export default function StatusPage({ services: initialServices, incidents, metrics, lastUpdated }) {
  const REFRESH_INTERVAL = 30;
  const [time, setTime] = useState(lastUpdated);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [filter, setFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          setTime(new Date().toLocaleTimeString());
          setRefreshKey(k => k + 1);
          return REFRESH_INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const allOperational = initialServices.every(s => s.status === 'operational');
  const hasOutage = initialServices.some(s => s.status === 'outage');
  const overallStatus = hasOutage ? 'outage' : allOperational ? 'operational' : 'degraded';

  const overallGradient = {
    operational: 'linear-gradient(135deg, #052e16 0%, #0a0a0a 100%)',
    degraded:    'linear-gradient(135deg, #451a03 0%, #0a0a0a 100%)',
    outage:      'linear-gradient(135deg, #450a0a 0%, #0a0a0a 100%)',
  }[overallStatus];

  const filtered = filter === 'all'
    ? initialServices
    : initialServices.filter(s => s.status === filter);

  const counts = {
    operational: initialServices.filter(s => s.status === 'operational').length,
    degraded:    initialServices.filter(s => s.status === 'degraded').length,
    outage:      initialServices.filter(s => s.status === 'outage').length,
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#000', minHeight: '100vh', padding: '2rem 1rem', color: '#e5e7eb' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{
                fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #fff 0%, #888 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                SRE Status Dashboard
              </h1>
              <p style={{ color: '#4b5563', marginTop: 4, fontSize: '0.85rem' }}>
                Real-time system health &nbsp;·&nbsp; Last updated: <span style={{ color: '#9ca3af' }}>{time}</span>
              </p>
              <CountdownBar seconds={countdown} total={REFRESH_INTERVAL} />
            </div>
            <button className="refresh-btn" onClick={() => { setTime(new Date().toLocaleTimeString()); setCountdown(REFRESH_INTERVAL); setRefreshKey(k => k + 1); }}>
              ↻ Refresh &nbsp;<span style={{ color: '#555' }}>{countdown}s</span>
            </button>
          </div>

          {/* Overall Status Banner */}
          <div style={{
            background: overallGradient,
            border: `1px solid ${STATUS_COLORS[overallStatus]}33`,
            borderRadius: 12,
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: 14,
            animation: 'fadeIn 0.3s ease both',
          }}>
            <span style={{ fontSize: '1.6rem' }}>
              {overallStatus === 'operational' ? '✅' : overallStatus === 'degraded' ? '⚠️' : '🔴'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: STATUS_COLORS[overallStatus] }}>
                {overallStatus === 'operational' ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Partial Degradation' : 'Active Outage'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>
                {counts.operational} operational &nbsp;·&nbsp; {counts.degraded} degraded &nbsp;·&nbsp; {counts.outage} outage
              </div>
            </div>
            <PulseDot status={overallStatus} />
          </div>

          {/* Metrics */}
          <div key={`metrics-${refreshKey}`} style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <MetricCard index={0} label="Avg Uptime (30d)" value={metrics.avgUptime} unit="%" color="#22c55e" />
            <MetricCard index={1} label="Avg Latency"      value={metrics.avgLatency} unit="ms" color="#3b82f6" />
            <MetricCard index={2} label="Incidents (30d)"  value={metrics.incidents}  unit="total" color="#f59e0b" />
            <MetricCard index={3} label="MTTR"             value={metrics.mttr}       unit="min" color="#a78bfa" />
          </div>

          {/* Services */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Services</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'operational', 'degraded', 'outage'].map(f => (
                  <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? `All (${initialServices.length})` : f === 'operational' ? `✓ ${counts.operational}` : f === 'degraded' ? `⚠ ${counts.degraded}` : `✕ ${counts.outage}`}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0
              ? <p style={{ color: '#4b5563', fontSize: '0.9rem', padding: '8px 12px' }}>No services match this filter.</p>
              : filtered.map((s, i) => <ServiceRow key={s.name} {...s} index={i} />)
            }
          </div>

          {/* Incidents */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 12, padding: '1rem 1.2rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Recent Incidents</h2>
            {incidents.length === 0
              ? <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>No incidents in the last 30 days.</p>
              : incidents.map((inc, i) => <IncidentRow key={i} incident={inc} index={i} total={incidents.length} />)
            }
          </div>

          <p style={{ textAlign: 'center', color: '#374151', fontSize: '0.75rem', marginTop: '2rem' }}>
            Powered by Vercel &nbsp;·&nbsp; vercel-test POC
          </p>
        </div>
      </div>
    </>
  );
}

function IncidentRow({ incident: inc, index: i, total }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="incident-row"
      style={{ borderBottom: i < total - 1 ? '1px solid #1a1a1a' : 'none', animationDelay: `${i * 60}ms` }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#d1d5db' }}>{inc.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.72rem',
            background: inc.resolved ? '#052e16' : '#450a0a',
            color: inc.resolved ? '#22c55e' : '#f87171',
            border: `1px solid ${inc.resolved ? '#14532d' : '#7f1d1d'}`,
            padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
          }}>
            {inc.resolved ? 'Resolved' : 'Ongoing'}
          </span>
          <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      <div
        className="expand-detail"
        style={{ maxHeight: open ? 60 : 0, opacity: open ? 1 : 0 }}
      >
        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>📅 {inc.date}</span>
          <span>⏱ Duration: <span style={{ color: '#9ca3af' }}>{inc.duration}</span></span>
          <span>🔧 Affected: <span style={{ color: '#9ca3af' }}>{inc.affected}</span></span>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const services = [
    { name: 'API Gateway',        status: 'operational', uptime: 99.98, latency: 42  },
    { name: 'Authentication',     status: 'operational', uptime: 99.95, latency: 38  },
    { name: 'Database Cluster',   status: 'operational', uptime: 99.99, latency: 12  },
    { name: 'CDN / Edge Cache',   status: 'operational', uptime: 100.0, latency: 8   },
    { name: 'Monitoring & Logs',  status: 'degraded',    uptime: 98.72, latency: 310 },
    { name: 'CI/CD Pipeline',     status: 'operational', uptime: 99.61, latency: 95  },
    { name: 'Notification Service', status: 'operational', uptime: 99.80, latency: 55 },
  ];

  const incidents = [
    { title: 'Monitoring service high latency',              date: 'Apr 8, 2026',  duration: '47 min', affected: 'Monitoring & Logs',  resolved: false },
    { title: 'Database failover during scheduled maintenance', date: 'Mar 29, 2026', duration: '12 min', affected: 'Database Cluster',   resolved: true  },
    { title: 'CDN cache invalidation delay',                 date: 'Mar 15, 2026', duration: '23 min', affected: 'CDN / Edge Cache',   resolved: true  },
  ];

  const metrics = { avgUptime: 99.72, avgLatency: 80, incidents: 3, mttr: 27 };

  return {
    props: {
      services, incidents, metrics,
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  };
}
