export interface FallbackPassage {
  id: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

export const FALLBACK_PASSAGES: FallbackPassage[] = [
  {
    id: -1,
    text: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of black quartz judge my vow.",
    difficulty: "easy",
  },
  {
    id: -2,
    text: "Practice makes perfect. Keep your fingers on the home row and let muscle memory do the work. Focus on accuracy before speed.",
    difficulty: "easy",
  },
  {
    id: -3,
    text: "Touch typing is a skill that rewards patience. Start slow, hit every key cleanly, and your speed will rise naturally over time.",
    difficulty: "easy",
  },
  {
    id: -4,
    text: "Speed typing improves with consistent daily practice. Focus on minimising errors first, then let your pace climb as confidence grows.",
    difficulty: "medium",
  },
  {
    id: -5,
    text: "The art of programming is the art of organising complexity. Good code is its own best documentation when written with clarity and purpose.",
    difficulty: "medium",
  },
  {
    id: -6,
    text: "Discipline is the bridge between goals and accomplishment. Every expert was once a beginner who refused to give up on the fundamentals.",
    difficulty: "medium",
  },
  {
    id: -7,
    text: "Efficiency in typing comes from minimising errors, not maximising raw speed. A typist at ninety percent accuracy outperforms one sprinting through mistakes every single time.",
    difficulty: "hard",
  },
  {
    id: -8,
    text: "Extraordinary results are rarely accidental. They emerge from the intersection of deliberate effort, focused repetition, and an unrelenting commitment to marginal improvement across every session.",
    difficulty: "hard",
  },
  {
    id: -9,
    text: "The measure of intelligence is the ability to change. Adaptability, not raw speed, separates typists who plateau from those who continue advancing throughout their career.",
    difficulty: "hard",
  },
];

export function getFallbackPassages(difficulty: string): FallbackPassage[] {
  const filtered = FALLBACK_PASSAGES.filter((p) => p.difficulty === difficulty);
  return filtered.length > 0 ? filtered : FALLBACK_PASSAGES;
}
