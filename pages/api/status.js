const services = [
  { name: 'API Gateway',          status: 'operational', uptime: 99.98, latency: 42  },
  { name: 'Authentication',       status: 'operational', uptime: 99.95, latency: 38  },
  { name: 'Database Cluster',     status: 'operational', uptime: 99.99, latency: 12  },
  { name: 'CDN / Edge Cache',     status: 'operational', uptime: 100.0, latency: 8   },
  { name: 'Monitoring & Logs',    status: 'degraded',    uptime: 98.72, latency: 310 },
  { name: 'CI/CD Pipeline',       status: 'operational', uptime: 99.61, latency: 95  },
  { name: 'Notification Service', status: 'operational', uptime: 99.80, latency: 55  },
];

export default function handler(req, res) {
  const allOperational = services.every(s => s.status === 'operational');
  const hasOutage = services.some(s => s.status === 'outage');

  res.status(200).json({
    overall: hasOutage ? 'outage' : allOperational ? 'operational' : 'degraded',
    services,
    timestamp: new Date().toISOString(),
  });
}
