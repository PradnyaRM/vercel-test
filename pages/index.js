import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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

const DEPLOY_REQUIREMENTS = [
  { icon: '⬡', label: 'Runtime',         value: 'Node.js 20.x LTS',    note: 'Fluid Compute (default)' },
  { icon: '▲', label: 'Framework',        value: 'Next.js 14.2.3',      note: 'Pages Router · SSR' },
  { icon: '📦', label: 'Package Manager', value: 'npm',                 note: 'package-lock.json' },
  { icon: '🔨', label: 'Build Command',   value: 'next build',          note: 'Auto-detected by Vercel' },
  { icon: '📂', label: 'Output Dir',      value: '.next',               note: 'Vercel managed' },
  { icon: '⏱', label: 'Max Timeout',     value: '300 seconds',         note: 'All plans' },
];

const VERCEL_FEATURES = [
  { label: 'Automatic Git Deployments',   desc: 'Every push to main deploys to production automatically',            supported: true  },
  { label: 'Preview Deployments',         desc: 'Unique URL generated for every pull request branch',                supported: true  },
  { label: 'Server-Side Rendering (SSR)', desc: 'getServerSideProps runs on Vercel Fluid Compute per request',       supported: true  },
  { label: 'Serverless API Routes',       desc: '/api/* handlers run as isolated serverless functions',              supported: true  },
  { label: 'Instant Rollback',            desc: 'One-click rollback to any previous production deployment',          supported: true  },
  { label: 'Environment Variables',       desc: 'Managed via Vercel dashboard or vercel env pull for local dev',     supported: true  },
  { label: 'Edge Network / CDN',          desc: 'Static assets and cached responses served from global edge nodes',  supported: true  },
  { label: 'Custom Domains',             desc: 'Attach any domain with automatic TLS provisioning',                  supported: true  },
  { label: 'Rolling Releases',            desc: 'Gradual canary rollouts to a percentage of traffic',                supported: true  },
  { label: 'Vercel Analytics',            desc: 'Core Web Vitals and real-user performance metrics',                 supported: true  },
  { label: 'Static Site Generation',      desc: 'SSG pages not used in this app — all routes are SSR',              supported: false },
  { label: 'Edge Functions',             desc: 'Not recommended; use Fluid Compute (Node.js) instead',              supported: false },
];

const SUPPORT_DETAILS = [
  { label: 'Compute Model',  value: 'Fluid Compute',         sub: 'Reuses instances across concurrent requests; reduces cold starts' },
  { label: 'Pricing Model',  value: 'Active CPU Time',        sub: 'Charged for active CPU, provisioned memory, and invocations' },
  { label: 'Regions',        value: 'Auto (Global)',          sub: 'Closest region selected automatically per request' },
  { label: 'Environments',   value: 'Production / Preview / Development', sub: 'Separate env vars per environment via Vercel dashboard' },
  { label: 'CI/CD',          value: 'GitHub Actions + Vercel', sub: '.github/workflows/vercel.yml handles build & deploy pipeline' },
  { label: 'Health Endpoint',value: '/api/health',            sub: 'Returns 200 OK — used by Vercel to confirm function boot' },
  { label: 'Status Endpoint',value: '/api/status',           sub: 'Returns JSON service status for external monitoring' },
];

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #e8f4fd; }

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
    border-bottom: 1px solid #e2e8f0;
    animation: fadeIn 0.3s ease both;
  }
  .service-row:last-child { border-bottom: none; }
  .service-row:hover { background: #eff6ff; }

  .metric-card {
    background: #ffffff;
    border: 1px solid #dbeafe;
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
    border-color: #93c5fd;
    box-shadow: 0 8px 24px rgba(37,99,235,0.12);
  }

  .incident-row {
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 6px;
    padding-left: 8px;
    padding-right: 8px;
  }
  .incident-row:last-child { border-bottom: none; }
  .incident-row:hover { background: #eff6ff; }

  .expand-detail {
    overflow: hidden;
    transition: max-height 0.25s ease, opacity 0.25s ease;
  }

  .refresh-btn {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #475569;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .refresh-btn:hover {
    background: #e2e8f0;
    color: #1e293b;
    border-color: #94a3b8;
  }

  .filter-btn {
    background: transparent;
    border: 1px solid #cbd5e1;
    color: #64748b;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .filter-btn.active, .filter-btn:hover {
    background: #2563eb;
    border-color: #2563eb;
    color: #fff;
  }

  .deploy-req-card {
    background: #f8fbff;
    border: 1px solid #dbeafe;
    border-radius: 10px;
    padding: 0.85rem 1rem;
    flex: 1;
    min-width: 160px;
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    animation: fadeIn 0.3s ease both;
  }
  .deploy-req-card:hover {
    border-color: #93c5fd;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37,99,235,0.1);
  }

  .feature-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 8px;
    border-radius: 8px;
    transition: background 0.15s;
    border-bottom: 1px solid #e2e8f0;
    cursor: default;
  }
  .feature-row:last-child { border-bottom: none; }
  .feature-row:hover { background: #eff6ff; }

  .support-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 8px 16px;
    padding: 10px 8px;
    border-radius: 8px;
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.15s;
  }
  .support-row:last-child { border-bottom: none; }
  .support-row:hover { background: #eff6ff; }

  .section-tab {
    background: transparent;
    border: 1px solid #cbd5e1;
    color: #64748b;
    padding: 5px 14px;
    border-radius: 6px;
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.03em;
  }
  .section-tab.active {
    background: #2563eb;
    border-color: #2563eb;
    color: #fff;
  }
  .section-tab:hover { border-color: #93c5fd; color: #2563eb; }
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
        <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.95rem' }}>{name}</div>
        <div
          className="expand-detail"
          style={{ maxHeight: expanded ? 40 : 0, opacity: expanded ? 1 : 0 }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
            Uptime: <span style={{ color: '#16a34a' }}>{uptime}%</span>
            &nbsp;·&nbsp;
            Latency: <span style={{ color: latency > 200 ? '#d97706' : '#2563eb' }}>{latency}ms</span>
          </div>
        </div>
        {!expanded && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
            Click to expand
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <StatusBadge status={status} />
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
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
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.9rem', fontWeight: 700, color: color }}>
        {count}
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94a3b8' }}> {unit}</span>
      </div>
    </div>
  );
}

function CountdownBar({ seconds, total }) {
  return (
    <div style={{ height: 2, background: '#dbeafe', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
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
  const [deployTab, setDeployTab] = useState('requirements');

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
    operational: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
    degraded:    'linear-gradient(135deg, #fef9c3 0%, #fffbeb 100%)',
    outage:      'linear-gradient(135deg, #fee2e2 0%, #fff5f5 100%)',
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
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#e8f4fd', minHeight: '100vh', color: '#1e293b' }}>
        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #bfdbfe', padding: '12px 1rem', background: '#ffffff', boxShadow: '0 1px 4px rgba(37,99,235,0.08)' }}>
          <Link href="/"        style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.85rem', padding: '5px 10px', borderRadius: 6, background: '#2563eb', fontWeight: 600 }}>Dashboard</Link>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <Link href="/deploy"  style={{ color: '#475569', textDecoration: 'none', fontSize: '0.85rem', padding: '5px 10px', borderRadius: 6, transition: 'color 0.15s' }}>Deploy</Link>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <Link href="/history" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.85rem', padding: '5px 10px', borderRadius: 6, transition: 'color 0.15s' }}>History</Link>
        </nav>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: 8, width: 32, height: 32,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>▲</span>
                <div>
                  <h1 style={{
                    fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em',
                    background: 'linear-gradient(90deg, #1e3a5f 30%, #2563eb 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                  }}>Pivotree</h1>
                  <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                    Automatic App Deployment
                  </div>
                </div>
              </div>
              <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.82rem' }}>
                Real-time system health &nbsp;·&nbsp; Last updated: <span style={{ color: '#1e293b', fontWeight: 500 }}>{time}</span>
              </p>
              <CountdownBar seconds={countdown} total={REFRESH_INTERVAL} />
            </div>
            <button className="refresh-btn" onClick={() => { setTime(new Date().toLocaleTimeString()); setCountdown(REFRESH_INTERVAL); setRefreshKey(k => k + 1); }}>
              ↻ Refresh &nbsp;<span style={{ color: '#94a3b8' }}>{countdown}s</span>
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
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                {counts.operational} operational &nbsp;·&nbsp; {counts.degraded} degraded &nbsp;·&nbsp; {counts.outage} outage
              </div>
            </div>
            <PulseDot status={overallStatus} />
          </div>

          {/* Metrics */}
          <div key={`metrics-${refreshKey}`} style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <MetricCard index={0} label="Avg Uptime (30d)" value={metrics.avgUptime} unit="%" color="#16a34a" />
            <MetricCard index={1} label="Avg Latency"      value={metrics.avgLatency} unit="ms" color="#2563eb" />
            <MetricCard index={2} label="Incidents (30d)"  value={metrics.incidents}  unit="total" color="#d97706" />
            <MetricCard index={3} label="MTTR"             value={metrics.mttr}       unit="min" color="#7c3aed" />
          </div>

          {/* Services */}
          <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.5rem', boxShadow: '0 1px 6px rgba(37,99,235,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Services</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'operational', 'degraded', 'outage'].map(f => (
                  <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? `All (${initialServices.length})` : f === 'operational' ? `✓ ${counts.operational}` : f === 'degraded' ? `⚠ ${counts.degraded}` : `✕ ${counts.outage}`}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0
              ? <p style={{ color: '#64748b', fontSize: '0.9rem', padding: '8px 12px' }}>No services match this filter.</p>
              : filtered.map((s, i) => <ServiceRow key={s.name} {...s} index={i} />)
            }
          </div>

          {/* Incidents */}
          <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '1rem 1.2rem', boxShadow: '0 1px 6px rgba(37,99,235,0.06)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Recent Incidents</h2>
            {incidents.length === 0
              ? <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No incidents in the last 30 days.</p>
              : incidents.map((inc, i) => <IncidentRow key={i} incident={inc} index={i} total={incidents.length} />)
            }
          </div>

          {/* Deployment Info */}
          <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '1rem 1.2rem', marginTop: '1.5rem', boxShadow: '0 1px 6px rgba(37,99,235,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Vercel Deployment
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>Requirements, features &amp; support details</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['requirements', 'features', 'support'].map(tab => (
                  <button key={tab} className={`section-tab ${deployTab === tab ? 'active' : ''}`} onClick={() => setDeployTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {deployTab === 'requirements' && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {DEPLOY_REQUIREMENTS.map((r, i) => (
                  <div key={r.label} className="deploy-req-card" style={{ animationDelay: `${i * 50}ms` }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{r.value}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{r.note}</div>
                  </div>
                ))}
              </div>
            )}

            {deployTab === 'features' && (
              <div>
                {VERCEL_FEATURES.map((f, i) => (
                  <div key={f.label} className="feature-row" style={{ animationDelay: `${i * 30}ms` }}>
                    <span style={{ fontSize: '0.85rem', marginTop: 1, flexShrink: 0 }}>
                      {f.supported ? '✅' : '🚫'}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500, color: f.supported ? '#1e293b' : '#94a3b8' }}>{f.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deployTab === 'support' && (
              <div>
                {SUPPORT_DETAILS.map((s, i) => (
                  <div key={s.label} className="support-row" style={{ animationDelay: `${i * 40}ms` }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: 2 }}>{s.label}</div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{s.value}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '2rem' }}>
            Pivotree &nbsp;·&nbsp; Powered by Vercel
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
        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#1e293b' }}>{inc.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.72rem',
            background: inc.resolved ? '#dcfce7' : '#fee2e2',
            color: inc.resolved ? '#16a34a' : '#dc2626',
            border: `1px solid ${inc.resolved ? '#86efac' : '#fca5a5'}`,
            padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
          }}>
            {inc.resolved ? 'Resolved' : 'Ongoing'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      <div
        className="expand-detail"
        style={{ maxHeight: open ? 60 : 0, opacity: open ? 1 : 0 }}
      >
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>📅 {inc.date}</span>
          <span>⏱ Duration: <span style={{ color: '#475569' }}>{inc.duration}</span></span>
          <span>🔧 Affected: <span style={{ color: '#475569' }}>{inc.affected}</span></span>
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
