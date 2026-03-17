import React from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { DreamEntry } from "@/types/dream";
import DreamBookCover from "./DreamBookCover";
import DreamBookTableOfContents from "./DreamBookTableOfContents";
import DreamBookPageSpread from "./DreamBookPageSpread";

interface DreamBook3DViewerProps {
  dreams: DreamEntry[];
  authorName: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export type PageContent =
  | { type: "cover" }
  | { type: "toc" }
  | { type: "dream"; dream: DreamEntry }
  | { type: "title"; dream: DreamEntry }
  | { type: "scene"; dream: DreamEntry; scene: { section: number; text: string; image_url?: string; video_url?: string } };

export function buildPages(dreams: DreamEntry[]): PageContent[] {
  const pages: PageContent[] = [{ type: "cover" }, { type: "toc" }];

  for (const dream of dreams) {
    const scenes = dream.section_images;
    if (scenes && scenes.length > 0) {
      // Title page first, then one spread per scene
      pages.push({ type: "title", dream });
      for (const scene of scenes) {
        pages.push({ type: "scene", dream, scene });
      }
    } else {
      // Single spread for dreams without scenes
      pages.push({ type: "dream", dream });
    }
  }

  return pages;
}

const DreamBook3DViewer = ({
  dreams,
  authorName,
  currentPage,
  onPageChange,
}: DreamBook3DViewerProps) => {
  const pages = buildPages(dreams);

  const rotateY = useMotionValue(0);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -50 && currentPage < pages.length - 1) {
      onPageChange(currentPage + 1);
    } else if (info.offset.x > 50 && currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const renderPage = (page: PageContent) => {
    switch (page.type) {
      case "cover":
        return <DreamBookCover authorName={authorName} dreams={dreams} />;
      case "toc":
        return (
          <DreamBookTableOfContents
            dreams={dreams}
            onSelectDream={(i) => {
              // Find page index for this dream
              const idx = pages.findIndex(
                (p) => (p.type === "dream" || p.type === "title") && p.dream.id === dreams[i]?.id
              );
              if (idx >= 0) onPageChange(idx);
            }}
          />
        );
      case "dream":
        return <DreamBookPageSpread dream={page.dream} mode="book" />;
      case "title":
        return <DreamBookPageSpread dream={page.dream} mode="book" isTitlePage />;
      case "scene":
        return <DreamBookPageSpread dream={page.dream} mode="book" scene={page.scene} />;
    }
  };

  return (
    <div
      className="flex-1 flex items-center justify-center overflow-hidden px-4"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="relative w-full max-w-lg aspect-[3/4] rounded-xl overflow-hidden border border-border/30 bg-card shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
          rotateY,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {/* Spine shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="absolute inset-0"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            {pages[currentPage] && renderPage(pages[currentPage])}
          </motion.div>
        </AnimatePresence>

        {/* Page edge effect */}
        <div className="absolute right-0 top-2 bottom-2 w-[3px] flex flex-col gap-px pointer-events-none">
          {[...Array(Math.min(pages.length, 8))].map((_, i) => (
            <div key={i} className="flex-1 bg-border/20 rounded-r-sm" />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DreamBook3DViewer;
