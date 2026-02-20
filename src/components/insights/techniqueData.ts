export interface Technique {
  name: string;
  acronym?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  difficultyRating: number; // 1-3
  effectiveness: number; // 1-3
  icon: string;
  shortDescription: string;
  description: string;
  longDescription: string;
  steps: string[];
}

export const techniques: Technique[] = [
  {
    name: "Reality Checks",
    difficulty: "Beginner",
    difficultyRating: 1,
    effectiveness: 2,
    icon: "✋",
    shortDescription: "Build the habit of questioning reality",
    description: "Build the habit of questioning reality throughout the day so it carries into your dreams.",
    longDescription: "Reality checks are the foundation of lucid dreaming. By regularly questioning whether you're awake or dreaming, you train your brain to do the same during sleep. Over time, this habit becomes automatic — and when a reality check fails in a dream (extra fingers, text that shifts, light switches that don't work), you'll realize you're dreaming.\n\nThe key is genuine curiosity each time you check. Don't just go through the motions — truly ask yourself if this could be a dream. The more sincere your questioning while awake, the more likely it is to trigger lucidity in a dream.",
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
    difficultyRating: 1,
    effectiveness: 2,
    icon: "🧠",
    shortDescription: "Use intention-setting to become lucid",
    description: "Use intention-setting and memory cues as you fall asleep to become lucid in your next dream.",
    longDescription: "MILD was developed by Dr. Stephen LaBerge and is one of the most well-researched lucid dreaming techniques. It works by leveraging prospective memory — your ability to remember to do something in the future.\n\nAs you fall asleep, you vividly recall a recent dream and identify a dream sign — something unusual that could have tipped you off. Then you repeat a mantra affirming your intention to recognize the next dream. The combination of visualization and intention-setting primes your mind to notice when you're dreaming.",
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
    difficultyRating: 1,
    effectiveness: 3,
    icon: "⏰",
    shortDescription: "Wake mid-sleep to enter lucid REM",
    description: "Wake up during the night and go back to sleep with heightened awareness to enter a lucid dream.",
    longDescription: "WBTB is arguably the most effective technique when combined with others like MILD. It exploits sleep architecture — your longest and most vivid REM periods occur in the last third of the night.\n\nBy waking after 5-6 hours, you become alert enough to set a strong intention, then fall back into REM sleep almost immediately. This combination of heightened awareness and rapid REM entry creates ideal conditions for lucidity. Many experienced lucid dreamers consider WBTB a force multiplier for any other technique.",
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
    difficultyRating: 2,
    effectiveness: 3,
    icon: "🌊",
    shortDescription: "Transition directly into a lucid dream",
    description: "Transition directly from wakefulness into a lucid dream without losing consciousness.",
    longDescription: "WILD is considered the holy grail of lucid dreaming techniques because you enter the dream fully conscious from the start. Instead of becoming lucid mid-dream, you watch the dream form around you.\n\nThe process involves relaxing deeply while maintaining a thread of awareness. You'll experience hypnagogic phenomena — swirling colors, geometric patterns, fleeting images, and eventually full dream scenes. The challenge is staying passively aware without getting excited (which wakes you up) or too relaxed (which puts you to sleep). It takes practice but offers the most vivid and controlled lucid dreams.",
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
    difficultyRating: 2,
    effectiveness: 2,
    icon: "👁️",
    shortDescription: "Cycle through senses to trigger lucidity",
    description: "Cycle through your senses as you fall back asleep to trigger spontaneous lucidity.",
    longDescription: "SSILD was created by a Chinese lucid dreaming community and has gained worldwide popularity for its simplicity and effectiveness. Unlike WILD, you don't try to stay conscious — instead, you prime your senses and then let go.\n\nBy cycling through sight (behind closed eyelids), sound, and touch sensations, you create a heightened state of sensory awareness. When you fall asleep afterward, this heightened state often carries into the dream, causing spontaneous lucidity or making reality checks more likely to occur to you.",
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
    difficultyRating: 2,
    effectiveness: 2,
    icon: "🤞",
    shortDescription: "Subtle finger movements to stay aware",
    description: "A subtle finger movement technique that can help you transition into a lucid dream.",
    longDescription: "FILD is one of the easiest transition techniques to learn. It works by keeping the tiniest thread of motor awareness active as you fall asleep. The finger movements are so subtle they shouldn't keep you awake, but they maintain just enough consciousness to carry into the dream.\n\nThe technique works best when you're extremely drowsy — either during a WBTB window or when you naturally wake briefly during the night. The key is finding the sweet spot between too much movement (staying awake) and too little (falling asleep unconsciously).",
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
    difficultyRating: 3,
    effectiveness: 3,
    icon: "🔄",
    shortDescription: "Re-enter dreams lucidly after waking",
    description: "Re-enter a dream lucidly immediately after waking from one — chaining dreams together.",
    longDescription: "DEILD is a powerful advanced technique that lets you chain multiple lucid dreams in a single night. The concept is simple: when you naturally wake from a dream, you stay perfectly still and re-enter the dream consciously.\n\nThe critical moment is the first few seconds after waking. If you can resist the urge to move, open your eyes, or think about being awake, you can slip right back into the dream world with full lucidity. Experienced practitioners can chain 3-5 lucid dreams in a single night using this method.",
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
    difficultyRating: 3,
    effectiveness: 3,
    icon: "🧘",
    shortDescription: "Deep meditation into conscious dreaming",
    description: "Use deep meditation to maintain awareness through the transition into sleep and dreaming.",
    longDescription: "This is the most spiritually-rooted lucid dreaming technique, drawing from Tibetan Dream Yoga and Yoga Nidra traditions. It requires a strong meditation practice as a foundation.\n\nThe goal is to maintain 'witness consciousness' — a state of pure awareness without attachment to thoughts or sensations — as your body falls asleep. You observe the entire process of sleep onset, hypnagogia, and dream formation from a place of detached awareness. The resulting lucid dreams tend to be exceptionally stable and profound.",
    steps: [
      "Practice meditation regularly to build your ability to observe without engaging.",
      "During a WBTB window, enter a deep meditative state while lying down.",
      "Focus on breath awareness or body scanning while letting thoughts pass.",
      "Maintain 'witness consciousness' — aware but not reactive — as sleep onset approaches.",
      "You'll eventually find yourself in a dream with full awareness, similar to WILD but deeper.",
    ],
  },
];
