import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";

const PAGE_WIDTH = 512;
const PAGE_HEIGHT = 720;

function createCanvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function drawCover(
  authorName: string,
  dreamCount: number,
  dateRange: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  grad.addColorStop(0, "#1a1625");
  grad.addColorStop(0.5, "#2d1f4e");
  grad.addColorStop(1, "#1a1625");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Decorative border
  ctx.strokeStyle = "rgba(168, 130, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, PAGE_WIDTH - 48, PAGE_HEIGHT - 48);
  ctx.strokeRect(32, 32, PAGE_WIDTH - 64, PAGE_HEIGHT - 64);

  // Volume text
  ctx.fillStyle = "rgba(168, 130, 255, 0.6)";
  ctx.font = "12px serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  ctx.fillText("VOLUME I", PAGE_WIDTH / 2, 120);

  // Title
  ctx.fillStyle = "#e8e0f0";
  ctx.font = "bold 36px Georgia, serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("Dream", PAGE_WIDTH / 2, 260);
  ctx.fillText("Journal", PAGE_WIDTH / 2, 310);

  // Divider
  ctx.strokeStyle = "rgba(168, 130, 255, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAGE_WIDTH / 2 - 60, 340);
  ctx.lineTo(PAGE_WIDTH / 2 + 60, 340);
  ctx.stroke();

  // Author
  ctx.fillStyle = "rgba(232, 224, 240, 0.7)";
  ctx.font = "italic 18px Georgia, serif";
  ctx.fillText(authorName, PAGE_WIDTH / 2, 390);

  // Stats
  ctx.fillStyle = "rgba(168, 130, 255, 0.4)";
  ctx.font = "13px sans-serif";
  ctx.fillText(
    `${dreamCount} dream${dreamCount !== 1 ? "s" : ""}${dateRange ? ` · ${dateRange}` : ""}`,
    PAGE_WIDTH / 2,
    440
  );

  return canvas;
}

function drawTOC(dreams: DreamEntry[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Page background
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Title
  ctx.fillStyle = "#2a2a2a";
  ctx.font = "bold 24px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("Contents", 40, 60);

  // Divider
  ctx.strokeStyle = "rgba(100, 70, 160, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 72);
  ctx.lineTo(120, 72);
  ctx.stroke();

  // Entries
  const maxEntries = Math.min(dreams.length, 20);
  for (let i = 0; i < maxEntries; i++) {
    const y = 110 + i * 28;
    let dateStr = "";
    try {
      dateStr = format(new Date(dreams[i].date), "MMM d");
    } catch {}

    // Number
    ctx.fillStyle = "rgba(100, 70, 160, 0.4)";
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(String(i + 1).padStart(2, "0"), 40, y);

    // Title (truncated)
    ctx.fillStyle = "#2a2a2a";
    ctx.font = "13px sans-serif";
    const title =
      dreams[i].title.length > 35
        ? dreams[i].title.slice(0, 35) + "…"
        : dreams[i].title;
    ctx.fillText(title, 70, y);

    // Date
    ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(dateStr, PAGE_WIDTH - 40, y);
  }

  if (dreams.length > maxEntries) {
    ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
    ctx.font = "italic 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `+ ${dreams.length - maxEntries} more`,
      PAGE_WIDTH / 2,
      110 + maxEntries * 28 + 10
    );
  }

  return canvas;
}

function drawDreamPage(dream: DreamEntry): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Page background
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  let y = 40;

  // Title
  ctx.fillStyle = "#2a2a2a";
  ctx.font = "bold 20px Georgia, serif";
  ctx.textAlign = "left";
  const titleLines = wrapText(ctx, dream.title, PAGE_WIDTH - 80, 40);
  for (const line of titleLines) {
    ctx.fillText(line, 40, y);
    y += 26;
  }

  // Date + meta
  let dateStr = "";
  try {
    dateStr = format(new Date(dream.date), "MMMM d, yyyy");
  } catch {
    dateStr = dream.date;
  }
  y += 4;
  ctx.fillStyle = "rgba(100, 100, 100, 0.6)";
  ctx.font = "12px sans-serif";
  let meta = dateStr;
  if (dream.mood) meta += ` · ${dream.mood}`;
  if (dream.lucid) meta += " · ✦ Lucid";
  ctx.fillText(meta, 40, y);
  y += 8;

  // Tags
  if (dream.tags && dream.tags.length > 0) {
    y += 14;
    ctx.fillStyle = "rgba(100, 70, 160, 0.5)";
    ctx.font = "italic 11px sans-serif";
    ctx.fillText(dream.tags.map((t) => `#${t}`).join("  "), 40, y);
    y += 6;
  }

  // Divider
  y += 10;
  ctx.strokeStyle = "rgba(100, 70, 160, 0.2)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(PAGE_WIDTH - 40, y);
  ctx.stroke();
  y += 16;

  // Content
  ctx.fillStyle = "#3a3a3a";
  ctx.font = "13px sans-serif";
  const contentText = dream.content?.slice(0, 1200) || "";
  const contentLines = wrapText(ctx, contentText, PAGE_WIDTH - 80, 40);
  const maxLines = Math.floor((PAGE_HEIGHT - y - 40) / 18);
  for (let i = 0; i < Math.min(contentLines.length, maxLines); i++) {
    ctx.fillText(contentLines[i], 40, y);
    y += 18;
  }
  if (contentLines.length > maxLines) {
    ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
    ctx.fillText("...", 40, y);
  }

  return canvas;
}

function drawBlankPage(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  return canvas;
}

function drawCoverBack(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  grad.addColorStop(0, "#1a1625");
  grad.addColorStop(1, "#2d1f4e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  _x: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    const words = para.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

export interface PageTextures {
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
}

export function usePageTextures(
  dreams: DreamEntry[],
  authorName: string
): PageTextures[] {
  const [textures, setTextures] = useState<PageTextures[]>([]);
  const cacheKeyRef = useRef("");

  useEffect(() => {
    const cacheKey = `${authorName}-${dreams.map((d) => d.id).join(",")}`;
    if (cacheKey === cacheKeyRef.current && textures.length > 0) return;
    cacheKeyRef.current = cacheKey;

    // Calculate date range for cover
    let dateRange = "";
    if (dreams.length > 0) {
      const sorted = [...dreams].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      try {
        const earliest = format(new Date(sorted[0].date), "MMM yyyy");
        const latest = format(
          new Date(sorted[sorted.length - 1].date),
          "MMM yyyy"
        );
        dateRange = earliest === latest ? earliest : `${earliest} — ${latest}`;
      } catch {}
    }

    // Build page pairs (front/back for each physical page)
    // Physical pages: cover, toc+dream1, dream2+dream3, ...
    const allCanvases: HTMLCanvasElement[] = [];

    // Cover front
    allCanvases.push(drawCover(authorName, dreams.length, dateRange));
    // Cover back (inside cover) = blank
    allCanvases.push(drawBlankPage());
    // TOC front
    allCanvases.push(drawTOC(dreams));
    // TOC back = blank
    allCanvases.push(drawBlankPage());
    // Dream pages
    for (const dream of dreams) {
      allCanvases.push(drawDreamPage(dream));
      allCanvases.push(drawBlankPage());
    }
    // Back cover
    allCanvases.push(drawCoverBack());

    // Group into page pairs
    const pairs: PageTextures[] = [];
    for (let i = 0; i < allCanvases.length; i += 2) {
      pairs.push({
        front: createCanvasTexture(allCanvases[i]),
        back: createCanvasTexture(allCanvases[i + 1] || drawBlankPage()),
      });
    }

    setTextures(pairs);

    return () => {
      pairs.forEach((p) => {
        p.front.dispose();
        p.back.dispose();
      });
    };
  }, [dreams, authorName]);

  return textures;
}
