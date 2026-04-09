// In-memory history — survives hot-reloads, resets on cold-start.
// Replace with a real database for production.
if (!global._deployHistory) global._deployHistory = [];

const FRAMEWORK_VERCEL_MAP = {
  nextjs:  'nextjs',
  react:   'create-react-app',
  nodejs:  null,
  vue:     'vue',
  nuxt:    'nuxtjs',
  svelte:  'sveltekit',
  vite:    'vite',
  other:   null,
};

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

function generatePipelineYaml(hookUrl, branch) {
  const safeHook = hookUrl || 'YOUR_DEPLOY_HOOK_URL';
  return `image: atlassian/default-image:4

pipelines:
  branches:
    ${branch}:
      - step:
          name: Deploy to Vercel (Production)
          script:
            - curl -X POST "${safeHook}"

  pull-requests:
    '**':
      - step:
          name: Deploy to Vercel (Preview)
          script:
            - curl -X POST "${safeHook}"`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    projectName, repoUrl, branch, framework, deployType, envVars,
    nodeVersion, region, installCmd, buildCommand, rootDirectory, autoDeploy,
  } = req.body;

  // ── Validate inputs ────────────────────────────────────────────────────────
  if (!projectName?.trim()) return res.status(400).json({ error: 'Project name is required', step: 'validate' });
  if (!repoUrl?.trim())     return res.status(400).json({ error: 'Repository URL is required', step: 'validate' });
  if (!branch?.trim())      return res.status(400).json({ error: 'Branch name is required', step: 'validate' });
  if (!framework)           return res.status(400).json({ error: 'Framework is required', step: 'validate' });

  // ── Parse Bitbucket URL ────────────────────────────────────────────────────
  const bbMatch = repoUrl.trim().match(/bitbucket\.org\/([^/]+)\/([^/\s]+?)(?:\.git)?\s*$/);
  if (!bbMatch) {
    return res.status(400).json({
      error: 'Invalid Bitbucket URL. Expected format: https://bitbucket.org/workspace/repo-slug',
      step: 'validate',
    });
  }
  const [, bbWorkspace, bbSlug] = bbMatch;

  // ── Require Vercel token ───────────────────────────────────────────────────
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  if (!VERCEL_TOKEN) {
    return res.status(500).json({
      error: 'VERCEL_TOKEN environment variable is not set. Add it to your Vercel project settings.',
      step: 'project',
    });
  }

  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
  const vercelHeaders = {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const teamParam = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';

  const sanitized = sanitizeName(projectName);

  // Build history record
  const record = {
    id: `dep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    projectName: sanitized,
    originalName: projectName.trim(),
    repoUrl: repoUrl.trim(),
    bbWorkspace,
    bbSlug,
    branch: branch.trim(),
    framework,
    deployType,
    envCount: (envVars || []).filter(e => e.key?.trim()).length,
    timestamp: new Date().toISOString(),
    status: 'in_progress',
    vercelProjectId: null,
    deploymentUrl: null,
    hookUrl: null,
    triggeredDeployId: null,
    error: null,
  };

  try {
    // ── Step 1: Validate Bitbucket repo (if credentials provided) ─────────────
    const BB_USER = process.env.BITBUCKET_USERNAME;
    const BB_PASS = process.env.BITBUCKET_APP_PASSWORD;

    if (BB_USER && BB_PASS) {
      const bbRes = await fetch(
        `https://api.bitbucket.org/2.0/repositories/${bbWorkspace}/${bbSlug}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${BB_USER}:${BB_PASS}`).toString('base64')}`,
          },
        }
      );
      if (!bbRes.ok) {
        const errJson = await bbRes.json().catch(() => ({}));
        return res.status(400).json({
          error: `Bitbucket repo not accessible (${bbRes.status}): ${errJson.error?.message || 'not found or private'}`,
          step: 'bitbucket',
        });
      }
    }

    // ── Step 2: Create Vercel project ─────────────────────────────────────────
    const createBody = { name: sanitized };
    if (FRAMEWORK_VERCEL_MAP[framework])   createBody.framework       = FRAMEWORK_VERCEL_MAP[framework];
    if (nodeVersion)                        createBody.nodeVersion     = nodeVersion;
    if (buildCommand?.trim())               createBody.buildCommand    = buildCommand.trim();
    if (installCmd?.trim())                 createBody.installCommand  = installCmd.trim();
    if (rootDirectory?.trim() && rootDirectory.trim() !== '/')
                                            createBody.rootDirectory   = rootDirectory.trim();
    if (region && region !== 'auto')        createBody.serverlessFunctionRegion = region;

    let projectData;
    const createRes = await fetch(`https://api.vercel.com/v9/projects${teamParam}`, {
      method: 'POST',
      headers: vercelHeaders,
      body: JSON.stringify(createBody),
    });
    const createJson = await createRes.json();

    if (!createRes.ok) {
      if (createJson.error?.code === 'project_already_exists') {
        // Re-use the existing project
        const existRes = await fetch(`https://api.vercel.com/v9/projects/${sanitized}${teamParam}`, {
          headers: vercelHeaders,
        });
        if (!existRes.ok) {
          throw new Error(`Project already exists but could not be retrieved: ${createJson.error?.message}`);
        }
        projectData = await existRes.json();
      } else {
        throw new Error(`Failed to create Vercel project: ${createJson.error?.message || createRes.statusText}`);
      }
    } else {
      projectData = createJson;
    }

    record.vercelProjectId = projectData.id;

    // ── Step 3: Add environment variables ─────────────────────────────────────
    const validEnvs = (envVars || []).filter(e => e.key?.trim() && e.value !== undefined && e.value !== null);
    const envTargets = deployType === 'production' ? ['production'] : ['preview', 'development'];

    await Promise.all(validEnvs.map(({ key, value }) =>
      fetch(`https://api.vercel.com/v10/projects/${projectData.id}/env${teamParam}`, {
        method: 'POST',
        headers: vercelHeaders,
        body: JSON.stringify({
          key: key.trim(),
          value: String(value),
          type: 'encrypted',
          target: envTargets,
        }),
      }).catch(() => null) // silently ignore duplicates / conflicts
    ));

    // ── Step 4: Create deploy hook ────────────────────────────────────────────
    const hookRes = await fetch(
      `https://api.vercel.com/v1/projects/${projectData.id}/deploy-hooks${teamParam}`,
      {
        method: 'POST',
        headers: vercelHeaders,
        body: JSON.stringify({ name: `Bitbucket · ${branch.trim()}`, ref: branch.trim() }),
      }
    );
    const hookJson = await hookRes.json();
    // Vercel returns { hook: { url, ... } } or directly { url }
    const hookUrl = hookRes.ok
      ? (hookJson.hook?.url || hookJson.url || null)
      : null;
    record.hookUrl = hookUrl;

    // ── Step 5: Trigger deployment via hook (only if autoDeploy is true) ────────
    let triggeredDeployId = null;
    if (autoDeploy !== false && hookUrl) {
      const trigRes = await fetch(hookUrl, { method: 'POST' });
      const trigJson = await trigRes.json().catch(() => ({}));
      triggeredDeployId = trigJson.job?.id || trigJson.deploymentId || null;
    }
    record.triggeredDeployId = triggeredDeployId;
    record.autoDeploy = autoDeploy !== false;

    // Canonical project URL (auto-assigned by Vercel)
    const deploymentUrl = `https://${sanitized}.vercel.app`;
    record.deploymentUrl = deploymentUrl;
    record.status = autoDeploy !== false ? 'triggered' : 'hook_ready';
    record.nodeVersion   = nodeVersion  || '20.x';
    record.region        = region       || 'auto';
    record.installCmd    = installCmd   || '';
    record.buildCommand  = buildCommand || '';
    record.rootDirectory = rootDirectory || '';

    // ── Persist to history ────────────────────────────────────────────────────
    global._deployHistory.unshift(record);
    if (global._deployHistory.length > 100) global._deployHistory.length = 100;

    return res.status(200).json({
      success: true,
      projectId: projectData.id,
      projectName: sanitized,
      deploymentUrl,
      hookUrl,
      triggeredDeployId,
      envVarsAdded: validEnvs.length,
      pipelineYaml: generatePipelineYaml(hookUrl, branch.trim()),
      record,
    });

  } catch (err) {
    record.status = 'error';
    record.error = err.message;
    global._deployHistory.unshift(record);
    if (global._deployHistory.length > 100) global._deployHistory.length = 100;
    return res.status(500).json({ error: err.message, step: 'unknown' });
  }
}
