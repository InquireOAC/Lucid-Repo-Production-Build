
import { jsPDF } from "jspdf";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";

interface ProfileInfo {
  display_name?: string | null;
  username?: string | null;
}

// Landscape A4
const PAGE_WIDTH = 297;
const PAGE_HEIGHT = 210;
const HALF_W = PAGE_WIDTH / 2;
const MARGIN = 14;
const TEXT_WIDTH = HALF_W - MARGIN * 2;

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

function addPageNumbers(doc: jsPDF, leftNum: number, rightNum: number) {
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(String(leftNum), MARGIN, PAGE_HEIGHT - 8);
  doc.text(String(rightNum), PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: "right" });
}

function drawSpine(doc: jsPDF) {
  doc.setDrawColor(200, 195, 210);
  doc.setLineWidth(0.3);
  doc.line(HALF_W, 0, HALF_W, PAGE_HEIGHT);
}

function addCoverPage(doc: jsPDF, profile: ProfileInfo, dreamCount: number, dateRange: string) {
  // Warm background fill
  doc.setFillColor(245, 240, 230);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // Decorative border
  doc.setDrawColor(120, 100, 180);
  doc.setLineWidth(1.2);
  doc.roundedRect(10, 10, PAGE_WIDTH - 20, PAGE_HEIGHT - 20, 4, 4);
  doc.setLineWidth(0.4);
  doc.roundedRect(13, 13, PAGE_WIDTH - 26, PAGE_HEIGHT - 26, 3, 3);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(50, 35, 80);
  doc.text("Dream Journal", PAGE_WIDTH / 2, 80, { align: "center" });

  // Decorative line
  doc.setDrawColor(120, 100, 180);
  doc.setLineWidth(0.8);
  doc.line(100, 90, PAGE_WIDTH - 100, 90);

  // Author
  const authorName = profile.display_name || profile.username || "Dreamer";
  doc.setFont("helvetica", "italic");
  doc.setFontSize(20);
  doc.setTextColor(100, 80, 140);
  doc.text(authorName, PAGE_WIDTH / 2, 110, { align: "center" });

  // Stats
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(130, 130, 150);
  doc.text(`${dreamCount} dream${dreamCount !== 1 ? "s" : ""}`, PAGE_WIDTH / 2, 130, { align: "center" });
  if (dateRange) {
    doc.text(dateRange, PAGE_WIDTH / 2, 140, { align: "center" });
  }

  // Quote
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 170);
  doc.text('"Dreams are the royal road to the unconscious."', PAGE_WIDTH / 2, PAGE_HEIGHT - 35, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("— Sigmund Freud", PAGE_WIDTH / 2, PAGE_HEIGHT - 28, { align: "center" });
}

export async function exportDreamJournalPdf(
  dreams: DreamEntry[],
  profile: ProfileInfo,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const sorted = [...dreams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let dateRange = "";
  if (sorted.length > 0) {
    const earliest = sorted[sorted.length - 1].date;
    const latest = sorted[0].date;
    try {
      dateRange = `${format(new Date(earliest), "MMM d, yyyy")} — ${format(new Date(latest), "MMM d, yyyy")}`;
    } catch { /* skip */ }
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Cover page
  addCoverPage(doc, profile, sorted.length, dateRange);

  // Dream spreads
  for (let i = 0; i < sorted.length; i++) {
    const dream = sorted[i];
    onProgress?.(i + 1, sorted.length);
    doc.addPage();

    // Warm paper background for right page
    doc.setFillColor(248, 244, 237);
    doc.rect(HALF_W, 0, HALF_W, PAGE_HEIGHT, "F");

    // Left page: image or decorative placeholder
    const imageUrl = dream.generatedImage || dream.image_url;
    if (imageUrl) {
      const base64 = await loadImageAsBase64(imageUrl);
      if (base64) {
        const img = new Image();
        img.src = base64;
        await new Promise(r => { img.onload = r; img.onerror = r; });
        const ar = img.naturalWidth / img.naturalHeight;
        let imgW = HALF_W;
        let imgH = imgW / ar;
        if (imgH < PAGE_HEIGHT) {
          imgH = PAGE_HEIGHT;
          imgW = imgH * ar;
        }
        const imgX = (HALF_W - imgW) / 2;
        const imgY = (PAGE_HEIGHT - imgH) / 2;
        doc.addImage(base64, "JPEG", imgX, imgY, imgW, imgH);
      } else {
        drawPlaceholderLeft(doc, dream.title);
      }
    } else {
      drawPlaceholderLeft(doc, dream.title);
    }

    // Spine
    drawSpine(doc);

    // Right page: text content
    const rightX = HALF_W + MARGIN;
    let y = MARGIN + 4;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(50, 35, 80);
    const titleLines = doc.splitTextToSize(dream.title, TEXT_WIDTH);
    doc.text(titleLines, rightX, y + 5);
    y += titleLines.length * 7 + 4;

    // Date & mood
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 110, 140);
    let meta = "";
    try { meta = format(new Date(dream.date), "MMMM d, yyyy"); } catch { meta = dream.date; }
    if (dream.mood) meta += `  •  ${dream.mood}`;
    if (dream.lucid) meta += "  •  ✦ Lucid";
    doc.text(meta, rightX, y + 3);
    y += 8;

    // Tags
    if (dream.tags && dream.tags.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(100, 80, 160);
      doc.setFont("helvetica", "italic");
      doc.text(dream.tags.map(t => `#${t}`).join("  "), rightX, y + 2);
      y += 7;
    }

    // Divider
    doc.setDrawColor(200, 190, 215);
    doc.setLineWidth(0.3);
    doc.line(rightX, y, rightX + TEXT_WIDTH, y);
    y += 5;

    // Content
    if (dream.content) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 45, 60);
      const contentLines = doc.splitTextToSize(dream.content, TEXT_WIDTH);
      const maxContentY = dream.analysis ? PAGE_HEIGHT - 55 : PAGE_HEIGHT - 20;
      for (const line of contentLines) {
        if (y > maxContentY) break;
        doc.text(line, rightX, y);
        y += 4.5;
      }
      y += 4;
    }

    // Analysis
    if (dream.analysis) {
      if (y < PAGE_HEIGHT - 40) {
        doc.setDrawColor(180, 170, 210);
        doc.setLineWidth(0.3);
        doc.line(rightX, y, rightX + TEXT_WIDTH, y);
        y += 5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(80, 60, 120);
        doc.text("Dream Analysis", rightX, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(70, 65, 80);
        const analysisLines = doc.splitTextToSize(dream.analysis, TEXT_WIDTH);
        for (const line of analysisLines) {
          if (y > PAGE_HEIGHT - 15) break;
          doc.text(line, rightX, y);
          y += 4;
        }
      }
    }

    // Page numbers
    addPageNumbers(doc, i * 2 + 1, i * 2 + 2);
  }

  return doc.output("blob");
}

function drawPlaceholderLeft(doc: jsPDF, title: string) {
  // Dark gradient-like fill
  doc.setFillColor(40, 30, 60);
  doc.rect(0, 0, HALF_W, PAGE_HEIGHT, "F");

  // Lighter overlay shape
  doc.setFillColor(55, 45, 80);
  doc.triangle(0, PAGE_HEIGHT, HALF_W, 0, HALF_W, PAGE_HEIGHT, "F");

  // Title overlay
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(180, 170, 210);
  const lines = doc.splitTextToSize(title, HALF_W - 30);
  doc.text(lines, HALF_W / 2, PAGE_HEIGHT / 2, { align: "center" });
}
