import { Suspense } from "react";
import { submitAnalysis, getAnalysis } from "@/app/actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, GitFork, Clock, Code, AlertTriangle, CheckCircle, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RepoPage({ params }: { params: Promise<{ owner: string; name: string }> }) {
  const { owner, name } = await params;
  
  // This triggers the analysis or returns cached ID
  try {
    await submitAnalysis(`https://github.com/${owner}/${name}`);
  } catch (error) {
    console.error(`RepoPage error for ${owner}/${name}:`, error);
    return (
      <div className="container mx-auto p-12 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Analysis Failed</h1>
        <p className="text-muted-foreground">Could not fetch data for this repository. It may be private or not exist.</p>
      </div>
    );
  }

  const analysis = await getAnalysis(owner, name);
  if (!analysis) return notFound();

  const { score, metrics, recommendations, githubData } = analysis as any;
  const { details } = githubData;

  const scoreColor = score >= 90 ? "text-emerald-500" : score >= 75 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";
  const scoreLabel = score >= 90 ? "Excellent" : score >= 75 ? "Healthy" : score >= 60 ? "Moderate Risk" : "High Risk";

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {owner} / <span className="text-primary">{name}</span>
            </h1>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-background">{scoreLabel}</Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">{details.description || "No description provided."}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <Card className="lg:col-span-1 border-primary/20 bg-card shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle>Health Score</CardTitle>
            <CardDescription>Overall repository health</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Simple CSS Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted stroke-1" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 283} 283`}
                  className={`${scoreColor} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-6xl font-black ${scoreColor}`}>{score}</span>
                <span className="text-sm font-medium text-muted-foreground mt-1">/ 100</span>
              </div>
            </div>
            <p className="mt-8 text-center text-muted-foreground font-medium">
              This repository is considered <strong className={scoreColor}>{scoreLabel.toLowerCase()}</strong> for production use.
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Repository Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <StatItem icon={<Star className="w-5 h-5 text-yellow-500" />} label="Stars" value={details.stargazers_count.toLocaleString()} />
              <StatItem icon={<GitFork className="w-5 h-5 text-blue-500" />} label="Forks" value={details.forks_count.toLocaleString()} />
              <StatItem icon={<Code className="w-5 h-5 text-purple-500" />} label="Language" value={details.language || "N/A"} />
              <StatItem icon={<Clock className="w-5 h-5 text-green-500" />} label="Created" value={new Date(details.created_at).toLocaleDateString()} />
              <StatItem icon={<AlertTriangle className="w-5 h-5 text-orange-500" />} label="Open PRs" value={githubData.pullRequests?.totalOpen ?? "N/A"} />
              <StatItem icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} label="Merge Rate" value={
                githubData.pullRequests && (githubData.pullRequests.totalMerged + githubData.pullRequests.totalClosed) > 0 
                  ? `${((githubData.pullRequests.totalMerged / (githubData.pullRequests.totalMerged + githubData.pullRequests.totalClosed)) * 100).toFixed(0)}%` 
                  : "N/A"
              } />
            </div>
            <Separator className="my-6" />
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-3">
                  {recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Language Breakdown</h4>
                <div className="space-y-3">
                  {githubData.languages && Object.keys(githubData.languages).length > 0 ? (
                    (() => {
                      const totalBytes = Object.values(githubData.languages).reduce((a: any, b: any) => a + b, 0) as number;
                      return Object.entries(githubData.languages)
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([lang, bytes]: [string, any], i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{lang}</span>
                              <span className="text-muted-foreground">{((bytes / totalBytes) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(bytes / totalBytes) * 100}%` }}></div>
                            </div>
                          </div>
                        ));
                    })()
                  ) : (
                    <span className="text-muted-foreground text-sm">No language data available.</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-bold tracking-tight mt-12 mb-4">Detailed Metrics</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Activity" score={metrics.activity} max={25} desc="Commit frequency and recency." />
        <MetricCard title="Community" score={metrics.community} max={20} desc="Contributors and engagement." />
        <MetricCard title="Issue Health" score={metrics.issues} max={20} desc="Issue resolution and triaging." />
        <MetricCard title="Documentation" score={metrics.documentation} max={15} desc="Presence of key project files." />
        <MetricCard title="Testing" score={metrics.testing} max={20} desc="Test suites and CI/CD workflows." />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function MetricCard({ title, score, max, desc }: { title: string, score: number, max: number, desc: string }) {
  const percentage = (score / max) * 100;
  const color = percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="font-bold text-lg">{score}<span className="text-sm text-muted-foreground font-normal">/{max}</span></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-secondary rounded-full h-2.5 mb-3">
          <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
