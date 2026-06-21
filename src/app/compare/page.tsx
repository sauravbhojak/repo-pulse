import { Suspense } from "react";
import { submitAnalysis, getAnalysis } from "@/app/actions";
import { CompareForm } from "@/components/compare-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Helper to fetch data for comparison
async function fetchCompareData(url: string) {
  try {
    const { owner, name } = await submitAnalysis(url);
    const data = await getAnalysis(owner, name);
    return data;
  } catch (e) {
    return null;
  }
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { repo1, repo2 } = await searchParams;
  
  const hasUrls = typeof repo1 === 'string' && typeof repo2 === 'string';
  
  let data1 = null;
  let data2 = null;

  if (hasUrls) {
    [data1, data2] = await Promise.all([
      fetchCompareData(repo1 as string),
      fetchCompareData(repo2 as string)
    ]);
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl mt-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Compare Repositories</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Evaluate two open source projects side-by-side to make an informed decision on which library to adopt for your next project.
        </p>
      </div>

      <CompareForm />

      {hasUrls && (
        <div className="grid md:grid-cols-2 gap-8">
          <RepoColumn data={data1} url={repo1 as string} />
          <RepoColumn data={data2} url={repo2 as string} />
        </div>
      )}
    </div>
  );
}

function RepoColumn({ data, url }: { data: any, url: string }) {
  if (!data) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Failed to analyze</p>
          <p className="text-sm truncate">{url}</p>
        </CardContent>
      </Card>
    );
  }

  const { owner, name, score, metrics, githubData } = data;
  const { details } = githubData;

  const scoreColor = score >= 90 ? "text-emerald-500" : score >= 75 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl truncate" title={`${owner}/${name}`}>{owner}/<span className="text-primary">{name}</span></CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="secondary">Stars: {details.stargazers_count}</Badge>
            <Badge variant="secondary">Forks: {details.forks_count}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <div className={`text-7xl font-black ${scoreColor}`}>{score}</div>
          <p className="text-muted-foreground text-sm font-medium mt-2">Overall Score</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metrics Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricRow label="Activity" score={metrics.activity} max={25} />
          <Separator />
          <MetricRow label="Community" score={metrics.community} max={20} />
          <Separator />
          <MetricRow label="Issue Health" score={metrics.issues} max={20} />
          <Separator />
          <MetricRow label="Documentation" score={metrics.documentation} max={15} />
          <Separator />
          <MetricRow label="Testing" score={metrics.testing} max={20} />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricRow({ label, score, max }: { label: string, score: number, max: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 bg-secondary rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${(score/max)*100}%` }}></div>
        </div>
        <span className="text-sm font-bold w-8 text-right">{score}<span className="text-muted-foreground font-normal">/{max}</span></span>
      </div>
    </div>
  );
}
