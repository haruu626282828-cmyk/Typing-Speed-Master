import { useState, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { TypingTest } from "@/components/typing-test";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useListPassages,
  useCreateResult,
  getListPassagesQueryKey,
  getListResultsQueryKey,
  getGetMyStatsQueryKey,
  getGetStatsHistoryQueryKey,
  getListAchievementsQueryKey,
} from "@workspace/api-client-react";
import { CheckCircle, TrendingUp, RotateCcw } from "lucide-react";

const DURATIONS = [15, 30, 60, 120] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

type Duration = typeof DURATIONS[number];
type Difficulty = typeof DIFFICULTIES[number];

interface TestResult {
  wpm: number;
  cpm: number;
  accuracy: number;
  mistakes: number;
  passageId: number;
  duration: number;
  difficulty: string;
}

export default function TestPage() {
  const [duration, setDuration] = useState<Duration>(30);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [passageIndex, setPassageIndex] = useState(0);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [saved, setSaved] = useState(false);

  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: passages, isLoading, refetch } = useListPassages(
    { difficulty, count: 5 },
    { query: { queryKey: getListPassagesQueryKey({ difficulty, count: 5 }) } }
  );

  const createResult = useCreateResult();

  const currentPassage = passages?.[passageIndex % (passages?.length || 1)];

  const handleComplete = useCallback((stats: { wpm: number; cpm: number; accuracy: number; mistakes: number }) => {
    setLastResult({
      ...stats,
      passageId: currentPassage?.id ?? 0,
      duration,
      difficulty,
    });
    setSaved(false);
  }, [currentPassage, duration, difficulty]);

  const handleSave = () => {
    if (!lastResult || saved) return;
    createResult.mutate(
      {
        data: {
          wpm: lastResult.wpm,
          cpm: lastResult.cpm,
          accuracy: lastResult.accuracy,
          duration: lastResult.duration,
          difficulty: lastResult.difficulty,
          mistakeCount: lastResult.mistakes,
          passageId: lastResult.passageId || null,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          queryClient.invalidateQueries({ queryKey: getListResultsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsHistoryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey() });
        },
      }
    );
  };

  const handleNext = () => {
    setLastResult(null);
    setSaved(false);
    setPassageIndex((i) => i + 1);
    if (passageIndex >= (passages?.length ?? 1) - 1) {
      refetch();
    }
  };

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    setPassageIndex(0);
    setLastResult(null);
    setSaved(false);
  };

  const handleDurationChange = (d: Duration) => {
    setDuration(d);
    setLastResult(null);
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8 max-w-5xl">
        {/* Config row */}
        <div className="flex flex-wrap items-center gap-6" data-testid="test-config">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono mr-1">Time</span>
            {DURATIONS.map((d) => (
              <button
                key={d}
                data-testid={`duration-${d}`}
                onClick={() => handleDurationChange(d)}
                className={`font-mono text-sm px-3 py-1 rounded transition-colors ${
                  duration === d
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono mr-1">Mode</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                data-testid={`difficulty-${d}`}
                onClick={() => handleDifficultyChange(d)}
                className={`font-mono text-sm px-3 py-1 rounded capitalize transition-colors ${
                  difficulty === d
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Result summary overlay */}
        {lastResult && (
          <Card className="border-primary/30 bg-card/80" data-testid="result-summary">
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
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">CPM</div>
                  <div className="text-5xl font-bold text-muted-foreground">{lastResult.cpm}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Errors</div>
                  <div className="text-5xl font-bold text-destructive">{lastResult.mistakes}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isSignedIn ? (
                  saved ? (
                    <Badge variant="outline" className="text-primary border-primary gap-1 font-mono">
                      <CheckCircle className="w-3 h-3" /> Saved
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={createResult.isPending}
                      className="font-mono uppercase tracking-widest"
                      data-testid="button-save-result"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {createResult.isPending ? "Saving..." : "Save Result"}
                    </Button>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Sign in to save your score</p>
                    <Button asChild size="sm" className="font-mono uppercase">
                      <Link href="/sign-up">Create Account</Link>
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="font-mono uppercase tracking-widest"
                  data-testid="button-next-test"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Next Test
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Typing area */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="font-mono text-muted-foreground animate-pulse">Loading passage...</div>
          </div>
        ) : currentPassage ? (
          <TypingTest
            key={`${currentPassage.id}-${duration}`}
            passage={currentPassage.text}
            duration={duration}
            onComplete={handleComplete}
            onNext={handleNext}
          />
        ) : (
          <div className="flex items-center justify-center h-48">
            <div className="font-mono text-muted-foreground">No passages available.</div>
          </div>
        )}
      </main>
    </div>
  );
}
