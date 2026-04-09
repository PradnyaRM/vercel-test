import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  operational: '#22c55e',
  degraded: '#f59e0b',
  outage: '#ef4444',
};

const STATUS_LABELS = {
  operational: 'Operational',
  degraded: 'Degraded Performance',
  outage: 'Major Outage',
};

function StatusBadge({ status }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.85rem',
      fontWeight: 500,
      color: STATUS_COLORS[status],
    }}>
      <span style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: STATUS_COLORS[status],
        display: 'inline-block',
      }} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function ServiceRow({ name, status, uptime, latency }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 0',
      borderBottom: '1px solid #f0f0f0',
    }}>
      <div>
        <div style={{ fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 2 }}>
          Uptime: {uptime}% &nbsp;|&nbsp; Latency: {latency}ms
        </div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function MetricCard({ label, value, unit, color }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '1.2rem 1.5rem',
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: color || '#111' }}>
        {value}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#999' }}> {unit}</span>
      </div>
    </div>
  );
}

export default function StatusPage({ services, incidents, metrics, lastUpdated }) {
  const [time, setTime] = useState(lastUpdated);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allOperational = services.every(s => s.status === 'operational');
  const hasOutage = services.some(s => s.status === 'outage');

  const overallStatus = hasOutage ? 'outage' : allOperational ? 'operational' : 'degraded';
  const overallBg = hasOutage ? '#fef2f2' : allOperational ? '#f0fdf4' : '#fffbeb';
  const overallBorder = STATUS_COLORS[overallStatus];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>SRE Status Dashboard</h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: '0.9rem' }}>
            Real-time system health for all services &nbsp;·&nbsp; Last updated: {time}
          </p>
        </div>

        {/* Overall Status Banner */}
        <div style={{
          background: overallBg,
          border: `1px solid ${overallBorder}`,
          borderRadius: 10,
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: '1.4rem' }}>
            {overallStatus === 'operational' ? '✅' : overallStatus === 'degraded' ? '⚠️' : '🔴'}
          </span>
          <div>
            <div style={{ fontWeight: 600 }}>
              {overallStatus === 'operational'
                ? 'All Systems Operational'
                : overallStatus === 'degraded'
                ? 'Partial System Degradation'
                : 'Active Outage Detected'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
              {services.filter(s => s.status === 'operational').length} of {services.length} services healthy
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <MetricCard label="Avg Uptime (30d)" value={metrics.avgUptime} unit="%" color="#22c55e" />
          <MetricCard label="Avg Latency" value={metrics.avgLatency} unit="ms" color="#3b82f6" />
          <MetricCard label="Incidents (30d)" value={metrics.incidents} unit="total" color="#f59e0b" />
          <MetricCard label="MTTR" value={metrics.mttr} unit="min" color="#8b5cf6" />
        </div>

        {/* Services */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Services</h2>
          {services.map(s => (
            <ServiceRow key={s.name} {...s} />
          ))}
        </div>

        {/* Incidents */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '1rem 1.5rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Recent Incidents</h2>
          {incidents.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No incidents in the last 30 days.</p>
          ) : incidents.map((inc, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < incidents.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{inc.title}</div>
                <span style={{
                  fontSize: '0.75rem',
                  background: inc.resolved ? '#f0fdf4' : '#fef2f2',
                  color: inc.resolved ? '#16a34a' : '#dc2626',
                  padding: '2px 8px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                  marginLeft: 12,
                }}>
                  {inc.resolved ? 'Resolved' : 'Ongoing'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 3 }}>
                {inc.date} &nbsp;·&nbsp; Duration: {inc.duration} &nbsp;·&nbsp; Affected: {inc.affected}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: '0.8rem', marginTop: '2rem' }}>
          Powered by Vercel &nbsp;·&nbsp; vercel-test POC
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const services = [
    { name: 'API Gateway',       status: 'operational', uptime: 99.98, latency: 42  },
    { name: 'Authentication',    status: 'operational', uptime: 99.95, latency: 38  },
    { name: 'Database Cluster',  status: 'operational', uptime: 99.99, latency: 12  },
    { name: 'CDN / Edge Cache',  status: 'operational', uptime: 100.0, latency: 8   },
    { name: 'Monitoring & Logs', status: 'degraded',    uptime: 98.72, latency: 310 },
    { name: 'CI/CD Pipeline',    status: 'operational', uptime: 99.61, latency: 95  },
    { name: 'Notification Service', status: 'operational', uptime: 99.80, latency: 55 },
  ];

  const incidents = [
    {
      title: 'Monitoring service high latency',
      date: 'Apr 8, 2026',
      duration: '47 min',
      affected: 'Monitoring & Logs',
      resolved: false,
    },
    {
      title: 'Database failover during scheduled maintenance',
      date: 'Mar 29, 2026',
      duration: '12 min',
      affected: 'Database Cluster',
      resolved: true,
    },
    {
      title: 'CDN cache invalidation delay',
      date: 'Mar 15, 2026',
      duration: '23 min',
      affected: 'CDN / Edge Cache',
      resolved: true,
    },
  ];

  const metrics = {
    avgUptime: 99.72,
    avgLatency: 80,
    incidents: 3,
    mttr: 27,
  };

  return {
    props: {
      services,
      incidents,
      metrics,
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  };
}
