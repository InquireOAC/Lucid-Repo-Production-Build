import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Moon, Sparkles, BookOpen } from "lucide-react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import SymbolTracker from "@/components/insights/SymbolTracker";

const Insights = () => {
  const { entries } = useJournalEntries();
  const [range, setRange] = useState<"30" | "all">("30");
  const dreams = useMemo(() => entries.filter((d) => !d.is_archived && (range === "all" || new Date(d.created_at || d.date).getTime() >= Date.now() - 30 * 86400000)), [entries, range]);
  const lucid = dreams.filter((d) => d.lucid).length;
  const moods = useMemo(() => {
    const counts = new Map<string, number>();
    dreams.forEach((d) => { if (d.mood) counts.set(d.mood, (counts.get(d.mood) || 0) + 1); });
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [dreams]);

  return (
    <main className="min-h-screen px-4 pb-12 pt-safe-top md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-end justify-between gap-4 py-6 md:py-9"><div><p className="lucid-overline mb-2">Patterns · symbols · progress</p><h1 className="lucid-display text-4xl md:text-5xl">Insights</h1></div><select aria-label="Insight date range" value={range} onChange={(e) => setRange(e.target.value as "30" | "all")} className="lucid-pill bg-[#0d2339] !text-slate-100"><option value="30">Last 30 days</option><option value="all">All time</option></select></header>
        <section className="lucid-hero relative min-h-64 md:min-h-72"><img src="/dream-art/starry-lake.png" alt="Moonlit dream landscape" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-[#061526]/90 to-transparent"/><div className="relative z-10 max-w-md p-6 md:p-9"><p className="lucid-overline !text-sky-200">Your dream insights</p><h2 className="lucid-display mt-3 text-3xl md:text-4xl">{dreams.length ? "Every dream leaves a pattern." : "Your patterns start with a dream."}</h2><p className="mt-3 text-sm leading-relaxed text-slate-300">{dreams.length ? "Explore the themes, feelings, and symbols that appear across your journal." : "Record a few dreams to begin finding themes and recurring symbols."}</p><Link to="/journal" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-400">Open your library <ArrowRight size={16}/></Link></div></section>
        <div className="mt-5 grid grid-cols-2 gap-3 md:gap-5"><div className="lucid-panel p-5"><Moon className="mb-4 text-sky-400" size={24}/><strong className="block text-4xl font-medium">{dreams.length}</strong><span className="text-sm text-slate-400">Dreams recorded</span></div><div className="lucid-panel p-5"><Sparkles className="mb-4 text-sky-400" size={24}/><strong className="block text-4xl font-medium">{lucid}</strong><span className="text-sm text-slate-400">Lucid dreams</span></div></div>
        {moods.length > 0 && <section className="lucid-panel mt-5 p-5 md:p-7"><p className="lucid-overline">Your dream moods</p><div className="mt-5 space-y-4">{moods.map(([mood, count]) => <div key={mood} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-3 text-sm"><span>{mood}</span><div className="h-2 overflow-hidden rounded-full bg-sky-900/50"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{width:`${Math.round(count / dreams.length * 100)}%`}}/></div><span className="text-right text-slate-400">{Math.round(count / dreams.length * 100)}%</span></div>)}</div></section>}
        <div className="lucid-panel mt-5"><SymbolTracker /></div>
        <Link to="/insights/technique/0" className="lucid-panel mt-5 flex items-center gap-4 p-5 transition-colors hover:border-sky-400"><BookOpen className="text-sky-400" size={28}/><span className="flex-1"><strong className="block">Browse lucid techniques</strong><small className="text-slate-400">Practical tools for more conscious dreams.</small></span><ArrowRight size={19} className="text-sky-400"/></Link>
      </div>
    </main>
  );
};

export default Insights;
