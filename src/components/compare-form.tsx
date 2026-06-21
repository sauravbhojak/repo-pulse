"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare } from "lucide-react";

export function CompareForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [repo1, setRepo1] = useState(searchParams.get("repo1") || "");
  const [repo2, setRepo2] = useState(searchParams.get("repo2") || "");

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repo1 || !repo2) return;
    
    const params = new URLSearchParams();
    params.set("repo1", repo1);
    params.set("repo2", repo2);
    
    router.push(`/compare?${params.toString()}`);
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          Compare Repositories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCompare} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Repository 1 URL</label>
            <Input 
              placeholder="https://github.com/facebook/react" 
              value={repo1}
              onChange={(e) => setRepo1(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Repository 2 URL</label>
            <Input 
              placeholder="https://github.com/vuejs/vue" 
              value={repo2}
              onChange={(e) => setRepo2(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full md:w-auto h-10">Compare</Button>
        </form>
      </CardContent>
    </Card>
  );
}
