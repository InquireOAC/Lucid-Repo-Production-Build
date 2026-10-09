import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { ArrowRight, Bookmark, Check } from "lucide-react";

interface Props {
  dream: DreamEntry;
  inList: boolean;
  onToggleList: (id: string) => void;
}

const HeroPoster = ({ dream, inList, onToggleList }: Props) => {
  const navigate = useNavigate();
  const imageUrl = dream.generatedImage || dream.image_url || dream.section_images?.find((s) => s.image_url)?.image_url || "/dream-art/starry-lake.png";
  const open = () => {
    const from = window.location.pathname + window.location.search;
    navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(from)}`);
  };
  return (
    <section className="lucid-hero relative mb-7 h-[420px] md:h-[470px] lg:h-[530px]" aria-label="Featured dream">
      <img src={imageUrl} alt={dream.title} className="absolute inset-0 h-full w-full object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#061526]/70 via-[#061526]/15 to-transparent"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#05111f] via-transparent to-transparent"/>
      <div className="absolute bottom-0 left-0 z-10 max-w-2xl p-5 md:p-10 lg:p-14">
        <p className="lucid-overline !text-sky-200">Featured dream</p>
        <h2 className="lucid-display mt-3 line-clamp-2 text-4xl text-white md:text-5xl lg:text-6xl">{dream.title}</h2>
        <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-relaxed text-slate-200 md:text-base">{dream.content}</p>
        <p className="mt-4 text-xs text-sky-100/80">{dream.profiles?.display_name || dream.profiles?.username ? `@ ${dream.profiles.display_name || dream.profiles.username}` : "From the community"}{dream.lucid ? " · Lucid" : ""}</p>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={open} className="lucid-button">Read dream <ArrowRight size={17}/></button>
          <button onClick={() => onToggleList(dream.id)} className="lucid-button-secondary !w-12 !px-0" aria-label={inList ? "Remove from My List" : "Add to My List"}>{inList ? <Check size={18}/> : <Bookmark size={18}/>}</button>
        </div>
      </div>
    </section>
  );
};

export default HeroPoster;
