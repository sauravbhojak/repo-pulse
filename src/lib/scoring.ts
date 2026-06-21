import { RepoAnalysisData } from './github';

export interface ScoreMetrics {
  totalScore: number;
  activity: number; // Max 25
  community: number; // Max 20
  issues: number; // Max 20
  documentation: number; // Max 15
  testing: number; // Max 20
}

export function generateRecommendations(data: RepoAnalysisData, metrics: ScoreMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.activity < 15) {
    recommendations.push("Repository activity is low. Consider increasing commit frequency or marking the project as maintained.");
  }
  
  if (data.issues.totalOpen > 0 && metrics.issues < 10) {
    recommendations.push("High number of open issues relative to closed issues. Focus on triaging and closing old issues.");
  }

  if (metrics.documentation < 10) {
    if (!data.communityProfile?.files?.contributing) {
      recommendations.push("Repository lacks a CONTRIBUTING guide. Adding one helps onboard new contributors.");
    }
    if (!data.communityProfile?.files?.code_of_conduct) {
      recommendations.push("Adding a CODE_OF_CONDUCT ensures a welcoming community.");
    }
  }

  if (!data.hasTests) {
    recommendations.push("Testing infrastructure appears incomplete. Add a test suite (e.g., Jest, Vitest) and a 'test' or 'spec' folder.");
  }

  if (!data.hasCI) {
    recommendations.push("No GitHub Actions workflows detected. Setup CI to automate testing and linting.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Excellent work! The repository follows best practices.");
  }

  return recommendations;
}

export function calculateHealthScore(data: RepoAnalysisData): ScoreMetrics {
  let activity = 0;
  let community = 0;
  let issues = 0;
  let documentation = 0;
  let testing = 0;

  // 1. Activity (Max 25)
  if (data.commits && data.commits.length > 0) {
    const lastCommitDate = new Date(data.commits[0].commit.author.date);
    const monthsSinceLastCommit = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsSinceLastCommit < 1) activity += 25;
    else if (monthsSinceLastCommit < 3) activity += 20;
    else if (monthsSinceLastCommit < 6) activity += 15;
    else if (monthsSinceLastCommit < 12) activity += 5;
  }

  // 2. Community (Max 20)
  if (data.contributorsCount > 10) community += 20;
  else if (data.contributorsCount > 5) community += 15;
  else if (data.contributorsCount > 1) community += 10;
  else community += 5;

  // 3. Issue Health (Max 20)
  const totalIssues = data.issues.totalOpen + data.issues.totalClosed;
  if (totalIssues === 0) {
    issues += 20; // No issues is fine
  } else {
    const closedRatio = data.issues.totalClosed / totalIssues;
    issues += Math.round(closedRatio * 20);
  }

  // 4. Documentation (Max 15)
  if (data.communityProfile) {
    if (data.communityProfile.files?.readme) documentation += 5;
    if (data.communityProfile.files?.license) documentation += 4;
    if (data.communityProfile.files?.contributing) documentation += 3;
    if (data.communityProfile.files?.code_of_conduct) documentation += 3;
  }

  // 5. Testing (Max 20)
  if (data.hasTests) testing += 10;
  if (data.hasCI) testing += 10;

  return {
    totalScore: activity + community + issues + documentation + testing,
    activity,
    community,
    issues,
    documentation,
    testing,
  };
}
