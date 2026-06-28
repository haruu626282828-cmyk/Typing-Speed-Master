import { useEffect, useRef } from "react";
import { useTypingTest } from "@/hooks/use-typing-test";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Square, RotateCcw, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    getCharState,
  } = useTypingTest({ passage, duration });

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Call onComplete when test finishes
  useEffect(() => {
    if (status === "completed") {
      onComplete({ wpm, cpm, accuracy, mistakes });
    }
  }, [status, wpm, cpm, accuracy, mistakes, onComplete]);

  // Focus container on mount or when resumed
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
    
    // Ignore meta keys
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
      // Allow backspace? Let's keep it simple, no backspace in this harsh test!
      return;
    }
    
    e.preventDefault();
    handleTyping(e.key);
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">WPM</span>
            <span className="text-3xl font-bold text-primary">{wpm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">ACC</span>
            <span className="text-3xl font-bold text-foreground">{accuracy}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">CPM</span>
            <span className="text-3xl font-bold text-muted-foreground">{cpm}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Time</span>
          <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-1 bg-muted [&>div]:bg-primary" />

      {/* Typing Area */}
      <Card className="border-border/50 bg-card/50 shadow-2xl relative overflow-hidden">
        {status === "paused" && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <h3 className="text-2xl font-mono font-bold text-foreground uppercase tracking-widest">Paused</h3>
            <Button onClick={resume} size="lg" className="font-bold tracking-widest uppercase">
              <Play className="mr-2 h-5 w-5" /> Resume
            </Button>
          </div>
        )}
        
        <CardContent className="p-8">
          <div 
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="text-2xl md:text-3xl font-mono leading-relaxed outline-none select-none break-words"
            style={{ wordSpacing: '0.2em' }}
          >
            {passage.split('').map((char, i) => {
              const state = getCharState(i);
              
              let className = "transition-colors duration-75 ";
              if (state === "correct") className += "text-primary opacity-80";
              else if (state === "wrong") className += "text-destructive bg-destructive/20 rounded-sm";
              else if (state === "current") className += "text-foreground bg-primary/20 border-b-2 border-primary animate-pulse";
              else className += "text-muted-foreground/40";
              
              return (
                <span key={i} className={className}>
                  {char}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {status === "idle" && (
          <p className="text-muted-foreground font-mono animate-pulse">Start typing to begin...</p>
        )}
        {(status === "running" || status === "paused") && (
          <>
            <Button variant="outline" onClick={status === "running" ? pause : resume} className="font-mono uppercase tracking-widest">
              {status === "running" ? <><Square className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Resume</>}
            </Button>
            <Button variant="outline" onClick={reset} className="font-mono uppercase tracking-widest hover:text-destructive hover:border-destructive">
              <RotateCcw className="mr-2 h-4 w-4" /> Restart
            </Button>
          </>
        )}
        {status === "completed" && (
          <>
            <Button variant="outline" onClick={reset} className="font-mono uppercase tracking-widest">
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button onClick={onNext} className="font-mono uppercase tracking-widest">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
