import jsPDF from "jspdf";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { formatBRL } from "@/utils/calculator";

export type QuoteItem = {
  inputs: CalculatorInputs;
  results: CalculationResults;
};

export const generateQuotePDF = (
  inputsOrItems:
    | CalculatorInputs
    | { inputs: CalculatorInputs; results: CalculationResults }[],
  resultsParam?: CalculationResults
) => {
  const items: QuoteItem[] = Array.isArray(inputsOrItems)
    ? (inputsOrItems as QuoteItem[])
    : [{ inputs: inputsOrItems as CalculatorInputs, results: resultsParam as CalculationResults }];

  if (!items.length) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  // ─── Design tokens ───
  const PRIMARY: [number, number, number] = [21, 89, 179];
  const PRIMARY_LIGHT: [number, number, number] = [235, 242, 254];
  const TEXT_DARK: [number, number, number] = [20, 25, 40];
  const TEXT_MID: [number, number, number] = [80, 90, 110];
  const TEXT_LIGHT: [number, number, number] = [140, 150, 165];
  const WHITE: [number, number, number] = [255, 255, 255];
  const BG_LIGHT: [number, number, number] = [248, 249, 252];
  const BORDER: [number, number, number] = [220, 225, 235];
  const SUCCESS: [number, number, number] = [34, 120, 60];

  const PAGE_W = 210;
  const PAGE_H = 297;
  const M = 18; // margin
  const TABLE_W = PAGE_W - M * 2;

  let y = 0;
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const clientName = items[0]?.inputs?.clientName || "Cliente";
  const quoteNumber = `ORC-${Date.now().toString().slice(-6)}`;

  const money = (v: number, round?: boolean) => {
    const n = Number.isFinite(v) ? v : 0;
    if (round) return `R$ ${Math.round(n).toLocaleString("pt-BR")}`;
    return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const truncate = (text: string, maxW: number): string => {
    const t = (text ?? "").toString().trim();
    if (!t) return "";
    if (pdf.getTextWidth(t) <= maxW) return t;
    let cut = t;
    while (cut.length > 0 && pdf.getTextWidth(cut + "…") > maxW) {
      cut = cut.slice(0, -1);
    }
    return cut.length ? cut + "…" : "";
  };

  // ─── Header ───
  const drawHeader = () => {
    // Background band
    pdf.setFillColor(...PRIMARY);
    pdf.rect(0, 0, PAGE_W, 52, "F");

    // Subtle diagonal accent
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.04 }));
    pdf.triangle(PAGE_W - 60, 0, PAGE_W, 0, PAGE_W, 52, "F");
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

    // Brand name
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(...WHITE);
    pdf.text("MALLKI PRINT", M, 22);

    // Tagline
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setGState && pdf.setGState(new (pdf as any).GState({ opacity: 0.7 }));
    pdf.text("Impressão 3D Profissional", M, 30);
    try { pdf.setGState(new (pdf as any).GState({ opacity: 1 })); } catch {}

    // "Orçamento" label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...WHITE);
    pdf.text("ORÇAMENTO", PAGE_W - M, 18, { align: "right" });

    // Quote number
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(quoteNumber, PAGE_W - M, 26, { align: "right" });
    pdf.text(today, PAGE_W - M, 34, { align: "right" });
  };

  // ─── Client info block ───
  const drawClientInfo = () => {
    y = 62;
    pdf.setFillColor(...BG_LIGHT);
    pdf.roundedRect(M, y, TABLE_W, 26, 3, 3, "F");
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(M, y, TABLE_W, 26, 3, 3, "S");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...TEXT_LIGHT);
    pdf.text("CLIENTE", M + 6, y + 8);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...TEXT_DARK);
    pdf.text(clientName, M + 6, y + 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...TEXT_LIGHT);
    pdf.text("VALIDADE", PAGE_W / 2, y + 8);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...TEXT_MID);
    pdf.text("30 dias", PAGE_W / 2, y + 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...TEXT_LIGHT);
    pdf.text("CONDIÇÕES", PAGE_W - M - 45, y + 8);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...TEXT_MID);
    pdf.text("A combinar", PAGE_W - M - 45, y + 18);

    y += 34;
  };

  // ─── Table ───
  const COLS = [
    { label: "Qtd.", w: 12, align: "center" as const },
    { label: "Descrição", w: 52, align: "left" as const },
    { label: "Material", w: 22, align: "center" as const },
    { label: "Peso (g)", w: 20, align: "right" as const },
    { label: "Tempo", w: 22, align: "right" as const },
    { label: "Vlr. Total", w: 26, align: "right" as const },
    { label: "Vlr. Unit.", w: 20, align: "right" as const },
  ];

  const ROW_H = 10;
  const HEADER_H = 9;

  const drawTableHeader = () => {
    pdf.setFillColor(...PRIMARY);
    pdf.rect(M, y, TABLE_W, HEADER_H, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...WHITE);

    let x = M;
    COLS.forEach((col) => {
      const pad = 3;
      if (col.align === "right") {
        pdf.text(col.label, x + col.w - pad, y + 6, { align: "right" });
      } else if (col.align === "center") {
        pdf.text(col.label, x + col.w / 2, y + 6, { align: "center" });
      } else {
        pdf.text(col.label, x + pad, y + 6);
      }
      x += col.w;
    });
    y += HEADER_H;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - 40) {
      pdf.addPage();
      drawHeader();
      y = 62;
      drawTableHeader();
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_DARK);
    }
  };

  const drawCell = (
    text: string,
    x: number,
    w: number,
    yPos: number,
    align: "left" | "center" | "right",
    maxW?: number
  ) => {
    const pad = 3;
    const display = maxW ? truncate(text, maxW) : text;
    if (align === "right") {
      pdf.text(display, x + w - pad, yPos, { align: "right" });
    } else if (align === "center") {
      pdf.text(display, x + w / 2, yPos, { align: "center" });
    } else {
      pdf.text(display, x + pad, yPos);
    }
  };

  // ─── Render ───
  drawHeader();
  drawClientInfo();

  // Section title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...TEXT_DARK);
  pdf.text("ITENS DO ORÇAMENTO", M, y);
  y += 5;

  drawTableHeader();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...TEXT_DARK);

  let grandTotal = 0;

  items.forEach((item, i) => {
    ensureSpace(ROW_H + 2);
    const { inputs, results } = item;
    const qty = Math.max(1, Number(inputs.quantity) || 1);
    const round = !!inputs.roundPrice;
    const useW =
      !!inputs.useWholesalePrice && (inputs.wholesaleDiscount ?? 0) > 0;
    const totalPriceRaw = useW
      ? Number(results.wholesalePrice) || 0
      : Number(results.finalPriceWithFee) || 0;
    const totalPrice = round ? Math.round(totalPriceRaw) : totalPriceRaw;
    const unitPrice = totalPrice / qty;
    grandTotal += totalPrice;

    const totalH = Math.floor(results.totalTime);
    const totalM = Math.round((results.totalTime - totalH) * 60);
    const timeStr = `${totalH}h ${totalM}m`;

    // Row background
    if (i % 2 === 0) {
      pdf.setFillColor(...BG_LIGHT);
    } else {
      pdf.setFillColor(255, 255, 255);
    }
    pdf.rect(M, y, TABLE_W, ROW_H, "F");

    const textY = y + 6.5;
    let x = M;

    const rowData = [
      { v: String(qty), align: "center" as const },
      { v: inputs.pieceName || "—", align: "left" as const },
      { v: inputs.material || "", align: "center" as const },
      { v: (inputs.filamentUsed ?? 0).toFixed(1), align: "right" as const },
      { v: timeStr, align: "right" as const },
      { v: money(totalPrice, round), align: "right" as const },
      { v: money(unitPrice, round), align: "right" as const },
    ];

    rowData.forEach((cell, ci) => {
      const col = COLS[ci];
      const maxW = ci === 1 ? col.w - 6 : undefined;
      // Highlight value column
      if (ci === 5) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...PRIMARY);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...TEXT_DARK);
      }
      drawCell(cell.v, x, col.w, textY, cell.align, maxW);
      x += col.w;
    });

    // Bottom row border
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.2);
    pdf.line(M, y + ROW_H, M + TABLE_W, y + ROW_H);

    // Product image
    const img: string | undefined = (inputs as any).productImage;
    if (img) {
      try {
        const fmt2 = img.startsWith("data:image/png") ? "PNG" : "JPEG";
        const imgSize = ROW_H - 3;
        // Shrink row to fit image (just overlay a small thumbnail in desc column)
        pdf.addImage(img, fmt2, M + COLS[0].w + 1, y + 1.5, imgSize, imgSize);
      } catch {}
    }

    y += ROW_H;
  });

  // ─── Summary totals ───
  ensureSpace(40);
  y += 4;

  // Grand total box
  pdf.setFillColor(...PRIMARY);
  pdf.roundedRect(M + TABLE_W - 80, y, 80, 18, 3, 3, "F");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...WHITE);
  pdf.setGState && pdf.setGState(new (pdf as any).GState({ opacity: 0.75 }));
  pdf.text("TOTAL GERAL", M + TABLE_W - 80 + 5, y + 7);
  try { pdf.setGState(new (pdf as any).GState({ opacity: 1 })); } catch {}
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(...WHITE);
  pdf.text(money(grandTotal, false), M + TABLE_W - 5, y + 13.5, {
    align: "right",
  });

  // Item count
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...TEXT_MID);
  pdf.text(
    `${items.length} item(s) • ${items.reduce((s, i) => s + Math.max(1, i.inputs.quantity || 1), 0)} peça(s) no total`,
    M,
    y + 11
  );

  y += 26;

  // ─── Notes ───
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...TEXT_LIGHT);
  pdf.text(
    "• Orçamento válido por 30 dias a partir da data de emissão.",
    M,
    y
  );
  pdf.text("• Valores sujeitos a alteração conforme disponibilidade de material.", M, y + 5);
  pdf.text("• Prazo de produção a confirmar após aprovação.", M, y + 10);

  // ─── Footer ───
  const footerY = PAGE_H - 14;
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.3);
  pdf.line(M, footerY - 3, PAGE_W - M, footerY - 3);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...TEXT_LIGHT);
  pdf.text("MALLKI PRINT — Impressão 3D Profissional", M, footerY + 2);
  pdf.text(quoteNumber, PAGE_W - M, footerY + 2, { align: "right" });

  // ─── Save ───
  const slug = (clientName || "cliente")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  pdf.save(`orcamento-${slug}-${quoteNumber}.pdf`);
};