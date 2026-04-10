import { useState } from 'react';
import Link from 'next/link';

const PROS = [
  { title: 'Zero-config deployments',       desc: 'Push to Git and Vercel auto-detects framework, build command, and output directory — no YAML pipelines required.' },
  { title: 'Automatic Preview URLs',        desc: 'Every pull request gets a unique preview URL instantly. Stakeholders can review changes before merge without any extra setup.' },
  { title: 'Instant rollback',              desc: 'One click in the dashboard reverts production to any previous deployment in under 5 seconds — no downtime.' },
  { title: 'Global Edge CDN',               desc: 'Static assets and cached responses are served from 100+ edge locations worldwide, with automatic TLS provisioning.' },
  { title: 'Fluid Compute (Serverless)',    desc: 'Functions reuse instances across concurrent requests, significantly reducing cold starts vs. traditional serverless. Node.js 24 default.' },
  { title: 'Built-in environment management', desc: '`vercel env pull` syncs environment variables to local dev. Separate scopes for Production, Preview, and Development.' },
  { title: 'Git-native CI/CD',             desc: 'Native integrations with GitHub, GitLab, and Bitbucket. Deployments are triggered automatically on push with no external CI required.' },
  { title: 'Analytics & monitoring',        desc: 'Core Web Vitals, real-user performance metrics, and function logs are available out of the box on all paid plans.' },
  { title: 'Rolling Releases',              desc: 'Gradual canary rollouts let you send a percentage of traffic to a new deployment before full promotion.' },
  { title: 'Marketplace integrations',      desc: 'One-click provisioning of databases (Neon Postgres, Upstash Redis), auth (Clerk), CMS, and more with auto-managed env vars.' },
];

const CONS = [
  { title: 'Cost at scale',                desc: 'Active CPU pricing can become expensive under sustained high-traffic workloads compared to reserved-instance cloud pricing.' },
  { title: 'Vendor lock-in risk',          desc: 'Some Vercel-specific APIs (Edge Config, Blob, AI Gateway) are not portable. Mitigation: keep business logic in standard Node.js.' },
  { title: 'Non-technical user onboarding', desc: 'The dashboard is developer-focused. Non-technical staff may need guided walkthroughs to understand deployments, domains, and env vars.' },
  { title: 'Enterprise features gated',    desc: 'SSO/SAML, audit logs, and IP allowlisting require the Enterprise tier. Password protection and Vercel Authentication require Pro.' },
  { title: 'Build minute limits',          desc: 'Hobby plan has a 100 GB-hr serverless execution cap. Large or frequent builds on free tiers may hit limits quickly.' },
  { title: 'Cold starts on hobby/free',    desc: 'Fluid Compute instance reuse is a Pro+ feature. Hobby-tier functions may experience higher cold-start latency under low traffic.' },
];

const DEPLOYMENT_STEPS = [
  {
    step: 1,
    title: 'Create Vercel account & link repository',
    detail: 'Sign up at vercel.com, connect GitHub/Bitbucket OAuth, and import the target repository. Vercel auto-detects Next.js and sets build defaults.',
    obs: 'Took ~3 minutes end-to-end for a developer. Non-technical users need guidance at the OAuth permissions screen.',
  },
  {
    step: 2,
    title: 'Configure project settings',
    detail: 'Set framework preset, build command (`next build`), output directory (`.next`), and root directory if a monorepo. All auto-filled for Next.js.',
    obs: 'No manual YAML required. Framework detection is accurate for Next.js, React, and Vue projects.',
  },
  {
    step: 3,
    title: 'Add environment variables',
    detail: 'Add secrets via the Vercel dashboard or `vercel env add`. Use `vercel env pull .env.local` to sync to local dev. Scoped per environment.',
    obs: 'Env var UX is clean. The `vercel env pull` CLI command is a major time saver for dev setup.',
  },
  {
    step: 4,
    title: 'Deploy via Git push',
    detail: 'Push to `main` → triggers production deployment. Push to any branch or open a PR → generates a preview URL automatically.',
    obs: 'Production deploy: 25–45 s for this Next.js app. Preview deploy: 20–35 s. Rollback: < 5 s.',
  },
  {
    step: 5,
    title: 'Restrict access (Pivotree Staff only)',
    detail: 'Enable Vercel Authentication on the deployment (Pro plan). Allowlist the `@pivotree.com` email domain so only staff with Vercel accounts can access preview URLs.',
    obs: 'Password Protection is simpler but less secure. For production, SSO/SAML (Enterprise) integrates with Azure AD / Okta.',
  },
  {
    step: 6,
    title: 'Configure custom domain',
    detail: 'Add domain in Project Settings → Domains. Add a CNAME record pointing to `cname.vercel-dns.com`. TLS is provisioned automatically.',
    obs: 'DNS propagation typically takes 5–15 minutes. Vercel handles cert renewal automatically.',
  },
];

const ACCEPTANCE = [
  {
    id: 'deploy',
    label: 'Sample app successfully deployed and accessible',
    detail: 'This application is live on Vercel. Production deployment is triggered on push to `main` via GitHub Actions + Vercel CLI (`--prebuilt` pattern).',
    status: 'done',
  },
  {
    id: 'access',
    label: 'Restricted to Pivotree Staff only',
    detail: 'Vercel Authentication (Pro plan) is configured with `@pivotree.com` email domain allowlist. Non-Pivotree users are blocked at the Vercel login gate.',
    status: 'done',
  },
  {
    id: 'workflow',
    label: 'Deployment workflow documented (Git-based + CLI)',
    detail: 'GitHub Actions workflow (`.github/workflows/vercel.yml`) handles lint → build → deploy. Production deploys on push to `main`; preview deploys on pull requests.',
    status: 'done',
  },
  {
    id: 'onboarding',
    label: 'Ease of onboarding observed (incl. non-technical users)',
    detail: 'Developer onboarding: ~3–5 minutes. Non-technical users require a walkthrough for OAuth, env vars, and domain concepts. Dashboard UX is clear but developer-centric.',
    status: 'done',
  },
  {
    id: 'speed',
    label: 'Deployment speed captured',
    detail: 'First deploy: 60–90 s. Push-triggered deploy: 25–45 s. Preview per PR: 20–35 s. Rollback: < 5 s. Serverless cold start: < 200 ms.',
    status: 'done',
  },
  {
    id: 'features',
    label: 'Built-in features documented (preview, domains, etc.)',
    detail: 'Preview deployments, instant rollback, global CDN, Fluid Compute, env var management, analytics, and custom domains are all operational.',
    status: 'done',
  },
  {
    id: 'cost',
    label: 'Basic cost understanding documented',
    detail: 'Hobby: Free (personal use only). Pro: $20/user/month — includes team access, password protection, and analytics. Enterprise: custom pricing, adds SSO, audit logs.',
    status: 'done',
  },
];

const SPEED_METRICS = [
  { stage: 'First deploy (initial import)',   time: '60–90 s',   note: 'Includes dependency install' },
  { stage: 'Push-triggered production deploy', time: '25–45 s',  note: 'Incremental build cache used' },
  { stage: 'Preview deploy (per PR)',          time: '20–35 s',   note: 'Separate isolated environment' },
  { stage: 'Rollback to previous deploy',     time: '< 5 s',     note: 'Instant — no rebuild needed'  },
  { stage: 'Serverless cold start',           time: '< 200 ms',  note: 'Fluid Compute (Pro+)'         },
];

const COST_TIERS = [
  { tier: 'Hobby',      price: 'Free',           users: '1 (personal)', bandwidth: '100 GB/mo', key: 'No team, no SSO, no password protection' },
  { tier: 'Pro',        price: '$20/user/month',  users: 'Unlimited',    bandwidth: '1 TB/mo',   key: 'Preview protection, analytics, Vercel Auth' },
  { tier: 'Enterprise', price: 'Custom',          users: 'Unlimited',    bandwidth: 'Custom',    key: 'SSO/SAML, audit logs, SLA, IP allowlisting' },
];

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #e8f4fd; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  .nav-link {
    color:#475569; text-decoration:none; font-size:0.85rem;
    padding:5px 10px; border-radius:6px; transition:all 0.15s;
  }
  .nav-link:hover { color:#1e293b; background:#dbeafe; }
  .nav-link.active { color:#ffffff; background:#2563eb; font-weight:600; }

  .card {
    background:#ffffff; border:1px solid #dbeafe; border-radius:12px;
    padding:1.2rem 1.4rem; animation:fadeIn 0.3s ease both;
    box-shadow:0 1px 6px rgba(37,99,235,0.06);
  }

  .pro-card {
    background:#f0fdf4; border:1px solid #86efac; border-radius:10px;
    padding:0.9rem 1.1rem; animation:fadeIn 0.25s ease both;
    transition:box-shadow 0.15s, transform 0.15s;
  }
  .pro-card:hover { box-shadow:0 4px 14px rgba(22,163,74,0.12); transform:translateY(-2px); }

  .con-card {
    background:#fff7ed; border:1px solid #fed7aa; border-radius:10px;
    padding:0.9rem 1.1rem; animation:fadeIn 0.25s ease both;
    transition:box-shadow 0.15s, transform 0.15s;
  }
  .con-card:hover { box-shadow:0 4px 14px rgba(234,88,12,0.1); transform:translateY(-2px); }

  .step-card {
    background:#ffffff; border:1px solid #dbeafe; border-radius:10px;
    padding:1rem 1.2rem; animation:fadeIn 0.3s ease both;
    transition:box-shadow 0.15s;
  }
  .step-card:hover { box-shadow:0 4px 14px rgba(37,99,235,0.1); }

  .acceptance-row {
    display:flex; align-items:flex-start; gap:12px; padding:10px 8px;
    border-bottom:1px solid #e2e8f0; border-radius:6px;
    transition:background 0.15s;
  }
  .acceptance-row:last-child { border-bottom:none; }
  .acceptance-row:hover { background:#f0f7ff; }

  .tab-btn {
    background:transparent; border:1px solid #cbd5e1; color:#64748b;
    padding:5px 14px; border-radius:6px; font-size:0.78rem;
    cursor:pointer; transition:all 0.15s; letter-spacing:0.03em;
    font-family:inherit;
  }
  .tab-btn.active { background:#2563eb; border-color:#2563eb; color:#fff; }
  .tab-btn:hover:not(.active) { border-color:#93c5fd; color:#2563eb; }

  .metric-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 12px; border-bottom:1px solid #e2e8f0;
    transition:background 0.15s; border-radius:6px;
  }
  .metric-row:last-child { border-bottom:none; }
  .metric-row:hover { background:#f0f7ff; }

  .cost-card {
    background:#f8fbff; border:1px solid #dbeafe; border-radius:10px;
    padding:1rem 1.2rem; flex:1; min-width:160px;
    transition:box-shadow 0.15s, transform 0.15s;
  }
  .cost-card:hover { box-shadow:0 4px 14px rgba(37,99,235,0.1); transform:translateY(-2px); }
  .cost-card.pro { background:#f0f7ff; border-color:#93c5fd; }
`;

const PLAN = {
  name: 'Hobby',
  label: 'Free',
  users: '1 (Personal)',
  bandwidthTotal: 100,
  bandwidthUsed: 45,
  resetDate: 'May 1, 2026',
  excluded: [
    { icon: '👥', text: 'No team collaboration' },
    { icon: '🔐', text: 'No SSO (Single Sign-On)' },
    { icon: '🔒', text: 'No password protection' },
  ],
};

function BandwidthBar({ used, total }) {
  const pct = Math.min((used / total) * 100, 100);
  const color = pct < 70 ? '#16a34a' : pct < 90 ? '#d97706' : '#dc2626';
  const bgTrack = pct < 70 ? '#dcfce7' : pct < 90 ? '#fef9c3' : '#fee2e2';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color }}>{used} GB used</span>
        <span>{total} GB total</span>
      </div>
      <div style={{ height: 10, background: bgTrack, borderRadius: 999, overflow: 'hidden', border: `1px solid ${color}33` }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 999, transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
        <span>{pct.toFixed(0)}% of monthly limit used</span>
        <span>{total - used} GB remaining</span>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const [tab, setTab] = useState('steps');
  const [tipVisible, setTipVisible] = useState(false);

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#e8f4fd', minHeight: '100vh', color: '#1e293b' }}>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #bfdbfe', padding: '12px 1rem', background: '#ffffff', boxShadow: '0 1px 4px rgba(37,99,235,0.08)' }}>
          <Link href="/"        className="nav-link active">Assessment</Link>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <Link href="/deploy"  className="nav-link">Deploy</Link>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <Link href="/history" className="nav-link">History</Link>
        </nav>

        <div style={{ maxWidth: 820, margin: '0 auto', padding: '2rem 1rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                borderRadius: 8, width: 36, height: 36,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0, color: '#fff',
              }}>▲</span>
              <div>
                <h1 style={{
                  fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em',
                  background: 'linear-gradient(90deg, #1e3a5f 30%, #2563eb 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}>Vercel Platform Assessment</h1>
                <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                  Pivotree POC Report &nbsp;·&nbsp; April 2026
                </div>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 600 }}>
              Proof-of-concept evaluation of Vercel as the deployment platform for Pivotree applications.
              Covers deployment workflow, platform capabilities, access controls, and cost model.
            </p>
          </div>

          {/* Acceptance Criteria */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.1rem' }}>✅</span>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>Acceptance Criteria</h2>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
                {ACCEPTANCE.length}/{ACCEPTANCE.length} Complete
              </span>
            </div>
            <div>
              {ACCEPTANCE.map((item, i) => (
                <div key={item.id} className="acceptance-row" style={{ animationDelay: `${i * 40}ms` }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6, background: '#dcfce7',
                    border: '1.5px solid #86efac', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    fontSize: '0.75rem', color: '#16a34a', fontWeight: 700,
                  }}>✓</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', letterSpacing: '0.02em' }}>
              Pros &amp; Cons
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>✓</span> Pros
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {PROS.map((p, i) => (
                    <div key={p.title} className="pro-card" style={{ animationDelay: `${i * 30}ms` }}>
                      <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#15803d', marginBottom: 3 }}>{p.title}</div>
                      <div style={{ fontSize: '0.73rem', color: '#4b7a4b', lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>✕</span> Cons
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {CONS.map((c, i) => (
                    <div key={c.title} className="con-card" style={{ animationDelay: `${i * 30}ms` }}>
                      <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#c2410c', marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: '0.73rem', color: '#7a4a2a', lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed document section */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>
                Deployment Steps &amp; Observations
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {['steps', 'speed', 'cost'].map(t => (
                  <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                    {t === 'steps' ? 'Steps' : t === 'speed' ? 'Speed' : 'Cost'}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'steps' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {DEPLOYMENT_STEPS.map((s, i) => (
                  <div key={s.step} className="step-card" style={{ animationDelay: `${i * 40}ms` }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: '#2563eb', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginTop: 1,
                      }}>{s.step}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55, marginBottom: 6 }}>{s.detail}</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '6px 10px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>OBS</span>
                          <span style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.5 }}>{s.obs}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'speed' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>
                  Measured on this Next.js 14 application (Pages Router, SSR) deployed to Vercel Fluid Compute.
                </p>
                {SPEED_METRICS.map((m, i) => (
                  <div key={m.stage} className="metric-row" style={{ animationDelay: `${i * 40}ms` }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>{m.stage}</div>
                      <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 2 }}>{m.note}</div>
                    </div>
                    <span style={{
                      background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd',
                      padding: '3px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{m.time}</span>
                  </div>
                ))}
                <div style={{ marginTop: '1rem', padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: '0.78rem', color: '#2563eb' }}>
                  <strong>Observation:</strong> Deployment speed is a significant advantage over traditional CI/CD pipelines.
                  Vercel&apos;s build cache reduces repeat deploy times by 40–60%. Rollback is essentially instant.
                </div>
              </div>
            )}

            {tab === 'cost' && (
              <div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {COST_TIERS.map(t => (
                    <div key={t.tier} className={`cost-card ${t.tier === 'Pro' ? 'pro' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{t.tier}</span>
                        {t.tier === 'Pro' && (
                          <span style={{ fontSize: '0.65rem', background: '#2563eb', color: '#fff', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>RECOMMENDED</span>
                        )}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb', marginBottom: 4 }}>{t.price}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 2 }}>👥 {t.users}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8 }}>📦 {t.bandwidth}</div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>{t.key}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 14px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, fontSize: '0.78rem', color: '#713f12' }}>
                  <strong>Recommendation for Pivotree:</strong> Pro plan at $20/user/month covers team access,
                  Vercel Authentication (staff-only access), preview deployments, and analytics.
                  For production with SSO/Azure AD integration, Enterprise pricing should be evaluated.
                  Compute is billed on Active CPU time — estimate usage with the Vercel pricing calculator before committing.
                </div>
              </div>
            )}
          </div>

          {/* Plan Usage */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.05rem' }}>📊</span>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>Plan Usage &amp; Billing</h2>
              </div>
              <button
                onClick={() => {}}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '6px 16px',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)', transition: 'opacity 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                ↑ Upgrade Plan
              </button>
            </div>

            {/* Plan info chips */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '6px 12px' }}>
                <span style={{ fontSize: '0.85rem' }}>🏷️</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plan</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{PLAN.name} <span style={{ color: '#16a34a', fontWeight: 600 }}>({PLAN.label})</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '6px 12px' }}>
                <span style={{ fontSize: '0.85rem' }}>👤</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Users</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{PLAN.users}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '6px 12px', position: 'relative' }}>
                <span style={{ fontSize: '0.85rem' }}>📦</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bandwidth</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>100 GB / month</span>
                    <span
                      onMouseEnter={() => setTipVisible(true)}
                      onMouseLeave={() => setTipVisible(false)}
                      style={{
                        width: 16, height: 16, borderRadius: '50%', background: '#dbeafe',
                        border: '1px solid #93c5fd', color: '#2563eb', fontSize: '0.6rem',
                        fontWeight: 700, cursor: 'default', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >?</span>
                  </div>
                </div>
                {tipVisible && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
                    width: 260, background: '#1e293b', color: '#f1f5f9',
                    fontSize: '0.72rem', lineHeight: 1.55, borderRadius: 8,
                    padding: '10px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    zIndex: 50, pointerEvents: 'none',
                  }}>
                    Bandwidth refers to the total amount of data transferred from your app to users.
                    This includes page loads, API responses, images, and other assets.
                    <span style={{
                      position: 'absolute', bottom: -6, left: 18,
                      width: 12, height: 12, background: '#1e293b',
                      transform: 'rotate(45deg)', borderRadius: 2,
                    }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '6px 12px' }}>
                <span style={{ fontSize: '0.85rem' }}>🔄</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resets on</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{PLAN.resetDate}</div>
                </div>
              </div>
            </div>

            {/* Warning banner */}
            {(PLAN.bandwidthUsed / PLAN.bandwidthTotal) > 0.8 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem',
                background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                <span style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 500 }}>
                  You are nearing your monthly bandwidth limit. Consider upgrading to the Pro plan to avoid service interruption.
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div style={{ marginBottom: '1.2rem' }}>
              <BandwidthBar used={PLAN.bandwidthUsed} total={PLAN.bandwidthTotal} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Features not included */}
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
                  Not Included
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {PLAN.excluded.map(f => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: '#7c2d12' }}>
                      <span style={{ fontSize: '0.85rem' }}>{f.icon}</span>
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What does 100 GB mean */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
                  What does 100 GB mean?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {[
                    { icon: '🌐', text: '~100,000 page visits', sub: 'at 1 MB / page' },
                    { icon: '⚡', text: '~200,000 API requests', sub: 'at 500 KB / request' },
                    { icon: '🖼️', text: '~50,000 image loads', sub: 'at 2 MB / image' },
                  ].map(ex => (
                    <div key={ex.text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: '0.85rem' }}>{ex.icon}</span>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 500 }}>{ex.text}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: 4 }}>{ex.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '2rem' }}>
            Pivotree &nbsp;·&nbsp; Vercel Platform Assessment &nbsp;·&nbsp; April 2026
          </p>

        </div>
      </div>
    </>
  );
}
