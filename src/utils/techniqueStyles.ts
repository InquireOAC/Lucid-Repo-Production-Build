export function getDifficultyStyles(difficulty: "Beginner" | "Intermediate" | "Advanced") {
  switch (difficulty) {
    case "Beginner":
      return {
        gradient: "from-emerald-500/20 to-emerald-700/10",
        border: "border-emerald-500/25",
        badgeBg: "bg-emerald-500/20 text-emerald-300",
        iconBg: "bg-emerald-500/10",
      };
    case "Intermediate":
      return {
        gradient: "from-amber-500/20 to-amber-700/10",
        border: "border-amber-500/25",
        badgeBg: "bg-amber-500/20 text-amber-300",
        iconBg: "bg-amber-500/10",
      };
    case "Advanced":
      return {
        gradient: "from-purple-500/20 to-rose-700/10",
        border: "border-purple-500/25",
        badgeBg: "bg-purple-500/20 text-purple-300",
        iconBg: "bg-purple-500/10",
      };
  }
}
