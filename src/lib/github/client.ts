const GH_API = "https://api.github.com";

export interface GHUser {
  id: number;
  login: string;
  avatar_url: string;
  name?: string;
}

export interface GHRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  default_branch: string;
  pushed_at: string;
}

export interface GHDependabotAlert {
  number: number;
  state: "open" | "fixed" | "dismissed" | "auto_dismissed";
  dependency: {
    package: { name: string; ecosystem: string };
    manifest_path?: string;
    scope?: string;
  };
  security_advisory: {
    ghsa_id: string;
    cve_id?: string;
    summary: string;
    description?: string;
    severity: "low" | "medium" | "moderate" | "high" | "critical";
    cvss?: { score?: number; vector_string?: string };
  };
  security_vulnerability: {
    vulnerable_version_range: string;
    first_patched_version?: { identifier: string };
  };
  html_url: string;
  created_at: string;
}

interface FetchResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

async function ghFetch<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<FetchResult<T>> {
  try {
    const res = await fetch(`${GH_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "BlindAI-Scanner/0.1",
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as { message?: string };
      return { ok: false, error: errBody.message || `HTTP ${res.status}`, status: res.status };
    }
    const data = (await res.json()) as T;
    return { ok: true, data, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function verifyToken(token: string) {
  return ghFetch<GHUser>(token, "/user");
}

export function listRepos(token: string) {
  return ghFetch<GHRepo[]>(token, "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member");
}

export function listDependabotAlerts(token: string, owner: string, repo: string) {
  return ghFetch<GHDependabotAlert[]>(
    token,
    `/repos/${owner}/${repo}/dependabot/alerts?state=open&per_page=100`
  );
}
