import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  useGetLeaderboard,
  getGetLeaderboardQueryKey,
  GetLeaderboardDuration,
  GetLeaderboardDifficulty,
} from "@workspace/api-client-react";
import { Trophy, Medal } from "lucide-react";

type Duration = typeof GetLeaderboardDuration[keyof typeof GetLeaderboardDuration] | undefined;
type Difficulty = typeof GetLeaderboardDifficulty[keyof typeof GetLeaderboardDifficulty] | undefined;

const durations: Duration[] = [undefined, 15, 30, 60, 120];
const difficulties: Difficulty[] = [undefined, "easy", "medium", "hard"];

export default function LeaderboardPage() {
  const [duration, setDuration] = useState<Duration>(undefined);
  const [difficulty, setDifficulty] = useState<Difficulty>(undefined);

  const { data: entries, isLoading } = useGetLeaderboard(
    { duration, difficulty, limit: 50 },
    { query: { queryKey: getGetLeaderboardQueryKey({ duration, difficulty, limit: 50 }) } }
  );

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />;
    return <span className="font-mono text-xs md:text-sm text-muted-foreground w-5 text-center">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <AppHeader />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-4xl space-y-5 md:space-y-6">
          <h1 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-widest text-primary">
            Leaderboard
          </h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-mono">Time</span>
              {durations.map((d) => (
                <button
                  key={d ?? "all"}
                  onClick={() => setDuration(d)}
                  className={`font-mono text-xs md:text-sm px-2.5 md:px-3 py-1 rounded transition-colors ${
                    duration === d
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d ? `${d}s` : "All"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-mono">Mode</span>
              {difficulties.map((d) => (
                <button
                  key={d ?? "all"}
                  onClick={() => setDifficulty(d)}
                  className={`font-mono text-xs md:text-sm px-2.5 md:px-3 py-1 rounded capitalize transition-colors ${
                    difficulty === d
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d ?? "All"}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-xs md:text-sm uppercase tracking-widest text-muted-foreground">Global Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 md:h-14 w-full" />)}
                </div>
              ) : (entries?.length ?? 0) === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-mono">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No entries yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {entries?.map((entry, i) => (
                    <motion.div
                      key={`${entry.userId}-${entry.duration}-${entry.difficulty}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className={`flex items-center gap-2 md:gap-4 p-2.5 md:p-3 rounded-lg transition-colors ${
                        entry.rank <= 3
                          ? "bg-primary/5 border border-primary/20"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-center w-6 md:w-8 shrink-0">
                        {rankIcon(entry.rank)}
                      </div>
                      <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0 border border-border/50">
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px] md:text-xs font-mono">
                          {entry.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 font-mono font-medium text-sm truncate">{entry.displayName}</span>
                      <div className="flex items-center gap-2 md:gap-4 font-mono text-xs md:text-sm shrink-0">
                        <span className="text-primary font-bold text-base md:text-lg">{Math.round(entry.wpm)}</span>
                        <span className="text-muted-foreground hidden sm:inline">WPM</span>
                        <span className="text-muted-foreground">{Math.round(entry.accuracy)}%</span>
                        <Badge variant="outline" className="text-[10px] capitalize hidden md:flex">{entry.difficulty}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </PageTransition>
    </div>
  );
}
