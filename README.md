# Calculadora 3D Pro — Melhorias v2.0

## Arquivos modificados/criados

### Layout & UX
- **`src/pages/Index.tsx`** — Layout dividido em duas colunas fixas:
  - Esquerda (340px): formulário com scroll independente
  - Direita: painel de resultados com scroll independente
  - Header com altura fixa (64px), tabs com 48px
  - Tela toda ocupa `100vh` sem overflow externo
  - Estado vazio animado com passos visuais

- **`src/components/CalculatorForm.tsx`** — Formulário redesenhado:
  - Tipografia DM Sans + DM Mono nos campos numéricos
  - Seções com ícone + título + descrição
  - Labels com uppercase + letter-spacing
  - Campos numéricos com `font-mono` para clareza
  - Upload de imagem com preview elegante
  - Grid 2 colunas responsivo dentro de cada seção
  - Campos de tempo com sufixo "h" e "min" embutido

### Resultados
- **`src/components/ResultsPanel.tsx`** — Componente novo (substitui CalculationCard + ResultsDisplay):
  - Hero card azul com preço principal + margem líquida + preço de atacado
  - Análise do preço desejado com ícones de status (baixo/ideal/alto)
  - Grid 2×2 de métricas (custo, lucro, preço final, tempo)
  - Simulador de margem com slider e preview em tempo real
  - Breakdown de custos collapsível com barras de proporção visual
  - Cards de ROI (peças para pagar impressora, meses, lucro mensal)
  - Toggle atacado integrado (aparece só quando desconto > 0)
  - Animação `fadeSlideIn` ao montar

### Orçamento
- **`src/components/QuoteTab.tsx`** — Redesenhado:
  - Imagem do produto com fallback de ícone
  - Badges de material estilizados
  - Confirmação de 2 cliques para limpar (segurança)
  - Total geral em destaque com contagem de itens
  - Estado vazio com guia de instruções

### Design System
- **`src/index.css`** — Sistema de design completo:
  - Fonte DM Sans (display) + DM Mono (números)
  - Tokens: `--primary`, `--success`, `--warning`, `--destructive`, `--accent`
  - Custom scrollbar sutil
  - Range slider estilizado com thumb personalizado
  - Animações: `fadeSlideIn`, `scaleIn`, `shimmer` (skeleton)
  - Variáveis de sombra: `--shadow-sm/md/lg/xl`

- **`tailwind.config.ts`** — Atualizado:
  - `fontFamily.sans/mono` com DM Sans / DM Mono
  - Cores: `success`, `warning`, `accent.muted`, `primary.muted`
  - `borderRadius.xl` e `.2xl`
  - Animações registradas

### Utilitários
- **`src/utils/calculator.ts`** — Adicionado:
  - `netMarginPercent` nos resultados
  - `formatBRL(value, round?)` — função utilitária de formatação
  - `formatTime(hours)` — formatação de tempo

- **`src/types/calculator.ts`** — Adicionado:
  - Campo `netMarginPercent` em `CalculationResults`
  - Campo `productImage?` em `CalculatorInputs`

- **`src/utils/pdfGenerator.ts`** — PDF refeito:
  - Header com fundo primary e número de orçamento gerado (ORC-XXXXXX)
  - Bloco de info do cliente com validade e condições
  - Linhas zebradas na tabela
  - Caixa de total geral estilizada
  - Notas de rodapé sobre validade
  - Footer com linha separadora e número de orçamento
  - Nome do arquivo: `orcamento-{cliente}-{numero}.pdf`

## Como atualizar no projeto existente

1. Copie os arquivos nas pastas corretas (mesmos paths)
2. Verifique que `DM Sans` e `DM Mono` carregam — eles vêm do Google Fonts via `@import` no CSS
3. O componente `ResultsDisplay.tsx` e `CalculationCard.tsx` originais podem ser mantidos mas não são mais usados pelo `Index.tsx`
4. Rode `npm install` para garantir dependências (nenhuma nova dependência adicionada)
5. Rode `npm run dev`

## Dependências — nenhuma nova adicionada
Todos os pacotes já estavam no `package.json` original:
- `jspdf` — PDF
- `@hookform/resolvers` + `react-hook-form` + `zod` — formulário
- `@radix-ui/*` + `shadcn` — componentes UI
- `lucide-react` — ícones
- `@tanstack/react-query` — query (mantido para compatibilidade)