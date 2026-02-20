import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { techniques } from "./techniqueData";

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
  const technique = techniques[Number(id)];

  if (!technique) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Technique not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-safe-top">
      {/* Back button */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Icon hero */}
      <div className="flex flex-col items-center px-6 pt-4">
        <div className="relative">
          <span className="text-[120px] leading-none">{technique.icon}</span>
          {/* Decorative sparkles */}
          <div className="absolute -top-2 -right-3 w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
          <div className="absolute top-4 -left-4 w-2 h-2 rounded-full bg-accent/25 animate-pulse delay-500" />
          <div className="absolute -bottom-1 right-2 w-2.5 h-2.5 rounded-full bg-primary/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 -right-5 w-1.5 h-1.5 rounded-full bg-accent/30 animate-pulse delay-300" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center mt-4">
          {technique.name}
          {technique.acronym && (
            <span className="text-primary ml-2 text-lg font-normal">
              ({technique.acronym})
            </span>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-primary/70 mt-1.5 text-center">
          {technique.shortDescription}
        </p>

        {/* Rating pills */}
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
