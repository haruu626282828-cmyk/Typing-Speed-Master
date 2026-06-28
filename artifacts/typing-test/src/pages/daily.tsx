import { useState, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { TypingTest } from "@/components/typing-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  useGetDailyChallenge,
  useCreateResult,
  getGetDailyChallengeQueryKey,
  getListResultsQueryKey,
  getGetMyStatsQueryKey,
} from "@workspace/api-client-react";
import { Calendar, Trophy, CheckCircle } from "lucide-react";

interface TestResult {
  wpm: number;
  cpm: number;
  accuracy: number;
  mistakes: number;
}

export default function DailyPage() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: daily, isLoading } = useGetDailyChallenge({
    query: { queryKey: getGetDailyChallengeQueryKey() },
  });

  const createResult = useCreateResult();

  const handleComplete = useCallback((stats: TestResult) => {
    setLastResult(stats);
    setSaved(false);
  }, []);

  const handleSave = () => {
    if (!lastResult || saved || !daily) return;
    createResult.mutate(
      {
        data: {
          wpm: lastResult.wpm,
          cpm: lastResult.cpm,
          accuracy: lastResult.accuracy,
          duration: 60,
          difficulty: daily.passage.difficulty,
          mistakeCount: lastResult.mistakes,
          passageId: daily.passage.id,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          queryClient.invalidateQueries({ queryKey: getListResultsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDailyChallengeQueryKey() });
        },
      }
    );
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <AppHeader />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-5xl space-y-5 md:space-y-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0" />
            <div>
              <h1 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-widest text-primary">
                Daily Challenge
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-mono">{today}</p>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !daily ? (
            <div className="text-center py-16 text-muted-foreground font-mono text-sm">No daily challenge available.</div>
          ) : (
            <>
              {lastResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <Card className="border-primary/30 bg-card/80">
                    <CardContent className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 md:gap-6">
                      <div className="flex gap-4 md:gap-8 font-mono">
                        {[
                          { label: "WPM", value: lastResult.wpm, cls: "text-primary" },
                          { label: "ACC", value: `${lastResult.accuracy}%`, cls: "text-foreground" },
                          { label: "ERR", value: lastResult.mistakes, cls: "text-destructive" },
                        ].map((s, i) => (
                          <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                          >
                            <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">{s.label}</div>
                            <div className={`text-3xl md:text-5xl font-bold ${s.cls}`}>{s.value}</div>
                          </motion.div>
                        ))}
                      </div>
                      {isSignedIn && (
                        <div>
                          {saved ? (
                            <Badge variant="outline" className="text-primary border-primary gap-1 font-mono">
                              <CheckCircle className="w-3 h-3" /> Submitted
                            </Badge>
                          ) : (
                            <Button
                              onClick={handleSave}
                              disabled={createResult.isPending}
                              className="font-mono uppercase tracking-widest"
                            >
                              {createResult.isPending ? "Submitting…" : "Submit to Leaderboard"}
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <TypingTest
                  passage={daily.passage.text}
                  duration={60}
                  onComplete={handleComplete}
                  onNext={() => setLastResult(null)}
                />
              )}

              {/* Daily board */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-xs md:text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Today's Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {daily.leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                      No submissions yet today. Be the first!
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {daily.leaderboard.map((entry, i) => (
                        <motion.div
                          key={entry.userId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <span className="font-mono text-xs md:text-sm text-muted-foreground w-5 text-center shrink-0">#{entry.rank}</span>
                          <Avatar className="h-6 w-6 md:h-7 md:w-7 border border-border/50 shrink-0">
                            <AvatarFallback className="bg-muted text-[10px] font-mono">
                              {entry.displayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 font-mono font-medium text-sm truncate">{entry.displayName}</span>
                          <div className="flex items-center gap-2 md:gap-3 font-mono text-xs md:text-sm shrink-0">
                            <span className="text-primary font-bold">{Math.round(entry.wpm)} WPM</span>
                            <span className="text-muted-foreground">{Math.round(entry.accuracy)}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </PageTransition>
    </div>
  );
}
