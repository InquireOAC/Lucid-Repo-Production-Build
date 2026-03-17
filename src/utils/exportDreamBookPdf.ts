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

  // Border
  doc.setDrawColor(100, 80, 180);
  doc.setLineWidth(1);
  doc.roundedRect(10, 10, PW - 20, PH - 20, 4, 4);
  doc.setLineWidth(0.3);
  doc.roundedRect(13, 13, PW - 26, PH - 26, 3, 3);

  // Volume
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 160);
  doc.text("VOLUME I", PW / 2, 60, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);
  doc.setTextColor(220, 215, 240);
  doc.text("Dream Journal", PW / 2, 88, { align: "center" });

  // Divider
  doc.setDrawColor(100, 80, 180);
  doc.setLineWidth(0.6);
  doc.line(PW / 2 - 30, 96, PW / 2 + 30, 96);

  // Author
  const name = profile.display_name || profile.username || "Dreamer";
  doc.setFont("helvetica", "italic");
  doc.setFontSize(18);
  doc.setTextColor(160, 150, 200);
  doc.text(name, PW / 2, 115, { align: "center" });

  // Stats
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 95, 130);
  doc.text(`${count} dream${count !== 1 ? "s" : ""}`, PW / 2, 132, { align: "center" });
  if (dateRange) doc.text(dateRange, PW / 2, 140, { align: "center" });

  // Quote
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
    const title = d.title.length > 60 ? d.title.slice(0, 57) + "..." : d.title;
    doc.text(title, M + 22, y);
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

  // Dream spreads
  for (let i = 0; i < sorted.length; i++) {
    const dream = sorted[i];
    onProgress?.(i + 1, sorted.length);
    doc.addPage();

    // Right side warm paper
    doc.setFillColor(248, 244, 237);
    doc.rect(HALF, 0, HALF, PH, "F");

    // Left: image or placeholder
    const imgUrl = dream.generatedImage || dream.image_url;
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
      } else {
        drawPlaceholder(doc, dream.title);
      }
    } else {
      drawPlaceholder(doc, dream.title);
    }

    // Spine
    doc.setDrawColor(200, 195, 210);
    doc.setLineWidth(0.3);
    doc.line(HALF, 0, HALF, PH);

    // Right side text
    const rx = HALF + M;
    let y = M + 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(50, 35, 80);
    const tl = doc.splitTextToSize(dream.title, TW);
    doc.text(tl, rx, y + 5);
    y += tl.length * 7 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 110, 140);
    let meta = "";
    try { meta = format(new Date(dream.date), "MMMM d, yyyy"); } catch { meta = dream.date; }
    if (dream.mood) meta += ` · ${dream.mood}`;
    if (dream.lucid) meta += " · ✦ Lucid";
    doc.text(meta, rx, y + 3);
    y += 8;

    if (dream.tags?.length) {
      doc.setFontSize(8);
      doc.setTextColor(100, 80, 160);
      doc.setFont("helvetica", "italic");
      doc.text(dream.tags.map((t) => `#${t}`).join("  "), rx, y + 2);
      y += 7;
    }

    doc.setDrawColor(200, 190, 215);
    doc.setLineWidth(0.3);
    doc.line(rx, y, rx + TW, y);
    y += 5;

    if (dream.content) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 45, 60);
      const cl = doc.splitTextToSize(dream.content, TW);
      const maxY = dream.analysis ? PH - 55 : PH - 20;
      for (const line of cl) {
        if (y > maxY) break;
        doc.text(line, rx, y);
        y += 4.5;
      }
      y += 4;
    }

    if (dream.analysis && y < PH - 40) {
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
      const al = doc.splitTextToSize(dream.analysis, TW);
      for (const line of al) {
        if (y > PH - 15) break;
        doc.text(line, rx, y);
        y += 4;
      }
    }

    // Page numbers
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(String(i * 2 + 3), M, PH - 8);
    doc.text(String(i * 2 + 4), PW - M, PH - 8, { align: "right" });
  }

  // End page
  doc.addPage();
  drawEndPage(doc);

  return doc.output("blob");
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
