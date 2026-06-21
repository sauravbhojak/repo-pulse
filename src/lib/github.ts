import { Octokit } from '@octokit/rest';

// We initialize Octokit with an optional auth token.
// If GITHUB_TOKEN is not provided in env, it will run unauthenticated
// (which has a strict rate limit of 60 requests/hour).
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
console.log("GITHUB_TOKEN exists:", !!process.env.GITHUB_TOKEN);

export interface RepoAnalysisData {
  owner: string;
  name: string;
  details: any;
  commits: any[];
  issues: {
    totalOpen: number;
    totalClosed: number;
  };
  pullRequests: {
    totalOpen: number;
    totalMerged: number;
    totalClosed: number;
  };
  languages: Record<string, number>;
  communityProfile: any;
  hasTests: boolean;
  hasCI: boolean;
  contributorsCount: number;
}

export async function analyzeRepository(owner: string, name: string): Promise<RepoAnalysisData> {
  try {
    // 1. Fetch basic repo details
    const { data: details } = await octokit.repos.get({ owner, repo: name });

    // 2. Fetch recent commits (max 100)
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo: name,
      per_page: 100,
    });

    // 3. Fetch issue and PR stats (we use search to get totals quickly)
    const openIssuesQuery = `repo:${owner}/${name} type:issue state:open`;
    const closedIssuesQuery = `repo:${owner}/${name} type:issue state:closed`;
    const openPRsQuery = `repo:${owner}/${name} type:pr state:open`;
    const mergedPRsQuery = `repo:${owner}/${name} type:pr is:merged`;
    const closedPRsQuery = `repo:${owner}/${name} type:pr state:closed is:unmerged`;
    
    const [openIssuesRes, closedIssuesRes, openPRsRes, mergedPRsRes, closedPRsRes] = await Promise.all([
      octokit.search.issuesAndPullRequests({ q: openIssuesQuery, per_page: 1 }),
      octokit.search.issuesAndPullRequests({ q: closedIssuesQuery, per_page: 1 }),
      octokit.search.issuesAndPullRequests({ q: openPRsQuery, per_page: 1 }),
      octokit.search.issuesAndPullRequests({ q: mergedPRsQuery, per_page: 1 }),
      octokit.search.issuesAndPullRequests({ q: closedPRsQuery, per_page: 1 }),
    ]);

    // 3.5 Fetch Languages
    let languages: Record<string, number> = {};
    try {
      const { data } = await octokit.repos.listLanguages({ owner, repo: name });
      languages = data;
    } catch (e) {
      console.warn("Could not fetch languages", e);
    }

    // 4. Fetch community profile (README, LICENSE, etc.)
    let communityProfile = null;
    try {
      const { data } = await octokit.repos.getCommunityProfileMetrics({ owner, repo: name });
      communityProfile = data;
    } catch (e) {
      // Some repos might not have this available or throw 404
      console.warn("Community profile not available", e);
    }

    // 5. Fetch root directory contents to check for tests / CI
    let hasTests = false;
    let hasCI = false;
    try {
      const { data: contents } = await octokit.repos.getContent({ owner, repo: name, path: '' });
      if (Array.isArray(contents)) {
        hasTests = contents.some((file) => 
          file.name.toLowerCase().includes('test') || 
          file.name.toLowerCase() === 'spec' || 
          file.name.toLowerCase() === '__tests__'
        );
      }
      
      try {
        const { data: githubContents } = await octokit.repos.getContent({ owner, repo: name, path: '.github/workflows' });
        if (Array.isArray(githubContents) && githubContents.length > 0) {
          hasCI = true;
        }
      } catch (e) {
        // .github/workflows not found
      }
    } catch (e) {
      console.warn("Could not fetch repo contents", e);
    }

    // 6. Contributors count
    let contributorsCount = 0;
    try {
      const { data: contributors } = await octokit.repos.listContributors({ owner, repo: name, per_page: 1, anon: "true" });
      // GitHub API link header has the total pages if we want exact count, but listContributors truncates.
      // A simple approximation or just getting the first page gives some signal.
      // For a real SaaS we'd parse the 'link' header to get the exact count.
      contributorsCount = contributors.length; 
    } catch (e) {
      console.warn("Could not fetch contributors", e);
    }

    return {
      owner,
      name,
      details,
      commits,
      issues: {
        totalOpen: openIssuesRes.data.total_count,
        totalClosed: closedIssuesRes.data.total_count,
      },
      pullRequests: {
        totalOpen: openPRsRes.data.total_count,
        totalMerged: mergedPRsRes.data.total_count,
        totalClosed: closedPRsRes.data.total_count,
      },
      languages,
      communityProfile,
      hasTests,
      hasCI,
      contributorsCount,
    };
  } catch (error) {
    console.error(`Failed to analyze repository ${owner}/${name}`, error);
    throw new Error('Failed to fetch repository data from GitHub.');
  }
}
