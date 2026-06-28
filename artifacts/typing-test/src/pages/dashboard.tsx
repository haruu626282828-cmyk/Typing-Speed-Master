import { useAuth } from "@clerk/react";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
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
import { Trophy, Zap, Target, Flame, Medal, TrendingUp } from "lucide-react";

const container = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

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
    { label: "Avg Acc", value: `${stats?.averageAccuracy ?? 0}%`, icon: Target, color: "text-chart-4" },
    { label: "Tests", value: stats?.totalTests ?? 0, icon: Trophy, color: "text-chart-5" },
    { label: "Streak", value: `${stats?.currentStreak ?? 0}d`, icon: Flame, color: "text-destructive" },
    { label: "Rank", value: stats?.rank ? `#${stats.rank}` : "—", icon: Medal, color: "text-chart-2" },
  ];

  const chartData = (history ?? []).map((p) => ({
    ...p,
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <AppHeader />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-6xl space-y-5 md:space-y-8">
          <h1 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-widest text-primary">
            Dashboard
          </h1>

          {/* Stat cards */}
          <motion.div
            variants={container}
            initial="initial"
            animate="animate"
            className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3"
          >
            {statCards.map((s) => (
              <motion.div key={s.label} variants={item}>
                <Card className="border-border/50 bg-card/50 h-full">
                  <CardContent className="p-3 md:p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <s.icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${s.color}`} />
                      <span className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-wider font-mono">{s.label}</span>
                    </div>
                    {statsLoading ? (
                      <Skeleton className="h-6 md:h-8 w-12" />
                    ) : (
                      <motion.span
                        className={`text-xl md:text-2xl font-bold font-mono ${s.color}`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {s.value}
                      </motion.span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* WPM Chart */}
          <motion.div variants={item} initial="initial" animate="animate">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-xs md:text-sm uppercase tracking-widest text-muted-foreground">WPM Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-44 md:h-52">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-sm text-center px-4">
                    Complete some tests to see your progress.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 3.7% 15.9%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "monospace", fill: "hsl(240 5% 64.9%)" }} />
                      <YAxis tick={{ fontSize: 10, fontFamily: "monospace", fill: "hsl(240 5% 64.9%)" }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(240 10% 3.9%)", border: "1px solid hsl(240 3.7% 15.9%)", borderRadius: "0.5rem", fontFamily: "monospace", fontSize: "12px" }}
                        labelStyle={{ color: "hsl(0 0% 98%)" }}
                        itemStyle={{ color: "hsl(172 100% 50%)" }}
                      />
                      <Line type="monotone" dataKey="wpm" stroke="hsl(172 100% 50%)" strokeWidth={2} dot={false} name="WPM" />
                      <Line type="monotone" dataKey="accuracy" stroke="hsl(43 74% 66%)" strokeWidth={1.5} dot={false} name="Acc%" strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Results */}
            <motion.div variants={item} initial="initial" animate="animate">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-xs md:text-sm uppercase tracking-widest text-muted-foreground">Recent Results</CardTitle>
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
                      {results?.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center justify-between p-2.5 rounded bg-muted/30 font-mono text-xs md:text-sm"
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="text-primary font-bold">{Math.round(r.wpm)} WPM</span>
                            <span className="text-muted-foreground">{Math.round(r.accuracy)}%</span>
                            <Badge variant="outline" className="text-[10px] md:text-xs capitalize font-mono hidden sm:flex">{r.difficulty}</Badge>
                          </div>
                          <span className="text-muted-foreground text-[10px] md:text-xs">{r.duration}s · {new Date(r.createdAt).toLocaleDateString()}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={item} initial="initial" animate="animate">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-xs md:text-sm uppercase tracking-widest text-muted-foreground">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  {achievementsLoading ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {achievements?.map((a, i) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, type: "spring", stiffness: 350, damping: 20 }}
                          title={`${a.title}: ${a.description}`}
                          className={`flex flex-col items-center gap-1 p-2 md:p-3 rounded border text-center ${
                            a.earned
                              ? "border-primary/40 bg-primary/5"
                              : "border-border/30 bg-muted/10 opacity-40 grayscale"
                          }`}
                        >
                          <span className="text-xl md:text-2xl">{a.icon}</span>
                          <span className="text-[9px] md:text-xs font-mono font-medium leading-tight">{a.title}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}
