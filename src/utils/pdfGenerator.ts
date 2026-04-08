import jsPDF from "jspdf";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";

export type QuoteItem = {
  inputs: CalculatorInputs;
  results: CalculationResults;
};

export const generateQuotePDF = (items: QuoteItem[]) => {
  if (!items.length) return;

  const pdf   = new jsPDF({ unit: "mm", format: "a4" });
  const PW    = 210;
  const PH    = 297;
  const M     = 18;
  const TW    = PW - M * 2;
  const BLUE: [number,number,number]  = [26, 86, 219];
  const WHITE: [number,number,number] = [255,255,255];
  const DARK:  [number,number,number] = [20, 25, 40];
  const GRAY:  [number,number,number] = [100,110,130];
  const LGRAY: [number,number,number] = [220,224,232];
  const BGLT:  [number,number,number] = [247,248,252];

  let y = 0;
  const quoteNo  = `ORC-${Date.now().toString().slice(-6)}`;
  const today    = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });
  const client   = items[0]?.inputs?.clientName || "Cliente";

  const money = (v: number, round?: boolean) => {
    const n = Number.isFinite(v) ? v : 0;
    return round
      ? "R$ " + Math.round(n).toLocaleString("pt-BR")
      : "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits:2, maximumFractionDigits:2 });
  };

  const clip = (text: string, maxW: number) => {
    const t = (text || "").trim();
    if (!t || pdf.getTextWidth(t) <= maxW) return t;
    let s = t;
    while (s.length && pdf.getTextWidth(s + "…") > maxW) s = s.slice(0, -1);
    return s.length ? s + "…" : "";
  };

  /* ── Header ── */
  const drawHeader = () => {
    pdf.setFillColor(...BLUE);
    pdf.rect(0, 0, PW, 50, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(...WHITE);
    pdf.text("MALLKI PRINT", M, 21);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(200, 210, 255);
    pdf.text("Impressão 3D Profissional", M, 30);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...WHITE);
    pdf.text("ORÇAMENTO", PW - M, 20, { align: "right" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(200, 210, 255);
    pdf.text(quoteNo, PW - M, 28, { align: "right" });
    pdf.text(today,   PW - M, 36, { align: "right" });
  };

  /* ── Info cliente ── */
  const drawClientBlock = () => {
    y = 60;
    pdf.setFillColor(...BGLT);
    pdf.roundedRect(M, y, TW, 24, 3, 3, "F");
    pdf.setDrawColor(...LGRAY);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(M, y, TW, 24, 3, 3, "S");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GRAY);
    pdf.text("CLIENTE",   M  + 6, y + 8);
    pdf.text("VALIDADE",  PW / 2, y + 8);
    pdf.text("CONDIÇÕES", PW - M - 44, y + 8);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...DARK);
    pdf.text(client,        M + 6,         y + 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("30 dias",     PW / 2,        y + 18);
    pdf.text("A combinar",  PW - M - 44,   y + 18);

    y += 32;
  };

  /* ── Cabeçalho da tabela ── */
  const COLS = [
    { label: "Qtd.",         w: 12, align: "center" as const },
    { label: "Descrição",    w: 52, align: "left"   as const },
    { label: "Material",     w: 22, align: "center" as const },
    { label: "Peso (g)",     w: 20, align: "right"  as const },
    { label: "Tempo",        w: 22, align: "right"  as const },
    { label: "Vlr. Total",   w: 26, align: "right"  as const },
    { label: "Vlr. Unit.",   w: 20, align: "right"  as const },
  ];
  const ROW_H  = 10;
  const HEAD_H = 9;

  const cell = (text: string, x: number, w: number, yPos: number, align: "left"|"center"|"right", maxW?: number) => {
    const t = maxW ? clip(text, maxW) : text;
    const P = 3;
    if (align === "right")  pdf.text(t, x + w - P, yPos, { align: "right" });
    else if (align === "center") pdf.text(t, x + w / 2, yPos, { align: "center" });
    else pdf.text(t, x + P, yPos);
  };

  const drawTableHead = () => {
    pdf.setFillColor(...BLUE);
    pdf.rect(M, y, TW, HEAD_H, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...WHITE);
    let x = M;
    COLS.forEach((c) => { cell(c.label, x, c.w, y + 6, c.align); x += c.w; });
    y += HEAD_H;
  };

  const ensureSpace = (n: number) => {
    if (y + n > PH - 38) {
      pdf.addPage();
      drawHeader();
      y = 60;
      drawTableHead();
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...DARK);
    }
  };

  /* ── Render ── */
  drawHeader();
  drawClientBlock();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...DARK);
  pdf.text("ITENS DO ORÇAMENTO", M, y);
  y += 5;

  drawTableHead();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...DARK);

  let grandTotal = 0;

  items.forEach(({ inputs, results }, i) => {
    ensureSpace(ROW_H + 2);
    const qty   = Math.max(1, Number(inputs.quantity) || 1);
    const round = !!inputs.roundPrice;
    const useW  = !!inputs.useWholesalePrice && (inputs.wholesaleDiscount ?? 0) > 0;
    const raw   = useW ? Number(results.wholesalePrice) : Number(results.finalPriceWithFee);
    const total = round ? Math.round(raw) : raw;
    const unit  = total / qty;
    grandTotal += total;

    const th = Math.floor(results.totalTime);
    const tm = Math.round((results.totalTime - th) * 60);

    // Fundo zebra
    pdf.setFillColor(...(i % 2 === 0 ? BGLT : WHITE));
    pdf.rect(M, y, TW, ROW_H, "F");

    const ty = y + 6.5;
    let x = M;
    const row = [
      { v: String(qty),                         align: "center" as const },
      { v: inputs.pieceName || "—",             align: "left"   as const },
      { v: inputs.material  || "",              align: "center" as const },
      { v: (inputs.filamentUsed ?? 0).toFixed(1), align: "right"  as const },
      { v: `${th}h ${tm}m`,                    align: "right"  as const },
      { v: money(total, round),                  align: "right"  as const },
      { v: money(unit,  round),                  align: "right"  as const },
    ];

    row.forEach((r, ci) => {
      if (ci === 5) { pdf.setFont("helvetica", "bold"); pdf.setTextColor(...BLUE); }
      else          { pdf.setFont("helvetica", "normal"); pdf.setTextColor(...DARK); }
      cell(r.v, x, COLS[ci].w, ty, r.align, ci === 1 ? COLS[ci].w - 6 : undefined);
      x += COLS[ci].w;
    });

    // Imagem
    const img: string | undefined = (inputs as any).productImage;
    if (img) {
      try {
        const fmt2 = img.startsWith("data:image/png") ? "PNG" : "JPEG";
        pdf.addImage(img, fmt2, M + COLS[0].w + 1, y + 1.5, ROW_H - 3, ROW_H - 3);
      } catch {}
    }

    pdf.setDrawColor(...LGRAY);
    pdf.setLineWidth(0.2);
    pdf.line(M, y + ROW_H, M + TW, y + ROW_H);
    y += ROW_H;
  });

  /* ── Total ── */
  ensureSpace(36);
  y += 5;
  pdf.setFillColor(...BLUE);
  pdf.roundedRect(M + TW - 78, y, 78, 16, 3, 3, "F");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(200, 210, 255);
  pdf.text("TOTAL GERAL", M + TW - 78 + 5, y + 7);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...WHITE);
  pdf.text(money(grandTotal), M + TW - 4, y + 13, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GRAY);
  pdf.text(
    `${items.length} item(s) · ${items.reduce((s, it) => s + Math.max(1, it.inputs.quantity || 1), 0)} peça(s)`,
    M, y + 10
  );
  y += 24;

  /* Notas */
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRAY);
  ["• Orçamento válido por 30 dias.", "• Valores sujeitos a alteração.", "• Prazo de produção a confirmar após aprovação."]
    .forEach((n, i) => pdf.text(n, M, y + i * 5));

  /* Footer */
  pdf.setDrawColor(...LGRAY);
  pdf.setLineWidth(0.3);
  pdf.line(M, PH - 14, PW - M, PH - 14);
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRAY);
  pdf.text("MALLKI PRINT — Impressão 3D Profissional", M,    PH - 8);
  pdf.text(quoteNo,                                   PW - M, PH - 8, { align: "right" });

  /* Nome do arquivo */
  const slug = (client || "cliente")
    .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  pdf.save(`orcamento-${slug}-${quoteNo}.pdf`);
};
