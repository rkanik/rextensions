import fallback from '../data/github-fallback.json'

export type GitHubUser = typeof fallback.user
export type GitHubRepo = typeof fallback.repo

const USER = import.meta.env.PUBLIC_GITHUB_USER || 'rkanik'
const REPO = import.meta.env.PUBLIC_GITHUB_REPO || 'rkanik/rextensions'

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'rextensions-web-ssg',
      },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getGitHubUser(): Promise<GitHubUser> {
  const data = await fetchJson<Record<string, unknown>>(`https://api.github.com/users/${USER}`)
  if (!data) return fallback.user
  return {
    login: String(data.login ?? fallback.user.login),
    name: String(data.name ?? fallback.user.name),
    bio: String(data.bio ?? fallback.user.bio),
    company: String(data.company ?? fallback.user.company),
    location: String(data.location ?? fallback.user.location),
    blog: String(data.blog ?? fallback.user.blog),
    html_url: String(data.html_url ?? fallback.user.html_url),
    avatar_url: String(data.avatar_url ?? fallback.user.avatar_url),
    hireable: Boolean(data.hireable ?? fallback.user.hireable),
    public_repos: Number(data.public_repos ?? fallback.user.public_repos),
    followers: Number(data.followers ?? fallback.user.followers),
    created_at: String(data.created_at ?? fallback.user.created_at),
  }
}

export async function getGitHubRepo(): Promise<GitHubRepo> {
  const data = await fetchJson<Record<string, unknown>>(`https://api.github.com/repos/${REPO}`)
  if (!data) return fallback.repo
  const license = data.license as { spdx_id?: string } | null
  return {
    full_name: String(data.full_name ?? fallback.repo.full_name),
    html_url: String(data.html_url ?? fallback.repo.html_url),
    description: String(data.description ?? fallback.repo.description),
    language: String(data.language ?? fallback.repo.language),
    stargazers_count: Number(data.stargazers_count ?? fallback.repo.stargazers_count),
    forks_count: Number(data.forks_count ?? fallback.repo.forks_count),
    open_issues_count: Number(data.open_issues_count ?? fallback.repo.open_issues_count),
    default_branch: String(data.default_branch ?? fallback.repo.default_branch),
    license: license?.spdx_id ?? fallback.repo.license,
  }
}
