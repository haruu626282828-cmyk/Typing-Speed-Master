import { useState, useEffect, useCallback, useRef } from "react";

export type TestStatus = "idle" | "running" | "paused" | "completed";

interface UseTypingTestProps {
  passage: string;
  duration: number;
}

interface UseTypingTestReturn {
  status: TestStatus;
  timeLeft: number;
  typedText: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  mistakes: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  handleTyping: (value: string) => void;
  currentIndex: number;
  expectedChar: string;
  getCharState: (index: number) => "correct" | "wrong" | "pending" | "current";
}

export function useTypingTest({ passage: passageProp, duration }: UseTypingTestProps): UseTypingTestReturn {
  // Guard against null/undefined passage — always work with a string
  const passage = passageProp ?? "";
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [typedText, setTypedText] = useState("");
  const [mistakes, setMistakes] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateStats = useCallback(() => {
    if (typedText.length === 0) return { wpm: 0, cpm: 0, accuracy: 100 };
    
    const timeElapsedInMinutes = (duration - timeLeft) / 60;
    
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === passage[i]) {
        correctChars++;
      }
    }
    
    const cpm = timeElapsedInMinutes > 0 ? Math.round(correctChars / timeElapsedInMinutes) : 0;
    const wpm = Math.round(cpm / 5);
    const accuracy = Math.round((correctChars / typedText.length) * 100);

    return { wpm, cpm, accuracy };
  }, [typedText, passage, duration, timeLeft]);

  const { wpm, cpm, accuracy } = calculateStats();

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) return;
    
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setStatus("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setStatus("running");
    startTimeRef.current = Date.now();
    startTimer();
  }, [startTimer]);

  const pause = useCallback(() => {
    setStatus("paused");
    stopTimer();
  }, [stopTimer]);

  const resume = useCallback(() => {
    setStatus("running");
    startTimer();
  }, [startTimer]);

  const reset = useCallback(() => {
    setStatus("idle");
    setTimeLeft(duration);
    setTypedText("");
    setMistakes(0);
    stopTimer();
    startTimeRef.current = null;
  }, [duration, stopTimer]);

  const handleTyping = useCallback((value: string) => {
    if (status === "idle") {
      start();
    }
    
    if (status === "completed" || status === "paused") return;

    // Prevent typing past the passage length
    if (value.length > passage.length) return;

    setTypedText((prevTyped) => {
      // Check if new char is mistake
      if (value.length > prevTyped.length) {
        const newCharIndex = value.length - 1;
        if (value[newCharIndex] !== passage[newCharIndex]) {
          setMistakes((m) => m + 1);
        }
      }
      return value;
    });

    if (value.length === passage.length) {
      setStatus("completed");
      stopTimer();
    }
  }, [status, passage.length, start, stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Update timer if duration prop changes while idle
  useEffect(() => {
    if (status === "idle") {
      setTimeLeft(duration);
    }
  }, [duration, status]);

  const getCharState = useCallback((index: number) => {
    if (index === typedText.length) return "current";
    if (index > typedText.length) return "pending";
    if (typedText[index] === passage[index]) return "correct";
    return "wrong";
  }, [typedText, passage]);

  return {
    status,
    timeLeft,
    typedText,
    wpm,
    cpm,
    accuracy,
    mistakes,
    start,
    pause,
    resume,
    reset,
    handleTyping,
    currentIndex: typedText.length,
    expectedChar: passage[typedText.length] || "",
    getCharState
  };
}
