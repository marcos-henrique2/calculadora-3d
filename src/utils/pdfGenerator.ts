import jsPDF from "jspdf";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";

export const generateQuotePDF = (
  inputsOrItems:
    | CalculatorInputs
    | { inputs: CalculatorInputs; results: CalculationResults }[],
  resultsParam?: CalculationResults
) => {
  const items: { inputs: CalculatorInputs; results: CalculationResults }[] =
    Array.isArray(inputsOrItems)
      ? (inputsOrItems as { inputs: CalculatorInputs; results: CalculationResults }[])
      : [{ inputs: inputsOrItems as CalculatorInputs, results: resultsParam as CalculationResults }];

  if (!items.length) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  const primaryColor: [number, number, number] = [21, 89, 179];
  const white: [number, number, number] = [255, 255, 255];

  const margin = 16;
  const pageWidth = 210;
  const pageHeight = 297;
  const tableWidth = pageWidth - margin * 2;

  let y = margin;

  const today = new Date().toLocaleDateString("pt-BR");
  const clientName = items[0]?.inputs?.clientName || "Cliente";

  const money = (v: number, round?: boolean) => {
    const n = Number.isFinite(v) ? v : 0;
    return round ? n.toFixed(0) : n.toFixed(2);
  };

  // ✅ Trunca pela largura REAL da célula
  const fitTextToWidth = (text: string, maxWidth: number) => {
    const t = (text ?? "").toString().trim();
    if (!t) return "";
    if (pdf.getTextWidth(t) <= maxWidth) return t;

    let cut = t;
    while (cut.length > 0 && pdf.getTextWidth(cut + "…") > maxWidth) {
      cut = cut.slice(0, -1);
    }
    return cut.length ? cut + "…" : "";
  };

  const drawHeader = () => {
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 40, "F");

    pdf.setTextColor(...white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("ORÇAMENTO", margin, 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.text("MALLKI PRINT", margin, 32);
  };

  const drawClientInfo = () => {
    y = 55;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);

    pdf.text(`Cliente: ${clientName}`, margin, y);
    y += 8;
    pdf.text(`Data: ${today}`, margin, y);
    y += 14;

    pdf.setFont("helvetica", "bold");
    pdf.text("ITENS", margin, y);
    y += 8;
  };

  // ✅ Colunas fixas + Descrição adaptável
  const COL_QTD = 12;
  const COL_MATERIAL = 18;
  const COL_PESO = 20;
  const COL_TEMPO = 24;
  const COL_TOTAL = 24;
  const COL_UNID = 24;
  const COL_DESC = tableWidth - (COL_QTD + COL_MATERIAL + COL_PESO + COL_TEMPO + COL_TOTAL + COL_UNID);

  const cols = [
    { label: "Qtd.", w: COL_QTD, align: "center" as const },
    { label: "Descrição", w: COL_DESC, align: "left" as const },
    { label: "Material", w: COL_MATERIAL, align: "center" as const },
    { label: "Peso (g)", w: COL_PESO, align: "center" as const },
    { label: "Tempo (h:m)", w: COL_TEMPO, align: "center" as const },
    { label: "Valor Total", w: COL_TOTAL, align: "right" as const },
    { label: "Valor Unid.", w: COL_UNID, align: "right" as const },
  ];

  const headerH = 9;
  const rowH = 9;

  const drawCellText = (
    text: string,
    x: number,
    w: number,
    yText: number,
    align: "left" | "center" | "right"
  ) => {
    const padding = 2;

    if (align === "right") {
      pdf.text(text, x + w - padding, yText, { align: "right" });
      return;
    }

    if (align === "center") {
      pdf.text(text, x + w / 2, yText, { align: "center" });
      return;
    }

    pdf.text(text, x + padding, yText);
  };

  const drawTableHeader = () => {
    pdf.setFillColor(...primaryColor);
    pdf.rect(margin, y, tableWidth, headerH, "F");

    pdf.setTextColor(...white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    let x = margin;
    cols.forEach((c) => {
      // header alinhado por coluna
      drawCellText(c.label, x, c.w, y + 6, c.align);
      x += c.w;
    });

    y += headerH;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      pdf.addPage();
      drawHeader();
      y = 55;
      drawTableHeader();
    }
  };

  const drawFooter = () => {
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text("Orçamento válido por 30 dias. Valores sujeitos a alteração.", margin, 285);
  };

  // Render
  drawHeader();
  drawClientInfo();
  drawTableHeader();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  let grandTotal = 0;

  items.forEach((item) => {
    ensureSpace(rowH + 2);

    const inputs = item.inputs;
    const results = item.results;

    const qty = Math.max(1, Number(inputs.quantity) || 1);
    const round = !!inputs.roundPrice;

    const totalPriceRaw = Number(results.finalPriceWithFee) || 0;
    const totalPrice = round ? Math.round(totalPriceRaw) : totalPriceRaw;
    const unitPrice = totalPrice / qty;

    grandTotal += totalPrice;

    const totalHours = Number(results.totalTime) || 0;
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    const timeStr = `${h}h ${m}m`;

    // linha branca (azul+branco)
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y, tableWidth, rowH, "F");

    // descrição “responsiva” e truncada pela largura real
    const descMaxWidth = cols[1].w - 4;
    const desc = fitTextToWidth(inputs.pieceName || "", descMaxWidth);

    const values = [
      { v: String(qty), align: "center" as const },
      { v: desc, align: "left" as const },
      { v: inputs.material || "", align: "center" as const },
      { v: inputs.filamentUsed ? inputs.filamentUsed.toFixed(2) : "0.00", align: "center" as const },
      { v: timeStr, align: "center" as const },
      { v: `R$ ${money(totalPrice, round)}`, align: "right" as const },
      { v: `R$ ${money(unitPrice, round)}`, align: "right" as const },
    ];

    const textY = y + 6;
    let x = margin;

    values.forEach((cell, i) => {
      drawCellText(cell.v, x, cols[i].w, textY, cell.align);
      x += cols[i].w;
    });

    // separador azul fino
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y + rowH, margin + tableWidth, y + rowH);

    y += rowH;
  });

  // Total geral
  ensureSpace(16);
  pdf.setFillColor(...primaryColor);
  pdf.rect(margin, y + 3, tableWidth, 10, "F");

  pdf.setTextColor(...white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.text("TOTAL GERAL", margin + 2, y + 10);
  pdf.text(`R$ ${money(grandTotal, false)}`, margin + tableWidth - 2, y + 10, { align: "right" });

  y += 20;

  // Condições + assinatura
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  ensureSpace(30);
  pdf.text("Pagamento: 40% junto ao pedido e 60% na entrega", margin, y);
  y += 7;
  pdf.text("Prazo: 7 Dias Úteis", margin, y);
  y += 20;

  pdf.setTextColor(80, 80, 80);
  pdf.text("_________________________", margin, y);
  pdf.text("Anna Vitória", margin, y + 6);
  pdf.text("Orçamentista", margin, y + 12);

  drawFooter();

  const clientSlug = (clientName || "cliente")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  const pieceSlug =
    items.length > 1
      ? "multi-itens"
      : (items[0].inputs.pieceName || "peca")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "");

  pdf.save(`orcamento-${clientSlug}-${pieceSlug}.pdf`);
};
