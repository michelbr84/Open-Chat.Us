import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solution?: string;
  learnMore?: string;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repoUrl } = await req.json();
    
    if (!repoUrl || !repoUrl.includes('github.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid GitHub repository URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract owner and repo from URL
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    console.log(`Analyzing repository: ${owner}/${repo}`);

    // Get GitHub API token from secrets
    const githubToken = Deno.env.get('GITHUB_API_TOKEN');
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Security-Checker'
    };

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Get repository information
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers
    });

    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repository: ${repoResponse.status}`);
    }

    const repoData = await repoResponse.json();

    // Get repository contents recursively
    const contentsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
      { headers }
    );

    if (!contentsResponse.ok) {
      throw new Error(`Failed to fetch repository contents: ${contentsResponse.status}`);
    }

    const contentsData = await contentsResponse.json();
    const files: GitHubFile[] = contentsData.tree.filter((item: any) => item.type === 'blob');

    console.log(`Found ${files.length} files to analyze`);

    // Perform security checks
    const checks: SecurityCheck[] = await performSecurityChecks(files, owner, repo, headers);

    // Calculate security score
    const score = calculateSecurityScore(checks);

    const report = {
      repoUrl,
      timestamp: new Date().toISOString(),
      checks,
      score,
      totalFiles: files.length,
      scannedFiles: files.length
    };

    return new Response(
      JSON.stringify(report),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error analyzing repository:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze repository',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function performSecurityChecks(
  files: GitHubFile[], 
  owner: string, 
  repo: string, 
  headers: Record<string, string>
): Promise<SecurityCheck[]> {
  const checks: SecurityCheck[] = [];
  
  // File-based security checks
  checks.push(...checkSensitiveFiles(files));
  checks.push(...checkGitignoreConfiguration(files));
  checks.push(...checkConfigurationFiles(files));
  checks.push(...checkDependencyFiles(files));
  
  // Repository-level checks
  checks.push(...await checkRepositorySettings(owner, repo, headers));
  
  return checks;
}

function checkSensitiveFiles(files: GitHubFile[]): SecurityCheck[] {
  const checks: SecurityCheck[] = [];
  
  const sensitivePatterns = [
    { pattern: /\.env$/, name: 'Environment Files', severity: 'critical' as const },
    { pattern: /\.env\./i, name: 'Environment Configuration', severity: 'critical' as const },
    { pattern: /supabase\/\.env/i, name: 'Supabase Environment', severity: 'critical' as const },
    { pattern: /config\/secrets/i, name: 'Secret Configuration', severity: 'critical' as const },
    { pattern: /\.(key|pem|crt|p12|pfx)$/, name: 'Certificate/Key Files', severity: 'critical' as const },
    { pattern: /\.(sql|dump|bak)$/, name: 'Database Files', severity: 'high' as const },
    { pattern: /(password|secret|token|api_key)/i, name: 'Credential Files', severity: 'high' as const },
    { pattern: /id_rsa|id_dsa/, name: 'SSH Keys', severity: 'critical' as const },
    { pattern: /firebase-adminsdk/i, name: 'Firebase Admin SDK', severity: 'critical' as const },
    { pattern: /aws-credentials|\.aws/i, name: 'AWS Credentials', severity: 'critical' as const },
  ];

  const foundSensitive = files.filter(file => 
    sensitivePatterns.some(pattern => pattern.pattern.test(file.path))
  );

  if (foundSensitive.length > 0) {
    foundSensitive.forEach(file => {
      const matchedPattern = sensitivePatterns.find(p => p.pattern.test(file.path));
      checks.push({
        id: `sensitive_${file.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: `Sensitive File Detected: ${matchedPattern?.name}`,
        description: 'Potentially sensitive file found in repository',
        status: 'error',
        message: `Found: ${file.path}`,
        severity: matchedPattern?.severity || 'high',
        solution: `Remove ${file.path} from the repository and add to .gitignore:\n\necho "${file.path}" >> .gitignore\ngit rm --cached "${file.path}"\ngit add .gitignore\ngit commit -m "Remove sensitive file and update .gitignore"`,
        learnMore: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository'
      });
    });
  } else {
    checks.push({
      id: 'sensitive_files_clean',
      name: 'No Sensitive Files',
      description: 'No obviously sensitive files detected',
      status: 'pass',
      message: 'No sensitive files found in repository root and common paths',
      severity: 'low'
    });
  }

  return checks;
}

function checkGitignoreConfiguration(files: GitHubFile[]): SecurityCheck[] {
  const checks: SecurityCheck[] = [];
  
  const gitignoreFile = files.find(file => file.path === '.gitignore');
  
  if (!gitignoreFile) {
    checks.push({
      id: 'gitignore_missing',
      name: 'Missing .gitignore',
      description: 'Repository should have a .gitignore file',
      status: 'warning',
      message: 'No .gitignore file found',
      severity: 'medium',
      solution: 'Create a .gitignore file with common patterns:\n\n# Environment variables\n.env\n.env.local\n.env.*.local\n\n# Dependencies\nnode_modules/\nvendor/\n\n# Build outputs\n/build\n/dist\n\n# Logs\n*.log\n\n# OS files\n.DS_Store\nThumbs.db',
      learnMore: 'https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files'
    });
  } else {
    checks.push({
      id: 'gitignore_exists',
      name: 'Gitignore Present',
      description: 'Repository has a .gitignore file',
      status: 'pass',
      message: '.gitignore file found',
      severity: 'low'
    });
  }

  return checks;
}

function checkConfigurationFiles(files: GitHubFile[]): SecurityCheck[] {
  const checks: SecurityCheck[] = [];
  
  const configFiles = files.filter(file => 
    /\.(json|yml|yaml|toml|ini|conf)$/.test(file.path) &&
    /(config|settings|credential|secret)/i.test(file.path)
  );

  if (configFiles.length > 0) {
    checks.push({
      id: 'config_files_review',
      name: 'Configuration Files Found',
      description: 'Review configuration files for sensitive data',
      status: 'info',
      message: `Found ${configFiles.length} configuration files: ${configFiles.map(f => f.path).join(', ')}`,
      severity: 'medium',
      solution: 'Review these files to ensure they don\'t contain:\n- API keys or tokens\n- Database passwords\n- Private URLs or endpoints\n- User credentials\n\nConsider using environment variables instead.',
      learnMore: 'https://12factor.net/config'
    });
  }

  return checks;
}

function checkDependencyFiles(files: GitHubFile[]): SecurityCheck[] {
  const checks: SecurityCheck[] = [];
  
  const packageFiles = files.filter(file => 
    ['package.json', 'requirements.txt', 'Gemfile', 'composer.json', 'pom.xml'].includes(file.name)
  );

  if (packageFiles.length > 0) {
    checks.push({
      id: 'dependency_files_found',
      name: 'Dependency Files Present',
      description: 'Dependency files found - ensure they are kept updated',
      status: 'info',
      message: `Found dependency files: ${packageFiles.map(f => f.name).join(', ')}`,
      severity: 'low',
      solution: 'Regularly update dependencies and scan for vulnerabilities:\n\n# For Node.js\nnpm audit\nnpm audit fix\n\n# For Python\npip-audit\n\n# For Ruby\nbundle audit',
      learnMore: 'https://docs.github.com/en/code-security/supply-chain-security/managing-vulnerabilities-in-your-projects-dependencies/about-alerts-for-vulnerable-dependencies'
    });
  }

  return checks;
}

async function checkRepositorySettings(
  owner: string, 
  repo: string, 
  headers: Record<string, string>
): Promise<SecurityCheck[]> {
  const checks: SecurityCheck[] = [];
  
  try {
    // Check if repository is public
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    const repoData = await repoResponse.json();
    
    if (repoData.private === false) {
      checks.push({
        id: 'repo_visibility_public',
        name: 'Public Repository',
        description: 'Repository is publicly visible',
        status: 'info',
        message: 'This is a public repository - ensure no sensitive data is committed',
        severity: 'medium',
        solution: 'For repositories containing sensitive data:\n1. Make the repository private\n2. Review commit history for leaked secrets\n3. Rotate any exposed credentials\n4. Use GitHub secret scanning',
        learnMore: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility'
      });
    }

    // Check security features
    checks.push({
      id: 'security_features_info',
      name: 'Security Features Available',
      description: 'GitHub provides additional security features',
      status: 'info',
      message: 'Consider enabling GitHub security features',
      severity: 'low',
      solution: 'Enable these GitHub security features:\n- Dependabot alerts\n- Secret scanning\n- Code scanning\n- Security advisories\n- Branch protection rules',
      learnMore: 'https://docs.github.com/en/code-security'
    });
    
  } catch (error) {
    console.error('Error checking repository settings:', error);
  }
  
  return checks;
}

function calculateSecurityScore(checks: SecurityCheck[]): number {
  let score = 100;
  
  for (const check of checks) {
    if (check.status === 'error') {
      switch (check.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    } else if (check.status === 'warning') {
      switch (check.severity) {
        case 'critical':
          score -= 15;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }
  }
  
  return Math.max(0, Math.min(100, score));
}