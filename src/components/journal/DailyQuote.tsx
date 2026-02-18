import React, { useState, useEffect } from "react";

const inspirationalDreamQuotes = [
  "Dreams are illustrations from the book your soul is writing about you.",
  "Dreams are the touchstones of our character.",
  "All that we see or seem is but a dream within a dream.",
  "Dreams are today's answers to tomorrow's questions.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "A dream you dream alone is only a dream. A dream you dream together is reality.",
  "All our dreams can come true, if we have the courage to pursue them.",
  "Dreams are the seedlings of realities.",
  "The best way to make your dreams come true is to wake up.",
  "Within your dreams lies a world of infinite possibilities.",
  "Dreams reflect the soul's deepest desires and fears.",
  "When you cease to dream, you cease to live.",
  "Dream big and dare to fail.",
  "In dreams, we enter a world that is entirely our own.",
  "Your dreams are the whispers of your soul.",
];

const DailyQuote = () => {
  const [dailyQuote, setDailyQuote] = useState("");

  // Set daily quote based on the date
  useEffect(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = Number(today) - Number(startOfYear);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % inspirationalDreamQuotes.length;
    setDailyQuote(inspirationalDreamQuotes[quoteIndex]);
  }, []);

  return (
    <h1 className="text-3xl md:text-4xl font-bold white-text flex items-center gap-2">
      <span className="italic">{dailyQuote}</span>
    </h1>
  );
};

export default DailyQuote;
