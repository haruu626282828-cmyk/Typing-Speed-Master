import { useAuth } from "@clerk/react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetMyStats,
  useGetStatsHistory,
  useListResults,
  useListAchievements,
  getGetMyStatsQueryKey,
  getGetStatsHistoryQueryKey,
  getListResultsQueryKey,
  getListAchievementsQueryKey,
} from "@workspace/api-client-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Zap, Target, Clock, Flame, Medal, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { userId } = useAuth();

  const { data: stats, isLoading: statsLoading } = useGetMyStats({
    query: { enabled: !!userId, queryKey: getGetMyStatsQueryKey() },
  });

  const { data: history, isLoading: historyLoading } = useGetStatsHistory(
    { limit: 30 },
    { query: { enabled: !!userId, queryKey: getGetStatsHistoryQueryKey({ limit: 30 }) } }
  );

  const { data: results, isLoading: resultsLoading } = useListResults(
    { limit: 10 },
    { query: { enabled: !!userId, queryKey: getListResultsQueryKey({ limit: 10 }) } }
  );

  const { data: achievements, isLoading: achievementsLoading } = useListAchievements({
    query: { enabled: !!userId, queryKey: getListAchievementsQueryKey() },
  });

  const statCards = [
    { label: "Best WPM", value: stats?.bestWpm ?? 0, icon: Zap, color: "text-primary" },
    { label: "Avg WPM", value: stats?.averageWpm ?? 0, icon: TrendingUp, color: "text-chart-1" },
    { label: "Avg Accuracy", value: `${stats?.averageAccuracy ?? 0}%`, icon: Target, color: "text-chart-4" },
    { label: "Total Tests", value: stats?.totalTests ?? 0, icon: Trophy, color: "text-chart-5" },
    { label: "Streak", value: `${stats?.currentStreak ?? 0}d`, icon: Flame, color: "text-destructive" },
    { label: "Global Rank", value: stats?.rank ? `#${stats.rank}` : "—", icon: Medal, color: "text-chart-2" },
  ];

  const chartData = (history ?? []).map((p) => ({
    ...p,
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <h1 className="font-mono text-2xl font-bold uppercase tracking-widest text-primary" data-testid="text-dashboard-title">
          Dashboard
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/50" data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{s.label}</span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* WPM History Chart */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase tracking-widest text-muted-foreground">WPM Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-52">
            {historyLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-sm">
                No data yet — complete some tests to see your progress.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 3.7% 15.9%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "monospace", fill: "hsl(240 5% 64.9%)" }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: "monospace", fill: "hsl(240 5% 64.9%)" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(240 10% 3.9%)", border: "1px solid hsl(240 3.7% 15.9%)", borderRadius: "0.5rem", fontFamily: "monospace" }}
                    labelStyle={{ color: "hsl(0 0% 98%)" }}
                    itemStyle={{ color: "hsl(172 100% 50%)" }}
                  />
                  <Line type="monotone" dataKey="wpm" stroke="hsl(172 100% 50%)" strokeWidth={2} dot={false} name="WPM" />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(43 74% 66%)" strokeWidth={1.5} dot={false} name="Accuracy" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Results */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (results?.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-mono text-sm">No results yet</div>
              ) : (
                <div className="space-y-1.5">
                  {results?.map((r) => (
                    <div key={r.id} data-testid={`row-result-${r.id}`} className="flex items-center justify-between p-2.5 rounded bg-muted/30 font-mono text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-bold">{Math.round(r.wpm)} WPM</span>
                        <span className="text-muted-foreground">{Math.round(r.accuracy)}%</span>
                        <Badge variant="outline" className="text-xs capitalize font-mono">{r.difficulty}</Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">{r.duration}s · {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {achievements?.map((a) => (
                    <div
                      key={a.id}
                      data-testid={`card-achievement-${a.key}`}
                      title={`${a.title}: ${a.description}`}
                      className={`flex flex-col items-center gap-1 p-3 rounded border text-center transition-all ${
                        a.earned
                          ? "border-primary/40 bg-primary/5 text-foreground"
                          : "border-border/30 bg-muted/10 opacity-40 grayscale"
                      }`}
                    >
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-xs font-mono font-medium leading-tight">{a.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
