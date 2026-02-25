
import { jsPDF } from "jspdf";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";

interface ProfileInfo {
  display_name?: string | null;
  username?: string | null;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

async function loadImageAsBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 5000);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { clearTimeout(timeout); resolve(null); };
    img.src = url;
  });
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: "center" });
}

function addCoverPage(doc: jsPDF, profile: ProfileInfo, dreamCount: number, dateRange: string) {
  // Decorative border
  doc.setDrawColor(120, 100, 180);
  doc.setLineWidth(1.5);
  doc.roundedRect(12, 12, PAGE_WIDTH - 24, PAGE_HEIGHT - 24, 6, 6);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 15, PAGE_WIDTH - 30, PAGE_HEIGHT - 30, 4, 4);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(60, 40, 100);
  doc.text("Dream Journal", PAGE_WIDTH / 2, 100, { align: "center" });

  // Decorative line
  doc.setDrawColor(120, 100, 180);
  doc.setLineWidth(0.8);
  doc.line(60, 112, PAGE_WIDTH - 60, 112);

  // Author
  const authorName = profile.display_name || profile.username || "Dreamer";
  doc.setFont("helvetica", "italic");
  doc.setFontSize(18);
  doc.setTextColor(100, 80, 140);
  doc.text(authorName, PAGE_WIDTH / 2, 130, { align: "center" });

  // Stats
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(120, 120, 140);
  doc.text(`${dreamCount} dream${dreamCount !== 1 ? "s" : ""}`, PAGE_WIDTH / 2, 155, { align: "center" });
  if (dateRange) {
    doc.text(dateRange, PAGE_WIDTH / 2, 165, { align: "center" });
  }

  // Footer quote
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 170);
  doc.text('"Dreams are the royal road to the unconscious."', PAGE_WIDTH / 2, PAGE_HEIGHT - 40, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("— Sigmund Freud", PAGE_WIDTH / 2, PAGE_HEIGHT - 33, { align: "center" });
}

export async function exportDreamJournalPdf(
  dreams: DreamEntry[],
  profile: ProfileInfo,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const sorted = [...dreams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = sorted.length + 1; // cover + entries

  // Date range
  let dateRange = "";
  if (sorted.length > 0) {
    const earliest = sorted[sorted.length - 1].date;
    const latest = sorted[0].date;
    try {
      dateRange = `${format(new Date(earliest), "MMM d, yyyy")} — ${format(new Date(latest), "MMM d, yyyy")}`;
    } catch { /* skip */ }
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Cover
  addCoverPage(doc, profile, sorted.length, dateRange);

  // Dream entries
  for (let i = 0; i < sorted.length; i++) {
    const dream = sorted[i];
    onProgress?.(i + 1, sorted.length);
    doc.addPage();

    let y = MARGIN;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(40, 30, 70);
    const titleLines = doc.splitTextToSize(dream.title, CONTENT_WIDTH);
    doc.text(titleLines, MARGIN, y + 6);
    y += titleLines.length * 8 + 4;

    // Date & mood
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 140);
    let meta = "";
    try { meta = format(new Date(dream.date), "MMMM d, yyyy"); } catch { meta = dream.date; }
    if (dream.mood) meta += `  •  ${dream.mood}`;
    if (dream.lucid) meta += "  •  🌟 Lucid";
    doc.text(meta, MARGIN, y + 4);
    y += 10;

    // Tags
    if (dream.tags && dream.tags.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100, 80, 160);
      doc.text(dream.tags.map(t => `#${t}`).join("  "), MARGIN, y + 3);
      y += 8;
    }

    // Divider
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;

    // Image
    const imageUrl = dream.generatedImage || dream.image_url;
    if (imageUrl) {
      const base64 = await loadImageAsBase64(imageUrl);
      if (base64) {
        const img = new Image();
        img.src = base64;
        await new Promise(r => { img.onload = r; img.onerror = r; });
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let imgW = CONTENT_WIDTH;
        let imgH = imgW / aspectRatio;
        const maxImgH = 100;
        if (imgH > maxImgH) { imgH = maxImgH; imgW = imgH * aspectRatio; }
        const imgX = MARGIN + (CONTENT_WIDTH - imgW) / 2;

        if (y + imgH > PAGE_HEIGHT - 30) { doc.addPage(); y = MARGIN; }
        doc.addImage(base64, "JPEG", imgX, y, imgW, imgH);
        y += imgH + 8;
      }
    }

    // Content
    if (dream.content) {
      if (y > PAGE_HEIGHT - 60) { doc.addPage(); y = MARGIN; }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 60);
      const contentLines = doc.splitTextToSize(dream.content, CONTENT_WIDTH);
      for (const line of contentLines) {
        if (y > PAGE_HEIGHT - 20) { doc.addPage(); y = MARGIN; }
        doc.text(line, MARGIN, y);
        y += 5;
      }
      y += 6;
    }

    // Analysis
    if (dream.analysis) {
      if (y > PAGE_HEIGHT - 50) { doc.addPage(); y = MARGIN; }
      doc.setDrawColor(180, 170, 210);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(80, 60, 120);
      doc.text("Dream Analysis", MARGIN, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 80);
      const analysisLines = doc.splitTextToSize(dream.analysis, CONTENT_WIDTH);
      for (const line of analysisLines) {
        if (y > PAGE_HEIGHT - 20) { doc.addPage(); y = MARGIN; }
        doc.text(line, MARGIN, y);
        y += 4.5;
      }
    }
  }

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 2; p <= pageCount; p++) {
    doc.setPage(p);
    addFooter(doc, p - 1, pageCount - 1);
  }

  return doc.output("blob");
}
