import { useState } from 'react';
import Link from 'next/link';

// ─── Data ──────────────────────────────────────────────────────────────────────

const SPEED_METRICS = [
  { stage: 'Initial import + first deploy', time: '60–90 s'  },
  { stage: 'Push-triggered deploy',         time: '20–40 s'  },
  { stage: 'Preview deployment (per PR)',   time: '25–45 s'  },
  { stage: 'Rollback to previous deploy',   time: '< 5 s'    },
  { stage: 'Serverless cold start',         time: '< 200 ms' },
];

const ACCESS_METHODS = [
  { method: 'Password Protection',    tier: 'Pro',        notes: 'Shared password on the deployment URL'                              },
  { method: 'Vercel Authentication',  tier: 'Pro',        notes: 'Vercel account login; can allowlist email domains'                  },
  { method: 'SSO / SAML',             tier: 'Enterprise', notes: 'Integrate with Okta, Azure AD, Google Workspace, etc.'             },
  { method: 'Custom auth middleware', tier: 'Free',       notes: 'App-level auth (NextAuth.js, Clerk) — no Vercel tier requirement'   },
];

const HOBBY_FEATURES = [
  { label: 'Deployments',                   value: 'Unlimited',        included: true  },
  { label: 'Bandwidth',                     value: '100 GB / month',   included: true  },
  { label: 'Serverless execution',          value: '100 GB-hrs / mo',  included: true  },
  { label: 'Team members',                  value: '1 (personal)',     included: true  },
  { label: 'Custom domains',                value: '✓',                included: true  },
  { label: 'Preview deployments',           value: '✓',                included: true  },
  { label: 'Password Protection',           value: '✗',                included: false },
];

const PRO_FEATURES = [
  { label: 'Bandwidth',                     value: '1 TB / month',     included: true  },
  { label: 'Serverless execution',          value: '1 000 GB-hrs / mo', included: true },
  { label: 'Team members',                  value: 'Unlimited',        included: true  },
  { label: 'Concurrent builds',            value: '12',                included: true  },
  { label: 'Password Protection',           value: '✓',                included: true  },
  { label: 'Vercel Authentication (SSO-lite)', value: '✓',             included: true  },
  { label: 'Support',                       value: 'Email',            included: true  },
];

const LIMITATIONS = [
  {
    icon: '⏱',
    title: 'No long-running processes',
    desc: 'Serverless Functions max at 300 s (Enterprise). Persistent connections or long jobs need an external service.',
  },
  {
    icon: '🔒',
    title: 'Vendor lock-in risk',
    desc: 'Vercel-specific features (Edge Functions, ISR, Image Optimization) are tightly coupled. Migration may require refactoring.',
  },
  {
    icon: '💳',
    title: 'Access control costs money',
    desc: 'Meaningful staff-only access restriction requires at least Pro tier ($20/user/month).',
  },
  {
    icon: '🗄️',
    title: 'No managed database',
    desc: 'Vercel does not provide a managed database. Supabase, PlanetScale, or Neon must be added separately via Marketplace.',
  },
  {
    icon: '🌡',
    title: 'Cold starts',
    desc: 'Serverless function cold starts are rare but measurable (~200–400 ms) on the free tier.',
  },
];

const COMPARISON_ROWS = [
  { dim: 'Developer onboarding speed', value: 'Very fast (< 5 min to live URL)',  good: true  },
  { dim: 'Non-technical onboarding',   value: 'Moderate (needs Git familiarity)', good: null  },
  { dim: 'Deployment speed',           value: 'Excellent (20–90 s)',              good: true  },
  { dim: 'Preview environments',       value: 'Native, zero-config',              good: true  },
  { dim: 'Access control',             value: 'Pro required for built-in options', good: null },
  { dim: 'Custom domains + SSL',       value: 'Free, automatic',                  good: true  },
  { dim: 'Observability',              value: 'Basic free; full on Pro',           good: null  },
  { dim: 'Best fit',                   value: 'Front-end / JAMstack / Next.js',   good: true  },
];

const DOD_ITEMS = [
  { label: 'Working PoC deployed and accessible at a Vercel URL',                                    done: true  },
  { label: 'Access restricted to Pivotree staff (Password Protection or app-level auth)',            done: false, note: 'Free tier — Password Protection not available; app-level auth recommended' },
  { label: 'Git-based deployment workflow documented',                                               done: true  },
  { label: 'CLI-based deployment workflow documented',                                               done: true  },
  { label: 'Observations captured: onboarding, speed, built-in features',                           done: true  },
  { label: 'Basic cost model documented',                                                            done: true  },
];

const GIT_STEPS = [
  {
    n: 1, title: 'Create the application',
    code: `npx create-next-app@latest my-poc-app\ncd my-poc-app\ngit init && git add . && git commit -m "initial commit"`,
  },
  {
    n: 2, title: 'Push to GitHub',
    code: `gh repo create my-poc-app --public --source=. --push\n# or use the GitHub web UI`,
  },
  {
    n: 3, title: 'Import into Vercel',
    code: null,
    prose: [
      'Go to vercel.com/new → Click "Import Git Repository"',
      'Select the repo (Vercel requests GitHub OAuth access)',
      'Vercel auto-detects the framework (Next.js)',
      'Configure environment variables if needed',
      'Click "Deploy"',
    ],
    note: 'First deployment: ~45–90 s. Subsequent push-triggered deploys: 20–40 s.',
  },
  {
    n: 4, title: 'Verify deployment',
    code: null,
    prose: [
      'Auto-generated URL: https://my-poc-app-<hash>.vercel.app',
      'Custom domains: Project → Settings → Domains',
    ],
  },
];

const CLI_STEPS = [
  {
    n: 1, title: 'Install & authenticate',
    code: `npm i -g vercel\nvercel login`,
  },
  {
    n: 2, title: 'Deploy from project root',
    code: `vercel`,
    prose: ['CLI prompts for framework, project name, and scope (personal vs team)', 'Creates a .vercel/ directory linking local project to Vercel project'],
  },
  {
    n: 3, title: 'Deploy to production',
    code: `vercel --prod`,
  },
];

const PREREQUISITES = [
  'Node.js ≥ 18.x installed locally',
  'A GitHub / GitLab / Bitbucket account (for Git-based deployment)',
  'Vercel CLI (optional, for CLI-based deployment): npm i -g vercel',
  'A Vercel account (free Hobby tier is sufficient for PoC)',
];

// ─── Styles ────────────────────────────────────────────────────────────────────

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #000; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .nav-link {
    color:#6b7280; text-decoration:none; font-size:0.85rem;
    padding:5px 10px; border-radius:6px; transition:all 0.15s;
  }
  .nav-link:hover  { color:#e5e7eb; background:#161616; }
  .nav-link.active { color:#e5e7eb; }

  .section-card {
    background:#0a0a0a; border:1px solid #1a1a1a; border-radius:12px;
    padding:1.2rem 1.4rem; animation:fadeIn 0.3s ease both;
  }
  .section-h {
    font-size:0.8rem; font-weight:700; color:#6b7280;
    text-transform:uppercase; letter-spacing:0.07em; margin-bottom:1rem;
    display:flex; align-items:center; gap:8px;
  }

  .tab-btn {
    background:transparent; border:1px solid #222; color:#6b7280;
    padding:6px 16px; border-radius:6px; font-size:0.82rem; cursor:pointer;
    transition:all 0.15s; font-family:inherit;
  }
  .tab-btn.active { background:#1a1a1a; border-color:#444; color:#e5e7eb; }
  .tab-btn:hover  { border-color:#333; color:#ccc; }

  .accordion-row {
    border-bottom:1px solid #141414; cursor:pointer;
    transition:background 0.15s; border-radius:6px; padding:12px 10px;
  }
  .accordion-row:last-child { border-bottom:none; }
  .accordion-row:hover { background:#111; }

  .expand-body {
    overflow:hidden; transition:max-height 0.25s ease, opacity 0.25s ease;
  }

  .metric-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:9px 10px; border-bottom:1px solid #111; border-radius:6px;
    transition:background 0.15s; animation:fadeIn 0.25s ease both;
  }
  .metric-row:last-child { border-bottom:none; }
  .metric-row:hover { background:#111; }

  .tier-card {
    background:#111; border:1px solid #1f1f1f; border-radius:12px;
    padding:1.2rem; flex:1; min-width:200px; transition:border-color 0.15s, transform 0.15s;
    animation:fadeIn 0.3s ease both;
  }
  .tier-card:hover { border-color:#2a2a2a; transform:translateY(-2px); }

  .limit-card {
    background:#0a0a0a; border:1px solid #1a1a1a; border-radius:10px;
    padding:0.9rem 1rem; display:flex; gap:12px; align-items:flex-start;
    transition:border-color 0.15s; animation:fadeIn 0.25s ease both;
  }
  .limit-card:hover { border-color:#2a2a2a; }

  .dod-row {
    display:flex; align-items:flex-start; gap:12px; padding:10px 8px;
    border-bottom:1px solid #111; border-radius:6px; transition:background 0.15s;
    cursor:default;
  }
  .dod-row:last-child { border-bottom:none; }
  .dod-row:hover { background:#0d0d0d; }

  .copy-btn {
    background:#1a1a1a; border:1px solid #2a2a2a; color:#6b7280;
    padding:3px 9px; border-radius:5px; font-size:0.72rem; cursor:pointer;
    transition:all 0.15s; font-family:inherit;
  }
  .copy-btn:hover { background:#222; color:#fff; border-color:#555; }

  .code-pre {
    background:#050505; border:1px solid #1a1a1a; border-radius:8px;
    padding:12px 14px; font-family:'SF Mono','Fira Code',monospace;
    font-size:0.78rem; color:#9ca3af; line-height:1.65; overflow-x:auto; white-space:pre;
  }

  .tier-feature-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:5px 0; border-bottom:1px solid #1a1a1a; font-size:0.8rem;
  }
  .tier-feature-row:last-child { border-bottom:none; }

  .access-row {
    display:grid; grid-template-columns:1fr 100px 1fr;
    gap:10px; padding:10px 8px; border-bottom:1px solid #111;
    align-items:start; font-size:0.82rem; border-radius:6px; transition:background 0.15s;
  }
  .access-row:last-child { border-bottom:none; }
  .access-row:hover { background:#0d0d0d; }

  .compare-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:9px 8px; border-bottom:1px solid #111; border-radius:6px;
    transition:background 0.15s;
  }
  .compare-row:last-child { border-bottom:none; }
  .compare-row:hover { background:#0d0d0d; }
`;

// ─── Sub-components ────────────────────────────────────────────────────────────

function Nav({ current }) {
  return (
    <nav style={{ display:'flex', alignItems:'center', gap:4, borderBottom:'1px solid #111', padding:'12px 1rem', marginBottom:'2rem' }}>
      <Link href="/"         className={`nav-link ${current==='dashboard' ? 'active':''}`}>Dashboard</Link>
      <span style={{color:'#333'}}>·</span>
      <Link href="/deploy"   className={`nav-link ${current==='deploy'    ? 'active':''}`}>Deploy</Link>
      <span style={{color:'#333'}}>·</span>
      <Link href="/history"  className={`nav-link ${current==='history'   ? 'active':''}`}>History</Link>
      <span style={{color:'#333'}}>·</span>
      <Link href="/overview" className={`nav-link ${current==='overview'  ? 'active':''}`}>POC Overview</Link>
    </nav>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  return <button className="copy-btn" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>;
}

function Accordion({ icon, title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="accordion-row" onClick={() => setOpen(o => !o)}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:'0.9rem', fontWeight:500, color:'#d1d5db' }}>{icon && <span style={{marginRight:8}}>{icon}</span>}{title}</span>
        <span style={{ color:'#374151', fontSize:'0.75rem' }}>{open ? '▲' : '▼'}</span>
      </div>
      <div className="expand-body" style={{ maxHeight: open ? 600 : 0, opacity: open ? 1 : 0 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ paddingTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

function DeployStep({ step }) {
  return (
    <div style={{ display:'flex', gap:14, paddingBottom:18, animation:'fadeIn 0.3s ease both' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
        <div style={{
          width:28, height:28, borderRadius:'50%', background:'#0c1a2e',
          border:'1px solid #1e3a5f', color:'#60a5fa', display:'flex',
          alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700,
        }}>{step.n}</div>
        <div style={{ width:1, flex:1, background:'#1a1a1a', marginTop:4 }} />
      </div>
      <div style={{ flex:1, paddingBottom:4 }}>
        <div style={{ fontWeight:600, color:'#e5e7eb', fontSize:'0.92rem', marginBottom:8 }}>{step.title}</div>
        {step.code && (
          <div style={{ position:'relative' }}>
            <pre className="code-pre">{step.code}</pre>
            <div style={{ position:'absolute', top:8, right:8 }}><CopyBtn text={step.code} /></div>
          </div>
        )}
        {step.prose && (
          <ul style={{ paddingLeft:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4, marginTop: step.code ? 8 : 0 }}>
            {step.prose.map((p, i) => (
              <li key={i} style={{ fontSize:'0.82rem', color:'#9ca3af', display:'flex', gap:8 }}>
                <span style={{ color:'#374151', flexShrink:0 }}>›</span>{p}
              </li>
            ))}
          </ul>
        )}
        {step.note && (
          <div style={{ marginTop:8, padding:'6px 10px', background:'#0c1a2e', border:'1px solid #1e3a5f', borderRadius:6, fontSize:'0.75rem', color:'#60a5fa' }}>
            ℹ {step.note}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const [deployTab, setDeployTab] = useState('git');
  const [dodItems, setDodItems] = useState(DOD_ITEMS);

  function toggleDod(i) {
    setDodItems(items => items.map((it, idx) => idx === i ? { ...it, done: !it.done } : it));
  }

  const doneCount = dodItems.filter(d => d.done).length;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:'#000', minHeight:'100vh', color:'#e5e7eb' }}>
        <div style={{ maxWidth:820, margin:'0 auto', padding:'1.5rem 1rem' }}>
          <Nav current="overview" />

          {/* Header */}
          <div style={{ marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <span style={{ fontSize:'1.6rem' }}>🔍</span>
              <h1 style={{
                fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em',
                background:'linear-gradient(90deg,#fff 30%,#6b7280 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>Vercel POC Assessment</h1>
            </div>
            <p style={{ color:'#4b5563', fontSize:'0.82rem' }}>
              End-to-end evaluation of Vercel as a hosting platform for Pivotree staff-accessible applications.
            </p>
          </div>

          {/* Quick metric cards */}
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
            {[
              { label:'First deploy',       value:'60–90s',  color:'#22c55e' },
              { label:'Subsequent deploy',  value:'20–40s',  color:'#3b82f6' },
              { label:'Rollback',           value:'< 5s',    color:'#a78bfa' },
              { label:'PoC cost / month',   value:'$20–$60', color:'#f59e0b' },
              { label:'Cold start',         value:'< 200ms', color:'#6b7280' },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{
                background:'#111', border:'1px solid #1f1f1f', borderRadius:10,
                padding:'0.85rem 1.1rem', flex:1, minWidth:110,
                animation:'fadeIn 0.3s ease both', animationDelay:`${i*60}ms`,
              }}>
                <div style={{ fontSize:'0.68rem', color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:'1.4rem', fontWeight:800, color }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Sample Application */}
            <div className="section-card">
              <div className="section-h">🖥 Sample Application</div>
              <p style={{ fontSize:'0.85rem', color:'#9ca3af', marginBottom:10 }}>
                A Next.js application was chosen as the deployment target. Vercel is purpose-built for this stack.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  'Static landing page',
                  'Server-side API route (/api/hello)',
                  'Environment variable usage',
                  'Basic authentication layer (Vercel Password Protection or SSO) to restrict access to Pivotree staff',
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:10, fontSize:'0.83rem', color:'#9ca3af' }}>
                    <span style={{ color:'#22c55e', flexShrink:0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="section-card">
              <div className="section-h">📋 Prerequisites</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {PREREQUISITES.map((p, i) => (
                  <div key={i} style={{ display:'flex', gap:10, fontSize:'0.83rem', color:'#9ca3af' }}>
                    <span style={{ color:'#3b82f6', flexShrink:0 }}>●</span>{p}
                  </div>
                ))}
              </div>
            </div>

            {/* Deployment Steps */}
            <div className="section-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <div className="section-h" style={{ marginBottom:0 }}>🚀 Deployment Steps</div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className={`tab-btn ${deployTab==='git' ? 'active':''}`}  onClick={() => setDeployTab('git')}>Git-based</button>
                  <button className={`tab-btn ${deployTab==='cli' ? 'active':''}`}  onClick={() => setDeployTab('cli')}>CLI</button>
                </div>
              </div>

              {deployTab === 'git' && (
                <div>
                  {GIT_STEPS.map(s => <DeployStep key={s.n} step={s} />)}
                </div>
              )}
              {deployTab === 'cli' && (
                <div>
                  {CLI_STEPS.map(s => <DeployStep key={s.n} step={s} />)}
                </div>
              )}
            </div>

            {/* Access Control */}
            <div className="section-card">
              <div className="section-h">🔒 Access Control — Pivotree Staff</div>
              {/* header row */}
              <div className="access-row" style={{ color:'#4b5563', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                <span>Method</span><span>Tier</span><span>Notes</span>
              </div>
              {ACCESS_METHODS.map((a, i) => (
                <div key={i} className="access-row">
                  <span style={{ color:'#d1d5db', fontWeight:500 }}>{a.method}</span>
                  <span style={{
                    fontSize:'0.72rem', fontWeight:600, padding:'2px 8px', borderRadius:20, whiteSpace:'nowrap',
                    background: a.tier==='Free' ? '#052e16' : a.tier==='Pro' ? '#0c1a2e' : '#1a0533',
                    color:      a.tier==='Free' ? '#22c55e' : a.tier==='Pro' ? '#60a5fa' : '#c084fc',
                    border: `1px solid ${a.tier==='Free' ? '#14532d' : a.tier==='Pro' ? '#1e3a5f' : '#581c87'}`,
                    alignSelf:'flex-start',
                  }}>{a.tier}</span>
                  <span style={{ color:'#6b7280', fontSize:'0.8rem' }}>{a.notes}</span>
                </div>
              ))}
              <div style={{ marginTop:12, padding:'8px 12px', background:'#0c1a2e', border:'1px solid #1e3a5f', borderRadius:8, fontSize:'0.78rem', color:'#60a5fa' }}>
                <strong>Recommendation for PoC:</strong> Use Vercel Password Protection (Pro) for quick staff-only access, or implement NextAuth.js with Google / Microsoft OAuth at the app level if staying on the free tier.
              </div>
            </div>

            {/* Observations */}
            <div className="section-card">
              <div className="section-h">👁 Observations</div>

              <Accordion icon="👤" title="Ease of Onboarding" defaultOpen>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { group:'Technical users', points:['Onboarding < 5 min. Developer with Git knowledge can go live immediately.', 'Framework auto-detection works reliably for Next.js, Vite, CRA, SvelteKit.', 'Dashboard is clean — build logs, deploy history, preview URLs easy to navigate.'], color:'#22c55e' },
                    { group:'Non-technical users', points:['Dashboard is more accessible than Netlify / AWS Amplify.', 'Git-based workflow still requires familiarity with repos and branching.', 'CLI reduces friction for local deploys but requires terminal comfort.'], color:'#f59e0b' },
                  ].map(({ group, points, color }) => (
                    <div key={group}>
                      <div style={{ fontSize:'0.78rem', fontWeight:600, color, marginBottom:4 }}>{group}</div>
                      {points.map((p, i) => (
                        <div key={i} style={{ display:'flex', gap:8, fontSize:'0.82rem', color:'#9ca3af', marginBottom:3 }}>
                          <span style={{ color:'#374151', flexShrink:0 }}>›</span>{p}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:16, marginTop:8, flexWrap:'wrap' }}>
                    {[['Developers','⭐⭐⭐⭐'],['Power users','⭐⭐⭐'],['Non-technical','⭐⭐']].map(([r,s]) => (
                      <div key={r} style={{ background:'#111', border:'1px solid #1f1f1f', borderRadius:8, padding:'6px 12px' }}>
                        <div style={{ fontSize:'0.68rem', color:'#4b5563', marginBottom:2 }}>{r}</div>
                        <div style={{ fontSize:'0.88rem' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>

              <Accordion icon="⚡" title="Deployment Speed">
                <div>
                  {SPEED_METRICS.map((m, i) => (
                    <div key={i} className="metric-row" style={{ animationDelay:`${i*40}ms` }}>
                      <span style={{ fontSize:'0.83rem', color:'#9ca3af' }}>{m.stage}</span>
                      <span style={{ fontSize:'0.88rem', fontWeight:700, color:'#22c55e', fontFamily:'monospace' }}>{m.time}</span>
                    </div>
                  ))}
                  <p style={{ fontSize:'0.75rem', color:'#374151', marginTop:8 }}>
                    Build caching is automatic — unchanged dependencies do not rebuild.
                  </p>
                </div>
              </Accordion>

              <Accordion icon="✨" title="Built-in Features">
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { title:'Preview Deployments', desc:'Every PR gets a unique URL. Reviewers can test before merge — zero config required.' },
                    { title:'Custom Domains',       desc:'Free SSL/TLS (Let\'s Encrypt), guided DNS config, supports apex, subdomains, and wildcards (Pro).' },
                    { title:'Environment Variables', desc:'Per-project, per-environment (Production / Preview / Dev). Encrypted at rest. Branch-scoped.' },
                    { title:'Analytics & Monitoring', desc:'Basic Web Analytics free. Speed Insights (Core Web Vitals) on Pro. Real-time logs always available.' },
                    { title:'Edge Network',           desc:'100+ PoPs. Static assets cached at edge automatically. Edge Functions run at nearest PoP.' },
                    { title:'Marketplace Integrations', desc:'Native GitHub / GitLab / Bitbucket, Datadog, Sentry, PlanetScale, Supabase, and others.' },
                  ].map(({ title, desc }) => (
                    <div key={title} style={{ display:'flex', gap:10, padding:'6px 0', borderBottom:'1px solid #141414' }}>
                      <span style={{ color:'#22c55e', flexShrink:0, fontSize:'0.85rem' }}>✓</span>
                      <div>
                        <div style={{ fontSize:'0.85rem', fontWeight:500, color:'#d1d5db' }}>{title}</div>
                        <div style={{ fontSize:'0.78rem', color:'#6b7280', marginTop:2 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>

            {/* Cost Overview */}
            <div className="section-card">
              <div className="section-h">💸 Cost Overview</div>
              <div style={{ display:'flex', gap:'0.85rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                {/* Hobby */}
                <div className="tier-card" style={{ animationDelay:'0ms' }}>
                  <div style={{ fontSize:'0.75rem', color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Hobby</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#22c55e', marginBottom:2 }}>Free</div>
                  <div style={{ fontSize:'0.72rem', color:'#374151', marginBottom:12 }}>Non-commercial use only (Vercel ToS)</div>
                  {HOBBY_FEATURES.map(f => (
                    <div key={f.label} className="tier-feature-row">
                      <span style={{ color:'#6b7280' }}>{f.label}</span>
                      <span style={{ color: f.included ? '#9ca3af' : '#374151', fontWeight:500 }}>{f.value}</span>
                    </div>
                  ))}
                </div>
                {/* Pro */}
                <div className="tier-card" style={{ borderColor:'#1e3a5f', animationDelay:'80ms' }}>
                  <div style={{ fontSize:'0.75rem', color:'#3b82f6', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Pro</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#60a5fa', marginBottom:2 }}>$20<span style={{ fontSize:'0.9rem', fontWeight:400, color:'#4b5563' }}>/user/mo</span></div>
                  <div style={{ fontSize:'0.72rem', color:'#374151', marginBottom:12 }}>Required for business / internal use</div>
                  {PRO_FEATURES.map(f => (
                    <div key={f.label} className="tier-feature-row">
                      <span style={{ color:'#6b7280' }}>{f.label}</span>
                      <span style={{ color:'#9ca3af', fontWeight:500 }}>{f.value}</span>
                    </div>
                  ))}
                </div>
                {/* Enterprise */}
                <div className="tier-card" style={{ animationDelay:'160ms' }}>
                  <div style={{ fontSize:'0.75rem', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Enterprise</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#c084fc', marginBottom:2 }}>Custom</div>
                  <div style={{ fontSize:'0.72rem', color:'#374151', marginBottom:12 }}>Contact Vercel sales</div>
                  {['SSO / SAML (Okta, Azure AD)', 'Audit logs', 'SLA guarantee', 'Dedicated support'].map(f => (
                    <div key={f} className="tier-feature-row">
                      <span style={{ color:'#6b7280' }}>{f}</span>
                      <span style={{ color:'#9ca3af' }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PoC cost estimate */}
              <div style={{ background:'#111', border:'1px solid #1f1f1f', borderRadius:10, padding:'0.9rem 1.1rem' }}>
                <div style={{ fontSize:'0.78rem', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>PoC Cost Estimate — ~20 Pivotree Staff Users</div>
                {[
                  { label:'Minimum viable',            cost:'$20 / mo',     note:'1 Pro seat, team access'              },
                  { label:'Comfortable internal tooling', cost:'$40–$60 / mo', note:'2–3 Pro seats for maintainers'      },
                  { label:'With SSO (Okta/Azure AD)',   cost:'Enterprise',   note:'Contact Vercel sales'                 },
                ].map(({ label, cost, note }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #1a1a1a', gap:16 }}>
                    <div>
                      <div style={{ fontSize:'0.83rem', color:'#d1d5db' }}>{label}</div>
                      <div style={{ fontSize:'0.72rem', color:'#4b5563', marginTop:1 }}>{note}</div>
                    </div>
                    <div style={{ fontSize:'0.92rem', fontWeight:700, color:'#f59e0b', whiteSpace:'nowrap' }}>{cost}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="section-card">
              <div className="section-h">📊 Comparison Summary</div>
              {COMPARISON_ROWS.map((r, i) => (
                <div key={i} className="compare-row">
                  <span style={{ fontSize:'0.83rem', color:'#6b7280' }}>{r.dim}</span>
                  <span style={{
                    fontSize:'0.83rem', fontWeight:500,
                    color: r.good === true ? '#22c55e' : r.good === false ? '#f87171' : '#9ca3af',
                  }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Limitations */}
            <div className="section-card">
              <div className="section-h">⚠️ Limitations &amp; Observations</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {LIMITATIONS.map((l, i) => (
                  <div key={i} className="limit-card" style={{ animationDelay:`${i*50}ms` }}>
                    <span style={{ fontSize:'1.2rem', flexShrink:0, marginTop:1 }}>{l.icon}</span>
                    <div>
                      <div style={{ fontSize:'0.88rem', fontWeight:600, color:'#e5e7eb', marginBottom:3 }}>{l.title}</div>
                      <div style={{ fontSize:'0.8rem', color:'#6b7280' }}>{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Definition of Done */}
            <div className="section-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <div className="section-h" style={{ marginBottom:0 }}>✅ Definition of Done</div>
                <span style={{ fontSize:'0.78rem', color: doneCount === dodItems.length ? '#22c55e' : '#6b7280' }}>
                  {doneCount} / {dodItems.length} complete
                </span>
              </div>
              {/* progress bar */}
              <div style={{ height:3, background:'#1a1a1a', borderRadius:2, overflow:'hidden', marginBottom:'1rem' }}>
                <div style={{ height:'100%', background:'#22c55e', width:`${(doneCount/dodItems.length)*100}%`, transition:'width 0.4s ease', borderRadius:2 }} />
              </div>
              {dodItems.map((item, i) => (
                <div key={i} className="dod-row" onClick={() => toggleDod(i)} style={{ cursor:'pointer' }}>
                  <span style={{
                    width:18, height:18, borderRadius:4, border:`1.5px solid ${item.done ? '#22c55e' : '#2a2a2a'}`,
                    background: item.done ? '#052e16' : 'transparent', display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0, marginTop:1, fontSize:'0.7rem', color:'#22c55e',
                    transition:'all 0.15s',
                  }}>
                    {item.done ? '✓' : ''}
                  </span>
                  <div>
                    <div style={{ fontSize:'0.85rem', color: item.done ? '#9ca3af' : '#e5e7eb', textDecoration: item.done ? 'line-through' : 'none', textDecorationColor:'#374151' }}>
                      {item.label}
                    </div>
                    {item.note && <div style={{ fontSize:'0.72rem', color:'#f59e0b', marginTop:3 }}>⚠ {item.note}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* References */}
            <div className="section-card">
              <div className="section-h">🔗 References</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['Vercel Documentation',       'https://vercel.com/docs'],
                  ['Vercel Pricing',             'https://vercel.com/pricing'],
                  ['Next.js Deployment Guide',   'https://nextjs.org/docs/deployment'],
                  ['Vercel CLI Reference',        'https://vercel.com/docs/cli'],
                ].map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:8, color:'#60a5fa', fontSize:'0.85rem', textDecoration:'none', padding:'5px 0', borderBottom:'1px solid #111' }}>
                    <span style={{ color:'#1e3a5f' }}>›</span>{label}
                    <span style={{ marginLeft:'auto', color:'#374151', fontSize:'0.72rem', fontFamily:'monospace' }}>{url}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          <p style={{ textAlign:'center', color:'#1f2937', fontSize:'0.75rem', marginTop:'2rem' }}>
            Pivotree · Vercel POC Assessment
          </p>
        </div>
      </div>
    </>
  );
}
