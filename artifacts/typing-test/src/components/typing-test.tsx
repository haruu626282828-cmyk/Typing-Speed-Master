import { useEffect, useRef } from "react";
import { useTypingTest } from "@/hooks/use-typing-test";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Square, RotateCcw, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface TypingTestProps {
  passage: string;
  duration: number;
  onComplete: (stats: { wpm: number; cpm: number; accuracy: number; mistakes: number }) => void;
  onNext: () => void;
}

export function TypingTest({ passage, duration, onComplete, onNext }: TypingTestProps) {
  const {
    status,
    timeLeft,
    wpm,
    cpm,
    accuracy,
    mistakes,
    start,
    pause,
    resume,
    reset,
    handleTyping,
    typedText,
    getCharState,
  } = useTypingTest({ passage, duration });

  const containerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === "completed") {
      onComplete({ wpm, cpm, accuracy, mistakes });
    }
  }, [status, wpm, cpm, accuracy, mistakes, onComplete]);

  useEffect(() => {
    if (status === "idle" || status === "running") {
      containerRef.current?.focus();
    }
  }, [status]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" || e.key === "Escape") {
      e.preventDefault();
      if (status === "running") pause();
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (status === "idle") start();
      if (status === "completed" || status === "paused") return;
      handleTyping(typedText.slice(0, -1));
      return;
    }
    if (e.key.length > 1) return;
    e.preventDefault();
    handleTyping(typedText + e.key);
  };

  // Mobile: sync from textarea value
  const handleMobileInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (status === "idle") start();
    if (status === "completed" || status === "paused") return;
    if (val.length > passage.length) return;
    handleTyping(val);
  };

  const focusMobile = () => {
    mobileInputRef.current?.focus();
    containerRef.current?.focus();
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const timeWarning = timeLeft <= 10 && status === "running";

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 md:gap-6">
      {/* Stats bar */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex gap-4 md:gap-6">
          {[
            { label: "WPM", value: wpm, highlight: true },
            { label: "ACC", value: `${accuracy}%`, highlight: false },
            { label: "CPM", value: cpm, highlight: false },
          ].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">{s.label}</span>
              <motion.span
                key={`${s.label}-${s.value}`}
                initial={{ opacity: 0.6, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl md:text-3xl font-bold ${s.highlight ? "text-primary" : "text-foreground"}`}
              >
                {s.value}
              </motion.span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Time</span>
          <motion.span
            animate={timeWarning ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className={`text-2xl md:text-3xl font-bold font-mono ${timeWarning ? "text-destructive" : "text-primary"}`}
          >
            {timeLeft}s
          </motion.span>
        </div>
      </div>

      <Progress value={progress} className="h-1 bg-muted [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-1000" />

      {/* Typing area */}
      <Card className="border-border/50 bg-card/50 shadow-2xl relative overflow-hidden">
        <AnimatePresence>
          {status === "paused" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
            >
              <h3 className="text-2xl font-mono font-bold uppercase tracking-widest">Paused</h3>
              <Button onClick={resume} size="lg" className="font-bold tracking-widest uppercase">
                <Play className="mr-2 h-5 w-5" /> Resume
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-4 md:p-8" onClick={focusMobile}>
          {/* Hidden textarea for mobile virtual keyboard */}
          <textarea
            ref={mobileInputRef}
            value={typedText}
            onChange={handleMobileInput}
            className="absolute opacity-0 pointer-events-none w-px h-px"
            tabIndex={-1}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
          />

          <div
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={focusMobile}
            className="text-xl md:text-2xl lg:text-3xl font-mono leading-relaxed outline-none select-none break-words cursor-text"
            style={{ wordSpacing: "0.15em" }}
          >
            {passage.split("").map((char, i) => {
              const state = getCharState(i);
              let className = "transition-colors duration-75 ";
              if (state === "correct") className += "text-primary opacity-80";
              else if (state === "wrong") className += "text-destructive bg-destructive/20 rounded-sm";
              else if (state === "current")
                className += "text-foreground bg-primary/20 border-b-2 border-primary";
              else className += "text-muted-foreground/40";

              return (
                <span key={i} className={className}>
                  {char}
                </span>
              );
            })}
          </div>

          {status === "idle" && (
            <p className="text-center text-muted-foreground font-mono text-sm mt-4 animate-pulse">
              Tap here and start typing…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          {(status === "running" || status === "paused") && (
            <motion.div
              key="running-controls"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                onClick={status === "running" ? pause : resume}
                className="font-mono uppercase tracking-widest"
              >
                {status === "running" ? <><Square className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Resume</>}
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                className="font-mono uppercase tracking-widest hover:text-destructive hover:border-destructive"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Restart
              </Button>
            </motion.div>
          )}

          {status === "completed" && (
            <motion.div
              key="completed-controls"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                onClick={reset}
                className="font-mono uppercase tracking-widest"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Button onClick={onNext} className="font-mono uppercase tracking-widest">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
