import React from "react";
import TechniqueCard, { Technique } from "./TechniqueCard";

const techniques: Technique[] = [
  {
    name: "Reality Checks",
    difficulty: "Beginner",
    icon: "✋",
    description: "Build the habit of questioning reality throughout the day so it carries into your dreams.",
    steps: [
      "Choose 2-3 reality checks (e.g., counting fingers, pushing finger through palm, checking text).",
      "Set reminders to perform checks every 1-2 hours while awake.",
      "Each time, genuinely ask yourself: 'Am I dreaming right now?'",
      "Look for inconsistencies — text changing, extra fingers, light switches not working.",
      "The habit will eventually trigger during a dream, making you lucid.",
    ],
  },
  {
    name: "Mnemonic Induction of Lucid Dreams",
    acronym: "MILD",
    difficulty: "Beginner",
    icon: "🧠",
    description: "Use intention-setting and memory cues as you fall asleep to become lucid in your next dream.",
    steps: [
      "As you lie in bed, recall a recent dream in vivid detail.",
      "Identify a dream sign — something unusual that could have tipped you off.",
      "Repeat a mantra like 'Next time I'm dreaming, I will realize I'm dreaming.'",
      "Visualize yourself back in the dream, this time recognizing the dream sign and becoming lucid.",
      "Hold this intention as you drift off to sleep.",
    ],
  },
  {
    name: "Wake Back To Bed",
    acronym: "WBTB",
    difficulty: "Beginner",
    icon: "⏰",
    description: "Wake up during the night and go back to sleep with heightened awareness to enter a lucid dream.",
    steps: [
      "Set an alarm for 5-6 hours after falling asleep (during REM-rich later sleep cycles).",
      "When you wake, stay up for 20-45 minutes. Read about lucid dreaming or meditate.",
      "As you go back to sleep, set a strong intention to recognize you're dreaming.",
      "Combine with MILD for best results.",
      "This works because you re-enter REM sleep quickly with increased self-awareness.",
    ],
  },
  {
    name: "Wake Initiated Lucid Dream",
    acronym: "WILD",
    difficulty: "Intermediate",
    icon: "🌊",
    description: "Transition directly from wakefulness into a lucid dream without losing consciousness.",
    steps: [
      "Best done after WBTB (5-6 hours of sleep). Lie still on your back.",
      "Focus on your breathing or a single point of awareness.",
      "You'll experience hypnagogic imagery — colors, shapes, scenes forming.",
      "Stay passively aware. Don't interact yet. Let the dream scene build around you.",
      "When the dream is fully formed, gently step into it. You'll be lucid from the start.",
    ],
  },
  {
    name: "Senses Initiated Lucid Dream",
    acronym: "SSILD",
    difficulty: "Intermediate",
    icon: "👁️",
    description: "Cycle through your senses as you fall back asleep to trigger spontaneous lucidity.",
    steps: [
      "Use with WBTB. After waking, lie still and relax completely.",
      "Cycle through senses: focus on what you see (behind closed eyelids), hear, and feel physically.",
      "Spend ~10 seconds on each sense. Do 4-6 full cycles.",
      "Don't try hard — keep it relaxed and passive. Then let yourself fall asleep naturally.",
      "Lucidity often occurs spontaneously during the resulting dream, or you may do a reality check.",
    ],
  },
  {
    name: "Finger Induced Lucid Dream",
    acronym: "FILD",
    difficulty: "Intermediate",
    icon: "🤞",
    description: "A subtle finger movement technique that can help you transition into a lucid dream.",
    steps: [
      "Set an alarm for ~4.5-6 hours after sleep. When you wake, stay very drowsy.",
      "As you start drifting off, very gently alternate pressing your index and middle finger (like playing piano keys).",
      "The movement should be barely perceptible — almost imagined.",
      "After 20-30 seconds, do a reality check (try pushing a finger through your palm).",
      "If you're dreaming, you'll know immediately. If not, repeat the process.",
    ],
  },
  {
    name: "Dream Exit Initiated Lucid Dream",
    acronym: "DEILD",
    difficulty: "Advanced",
    icon: "🔄",
    description: "Re-enter a dream lucidly immediately after waking from one — chaining dreams together.",
    steps: [
      "When you wake from a dream, don't move or open your eyes.",
      "Stay completely still and hold onto the fading dream imagery.",
      "Focus on the last dream scene and intend to re-enter it lucidly.",
      "Within seconds, you should feel yourself slipping back into the dream world.",
      "This technique allows you to chain multiple lucid dreams in a single night.",
    ],
  },
  {
    name: "Wake-Initiated Meditation",
    difficulty: "Advanced",
    icon: "🧘",
    description: "Use deep meditation to maintain awareness through the transition into sleep and dreaming.",
    steps: [
      "Practice meditation regularly to build your ability to observe without engaging.",
      "During a WBTB window, enter a deep meditative state while lying down.",
      "Focus on breath awareness or body scanning while letting thoughts pass.",
      "Maintain 'witness consciousness' — aware but not reactive — as sleep onset approaches.",
      "You'll eventually find yourself in a dream with full awareness, similar to WILD but deeper.",
    ],
  },
];

const TechniqueLibrary: React.FC = () => {
  return (
    <div className="p-4 space-y-3">
      <div className="mb-2">
        <h2 className="text-lg font-bold">Technique Library</h2>
        <p className="text-xs text-muted-foreground">Tap any card to see step-by-step instructions</p>
      </div>
      {techniques.map((tech, i) => (
        <TechniqueCard key={i} technique={tech} />
      ))}
    </div>
  );
};

export default TechniqueLibrary;
