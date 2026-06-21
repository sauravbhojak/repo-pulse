"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Activity, Users, FileText, CheckCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== "github.com") {
        setError("Please enter a valid GitHub repository URL.");
        return;
      }

      const parts = urlObj.pathname.split("/").filter(Boolean);
      if (parts.length < 2) {
        setError("Please provide a URL with both owner and repository name.");
        return;
      }

      const owner = parts[0];
      const name = parts[1];
      router.push(`/repo/${owner}/${name}`);
    } catch {
      setError("Please enter a valid URL.");
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full px-6 py-24 md:py-32 lg:py-40 flex flex-col items-center text-center space-y-8 bg-gradient-to-b from-background to-muted/20">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Understand Any GitHub Repository in <span className="text-primary">Seconds</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Analyze maintenance, activity, documentation quality, testing coverage, and community health before adopting a library.
          </p>
        </div>

        <div className="w-full max-w-xl space-y-4">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="https://github.com/facebook/react"
                className="pl-10 h-14 text-lg rounded-xl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-14 px-8 text-lg rounded-xl">
              Analyze
            </Button>
          </form>
          {error && <p className="text-destructive text-sm text-left px-2">{error}</p>}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl px-6 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Comprehensive Health Metrics</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We look beyond the star count. RepoPulse evaluates the underlying signals that indicate a healthy, well-maintained open source project.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Activity className="w-8 h-8 text-blue-500" />}
            title="Repository Activity"
            description="Measures commit frequency, recent releases, and ongoing maintenance to ensure the project isn't abandoned."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-green-500" />}
            title="Community Health"
            description="Evaluates contributor count, pull request activity, and community engagement."
          />
          <FeatureCard
            icon={<ShieldAlert className="w-8 h-8 text-yellow-500" />}
            title="Issue Management"
            description="Analyzes the ratio of open to closed issues to determine if maintainers are actively resolving bugs."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8 text-purple-500" />}
            title="Documentation Quality"
            description="Checks for essential files like README, CONTRIBUTING, and CODE_OF_CONDUCT."
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8 text-emerald-500" />}
            title="Testing Signals"
            description="Detects the presence of automated test suites and continuous integration workflows."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="w-full px-6 py-24 bg-muted/30 flex flex-col items-center">
        <div className="max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold">How Scoring Works</h2>
          <div className="text-left bg-card p-8 rounded-2xl border shadow-sm space-y-4">
            <p className="text-lg text-muted-foreground">
              RepoPulse calculates a score from 0 to 100 based on a weighted formula. We analyze multiple data points from the GitHub API and aggregate them into five key categories:
            </p>
            <ul className="space-y-3 font-medium">
              <li className="flex justify-between border-b pb-2"><span>Activity</span> <span className="text-muted-foreground">25%</span></li>
              <li className="flex justify-between border-b pb-2"><span>Community</span> <span className="text-muted-foreground">20%</span></li>
              <li className="flex justify-between border-b pb-2"><span>Issue Health</span> <span className="text-muted-foreground">20%</span></li>
              <li className="flex justify-between border-b pb-2"><span>Documentation</span> <span className="text-muted-foreground">15%</span></li>
              <li className="flex justify-between"><span>Testing</span> <span className="text-muted-foreground">20%</span></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
