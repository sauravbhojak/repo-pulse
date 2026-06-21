'use server'

import { prisma } from '@/lib/prisma';
import { analyzeRepository } from '@/lib/github';
import { calculateHealthScore, generateRecommendations } from '@/lib/scoring';
import { revalidatePath } from 'next/cache';

// Helper to extract owner and name from GitHub URL
function parseGithubUrl(url: string) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], name: parts[1] };
    }
    return null;
  } catch {
    return null;
  }
}

export async function submitAnalysis(url: string) {
  const repoInfo = parseGithubUrl(url);
  
  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL. Must be in the format https://github.com/owner/name');
  }

  const { owner, name } = repoInfo;
  const canonicalUrl = `https://github.com/${owner}/${name}`.toLowerCase();

  // Check cache (within last 24 hours)
  const existingAnalysis = await prisma.repositoryAnalysis.findUnique({
    where: { url: canonicalUrl },
  });

  if (existingAnalysis) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const githubData = existingAnalysis.githubData as any;
    const hasNewFields = githubData && githubData.languages !== undefined;
    
    if (existingAnalysis.updatedAt > twentyFourHoursAgo && hasNewFields) {
      return { id: existingAnalysis.id, owner, name };
    }
  }

  // Fetch new data
  const githubData = await analyzeRepository(owner, name);
  const metrics = calculateHealthScore(githubData);
  const recommendations = generateRecommendations(githubData, metrics);

  // Save to database
  const analysis = await prisma.repositoryAnalysis.upsert({
    where: { url: canonicalUrl },
    update: {
      score: metrics.totalScore,
      metrics: metrics as any,
      recommendations: recommendations as any,
      githubData: githubData as any,
    },
    create: {
      url: canonicalUrl,
      owner,
      name,
      score: metrics.totalScore,
      metrics: metrics as any,
      recommendations: recommendations as any,
      githubData: githubData as any,
    },
  });
  return { id: analysis.id, owner, name };
}

export async function getAnalysis(owner: string, name: string) {
  const canonicalUrl = `https://github.com/${owner}/${name}`.toLowerCase();
  
  const analysis = await prisma.repositoryAnalysis.findUnique({
    where: { url: canonicalUrl },
  });

  if (!analysis) {
    return null;
  }

  return analysis;
}

export async function getRecentAnalyses(limit = 10) {
  return await prisma.repositoryAnalysis.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getAdminStats() {
  const totalAnalyses = await prisma.repositoryAnalysis.count();
  const recent = await prisma.repositoryAnalysis.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  const popular = await prisma.repositoryAnalysis.findMany({
    orderBy: { score: 'desc' },
    take: 5,
  });

  return { totalAnalyses, recent, popular };
}
