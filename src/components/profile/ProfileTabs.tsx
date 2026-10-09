import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { BookOpen, Film } from "lucide-react";

interface ProfileTabsProps {
  publicDreams: DreamEntry[];
  likedDreams: DreamEntry[];
  isOwnProfile: boolean;
  bio?: string | null;
  refreshDreams?: () => void;
  userId?: string;
}

const ProfileTabs = ({ publicDreams, likedDreams, isOwnProfile, bio }: ProfileTabsProps) => {
  const [tab, setTab] = useState<"dreams" | "films" | "about">("dreams");
  const navigate = useNavigate();
  const dreams = tab === "films" ? publicDreams.filter((d) => d.video_url) : publicDreams;

  return (
    <section className="px-4 pb-16 lg:px-12 xl:px-16">
      <div role="tablist" aria-label="Profile content" className="mb-6 grid grid-cols-3 border-b border-sky-200/20">
        {(["dreams", "films", "about"] as const).map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`border-b-2 pb-3 text-sm font-semibold capitalize transition-colors md:text-base ${tab === item ? "border-blue-400 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{item}</button>)}
      </div>

      {tab === "about" ? <div className="lucid-panel p-6"><h2 className="lucid-display text-2xl">About</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{bio || "A place for the dreams this dreamer chooses to share."}</p>{likedDreams.length > 0 && <p className="mt-5 text-xs text-slate-400">{likedDreams.length} liked dreams</p>}</div> : dreams.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {dreams.map((dream) => {
            const image = dream.generatedImage || dream.image_url || dream.section_images?.find((s) => s.image_url)?.image_url || "/dream-art/starry-lake.png";
            return <button key={dream.id} onClick={() => navigate(`/lucid-repo/${dream.id}`)} className="lucid-poster relative aspect-[4/3] text-left md:aspect-[16/10]"><img src={image} alt="" className="h-full w-full object-cover"/><span className="absolute inset-0 bg-gradient-to-t from-[#05111f] via-transparent to-transparent"/><span className="absolute bottom-3 left-3 right-3"><span className="lucid-display block truncate text-lg md:text-2xl">{dream.title}</span><span className="mt-1 flex items-center gap-1 text-xs text-slate-300">{dream.video_url ? <Film size={13}/> : <BookOpen size={13}/>} {dream.video_url ? "Film" : "Dream"}</span></span></button>;
          })}
        </div>
      ) : <div className="lucid-panel flex flex-col items-center px-6 py-14 text-center"><BookOpen className="mb-3 text-sky-300" size={30}/><h2 className="lucid-display text-2xl">{tab === "films" ? "No films shared yet" : "No public dreams yet"}</h2><p className="mt-2 max-w-xs text-sm text-slate-400">{isOwnProfile ? (tab === "films" ? "Your finished public films will appear here." : "Share a dream with the community to see it here.") : "This dreamer has not shared anything in this section yet."}</p></div>}
    </section>
  );
};

export default ProfileTabs;
