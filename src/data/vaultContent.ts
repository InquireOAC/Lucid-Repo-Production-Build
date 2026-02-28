export type VaultCategory = "lucid-dreaming" | "meditation";

export interface VaultVideo {
  title: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  duration: string;
  author: string;
  category: VaultCategory;
}

export interface ResearchStudy {
  title: string;
  journal: string;
  year: number;
  authors: string;
  keyFinding: string;
  doi: string;
  category: VaultCategory;
}

export const vaultVideos: VaultVideo[] = [
  // ─── Lucid Dreaming ───
  {
    title: "Lucid Dreaming Explained in 37 Minutes",
    thumbnailUrl: "https://img.youtube.com/vi/4NEWuE0quFU/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=4NEWuE0quFU",
    duration: "37:02",
    author: "Tipharot",
    category: "lucid-dreaming",
  },
  {
    title: "How to Lucid Dream (Science-Backed Tips!)",
    thumbnailUrl: "https://img.youtube.com/vi/sccjyNRg-YQ/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=sccjyNRg-YQ",
    duration: "12:16",
    author: "Thomas Frank",
    category: "lucid-dreaming",
  },
  {
    title: "The Science of Lucid Dreaming",
    thumbnailUrl: "https://img.youtube.com/vi/lYSX51xBkos/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=lYSX51xBkos",
    duration: "4:51",
    author: "AsapSCIENCE",
    category: "lucid-dreaming",
  },
  {
    title: "The DEILD Technique for Lucid Dreaming",
    thumbnailUrl: "https://img.youtube.com/vi/bnAQ5-ijDho/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=bnAQ5-ijDho",
    duration: "5:43",
    author: "Daniel Love",
    category: "lucid-dreaming",
  },
  {
    title: "How to Lucid Dream Tonight – 5 Proven Methods",
    thumbnailUrl: "https://img.youtube.com/vi/6pKFiE4kfEI/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=6pKFiE4kfEI",
    duration: "12:03",
    author: "Explore Lucid Dreaming",
    category: "lucid-dreaming",
  },
  {
    title: "MILD Technique – Step by Step Guide",
    thumbnailUrl: "https://img.youtube.com/vi/w1LJeiJBHeA/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=w1LJeiJBHeA",
    duration: "11:15",
    author: "Explore Lucid Dreaming",
    category: "lucid-dreaming",
  },
  {
    title: "What Happens In Your Brain During Lucid Dreams",
    thumbnailUrl: "https://img.youtube.com/vi/rnWMpFSBi0g/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=rnWMpFSBi0g",
    duration: "10:29",
    author: "SciShow Psych",
    category: "lucid-dreaming",
  },
  {
    title: "11 Advanced Lucid Dreaming Secrets",
    thumbnailUrl: "https://img.youtube.com/vi/eMODBwPxRjc/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=eMODBwPxRjc",
    duration: "22:14",
    author: "Tipharot",
    category: "lucid-dreaming",
  },

  // ─── Meditation ───
  {
    title: "How Meditation Works & Science-Based Effective Meditations",
    thumbnailUrl: "https://img.youtube.com/vi/wTBSGgbIvsY/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=wTBSGgbIvsY",
    duration: "2:04:06",
    author: "Andrew Huberman",
    category: "meditation",
  },
  {
    title: "The Best Science-Based Meditation for Focus & Productivity",
    thumbnailUrl: "https://img.youtube.com/vi/7TAi-8GofBk/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=7TAi-8GofBk",
    duration: "10:12",
    author: "Better Than Yesterday",
    category: "meditation",
  },
  {
    title: "How Meditation Changes Your Brain",
    thumbnailUrl: "https://img.youtube.com/vi/m8rRzTtP7Tc/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=m8rRzTtP7Tc",
    duration: "6:31",
    author: "AsapSCIENCE",
    category: "meditation",
  },
  {
    title: "Meditation for Beginners – 20 Practical Tips",
    thumbnailUrl: "https://img.youtube.com/vi/o-kMJBWk9E0/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=o-kMJBWk9E0",
    duration: "15:23",
    author: "Matt D'Avella",
    category: "meditation",
  },
  {
    title: "Yoga Nidra: The Art of Conscious Sleep",
    thumbnailUrl: "https://img.youtube.com/vi/M0u9GST_j3s/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=M0u9GST_j3s",
    duration: "20:00",
    author: "Ally Boothroyd",
    category: "meditation",
  },
  {
    title: "10-Minute Meditation For Sleep",
    thumbnailUrl: "https://img.youtube.com/vi/aEqlQvczMJQ/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=aEqlQvczMJQ",
    duration: "10:01",
    author: "Goodful",
    category: "meditation",
  },
  {
    title: "Jon Kabat-Zinn: Guided Mindfulness Meditation",
    thumbnailUrl: "https://img.youtube.com/vi/_DTmGtznab4/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=_DTmGtznab4",
    duration: "43:02",
    author: "Jon Kabat-Zinn",
    category: "meditation",
  },
  {
    title: "Guided Body Scan Meditation for Deep Relaxation",
    thumbnailUrl: "https://img.youtube.com/vi/15q-N-_kkrU/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=15q-N-_kkrU",
    duration: "20:00",
    author: "The Honest Guys",
    category: "meditation",
  },
  {
    title: "Breathwork for Energy & Focus – Wim Hof Method",
    thumbnailUrl: "https://img.youtube.com/vi/tybOi4hjZFQ/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=tybOi4hjZFQ",
    duration: "11:48",
    author: "Wim Hof",
    category: "meditation",
  },
  {
    title: "Pranayama Breathing Techniques for Beginners",
    thumbnailUrl: "https://img.youtube.com/vi/IElHgJG5Fe4/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=IElHgJG5Fe4",
    duration: "15:37",
    author: "Yoga With Adriene",
    category: "meditation",
  },
  {
    title: "Guided Chakra Meditation – Energy Healing",
    thumbnailUrl: "https://img.youtube.com/vi/mEL8GJhMo-I/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=mEL8GJhMo-I",
    duration: "30:12",
    author: "Michael Sealey",
    category: "meditation",
  },
  {
    title: "Energy Control Breathing – Box Breathing Technique",
    thumbnailUrl: "https://img.youtube.com/vi/n6RbW2LtdFs/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=n6RbW2LtdFs",
    duration: "5:30",
    author: "Mark Divine",
    category: "meditation",
  },
];

export const researchStudies: ResearchStudy[] = [
  // Lucid Dreaming
  {
    title: "Lucid Dreaming: A State of Consciousness with Features of Both Waking and Non-Lucid Dreaming",
    journal: "Sleep",
    year: 2009,
    authors: "Voss, U., Holzmann, R., Tuin, I., & Hobson, J.A.",
    keyFinding: "Lucid dreaming activates a unique hybrid brain state combining features of both waking and REM sleep, with increased frontal cortex activity.",
    doi: "https://doi.org/10.1093/sleep/32.9.1191",
    category: "lucid-dreaming",
  },
  {
    title: "Induction of Self-Awareness in Dreams Through Frontal Low Current Stimulation of Gamma Activity",
    journal: "Nature Neuroscience",
    year: 2014,
    authors: "Voss, U., Holzmann, R., Hobson, J.A., et al.",
    keyFinding: "Applying 40 Hz electrical stimulation to the frontal cortex during REM sleep induced lucid dreaming in 77% of trials.",
    doi: "https://doi.org/10.1038/nn.3719",
    category: "lucid-dreaming",
  },
  {
    title: "Induction of Lucid Dreams: A Systematic Review of Evidence",
    journal: "Consciousness and Cognition",
    year: 2012,
    authors: "Stumbrys, T., Erlacher, D., Schädlich, M., & Schredl, M.",
    keyFinding: "MILD and WBTB techniques showed the strongest evidence for reliably inducing lucid dreams among all tested methods.",
    doi: "https://doi.org/10.1016/j.concog.2012.07.003",
    category: "lucid-dreaming",
  },
  {
    title: "Reality Testing and the Mnemonic Induction of Lucid Dreams",
    journal: "Dreaming",
    year: 2017,
    authors: "Aspy, D.J., Delfabbro, P., Proeve, M., & Mohr, P.",
    keyFinding: "Combining MILD with WBTB achieved a 46% success rate for lucid dreaming in a single night — the highest recorded in a prospective study.",
    doi: "https://doi.org/10.1037/drm0000059",
    category: "lucid-dreaming",
  },
  {
    title: "Psychophysiological Correlates of Lucid Dreaming",
    journal: "Perceptual and Motor Skills",
    year: 1981,
    authors: "LaBerge, S., Nagel, L., Dement, W.C., & Zarcone, V.",
    keyFinding: "First scientific proof that lucid dreaming occurs during REM sleep, verified through pre-arranged eye signal communication.",
    doi: "https://doi.org/10.2466/pms.1981.52.3.727",
    category: "lucid-dreaming",
  },

  // Meditation
  {
    title: "Mindfulness Practice Leads to Increases in Regional Brain Gray Matter Density",
    journal: "Psychiatry Research: Neuroimaging",
    year: 2011,
    authors: "Hölzel, B.K., Carmody, J., Vangel, M., et al.",
    keyFinding: "8 weeks of mindfulness meditation increased gray matter density in brain regions linked to learning, memory, and emotional regulation.",
    doi: "https://doi.org/10.1016/j.pscychresns.2010.08.006",
    category: "meditation",
  },
  {
    title: "Meditation Experience Is Associated with Differences in Default Mode Network Activity and Connectivity",
    journal: "Proceedings of the National Academy of Sciences",
    year: 2011,
    authors: "Brewer, J.A., Worhunsky, P.D., Gray, J.R., et al.",
    keyFinding: "Experienced meditators showed decreased activity in the default mode network, the brain's 'wandering mind' system.",
    doi: "https://doi.org/10.1073/pnas.1112029108",
    category: "meditation",
  },
  {
    title: "A Randomized Controlled Trial of Mindfulness Meditation for Generalized Anxiety Disorder",
    journal: "The Journal of Clinical Psychiatry",
    year: 2013,
    authors: "Hoge, E.A., Bui, E., Marques, L., et al.",
    keyFinding: "Mindfulness-based stress reduction significantly reduced anxiety symptoms compared to an active control group.",
    doi: "https://doi.org/10.4088/JCP.12m08083",
    category: "meditation",
  },
  {
    title: "Alterations in Brain and Immune Function Produced by Mindfulness Meditation",
    journal: "Psychosomatic Medicine",
    year: 2003,
    authors: "Davidson, R.J., Kabat-Zinn, J., Schumacher, J., et al.",
    keyFinding: "8-week meditation program increased left-sided anterior brain activation (associated with positive affect) and boosted immune response.",
    doi: "https://doi.org/10.1097/01.PSY.0000077505.67574.E3",
    category: "meditation",
  },
  {
    title: "Effect of Mindfulness-Based Stress Reduction vs Cognitive Behavioral Therapy on Sleep Quality",
    journal: "JAMA Internal Medicine",
    year: 2015,
    authors: "Black, D.S., O'Reilly, G.A., Olmstead, R., et al.",
    keyFinding: "Mindfulness meditation significantly improved sleep quality in older adults with moderate sleep disturbances.",
    doi: "https://doi.org/10.1001/jamainternmed.2014.8081",
    category: "meditation",
  },
];

export const dailyInsights: Record<VaultCategory, string[]> = {
  "lucid-dreaming": [
    "Keep a dream journal by your bed — writing immediately after waking dramatically improves recall.",
    "Perform reality checks throughout the day: try pushing your finger through your palm.",
    "Set an intention before sleep: 'Tonight I will realize I'm dreaming.'",
    "Wake up 5 hours after sleeping, stay up briefly, then go back to sleep for vivid lucid dreams (WBTB).",
    "Look for recurring dream signs in your journal — they're your gateway to lucidity.",
    "Combine MILD with WBTB for a 46% success rate on any given night.",
    "Visualize a recent dream as you fall asleep, but imagine becoming lucid within it.",
  ],
  meditation: [
    "Even 5 minutes of daily meditation measurably changes brain structure over 8 weeks.",
    "Focus on your exhale — making it longer than your inhale activates the parasympathetic nervous system.",
    "Body scan meditation before sleep primes your brain for vivid and memorable dreams.",
    "Don't judge your wandering mind during meditation — noticing it wandered IS the practice.",
    "Yoga Nidra (non-sleep deep rest) bridges meditation and lucid dreaming — try a guided session.",
    "Meditating at the same time each day strengthens the habit loop faster than longer sporadic sessions.",
    "Loving-kindness meditation has been shown to increase positive emotions that persist into dream content.",
  ],
};

// Technique indices mapping to categories
export const lucidDreamingTechniqueIndices = [0, 1, 2, 3, 4, 5, 6];
export const meditationTechniqueIndices = [7];
