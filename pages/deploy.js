import { useState, useCallback } from 'react';
import Link from 'next/link';

const FRAMEWORKS = [
  { id: 'nextjs',  label: 'Next.js',   icon: '▲', color: '#fff'    },
  { id: 'react',   label: 'React',     icon: '⚛', color: '#61dafb' },
  { id: 'nodejs',  label: 'Node.js',   icon: '⬡', color: '#6cc24a' },
  { id: 'vue',     label: 'Vue.js',    icon: '◆', color: '#42b883' },
  { id: 'nuxt',    label: 'Nuxt.js',   icon: '◆', color: '#00dc82' },
  { id: 'svelte',  label: 'SvelteKit', icon: '▼', color: '#ff3e00' },
  { id: 'vite',    label: 'Vite',      icon: '⚡', color: '#646cff' },
  { id: 'other',   label: 'Other',     icon: '◻', color: '#9ca3af' },
];

const DEPLOY_STEPS = [
  { id: 'validate',  label: 'Validating inputs'                 },
  { id: 'bitbucket', label: 'Connecting to Bitbucket'           },
  { id: 'project',   label: 'Creating Vercel project'           },
  { id: 'envvars',   label: 'Configuring environment variables' },
  { id: 'hook',      label: 'Setting up deploy hook'            },
  { id: 'trigger',   label: 'Triggering deployment'             },
  { id: 'live',      label: 'Deployment live'                   },
];

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #000; }

  @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
  @keyframes blink   { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

  .dp-input {
    width:100%; background:#111; border:1px solid #2a2a2a; color:#e5e7eb;
    padding:10px 12px; border-radius:8px; font-size:0.9rem; outline:none;
    transition:border-color 0.15s; font-family:inherit;
  }
  .dp-input:focus  { border-color:#3b82f6; }
  .dp-input::placeholder { color:#374151; }

  .dp-select {
    width:100%; background:#111; border:1px solid #2a2a2a; color:#e5e7eb;
    padding:10px 12px; border-radius:8px; font-size:0.9rem; outline:none;
    transition:border-color 0.15s; font-family:inherit; cursor:pointer;
    -webkit-appearance:none; appearance:none;
  }
  .dp-select:focus { border-color:#3b82f6; }
  .dp-select option { background:#111; }

  .fw-card {
    border:1px solid #222; border-radius:10px; padding:10px 14px; cursor:pointer;
    display:flex; align-items:center; gap:8px; background:#111; min-width:110px;
    transition:border-color 0.15s, background 0.15s; animation:fadeIn 0.2s ease both;
  }
  .fw-card:hover   { border-color:#444; }
  .fw-card.sel     { border-color:#3b82f6; background:#0c1a2e; }

  .env-input {
    background:#111; border:1px solid #222; color:#e5e7eb; padding:8px 10px;
    border-radius:6px; font-size:0.82rem; outline:none; transition:border-color 0.15s;
    font-family:'SF Mono','Fira Code',monospace; width:100%;
  }
  .env-input:focus { border-color:#3b82f6; }
  .env-input::placeholder { color:#374151; }

  .env-del {
    background:transparent; border:1px solid #2a2a2a; color:#6b7280;
    width:28px; height:28px; border-radius:6px; cursor:pointer; font-size:1rem;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:all 0.15s;
  }
  .env-del:hover { background:#450a0a; border-color:#7f1d1d; color:#f87171; }

  .add-env {
    background:transparent; border:1px dashed #2a2a2a; color:#4b5563;
    padding:7px; border-radius:6px; font-size:0.8rem; cursor:pointer;
    transition:all 0.15s; width:100%; text-align:center;
  }
  .add-env:hover { border-color:#3b82f6; color:#60a5fa; background:#0c1a2e; }

  .btn-deploy {
    background:linear-gradient(135deg,#2563eb,#7c3aed); border:none; color:#fff;
    padding:12px 32px; border-radius:8px; font-size:0.95rem; font-weight:600;
    cursor:pointer; transition:opacity 0.15s,transform 0.15s; letter-spacing:0.02em;
  }
  .btn-deploy:hover   { opacity:0.9; transform:translateY(-1px); }
  .btn-deploy:active  { transform:translateY(0); }
  .btn-deploy:disabled{ opacity:0.45; cursor:not-allowed; transform:none; }

  .btn-back {
    background:#111; border:1px solid #2a2a2a; color:#9ca3af;
    padding:10px 20px; border-radius:8px; font-size:0.9rem; cursor:pointer;
    transition:all 0.15s;
  }
  .btn-back:hover { background:#1a1a1a; color:#e5e7eb; border-color:#444; }

  .btn-next {
    background:#0c1a2e; border:1px solid #3b82f6; color:#60a5fa;
    padding:10px 24px; border-radius:8px; font-size:0.9rem; font-weight:500;
    cursor:pointer; transition:all 0.15s;
  }
  .btn-next:hover { background:#0f2040; color:#93c5fd; }

  .btn-outline {
    background:#111; border:1px solid #333; color:#9ca3af;
    padding:7px 14px; border-radius:6px; font-size:0.8rem; cursor:pointer;
    transition:all 0.15s;
  }
  .btn-outline:hover { background:#1a1a1a; color:#e5e7eb; border-color:#555; }

  .type-toggle { display:flex; border:1px solid #222; border-radius:8px; overflow:hidden; }
  .type-btn {
    background:transparent; border:none; color:#6b7280;
    padding:8px 22px; font-size:0.85rem; cursor:pointer;
    transition:all 0.15s; flex:1; font-family:inherit;
  }
  .type-btn.preview-on    { background:#0c1a2e; color:#60a5fa; }
  .type-btn.production-on { background:#0a1f0a; color:#4ade80; }

  .step-dot {
    width:28px; height:28px; border-radius:50%; display:flex; align-items:center;
    justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;
    transition:all 0.3s;
  }

  .progress-row {
    display:flex; align-items:center; gap:12px; padding:10px 0;
    border-bottom:1px solid #1a1a1a; animation:fadeIn 0.2s ease both;
  }
  .progress-row:last-child { border-bottom:none; }

  .spinner {
    width:16px; height:16px; border:2px solid #3b82f633;
    border-top-color:#3b82f6; border-radius:50%; flex-shrink:0;
    animation:spin 0.7s linear infinite;
  }

  .code-pre {
    background:#050505; border:1px solid #1a1a1a; border-radius:8px;
    padding:14px 16px; font-family:'SF Mono','Fira Code','Consolas',monospace;
    font-size:0.76rem; color:#9ca3af; line-height:1.65; overflow-x:auto;
    white-space:pre;
  }

  .nav-link {
    color:#6b7280; text-decoration:none; font-size:0.85rem;
    padding:5px 10px; border-radius:6px; transition:all 0.15s;
  }
  .nav-link:hover { color:#e5e7eb; background:#161616; }
  .nav-link.active { color:#e5e7eb; }

  .result-url {
    background:#050505; border:1px solid #1f1f1f; border-radius:8px;
    padding:12px 16px; font-family:'SF Mono','Fira Code',monospace;
    font-size:0.85rem; color:#60a5fa; word-break:break-all;
    display:flex; align-items:center; justify-content:space-between; gap:12px;
  }

  .copy-btn {
    background:#1a1a1a; border:1px solid #333; color:#9ca3af;
    padding:4px 10px; border-radius:5px; font-size:0.73rem; cursor:pointer;
    transition:all 0.15s; flex-shrink:0; font-family:inherit;
  }
  .copy-btn:hover { background:#222; color:#fff; border-color:#555; }

  .section-card {
    background:#0a0a0a; border:1px solid #1f1f1f; border-radius:12px;
    padding:1.2rem 1.4rem; animation:fadeIn 0.3s ease both;
  }
  .section-label {
    font-size:0.72rem; color:#6b7280; text-transform:uppercase;
    letter-spacing:0.07em; margin-bottom:6px;
  }
  .review-row {
    display:flex; justify-content:space-between; align-items:flex-start;
    padding:8px 0; border-bottom:1px solid #141414; gap:16px;
  }
  .review-row:last-child { border-bottom:none; }
`;

// ─── Sub-components ────────────────────────────────────────────────────────────

function Nav({ current }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 4,
      borderBottom: '1px solid #111', padding: '12px 1rem',
      marginBottom: '2rem',
    }}>
      <Link href="/" className={`nav-link ${current === 'dashboard' ? 'active' : ''}`}>Dashboard</Link>
      <span style={{ color: '#333' }}>·</span>
      <Link href="/deploy" className={`nav-link ${current === 'deploy' ? 'active' : ''}`}>Deploy</Link>
      <span style={{ color: '#333' }}>·</span>
      <Link href="/history" className={`nav-link ${current === 'history' ? 'active' : ''}`}>History</Link>
    </nav>
  );
}

function StepIndicator({ current }) {
  const steps = ['Source', 'Config', 'Review', 'Deploy'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.8rem', gap: 0 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className="step-dot" style={{
                background: done ? '#22c55e' : active ? '#3b82f6' : '#1a1a1a',
                color: done || active ? '#fff' : '#4b5563',
                border: `1px solid ${done ? '#22c55e' : active ? '#3b82f6' : '#2a2a2a'}`,
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: '0.7rem', color: active ? '#e5e7eb' : '#4b5563', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ height: 1, flex: 1, background: done ? '#22c55e44' : '#1a1a1a', margin: '0 6px', marginBottom: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LabelledField({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>{label}</label>
        {hint && <span style={{ fontSize: '0.72rem', color: '#4b5563' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function EnvVarRow({ ev, index, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        className="env-input"
        placeholder="KEY"
        value={ev.key}
        onChange={e => onChange(index, 'key', e.target.value)}
        style={{ flex: '0 0 38%' }}
      />
      <input
        className="env-input"
        placeholder="value"
        type="text"
        value={ev.value}
        onChange={e => onChange(index, 'value', e.target.value)}
        style={{ flex: 1 }}
      />
      <button className="env-del" onClick={() => onRemove(index)} title="Remove">×</button>
    </div>
  );
}

function ProgressTracker({ steps, currentStepId, error }) {
  const stepIds = DEPLOY_STEPS.map(s => s.id);
  const currentIdx = stepIds.indexOf(currentStepId);

  return (
    <div>
      {DEPLOY_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx && !error;
        const errored = i === currentIdx && error;
        const pending = i > currentIdx;
        return (
          <div key={s.id} className="progress-row" style={{ animationDelay: `${i * 40}ms` }}>
            {done    && <span style={{ color: '#22c55e', fontSize: '1rem', flexShrink: 0, width: 20 }}>✓</span>}
            {active  && <div className="spinner" />}
            {errored && <span style={{ color: '#ef4444', fontSize: '1rem', flexShrink: 0, width: 20 }}>✕</span>}
            {pending && <span style={{ color: '#374151', fontSize: '0.8rem', flexShrink: 0, width: 20 }}>○</span>}
            <span style={{
              fontSize: '0.9rem',
              color: done ? '#9ca3af' : active ? '#e5e7eb' : errored ? '#ef4444' : '#374151',
              fontWeight: active ? 500 : 400,
              textDecoration: done ? 'none' : 'none',
            }}>
              {s.label}
            </span>
          </div>
        );
      })}
      {error && (
        <div style={{
          marginTop: 14, padding: '10px 14px', background: '#450a0a',
          border: '1px solid #7f1d1d', borderRadius: 8,
          fontSize: '0.85rem', color: '#fca5a5',
        }}>
          {error}
        </div>
      )}
    </div>
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
  return (
    <button className="copy-btn" onClick={copy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DeployPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    projectName: '',
    repoUrl: '',
    branch: 'main',
    framework: 'nextjs',
    deployType: 'preview',
    envVars: [{ key: '', value: '' }],
  });
  const [errors, setErrors] = useState({});
  const [currentStepId, setCurrentStepId] = useState('validate');
  const [deployError, setDeployError] = useState(null);
  const [result, setResult] = useState(null);

  // ── Field helpers ──────────────────────────────────────────────────────────
  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function updateEnvVar(index, field, value) {
    setForm(f => {
      const ev = [...f.envVars];
      ev[index] = { ...ev[index], [field]: value };
      return { ...f, envVars: ev };
    });
  }

  function addEnvVar() {
    setForm(f => ({ ...f, envVars: [...f.envVars, { key: '', value: '' }] }));
  }

  function removeEnvVar(index) {
    setForm(f => ({ ...f, envVars: f.envVars.filter((_, i) => i !== index) }));
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateStep(n) {
    const errs = {};
    if (n === 1) {
      if (!form.projectName.trim()) errs.projectName = 'Required';
      if (!form.repoUrl.trim())     errs.repoUrl = 'Required';
      else if (!/bitbucket\.org\/[^/]+\/[^/]+/.test(form.repoUrl))
        errs.repoUrl = 'Must be a valid Bitbucket URL';
      if (!form.branch.trim())      errs.branch = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() { if (validateStep(step)) setStep(s => s + 1); }
  function goBack() { setStep(s => s - 1); }

  // ── Deploy ─────────────────────────────────────────────────────────────────
  const handleDeploy = useCallback(async () => {
    setStep(4);
    setDeployError(null);
    setResult(null);

    // Simulate step-by-step progress for UX
    const stepDelay = ms => new Promise(r => setTimeout(r, ms));
    const stepOrder = ['validate', 'bitbucket', 'project', 'envvars', 'hook', 'trigger'];

    for (const sid of stepOrder) {
      setCurrentStepId(sid);
      await stepDelay(600);
    }

    try {
      const res = await fetch('/api/deploy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: form.projectName,
          repoUrl: form.repoUrl,
          branch: form.branch,
          framework: form.framework,
          deployType: form.deployType,
          envVars: form.envVars.filter(e => e.key.trim()),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCurrentStepId(data.step || 'trigger');
        setDeployError(data.error || 'Deployment failed.');
        return;
      }

      setCurrentStepId('live');
      setResult(data);
    } catch (err) {
      setCurrentStepId('trigger');
      setDeployError(err.message);
    }
  }, [form]);

  const slugPreview = form.projectName
    ? form.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')
    : null;

  const selectedFw = FRAMEWORKS.find(f => f.id === form.framework);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#000', minHeight: '100vh', color: '#e5e7eb' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' }}>
          <Nav current="deploy" />

          {/* Page title */}
          <div style={{ marginBottom: '1.8rem' }}>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg,#fff 30%,#6b7280 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Deploy to Vercel
            </h1>
            <p style={{ color: '#4b5563', fontSize: '0.82rem', marginTop: 4 }}>
              Self-service deployment from Bitbucket to Vercel — no DevOps knowledge required.
            </p>
          </div>

          <StepIndicator current={step} />

          {/* ── Step 1: Source ────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Source Repository
              </h2>

              <LabelledField label="Project Name" hint={slugPreview ? `slug: ${slugPreview}` : undefined}>
                <input
                  className="dp-input"
                  placeholder="my-awesome-app"
                  value={form.projectName}
                  onChange={e => setField('projectName', e.target.value)}
                />
                {errors.projectName && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.projectName}</span>}
              </LabelledField>

              <LabelledField label="Bitbucket Repository URL" hint="https://bitbucket.org/workspace/repo-slug">
                <input
                  className="dp-input"
                  placeholder="https://bitbucket.org/your-workspace/your-repo"
                  value={form.repoUrl}
                  onChange={e => setField('repoUrl', e.target.value)}
                />
                {errors.repoUrl && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.repoUrl}</span>}
              </LabelledField>

              <LabelledField label="Branch Name">
                <input
                  className="dp-input"
                  placeholder="main"
                  value={form.branch}
                  onChange={e => setField('branch', e.target.value)}
                />
                {errors.branch && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.branch}</span>}
              </LabelledField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn-next" onClick={goNext}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Configuration ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Configuration
              </h2>

              {/* Framework */}
              <LabelledField label="Framework">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {FRAMEWORKS.map((fw, i) => (
                    <button
                      key={fw.id}
                      className={`fw-card ${form.framework === fw.id ? 'sel' : ''}`}
                      style={{ animationDelay: `${i * 30}ms` }}
                      onClick={() => setField('framework', fw.id)}
                    >
                      <span style={{ color: fw.color, fontSize: '1rem' }}>{fw.icon}</span>
                      <span style={{ fontSize: '0.82rem', color: form.framework === fw.id ? '#e5e7eb' : '#9ca3af' }}>{fw.label}</span>
                    </button>
                  ))}
                </div>
              </LabelledField>

              {/* Deployment Type */}
              <LabelledField label="Deployment Target">
                <div className="type-toggle">
                  <button
                    className={`type-btn ${form.deployType === 'preview' ? 'preview-on' : ''}`}
                    onClick={() => setField('deployType', 'preview')}
                  >
                    Preview
                  </button>
                  <button
                    className={`type-btn ${form.deployType === 'production' ? 'production-on' : ''}`}
                    onClick={() => setField('deployType', 'production')}
                  >
                    Production
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#374151', marginTop: 4 }}>
                  {form.deployType === 'preview'
                    ? 'Creates a unique preview URL. Env vars scoped to preview + development.'
                    : 'Deploys to your production domain. Env vars scoped to production only.'}
                </p>
              </LabelledField>

              {/* Environment Variables */}
              <LabelledField label="Environment Variables" hint="Optional">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.envVars.map((ev, i) => (
                    <EnvVarRow key={i} ev={ev} index={i} onChange={updateEnvVar} onRemove={removeEnvVar} />
                  ))}
                  <button className="add-env" onClick={addEnvVar}>+ Add Variable</button>
                </div>
              </LabelledField>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <button className="btn-back" onClick={goBack}>← Back</button>
                <button className="btn-next" onClick={goNext}>Review →</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="section-card">
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                Review &amp; Deploy
              </h2>

              {[
                ['Project', form.projectName || '—'],
                ['Repository', form.repoUrl || '—'],
                ['Branch', form.branch],
                ['Framework', selectedFw?.label || form.framework],
                ['Target', form.deployType === 'production' ? '🟢 Production' : '🔵 Preview'],
                ['Env Variables', `${form.envVars.filter(e => e.key.trim()).length} configured`],
              ].map(([k, v]) => (
                <div className="review-row" key={k}>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{k}</span>
                  <span style={{ fontSize: '0.9rem', color: '#e5e7eb', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}

              <div style={{
                marginTop: 14, padding: '10px 14px',
                background: '#0c1a2e', border: '1px solid #1e3a5f', borderRadius: 8,
                fontSize: '0.78rem', color: '#60a5fa',
              }}>
                <strong>Required env vars on this server:</strong> VERCEL_TOKEN (required) ·
                VERCEL_TEAM_ID (optional) · BITBUCKET_USERNAME &amp; BITBUCKET_APP_PASSWORD (optional — for repo validation)
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.2rem' }}>
                <button className="btn-back" onClick={goBack}>← Back</button>
                <button className="btn-deploy" onClick={handleDeploy}>🚀 Deploy Now</button>
              </div>
            </div>
          )}

          {/* ── Step 4: Progress / Result ─────────────────────────────────── */}
          {step === 4 && (
            <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {!result && (
                <>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {deployError ? 'Deployment Failed' : 'Deploying…'}
                  </h2>
                  <ProgressTracker steps={DEPLOY_STEPS} currentStepId={currentStepId} error={deployError} />
                  {deployError && (
                    <button className="btn-back" onClick={() => setStep(3)} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                      ← Try Again
                    </button>
                  )}
                </>
              )}

              {result && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>🎉</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#22c55e' }}>Deployment Triggered!</div>
                      <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: 2 }}>
                        Vercel is building your project. It will be live shortly.
                      </div>
                    </div>
                  </div>

                  {/* Deployment URL */}
                  <div>
                    <p className="section-label">Deployment URL</p>
                    <div className="result-url">
                      <a href={result.deploymentUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                        {result.deploymentUrl}
                      </a>
                      <CopyBtn text={result.deploymentUrl} />
                    </div>
                  </div>

                  {/* Hook URL */}
                  {result.hookUrl && (
                    <div>
                      <p className="section-label">Deploy Hook URL</p>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: 6 }}>
                        Paste this into Bitbucket Pipelines or trigger it manually to redeploy.
                      </p>
                      <div className="result-url" style={{ color: '#a78bfa' }}>
                        <span style={{ wordBreak: 'break-all', fontSize: '0.78rem' }}>{result.hookUrl}</span>
                        <CopyBtn text={result.hookUrl} />
                      </div>
                    </div>
                  )}

                  {/* Bitbucket Pipelines YAML */}
                  {result.pipelineYaml && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <p className="section-label" style={{ marginBottom: 0 }}>bitbucket-pipelines.yml</p>
                        <CopyBtn text={result.pipelineYaml} />
                      </div>
                      <pre className="code-pre">{result.pipelineYaml}</pre>
                    </div>
                  )}

                  {/* Summary */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Project', value: result.projectName },
                      { label: 'Env Vars', value: `${result.envVarsAdded} added` },
                      { label: 'Target', value: form.deployType },
                    ].map(({ label, value }) => (
                      <div key={label} style={{
                        background: '#111', border: '1px solid #1f1f1f', borderRadius: 8,
                        padding: '8px 14px', flex: 1, minWidth: 100,
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e5e7eb', marginTop: 2 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn-outline" onClick={() => { setStep(1); setForm({ projectName: '', repoUrl: '', branch: 'main', framework: 'nextjs', deployType: 'preview', envVars: [{ key: '', value: '' }] }); setResult(null); }}>
                      + New Deployment
                    </button>
                    <Link href="/history" style={{ textDecoration: 'none' }}>
                      <button className="btn-outline">View History</button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
