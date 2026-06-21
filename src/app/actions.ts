'use server'

import { prisma } from '@/lib/prisma';
import { analyzeRepository } from '@/lib/github';
import { calculateHealthScore, generateRecommendations } from '@/lib/scoring';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

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

  const cookieStore = await cookies();
  let sessionId = cookieStore.get('repopulse_session')?.value;
  if (!sessionId) {
    sessionId = randomUUID(); // fallback if middleware failed
  }

  // Check cache (within last 24 hours)
  const existingAnalysis = await prisma.repositoryAnalysis.findUnique({
    where: { url: canonicalUrl },
  });

  if (existingAnalysis) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const githubData = existingAnalysis.githubData as any;
    const hasNewFields = githubData && githubData.languages !== undefined;

    if (existingAnalysis.updatedAt > twentyFourHoursAgo && hasNewFields) {
      await prisma.userSearchHistory.upsert({
        where: {
          sessionId_analysisId: {
            sessionId: sessionId,
            analysisId: existingAnalysis.id,
          }
        },
        create: {
          sessionId: sessionId,
          analysisId: existingAnalysis.id,
        },
        update: {
          createdAt: new Date(),
        }
      });
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

  await prisma.userSearchHistory.upsert({
    where: {
      sessionId_analysisId: {
        sessionId: sessionId,
        analysisId: analysis.id,
      }
    },
    create: {
      sessionId: sessionId,
      analysisId: analysis.id,
    },
    update: {
      createdAt: new Date(),
    }
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
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('repopulse_session')?.value;

  if (!sessionId) {
    return { totalAnalyses: 0, recent: [], popular: [] };
  }

  const userSearches = await prisma.userSearchHistory.findMany({
    where: { sessionId },
    include: { analysis: true },
    orderBy: { createdAt: 'desc' }
  });

  // Extract unique analyses
  const uniqueAnalysesMap = new Map();
  userSearches.forEach(item => {
    if (!uniqueAnalysesMap.has(item.analysis.id)) {
      uniqueAnalysesMap.set(item.analysis.id, item.analysis);
    }
  });
  const uniqueAnalyses = Array.from(uniqueAnalysesMap.values());

  const totalAnalyses = uniqueAnalyses.length;
  const recent = uniqueAnalyses.slice(0, 5);
  const popular = [...uniqueAnalyses].sort((a, b) => b.score - a.score).slice(0, 5);

  return { totalAnalyses, recent, popular };
}
