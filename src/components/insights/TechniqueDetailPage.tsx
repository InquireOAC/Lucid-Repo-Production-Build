import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pin, PinOff } from "lucide-react";
import { techniques } from "./techniqueData";
import { usePinnedTechniques } from "@/hooks/usePinnedTechniques";
import { Button } from "@/components/ui/button";

import realityChecksImg from "@/assets/techniques/reality-checks.jpeg";
import wildImg from "@/assets/techniques/wild.jpeg";
import ssildImg from "@/assets/techniques/ssild.jpeg";
import fildImg from "@/assets/techniques/fild.jpeg";
import deildImg from "@/assets/techniques/deild.jpeg";
import meditationImg from "@/assets/techniques/meditation.jpeg";

const TECHNIQUE_IMAGES: Record<number, string> = {
  0: realityChecksImg,
  3: wildImg,
  4: ssildImg,
  5: fildImg,
  6: deildImg,
  7: meditationImg,
};

const DotRating: React.FC<{ label: string; value: number; max?: number }> = ({
  label,
  value,
  max = 3,
}) => (
  <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-card/60 backdrop-blur-sm px-4 py-2">
    <span className="text-xs text-muted-foreground font-medium">{label}</span>
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < value ? "bg-primary" : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  </div>
);

const TechniqueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const index = Number(id);
  const technique = techniques[index];
  const { isPinned, pinTechnique, unpinTechnique } = usePinnedTechniques();
  const pinned = !isNaN(index) && isPinned(index);
  const headerImage = TECHNIQUE_IMAGES[index];

  if (!technique) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Technique not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-safe-top">
      {/* Image hero or emoji fallback */}
      {headerImage ? (
        <div className="relative h-56 w-full overflow-hidden">
          <img src={headerImage} alt={technique.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          {/* Overlaid nav */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className={`${pinned ? "text-primary" : "text-white/80"} hover:bg-white/20`}
              onClick={() => (pinned ? unpinTechnique(index) : pinTechnique(index))}
            >
              {pinned ? <PinOff size={18} /> : <Pin size={18} />}
              <span className="ml-1.5 text-xs">{pinned ? "Unpin" : "Pin"}</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Fallback: nav + emoji */}
          <div className="p-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className={pinned ? "text-primary" : "text-muted-foreground"}
              onClick={() => (pinned ? unpinTechnique(index) : pinTechnique(index))}
            >
              {pinned ? <PinOff size={18} /> : <Pin size={18} />}
              <span className="ml-1.5 text-xs">{pinned ? "Unpin" : "Pin"}</span>
            </Button>
          </div>
          <div className="flex flex-col items-center px-6 pt-4">
            <span className="text-[120px] leading-none">{technique.icon}</span>
          </div>
        </>
      )}

      {/* Title + meta */}
      <div className="flex flex-col items-center px-6 pt-4">
        <h1 className="text-2xl font-bold text-foreground text-center">
          {technique.name}
          {technique.acronym && (
            <span className="text-primary ml-2 text-lg font-normal">
              ({technique.acronym})
            </span>
          )}
        </h1>
        <p className="text-sm text-primary/70 mt-1.5 text-center">
          {technique.shortDescription}
        </p>
        <div className="flex gap-3 mt-5">
          <DotRating label="Difficulty" value={technique.difficultyRating} />
          <DotRating label="Effectiveness" value={technique.effectiveness} />
        </div>
      </div>

      {/* Long description */}
      <div className="px-6 mt-8">
        {technique.longDescription.split("\n\n").map((paragraph, i) => (
          <p
            key={i}
            className="text-sm text-muted-foreground leading-relaxed mb-4"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Steps */}
      <div className="px-6 mt-4">
        <div className="rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-5">
          <h2 className="text-base font-bold text-foreground mb-4">
            Step-by-Step Tutorial
          </h2>
          <ol className="space-y-4">
            {technique.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TechniqueDetailPage;
