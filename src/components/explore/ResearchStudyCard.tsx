import React from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResearchStudyCardProps {
  study: {
    title: string;
    journal?: string | null;
    year?: number | null;
    authors: string;
    key_finding: string;
    url: string;
  };
}

const ResearchStudyCard: React.FC<ResearchStudyCardProps> = ({ study }) => {
  return (
    <div
      onClick={() => window.open(study.url, "_blank")}
      className="glass-card rounded-xl p-4 border-l-2 border-l-primary/40 cursor-pointer group hover:border-l-primary/70 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              {study.journal} · {study.year}
            </Badge>
          </div>
          <h4 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
            {study.title}
          </h4>
          <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {study.key_finding}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1 truncate">
            {study.authors}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
      </div>
    </div>
  );
};

export default ResearchStudyCard;
