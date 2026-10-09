import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, ArrowRight, Sparkles, Clapperboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamStore } from "@/store/dreamStore";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { DreamEntry } from "@/types/dream";
import PageTransition from "@/components/ui/PageTransition";

const art = {
  city: "/dream-art/city-above-clouds.png",
  whale: "/dream-art/luminous-whale.png",
  door: "/dream-art/door-at-horizon.png",
  lake: "/dream-art/starry-lake.png",
};

const imageFor = (dream?: DreamEntry, fallback = art.city) =>
  dream?.generatedImage || dream?.image_url || dream?.section_images?.find((s) => s.image_url)?.image_url || fallback;

const Home = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { entries } = useDreamStore();
  useJournalEntries();
  const dreams = useMemo(() => user ? (entries as DreamEntry[]).filter((d) => !d.is_archived && (!d.user_id || d.user_id === user.id)) : [], [entries, user]);
  const films = useMemo(() => dreams.filter((d) => d.video_url), [dreams]);
  const creating = useMemo(() => dreams.filter((d) => !d.video_url).slice(0, 2), [dreams]);
  const featured = films[0] || dreams[0];

  return (
    <PageTransition className="min-h-screen pb-safe-bottom">
      <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-safe-top md:px-10 lg:px-14">
        <header className="flex items-center justify-between gap-4 py-5 md:py-8">
          <div className="flex items-center gap-4 md:hidden"><span className="lucid-ring" /><span className="text-lg font-medium tracking-[.3em] uppercase">Lucid Repo</span></div>
          <div className="hidden md:block"><p className="lucid-overline mb-1">Your creative home</p><p className="text-sm text-slate-300">{user ? `Welcome back, ${profile?.display_name || profile?.username || "dreamer"}` : "Where dreams become cinema"}</p></div>
          <button onClick={() => navigate(user ? "/profile" : "/auth")} className="h-11 w-11 overflow-hidden rounded-full border border-sky-400/50 bg-[#173554] text-sky-200 flex items-center justify-center" aria-label={user ? "Open profile" : "Sign in"}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-semibold">{(profile?.display_name || profile?.username || "L").slice(0, 1).toUpperCase()}</span>}
          </button>
        </header>

        <section className="lucid-hero relative min-h-[530px] md:min-h-[540px] lg:min-h-[590px]" aria-label="Featured dream">
          <img src={imageFor(featured)} alt={featured?.title || "Fantastical city above the clouds"} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061626]/75 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 z-10 max-w-2xl p-6 pb-8 md:p-12 lg:p-16">
            <p className="lucid-overline !text-sky-200">{featured ? (featured.video_url ? "Ready to watch" : "Continue your dream") : "Your dream, a higher reality"}</p>
            <h1 className="lucid-display mt-4 text-5xl text-white drop-shadow-xl md:text-6xl lg:text-[5.5rem]">{featured?.title || "Your dreams, as cinema"}</h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-200 md:text-base">{featured ? (featured.video_url ? "Your film is ready. Step back into the world you imagined." : "Return to your story and bring its next scene to life.") : "Capture what you remember. Shape it into scenes. Watch your imagination come alive."}</p>
            <button className="lucid-button mt-7 min-w-48" onClick={() => navigate(featured ? (featured.video_url ? "/cinematic" : `/dream/${featured.id}`) : (user ? "/journal/new" : "/auth"))}>
              {featured?.video_url ? <Play size={19} fill="currentColor" /> : <Plus size={20} />}
              {featured ? (featured.video_url ? "Watch Film" : "Open Dream") : (user ? "Record a Dream" : "Get Started")}
            </button>
          </div>
        </section>

        <section className="mt-10 md:mt-14">
          <div className="mb-5 flex items-end justify-between gap-3"><div><p className="lucid-overline mb-2">The journey continues</p><h2 className="text-2xl font-semibold md:text-3xl">Continue Creating</h2></div><button onClick={() => navigate("/journal")} className="flex items-center gap-1 text-sm font-semibold text-sky-400">See All <ArrowRight size={16}/></button></div>
          {creating.length ? <div className="grid grid-cols-2 gap-3 md:gap-5">{creating.map((dream, i) => <button key={dream.id} onClick={() => navigate(`/dream/${dream.id}`)} className="group relative h-56 overflow-hidden rounded-xl border border-sky-300/20 text-left md:h-72"><img src={imageFor(dream, i ? art.door : art.whale)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#06121f] via-transparent to-transparent"/><div className="absolute bottom-0 p-4 md:p-6"><h3 className="lucid-display text-xl md:text-3xl">{dream.title}</h3><p className="mt-2 text-xs text-sky-200">{dream.section_images?.filter(s => s.image_url).length || 0} scenes created · Open dream</p></div></button>)}</div> : <div className="grid grid-cols-2 gap-3 md:gap-5"><div className="lucid-panel overflow-hidden"><img src={art.whale} alt="Dreamlike whale beneath the sea" className="h-36 w-full object-cover md:h-48"/><div className="p-4"><p className="lucid-overline">01 · Capture</p><h3 className="lucid-display mt-2 text-xl md:text-2xl">Remember the feeling</h3><p className="mt-2 text-xs text-slate-400">Start with a few details from your dream.</p></div></div><div className="lucid-panel overflow-hidden"><img src={art.door} alt="Glowing door on a dream horizon" className="h-36 w-full object-cover md:h-48"/><div className="p-4"><p className="lucid-overline">02 · Create</p><h3 className="lucid-display mt-2 text-xl md:text-2xl">Give it a new life</h3><p className="mt-2 text-xs text-slate-400">Visualize scenes and build a film.</p></div></div></div>}
        </section>

        <section className="mt-10 md:mt-14">
          <div className="mb-5 flex items-end justify-between"><div><p className="lucid-overline mb-2">Made from your imagination</p><h2 className="text-2xl font-semibold md:text-3xl">Your Films</h2></div><button onClick={() => navigate("/cinematic")} className="flex items-center gap-1 text-sm font-semibold text-sky-400">See All <ArrowRight size={16}/></button></div>
          {films.length ? <div className="flex gap-3 overflow-x-auto pb-3 md:gap-5">{films.slice(0, 8).map((film) => <button key={film.id} onClick={() => navigate("/cinematic")} className="lucid-poster relative aspect-[3/4] w-40 flex-none text-left md:w-52"><img src={imageFor(film, art.lake)} alt=""/><span className="absolute inset-0 bg-gradient-to-t from-[#06121f] via-transparent to-transparent"/><span className="lucid-display absolute bottom-3 left-3 right-3 text-xl">{film.title}</span></button>)}</div> : <div className="lucid-panel flex items-center gap-4 p-4 md:p-6"><img src={art.lake} alt="Starry dream landscape" className="h-24 w-24 rounded-lg object-cover md:h-32 md:w-40"/><div><Clapperboard className="mb-2 text-sky-400" size={22}/><h3 className="text-lg font-semibold">Your first film starts with a dream.</h3><p className="mt-1 text-sm text-slate-400">Once you make a cinematic, it will live here.</p><button onClick={() => navigate("/journal/new")} className="mt-3 text-sm font-semibold text-sky-400">Create a dream <ArrowRight size={14} className="inline"/></button></div></div>}
        </section>

        <button onClick={() => navigate(user ? "/journal/new" : "/auth")} className="lucid-button mt-10 w-full md:mt-14 md:w-auto"><Sparkles size={18}/> Create a new dream</button>
      </div>
    </PageTransition>
  );
};

export default Home;
