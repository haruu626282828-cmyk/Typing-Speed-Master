import { useState, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { FALLBACK_PASSAGES, getFallbackPassages } from "@/data/fallback-passages";
import { Link } from "wouter";
import { TypingTest } from "@/components/typing-test";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListPassages,
  useCreateResult,
  useGetMyStats,
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

  const { data: myStats } = useGetMyStats({ query: { queryKey: getGetMyStatsQueryKey(), enabled: isSignedIn === true } });

  const { data: passages, isLoading, refetch } = useListPassages(
    { difficulty, count: 5 },
    { query: { queryKey: getListPassagesQueryKey({ difficulty, count: 5 }) } }
  );

  const createResult = useCreateResult();

  // When the API is unavailable (Cloudflare Pages static deploy, offline, etc.)
  // fall back to the bundled passages so the typing test always has text.
  const resolvedPassages =
    !isLoading && !passages?.length
      ? getFallbackPassages(difficulty)
      : (passages ?? getFallbackPassages(difficulty));

  const currentPassage = resolvedPassages[passageIndex % (resolvedPassages.length || 1)];

  const handleComplete = useCallback(
    (stats: { wpm: number; cpm: number; accuracy: number; mistakes: number }) => {
      setLastResult({ ...stats, passageId: currentPassage?.id ?? 0, duration, difficulty });
      setSaved(false);
    },
    [currentPassage, duration, difficulty]
  );

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
    if (passageIndex >= (passages?.length ?? 1) - 1) refetch();
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
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <AppHeader />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8 flex flex-col gap-5 md:gap-8 max-w-5xl">
          {/* Config row */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-mono mr-1">Time</span>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDurationChange(d)}
                  className={`font-mono text-xs md:text-sm px-2.5 md:px-3 py-1 rounded transition-colors ${
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
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-mono mr-1">Mode</span>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`font-mono text-xs md:text-sm px-2.5 md:px-3 py-1 rounded capitalize transition-colors ${
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

          {/* Result summary */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="border-primary/30 bg-card/80">
                  <CardContent className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 md:gap-6">
                    <div className="flex gap-4 md:gap-8 font-mono">
                      {[
                        { label: "WPM", value: lastResult.wpm, cls: "text-primary" },
                        { label: "ACC", value: `${lastResult.accuracy}%`, cls: "text-foreground" },
                        { label: "CPM", value: lastResult.cpm, cls: "text-muted-foreground" },
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
                    <div className="flex flex-wrap items-center gap-3">
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
                          >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {createResult.isPending ? "Saving…" : "Save Result"}
                          </Button>
                        )
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-2">Sign in to save your score</p>
                          <Button asChild size="sm" className="font-mono uppercase">
                            <Link href="/sign-up">Create Account</Link>
                          </Button>
                        </div>
                      )}
                      <Button variant="outline" onClick={handleNext} className="font-mono uppercase tracking-widest">
                        <RotateCcw className="mr-2 h-4 w-4" /> Next Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typing area */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="font-mono text-muted-foreground animate-pulse">Loading passage…</div>
            </div>
          ) : currentPassage ? (
            <TypingTest
              key={`${currentPassage.id}-${duration}`}
              passage={currentPassage.text}
              duration={duration}
              personalBestWpm={myStats?.bestWpm ?? undefined}
              onComplete={handleComplete}
              onNext={handleNext}
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="font-mono text-muted-foreground">No passages available.</div>
            </div>
          )}
        </main>
      </PageTransition>
    </div>
  );
}
