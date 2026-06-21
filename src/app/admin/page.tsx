import { getAdminStats } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { totalAnalyses, recent, popular } = await getAdminStats();

  return (
    <div className="container mx-auto p-6 max-w-6xl mt-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of RepoPulse usage and analyzed repositories.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Analyses</CardTitle>
            <CardDescription>Number of repositories analyzed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-primary">{totalAnalyses}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <Link href={`/repo/${repo.owner}/${repo.name}`} className="font-medium hover:underline text-primary">
                        {repo.owner}/{repo.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{repo.score}/100</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(repo.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No recent analyses.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest Scored Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popular.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <Link href={`/repo/${repo.owner}/${repo.name}`} className="font-medium hover:underline text-primary">
                        {repo.owner}/{repo.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={repo.score >= 90 ? "bg-emerald-500" : "bg-green-500"}>{repo.score}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {popular.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">No popular repositories yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
