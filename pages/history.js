import { useState } from 'react';
import Link from 'next/link';

const STATUS_COLOR = {
  triggered:   { bg: '#dbeafe', border: '#93c5fd', text: '#2563eb',  label: 'Triggered'   },
  in_progress: { bg: '#fef9c3', border: '#fde047', text: '#d97706',  label: 'In Progress' },
  error:       { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626',  label: 'Failed'      },
};

const FRAMEWORK_ICONS = {
  nextjs:  '▲', react: '⚛', nodejs: '⬡', vue: '◆',
  nuxt: '◆', svelte: '▼', vite: '⚡', other: '◻',
};

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #e8f4fd; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .hist-row {
    background:#ffffff; border:1px solid #dbeafe; border-radius:10px;
    padding:1rem 1.2rem; cursor:pointer; transition:border-color 0.15s, background 0.15s, box-shadow 0.15s;
    animation:fadeIn 0.25s ease both; box-shadow:0 1px 4px rgba(37,99,235,0.05);
  }
  .hist-row:hover { background:#f0f7ff; border-color:#93c5fd; box-shadow:0 4px 12px rgba(37,99,235,0.1); }

  .hist-detail {
    overflow:hidden; transition:max-height 0.3s ease, opacity 0.3s ease;
  }

  .nav-link {
    color:#475569; text-decoration:none; font-size:0.85rem;
    padding:5px 10px; border-radius:6px; transition:all 0.15s;
  }
  .nav-link:hover  { color:#1e293b; background:#dbeafe; }
  .nav-link.active { color:#ffffff; background:#2563eb; font-weight:600; }

  .filter-btn {
    background:transparent; border:1px solid #cbd5e1; color:#64748b;
    padding:4px 12px; border-radius:20px; font-size:0.75rem; cursor:pointer;
    transition:all 0.15s; font-family:inherit;
  }
  .filter-btn.active, .filter-btn:hover {
    background:#2563eb; border-color:#2563eb; color:#fff;
  }

  .btn-outline {
    background:#f1f5f9; border:1px solid #cbd5e1; color:#475569;
    padding:6px 14px; border-radius:6px; font-size:0.78rem; cursor:pointer;
    transition:all 0.15s; font-family:inherit;
  }
  .btn-outline:hover { background:#e2e8f0; color:#1e293b; border-color:#94a3b8; }

  .btn-danger {
    background:transparent; border:1px solid #fca5a5; color:#dc2626;
    padding:6px 14px; border-radius:6px; font-size:0.78rem; cursor:pointer;
    transition:all 0.15s; font-family:inherit;
  }
  .btn-danger:hover { background:#fee2e2; }

  .code-pre {
    background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px;
    padding:12px 14px; font-family:'SF Mono','Fira Code','Consolas',monospace;
    font-size:0.74rem; color:#334155; line-height:1.6; overflow-x:auto;
    white-space:pre; margin-top:6px;
  }

  .copy-btn {
    background:#f1f5f9; border:1px solid #cbd5e1; color:#64748b;
    padding:3px 9px; border-radius:5px; font-size:0.72rem; cursor:pointer;
    transition:all 0.15s; font-family:inherit;
  }
  .copy-btn:hover { background:#e2e8f0; color:#1e293b; border-color:#94a3b8; }

  .deploy-btn {
    background:linear-gradient(135deg,#2563eb,#7c3aed); border:none; color:#fff;
    padding:10px 22px; border-radius:8px; font-size:0.85rem; font-weight:600;
    cursor:pointer; transition:opacity 0.15s, transform 0.15s; font-family:inherit;
    box-shadow:0 4px 14px rgba(37,99,235,0.3);
  }
  .deploy-btn:hover { opacity:0.9; transform:translateY(-1px); }
`;

function Nav({ current }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 4,
      borderBottom: '1px solid #bfdbfe', padding: '12px 1rem', marginBottom: '2rem',
      background: '#ffffff', boxShadow: '0 1px 4px rgba(37,99,235,0.08)',
    }}>
      <Link href="/"        className={`nav-link ${current === 'dashboard' ? 'active' : ''}`}>Assessment</Link>
      <span style={{ color: '#cbd5e1' }}>·</span>
      <Link href="/deploy"  className={`nav-link ${current === 'deploy'    ? 'active' : ''}`}>Deploy</Link>
      <span style={{ color: '#cbd5e1' }}>·</span>
      <Link href="/history" className={`nav-link ${current === 'history'   ? 'active' : ''}`}>History</Link>
    </nav>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return <button className="copy-btn" onClick={e => { e.stopPropagation(); copy(); }}>{copied ? '✓ Copied' : 'Copy'}</button>;
}

function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR.in_progress;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}

function HistoryRow({ dep, index }) {
  const [open, setOpen] = useState(false);

  const pipelineYaml = dep.hookUrl
    ? `image: atlassian/default-image:4\n\npipelines:\n  branches:\n    ${dep.branch}:\n      - step:\n          name: Deploy to Vercel\n          script:\n            - curl -X POST "${dep.hookUrl}"`
    : null;

  return (
    <div
      className="hist-row"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Row header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{FRAMEWORK_ICONS[dep.framework] || '◻'}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dep.originalName || dep.projectName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>
              {dep.bbWorkspace}/{dep.bbSlug} &nbsp;·&nbsp; <span style={{ color: '#64748b' }}>{dep.branch}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <StatusBadge status={dep.status} />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {new Date(dep.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expandable details */}
      <div className="hist-detail" style={{ maxHeight: open ? 600 : 0, opacity: open ? 1 : 0 }}>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Quick facts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {[
              { label: 'Framework',   value: dep.framework },
              { label: 'Target',      value: dep.deployType },
              { label: 'Env Vars',    value: `${dep.envCount} configured` },
              { label: 'Project ID',  value: dep.vercelProjectId || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: 8,
                padding: '7px 12px', flex: 1, minWidth: 100,
              }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Deployment URL */}
          {dep.deploymentUrl && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Deployment URL</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px' }}>
                <a href={dep.deploymentUrl} target="_blank" rel="noreferrer"
                  style={{ color: '#2563eb', fontSize: '0.82rem', textDecoration: 'none', flex: 1 }}>
                  {dep.deploymentUrl}
                </a>
                <CopyBtn text={dep.deploymentUrl} />
              </div>
            </div>
          )}

          {/* Deploy hook URL */}
          {dep.hookUrl && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deploy Hook URL</span>
                <CopyBtn text={dep.hookUrl} />
              </div>
              <div style={{ background: '#f5f0ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem', color: '#7c3aed', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {dep.hookUrl}
              </div>
            </div>
          )}

          {/* Pipeline YAML */}
          {pipelineYaml && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>bitbucket-pipelines.yml</span>
                <CopyBtn text={pipelineYaml} />
              </div>
              <pre className="code-pre">{pipelineYaml}</pre>
            </div>
          )}

          {/* Error */}
          {dep.error && (
            <div style={{ padding: '8px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: '0.82rem', color: '#dc2626' }}>
              {dep.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage({ deployments: initial }) {
  const [deployments, setDeployments] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [clearing, setClearing] = useState(false);

  const counts = {
    all:         deployments.length,
    triggered:   deployments.filter(d => d.status === 'triggered').length,
    error:       deployments.filter(d => d.status === 'error').length,
    in_progress: deployments.filter(d => d.status === 'in_progress').length,
  };

  const filtered = filter === 'all' ? deployments : deployments.filter(d => d.status === filter);

  async function refresh() {
    const res = await fetch('/api/deploy/history');
    const data = await res.json();
    setDeployments(data.deployments || []);
  }

  async function clearHistory() {
    if (!confirm('Clear all deployment history?')) return;
    setClearing(true);
    await fetch('/api/deploy/history', { method: 'DELETE' });
    setDeployments([]);
    setClearing(false);
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#e8f4fd', minHeight: '100vh', color: '#1e293b' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1rem' }}>
          <Nav current="history" />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '1.8rem' }}>
            <div>
              <h1 style={{
                fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg,#1e3a5f 30%,#2563eb 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Deployment History
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 4 }}>
                {deployments.length} total deployment{deployments.length !== 1 ? 's' : ''} · stored in-memory
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-outline" onClick={refresh}>↻ Refresh</button>
              {deployments.length > 0 && (
                <button className="btn-danger" onClick={clearHistory} disabled={clearing}>
                  {clearing ? '…' : 'Clear All'}
                </button>
              )}
              <Link href="/deploy" style={{ textDecoration: 'none' }}>
                <button className="deploy-btn">+ New Deploy</button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            {[
              ['all',         `All (${counts.all})`],
              ['triggered',   `✓ Triggered (${counts.triggered})`],
              ['error',       `✕ Failed (${counts.error})`],
              ['in_progress', `⏳ In Progress (${counts.in_progress})`],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`filter-btn ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div style={{
              background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12,
              padding: '3rem', textAlign: 'center', boxShadow: '0 1px 6px rgba(37,99,235,0.06)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📭</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {deployments.length === 0
                  ? 'No deployments yet. Start your first deployment!'
                  : 'No deployments match this filter.'}
              </div>
              {deployments.length === 0 && (
                <Link href="/deploy" style={{ textDecoration: 'none' }}>
                  <button className="deploy-btn" style={{ marginTop: 16 }}>Deploy Now</button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((dep, i) => (
                <HistoryRow key={dep.id} dep={dep} index={i} />
              ))}
            </div>
          )}

          {/* Setup guide */}
          <div style={{
            background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12,
            padding: '1rem 1.2rem', marginTop: '2rem', boxShadow: '0 1px 6px rgba(37,99,235,0.06)',
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              Required Secrets
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { key: 'VERCEL_TOKEN',          req: true,  desc: 'API token from vercel.com/account/tokens' },
                { key: 'VERCEL_TEAM_ID',         req: false, desc: 'Team ID — only needed for team/org projects' },
                { key: 'BITBUCKET_USERNAME',     req: false, desc: 'Bitbucket account username for repo validation' },
                { key: 'BITBUCKET_APP_PASSWORD', req: false, desc: 'Bitbucket app password (not account password)' },
              ].map(({ key, req, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: '0.7rem', marginTop: 3, flexShrink: 0, color: req ? '#d97706' : '#94a3b8' }}>
                    {req ? '●' : '○'}
                  </span>
                  <div>
                    <code style={{ fontSize: '0.8rem', color: '#7c3aed', background: '#f5f0ff', padding: '1px 5px', borderRadius: 4 }}>
                      {key}
                    </code>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 8 }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 10 }}>
              ● Required &nbsp; ○ Optional — Add these via <code style={{ color: '#64748b' }}>vercel env add</code> or the Vercel project dashboard.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const deployments = global._deployHistory || [];
  return { props: { deployments: JSON.parse(JSON.stringify(deployments)) } };
}
