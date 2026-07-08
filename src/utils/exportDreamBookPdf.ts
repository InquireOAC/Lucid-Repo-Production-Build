import { jsPDF } from "jspdf";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";

interface ProfileInfo {
  display_name?: string | null;
  username?: string | null;
}

const PW = 297; // landscape A4
const PH = 210;
const HALF = PW / 2;
const M = 14;
const TW = HALF - M * 2;

async function loadImageBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 5000);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/jpeg", 0.8));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { clearTimeout(timeout); resolve(null); };
    img.src = url;
  });
}

function drawCover(doc: jsPDF, profile: ProfileInfo, count: number, dateRange: string) {
  doc.setFillColor(20, 18, 35);
  doc.rect(0, 0, PW, PH, "F");
  doc.setDrawColor(100, 80, 180);
  doc.setLineWidth(1);
  doc.roundedRect(10, 10, PW - 20, PH - 20, 4, 4);
  doc.setLineWidth(0.3);
  doc.roundedRect(13, 13, PW - 26, PH - 26, 3, 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 160);
  doc.text("VOLUME I", PW / 2, 60, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);
  doc.setTextColor(220, 215, 240);
  doc.text("Dream Journal", PW / 2, 88, { align: "center" });
  doc.setDrawColor(100, 80, 180);
  doc.setLineWidth(0.6);
  doc.line(PW / 2 - 30, 96, PW / 2 + 30, 96);
  const name = profile.display_name || profile.username || "Dreamer";
  doc.setFont("helvetica", "italic");
  doc.setFontSize(18);
  doc.setTextColor(160, 150, 200);
  doc.text(name, PW / 2, 115, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 95, 130);
  doc.text(`${count} dream${count !== 1 ? "s" : ""}`, PW / 2, 132, { align: "center" });
  if (dateRange) doc.text(dateRange, PW / 2, 140, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100, 95, 130);
  doc.text('"Dreams are the royal road to the unconscious."', PW / 2, PH - 30, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("— Sigmund Freud", PW / 2, PH - 24, { align: "center" });
}

function drawTOC(doc: jsPDF, dreams: DreamEntry[]) {
  doc.setFillColor(248, 244, 237);
  doc.rect(0, 0, PW, PH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(50, 35, 80);
  doc.text("Contents", M + 10, 30);
  doc.setDrawColor(180, 170, 210);
  doc.setLineWidth(0.3);
  doc.line(M + 10, 34, M + 80, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let y = 46;
  dreams.forEach((d, i) => {
    if (y > PH - 20) return;
    doc.setTextColor(120, 110, 140);
    doc.text(String(i + 1).padStart(2, "0"), M + 10, y);
    doc.setTextColor(50, 45, 60);
    const title = d.title.length > 50 ? d.title.slice(0, 47) + "..." : d.title;
    doc.text(title, M + 22, y);
    const sceneCount = d.section_images?.length || 0;
    if (sceneCount > 0) {
      doc.setTextColor(100, 80, 160);
      doc.setFontSize(8);
      doc.text(`${sceneCount} scenes`, M + 22 + doc.getTextWidth(title) + 4, y);
      doc.setFontSize(10);
    }
    let dateStr = "";
    try { dateStr = format(new Date(d.date), "MMM d"); } catch {}
    doc.setTextColor(160, 150, 180);
    doc.text(dateStr, PW - M - 10, y, { align: "right" });
    y += 6;
  });
}

function drawEndPage(doc: jsPDF) {
  doc.setFillColor(20, 18, 35);
  doc.rect(0, 0, PW, PH, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.setTextColor(160, 150, 200);
  doc.text("Sweet dreams...", PW / 2, PH / 2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 75, 110);
  doc.text("Made with Lucid Repo", PW / 2, PH / 2 + 14, { align: "center" });
}

function drawPlaceholder(doc: jsPDF, title: string) {
  doc.setFillColor(30, 25, 50);
  doc.rect(0, 0, HALF, PH, "F");
  doc.setFillColor(45, 38, 70);
  doc.triangle(0, PH, HALF, 0, HALF, PH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(160, 150, 200);
  const lines = doc.splitTextToSize(title, HALF - 30);
  doc.text(lines, HALF / 2, PH / 2, { align: "center" });
}

async function drawImageSide(doc: jsPDF, imgUrl: string | undefined, title: string) {
  if (imgUrl) {
    const b64 = await loadImageBase64(imgUrl);
    if (b64) {
      const tmpImg = new Image();
      tmpImg.src = b64;
      await new Promise((r) => { tmpImg.onload = r; tmpImg.onerror = r; });
      const ar = tmpImg.naturalWidth / tmpImg.naturalHeight;
      let iw = HALF, ih = iw / ar;
      if (ih < PH) { ih = PH; iw = ih * ar; }
      doc.addImage(b64, "JPEG", (HALF - iw) / 2, (PH - ih) / 2, iw, ih);
      return;
    }
  }
  drawPlaceholder(doc, title);
}

function drawTextSide(doc: jsPDF, opts: {
  title: string; dateStr: string; mood?: string; lucid: boolean;
  tags?: string[]; content: string; analysis?: string; sceneLabel?: string;
}, pageNum: number, totalIdx: number) {
  // Right side warm paper
  doc.setFillColor(248, 244, 237);
  doc.rect(HALF, 0, HALF, PH, "F");

  // Spine
  doc.setDrawColor(200, 195, 210);
  doc.setLineWidth(0.3);
  doc.line(HALF, 0, HALF, PH);

  const rx = HALF + M;
  let y = M + 4;

  if (opts.sceneLabel) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 80, 160);
    doc.text(opts.sceneLabel, rx, y + 3);
    y += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(opts.sceneLabel ? 14 : 18);
  doc.setTextColor(50, 35, 80);
  const tl = doc.splitTextToSize(opts.title, TW);
  doc.text(tl, rx, y + 5);
  y += tl.length * 7 + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 140);
  let meta = opts.dateStr;
  if (opts.mood) meta += ` · ${opts.mood}`;
  if (opts.lucid) meta += " · ✦ Lucid";
  doc.text(meta, rx, y + 3);
  y += 8;

  if (opts.tags?.length) {
    doc.setFontSize(8);
    doc.setTextColor(100, 80, 160);
    doc.setFont("helvetica", "italic");
    doc.text(opts.tags.map((t) => `#${t}`).join("  "), rx, y + 2);
    y += 7;
  }

  doc.setDrawColor(200, 190, 215);
  doc.setLineWidth(0.3);
  doc.line(rx, y, rx + TW, y);
  y += 5;

  if (opts.content) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 45, 60);
    const cl = doc.splitTextToSize(opts.content, TW);
    const maxY = opts.analysis ? PH - 55 : PH - 20;
    for (const line of cl) {
      if (y > maxY) break;
      doc.text(line, rx, y);
      y += 4.5;
    }
    y += 4;
  }

  if (opts.analysis && y < PH - 40) {
    doc.setDrawColor(180, 170, 210);
    doc.line(rx, y, rx + TW, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 60, 120);
    doc.text("Dream Analysis", rx, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70, 65, 80);
    const al = doc.splitTextToSize(opts.analysis, TW);
    for (const line of al) {
      if (y > PH - 15) break;
      doc.text(line, rx, y);
      y += 4;
    }
  }

  // Page numbers
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(String(pageNum), M, PH - 8);
  doc.text(String(pageNum + 1), PW - M, PH - 8, { align: "right" });
}

export async function exportDreamBookPdf(
  dreams: DreamEntry[],
  profile: ProfileInfo,
  onProgress?: (cur: number, total: number) => void
): Promise<Blob> {
  const sorted = [...dreams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let dateRange = "";
  if (sorted.length > 0) {
    try {
      const e = format(new Date(sorted[sorted.length - 1].date), "MMM d, yyyy");
      const l = format(new Date(sorted[0].date), "MMM d, yyyy");
      dateRange = `${e} — ${l}`;
    } catch {}
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Cover
  drawCover(doc, profile, sorted.length, dateRange);

  // TOC
  doc.addPage();
  drawTOC(doc, sorted);

  // Count total spreads for progress
  let totalSpreads = 0;
  for (const dream of sorted) {
    const scenes = dream.section_images;
    totalSpreads += (scenes && scenes.length > 0) ? 1 + scenes.length : 1;
  }

  let spreadIdx = 0;
  let pageNum = 3;

  for (const dream of sorted) {
    let dateStr = "";
    try { dateStr = format(new Date(dream.date), "MMMM d, yyyy"); } catch { dateStr = dream.date; }
    const scenes = dream.section_images;

    if (scenes && scenes.length > 0) {
      // Title page spread
      doc.addPage();
      const heroImg = dream.generatedImage || dream.image_url;
      await drawImageSide(doc, heroImg, dream.title);
      drawTextSide(doc, {
        title: dream.title, dateStr, mood: dream.mood, lucid: dream.lucid,
        tags: dream.tags, content: `${scenes.length} scene${scenes.length !== 1 ? "s" : ""}`,
      }, pageNum, spreadIdx);
      pageNum += 2;
      spreadIdx++;
      onProgress?.(spreadIdx, totalSpreads);

      // Scene spreads
      for (let si = 0; si < scenes.length; si++) {
        const scene = scenes[si];
        doc.addPage();
        // Use scene image (video poster fallback = image_url)
        await drawImageSide(doc, scene.image_url, `Scene ${scene.section}`);
        drawTextSide(doc, {
          title: dream.title, dateStr, mood: dream.mood, lucid: dream.lucid,
          tags: undefined, content: scene.text,
          analysis: si === scenes.length - 1 ? dream.analysis : undefined,
          sceneLabel: `Scene ${scene.section}`,
        }, pageNum, spreadIdx);
        pageNum += 2;
        spreadIdx++;
        onProgress?.(spreadIdx, totalSpreads);
      }
    } else {
      // Single spread
      doc.addPage();
      const imgUrl = dream.generatedImage || dream.image_url;
      await drawImageSide(doc, imgUrl, dream.title);
      drawTextSide(doc, {
        title: dream.title, dateStr, mood: dream.mood, lucid: dream.lucid,
        tags: dream.tags, content: dream.content, analysis: dream.analysis,
      }, pageNum, spreadIdx);
      pageNum += 2;
      spreadIdx++;
      onProgress?.(spreadIdx, totalSpreads);
    }
  }

  // End page
  doc.addPage();
  drawEndPage(doc);

  return doc.output("blob");
}
