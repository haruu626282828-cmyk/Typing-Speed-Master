import { useState, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { TypingTest } from "@/components/typing-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-widest text-primary" data-testid="text-daily-title">
              Daily Challenge
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{today}</p>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !daily ? (
          <div className="text-center py-16 text-muted-foreground font-mono">No daily challenge available.</div>
        ) : (
          <>
            {lastResult ? (
              <Card className="border-primary/30 bg-card/80" data-testid="daily-result">
                <CardContent className="p-6 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex gap-8 font-mono">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">WPM</div>
                      <div className="text-5xl font-bold text-primary">{lastResult.wpm}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">Accuracy</div>
                      <div className="text-5xl font-bold text-foreground">{lastResult.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">Errors</div>
                      <div className="text-5xl font-bold text-destructive">{lastResult.mistakes}</div>
                    </div>
                  </div>
                  {isSignedIn && (
                    <div>
                      {saved ? (
                        <Badge variant="outline" className="text-primary border-primary gap-1 font-mono">
                          <CheckCircle className="w-3 h-3" /> Submitted to leaderboard
                        </Badge>
                      ) : (
                        <Button
                          onClick={handleSave}
                          disabled={createResult.isPending}
                          className="font-mono uppercase tracking-widest"
                          data-testid="button-submit-daily"
                        >
                          {createResult.isPending ? "Submitting..." : "Submit to Leaderboard"}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <TypingTest
                passage={daily.passage.text}
                duration={60}
                onComplete={handleComplete}
                onNext={() => setLastResult(null)}
              />
            )}

            {/* Daily Leaderboard */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="font-mono text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
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
                    {daily.leaderboard.map((entry) => (
                      <div
                        key={entry.userId}
                        data-testid={`row-daily-rank-${entry.rank}`}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-mono text-sm text-muted-foreground w-6 text-center">#{entry.rank}</span>
                        <Avatar className="h-7 w-7 border border-border/50 shrink-0">
                          <AvatarFallback className="bg-muted text-xs font-mono">
                            {entry.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-mono font-medium text-sm truncate">{entry.displayName}</span>
                        <div className="flex items-center gap-3 font-mono text-sm shrink-0">
                          <span className="text-primary font-bold">{Math.round(entry.wpm)} WPM</span>
                          <span className="text-muted-foreground">{Math.round(entry.accuracy)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
