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
        gradient: "from-blue-500/20 to-blue-700/10",
        border: "border-blue-500/25",
        badgeBg: "bg-blue-500/20 text-blue-300",
        iconBg: "bg-blue-500/10",
      };
  }
}
