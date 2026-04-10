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

const NODE_VERSIONS = [
  { id: '18.x', label: 'Node 18', sub: 'LTS (older)' },
  { id: '20.x', label: 'Node 20', sub: 'LTS (stable)' },
  { id: '22.x', label: 'Node 22', sub: 'LTS (latest)'  },
];

const REGIONS = [
  { id: 'auto', label: 'Auto',    sub: 'Nearest region'  },
  { id: 'iad1', label: 'US East', sub: 'Washington D.C.' },
  { id: 'sfo1', label: 'US West', sub: 'San Francisco'   },
  { id: 'cdg1', label: 'Europe',  sub: 'Paris'           },
  { id: 'hnd1', label: 'Asia',    sub: 'Tokyo'           },
  { id: 'bom1', label: 'India',   sub: 'Mumbai'          },
];

const INSTALL_CMDS = [
  { id: '',               label: 'Auto',    sub: 'Vercel detects' },
  { id: 'npm install',    label: 'npm',     sub: 'npm install'    },
  { id: 'yarn',           label: 'Yarn',    sub: 'yarn'           },
  { id: 'pnpm install',   label: 'pnpm',    sub: 'pnpm install'   },
  { id: 'bun install',    label: 'Bun',     sub: 'bun install'    },
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
  body { background: #e8f4fd; }

  @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
  @keyframes blink   { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

  .dp-input {
    width:100%; background:#ffffff; border:1px solid #cbd5e1; color:#1e293b;
    padding:10px 12px; border-radius:8px; font-size:0.9rem; outline:none;
    transition:border-color 0.15s; font-family:inherit;
  }
  .dp-input:focus  { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
  .dp-input::placeholder { color:#94a3b8; }

  .dp-select {
    width:100%; background:#ffffff; border:1px solid #cbd5e1; color:#1e293b;
    padding:10px 12px; border-radius:8px; font-size:0.9rem; outline:none;
    transition:border-color 0.15s; font-family:inherit; cursor:pointer;
    -webkit-appearance:none; appearance:none;
  }
  .dp-select:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
  .dp-select option { background:#ffffff; color:#1e293b; }

  .fw-card {
    border:1px solid #dbeafe; border-radius:10px; padding:10px 14px; cursor:pointer;
    display:flex; align-items:center; gap:8px; background:#ffffff; min-width:110px;
    transition:border-color 0.15s, background 0.15s, box-shadow 0.15s; animation:fadeIn 0.2s ease both;
  }
  .fw-card:hover   { border-color:#93c5fd; box-shadow:0 2px 8px rgba(37,99,235,0.1); }
  .fw-card.sel     { border-color:#2563eb; background:#dbeafe; box-shadow:0 2px 8px rgba(37,99,235,0.15); }

  .env-input {
    background:#f8fbff; border:1px solid #dbeafe; color:#1e293b; padding:8px 10px;
    border-radius:6px; font-size:0.82rem; outline:none; transition:border-color 0.15s;
    font-family:'SF Mono','Fira Code',monospace; width:100%;
  }
  .env-input:focus { border-color:#2563eb; }
  .env-input::placeholder { color:#94a3b8; }

  .env-del {
    background:transparent; border:1px solid #dbeafe; color:#94a3b8;
    width:28px; height:28px; border-radius:6px; cursor:pointer; font-size:1rem;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:all 0.15s;
  }
  .env-del:hover { background:#fee2e2; border-color:#fca5a5; color:#dc2626; }

  .add-env {
    background:transparent; border:1px dashed #cbd5e1; color:#94a3b8;
    padding:7px; border-radius:6px; font-size:0.8rem; cursor:pointer;
    transition:all 0.15s; width:100%; text-align:center;
  }
  .add-env:hover { border-color:#2563eb; color:#2563eb; background:#dbeafe; }

  .btn-deploy {
    background:linear-gradient(135deg,#2563eb,#7c3aed); border:none; color:#fff;
    padding:12px 32px; border-radius:8px; font-size:0.95rem; font-weight:600;
    cursor:pointer; transition:opacity 0.15s,transform 0.15s; letter-spacing:0.02em;
    box-shadow:0 4px 14px rgba(37,99,235,0.3);
  }
  .btn-deploy:hover   { opacity:0.9; transform:translateY(-1px); }
  .btn-deploy:active  { transform:translateY(0); }
  .btn-deploy:disabled{ opacity:0.45; cursor:not-allowed; transform:none; }

  .btn-back {
    background:#f1f5f9; border:1px solid #cbd5e1; color:#475569;
    padding:10px 20px; border-radius:8px; font-size:0.9rem; cursor:pointer;
    transition:all 0.15s;
  }
  .btn-back:hover { background:#e2e8f0; color:#1e293b; border-color:#94a3b8; }

  .btn-next {
    background:#2563eb; border:1px solid #2563eb; color:#ffffff;
    padding:10px 24px; border-radius:8px; font-size:0.9rem; font-weight:500;
    cursor:pointer; transition:all 0.15s; box-shadow:0 2px 8px rgba(37,99,235,0.25);
  }
  .btn-next:hover { background:#1d4ed8; border-color:#1d4ed8; }

  .btn-outline {
    background:#f1f5f9; border:1px solid #cbd5e1; color:#475569;
    padding:7px 14px; border-radius:6px; font-size:0.8rem; cursor:pointer;
    transition:all 0.15s;
  }
  .btn-outline:hover { background:#e2e8f0; color:#1e293b; border-color:#94a3b8; }

  .type-toggle { display:flex; border:1px solid #dbeafe; border-radius:8px; overflow:hidden; background:#f8fbff; }
  .type-btn {
    background:transparent; border:none; color:#64748b;
    padding:8px 22px; font-size:0.85rem; cursor:pointer;
    transition:all 0.15s; flex:1; font-family:inherit;
  }
  .type-btn.preview-on    { background:#dbeafe; color:#2563eb; font-weight:500; }
  .type-btn.production-on { background:#dcfce7; color:#16a34a; font-weight:500; }

  .step-dot {
    width:28px; height:28px; border-radius:50%; display:flex; align-items:center;
    justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;
    transition:all 0.3s;
  }

  .progress-row {
    display:flex; align-items:center; gap:12px; padding:10px 0;
    border-bottom:1px solid #e2e8f0; animation:fadeIn 0.2s ease both;
  }
  .progress-row:last-child { border-bottom:none; }

  .spinner {
    width:16px; height:16px; border:2px solid #bfdbfe;
    border-top-color:#2563eb; border-radius:50%; flex-shrink:0;
    animation:spin 0.7s linear infinite;
  }

  .opt-pill {
    background:#ffffff; border:1px solid #dbeafe; border-radius:8px;
    padding:8px 12px; cursor:pointer; text-align:center;
    transition:border-color 0.15s, background 0.15s;
    min-width:72px; font-family:inherit;
  }
  .opt-pill:hover { border-color:#93c5fd; }
  .opt-pill.sel   { border-color:#2563eb; background:#dbeafe; }

  .toggle-switch {
    width:42px; height:24px; border-radius:12px; border:none; cursor:pointer;
    position:relative; transition:background 0.2s; flex-shrink:0; padding:0;
  }
  .toggle-knob {
    position:absolute; top:3px; width:18px; height:18px;
    border-radius:50%; background:#fff; transition:left 0.2s;
  }

  .code-pre {
    background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px;
    padding:14px 16px; font-family:'SF Mono','Fira Code','Consolas',monospace;
    font-size:0.76rem; color:#334155; line-height:1.65; overflow-x:auto;
    white-space:pre;
  }

  .nav-link {
    color:#475569; text-decoration:none; font-size:0.85rem;
    padding:5px 10px; border-radius:6px; transition:all 0.15s;
  }
  .nav-link:hover { color:#1e293b; background:#dbeafe; }
  .nav-link.active { color:#ffffff; background:#2563eb; font-weight:600; }

  .result-url {
    background:#f0f9ff; border:1px solid #bfdbfe; border-radius:8px;
    padding:12px 16px; font-family:'SF Mono','Fira Code',monospace;
    font-size:0.85rem; color:#2563eb; word-break:break-all;
    display:flex; align-items:center; justify-content:space-between; gap:12px;
  }

  .copy-btn {
    background:#f1f5f9; border:1px solid #cbd5e1; color:#64748b;
    padding:4px 10px; border-radius:5px; font-size:0.73rem; cursor:pointer;
    transition:all 0.15s; flex-shrink:0; font-family:inherit;
  }
  .copy-btn:hover { background:#e2e8f0; color:#1e293b; border-color:#94a3b8; }

  .section-card {
    background:#ffffff; border:1px solid #dbeafe; border-radius:12px;
    padding:1.2rem 1.4rem; animation:fadeIn 0.3s ease both;
    box-shadow:0 1px 6px rgba(37,99,235,0.06);
  }
  .section-label {
    font-size:0.72rem; color:#64748b; text-transform:uppercase;
    letter-spacing:0.07em; margin-bottom:6px;
  }
  .review-row {
    display:flex; justify-content:space-between; align-items:flex-start;
    padding:8px 0; border-bottom:1px solid #e2e8f0; gap:16px;
  }
  .review-row:last-child { border-bottom:none; }
`;

// ─── Sub-components ────────────────────────────────────────────────────────────

function Nav({ current }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 4,
      borderBottom: '1px solid #bfdbfe', padding: '12px 1rem',
      marginBottom: '2rem', background: '#ffffff',
      boxShadow: '0 1px 4px rgba(37,99,235,0.08)',
    }}>
      <Link href="/" className={`nav-link ${current === 'dashboard' ? 'active' : ''}`}>Assessment</Link>
      <span style={{ color: '#cbd5e1' }}>·</span>
      <Link href="/deploy" className={`nav-link ${current === 'deploy' ? 'active' : ''}`}>Deploy</Link>
      <span style={{ color: '#cbd5e1' }}>·</span>
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
                background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                border: `1px solid ${done ? '#16a34a' : active ? '#2563eb' : '#cbd5e1'}`,
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: '0.7rem', color: active ? '#1e293b' : '#94a3b8', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ height: 1, flex: 1, background: done ? '#86efac' : '#e2e8f0', margin: '0 6px', marginBottom: 16 }} />
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
        <label style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{label}</label>
        {hint && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{hint}</span>}
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
            {done    && <span style={{ color: '#16a34a', fontSize: '1rem', flexShrink: 0, width: 20 }}>✓</span>}
            {active  && <div className="spinner" />}
            {errored && <span style={{ color: '#dc2626', fontSize: '1rem', flexShrink: 0, width: 20 }}>✕</span>}
            {pending && <span style={{ color: '#cbd5e1', fontSize: '0.8rem', flexShrink: 0, width: 20 }}>○</span>}
            <span style={{
              fontSize: '0.9rem',
              color: done ? '#94a3b8' : active ? '#1e293b' : errored ? '#dc2626' : '#94a3b8',
              fontWeight: active ? 600 : 400,
            }}>
              {s.label}
            </span>
          </div>
        );
      })}
      {error && (
        <div style={{
          marginTop: 14, padding: '10px 14px', background: '#fee2e2',
          border: '1px solid #fca5a5', borderRadius: 8,
          fontSize: '0.85rem', color: '#dc2626',
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
    nodeVersion: '20.x',
    region: 'auto',
    installCmd: '',
    buildCommand: '',
    rootDirectory: '',
    autoDeploy: true,
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
          projectName:  form.projectName,
          repoUrl:      form.repoUrl,
          branch:       form.branch,
          framework:    form.framework,
          deployType:   form.deployType,
          envVars:      form.envVars.filter(e => e.key.trim()),
          nodeVersion:  form.nodeVersion,
          region:       form.region,
          installCmd:   form.installCmd,
          buildCommand: form.buildCommand,
          rootDirectory: form.rootDirectory,
          autoDeploy:   form.autoDeploy,
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
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#e8f4fd', minHeight: '100vh', color: '#1e293b' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' }}>
          <Nav current="deploy" />

          {/* Page title */}
          <div style={{ marginBottom: '1.8rem' }}>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg,#1e3a5f 30%,#2563eb 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Deploy to Vercel
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 4 }}>
              Self-service deployment from Bitbucket to Vercel — no DevOps knowledge required.
            </p>
          </div>

          <StepIndicator current={step} />

          {/* ── Step 1: Source ────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
                      <span style={{ fontSize: '0.82rem', color: form.framework === fw.id ? '#1e293b' : '#475569', fontWeight: form.framework === fw.id ? 600 : 400 }}>{fw.label}</span>
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
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                  {form.deployType === 'preview'
                    ? 'Creates a unique preview URL. Env vars scoped to preview + development.'
                    : 'Deploys to your production domain. Env vars scoped to production only.'}
                </p>
              </LabelledField>

              {/* Node.js Version */}
              <LabelledField label="Node.js Version">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {NODE_VERSIONS.map(nv => (
                    <button key={nv.id} className={`opt-pill ${form.nodeVersion === nv.id ? 'sel' : ''}`}
                      onClick={() => setField('nodeVersion', nv.id)}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: form.nodeVersion === nv.id ? '#2563eb' : '#475569' }}>{nv.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{nv.sub}</div>
                    </button>
                  ))}
                </div>
              </LabelledField>

              {/* Region */}
              <LabelledField label="Deploy Region" hint="Fluid Compute auto-routes to nearest">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {REGIONS.map(r => (
                    <button key={r.id} className={`opt-pill ${form.region === r.id ? 'sel' : ''}`}
                      onClick={() => setField('region', r.id)}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: form.region === r.id ? '#2563eb' : '#475569' }}>{r.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{r.sub}</div>
                    </button>
                  ))}
                </div>
              </LabelledField>

              {/* Install Command */}
              <LabelledField label="Package Manager" hint="Sets the install command">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {INSTALL_CMDS.map(ic => (
                    <button key={ic.id} className={`opt-pill ${form.installCmd === ic.id ? 'sel' : ''}`}
                      onClick={() => setField('installCmd', ic.id)}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: form.installCmd === ic.id ? '#2563eb' : '#475569' }}>{ic.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{ic.sub}</div>
                    </button>
                  ))}
                </div>
              </LabelledField>

              {/* Build Command override */}
              <LabelledField label="Build Command" hint="Leave blank to use framework default">
                <input className="dp-input" placeholder={`e.g. npm run build`}
                  value={form.buildCommand} onChange={e => setField('buildCommand', e.target.value)} />
              </LabelledField>

              {/* Root Directory */}
              <LabelledField label="Root Directory" hint="For monorepos — leave blank for repo root">
                <input className="dp-input" placeholder="e.g. apps/web"
                  value={form.rootDirectory} onChange={e => setField('rootDirectory', e.target.value)} />
              </LabelledField>

              {/* Auto Deploy */}
              <LabelledField label="Trigger Deployment Immediately">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className="toggle-switch"
                    style={{ background: form.autoDeploy ? '#2563eb' : '#cbd5e1' }}
                    onClick={() => setField('autoDeploy', !form.autoDeploy)}
                  >
                    <div className="toggle-knob" style={{ left: form.autoDeploy ? 21 : 3 }} />
                  </button>
                  <span style={{ fontSize: '0.82rem', color: form.autoDeploy ? '#2563eb' : '#94a3b8' }}>
                    {form.autoDeploy ? 'Deploy right after project setup' : 'Set up hook only — trigger manually later'}
                  </span>
                </div>
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
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                Review &amp; Deploy
              </h2>

              {[
                ['Project',       form.projectName || '—'],
                ['Repository',    form.repoUrl || '—'],
                ['Branch',        form.branch],
                ['Framework',     selectedFw?.label || form.framework],
                ['Node.js',       form.nodeVersion],
                ['Region',        REGIONS.find(r => r.id === form.region)?.label || form.region],
                ['Package Mgr',   INSTALL_CMDS.find(c => c.id === form.installCmd)?.label || 'Auto'],
                ['Build Cmd',     form.buildCommand || 'Framework default'],
                ['Root Dir',      form.rootDirectory || '/ (root)'],
                ['Target',        form.deployType === 'production' ? '🟢 Production' : '🔵 Preview'],
                ['Auto Deploy',   form.autoDeploy ? '✓ Trigger immediately' : 'Hook only'],
                ['Env Variables', `${form.envVars.filter(e => e.key.trim()).length} configured`],
              ].map(([k, v]) => (
                <div className="review-row" key={k}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>{k}</span>
                  <span style={{ fontSize: '0.9rem', color: '#1e293b', textAlign: 'right', wordBreak: 'break-all', fontWeight: 500 }}>{v}</span>
                </div>
              ))}

              <div style={{
                marginTop: 14, padding: '10px 14px',
                background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 8,
                fontSize: '0.78rem', color: '#2563eb',
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
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#16a34a' }}>Deployment Triggered!</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                        Vercel is building your project. It will be live shortly.
                      </div>
                    </div>
                  </div>

                  {/* Deployment URL */}
                  <div>
                    <p className="section-label">Deployment URL</p>
                    <div className="result-url">
                      <a href={result.deploymentUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {result.deploymentUrl}
                      </a>
                      <CopyBtn text={result.deploymentUrl} />
                    </div>
                  </div>

                  {/* Hook URL */}
                  {result.hookUrl && (
                    <div>
                      <p className="section-label">Deploy Hook URL</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 6 }}>
                        Paste this into Bitbucket Pipelines or trigger it manually to redeploy.
                      </p>
                      <div className="result-url" style={{ color: '#7c3aed' }}>
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
                        background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: 8,
                        padding: '8px 14px', flex: 1, minWidth: 100,
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{value}</div>
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
