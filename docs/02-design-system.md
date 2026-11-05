# 02 · Design system

Fonte de verdade: o protótipo. Os valores abaixo são os **finais** do protótipo. Em caso de divergência entre este documento e o protótipo, vale o protótipo. As variáveis de cor estão em [`tokens.css`](tokens.css) e devem ser copiadas sem alteração.

## 1. Identidade

| Item | Valor |
|---|---|
| Estilo | iOS (Ajustes), limpo, chapado: sem degradês em interface e **sem sombra em cards**. Sombra só no menu flutuante do celular |
| Cor principal | Laranja da Silper. Botões e seleção: `--primary #C94F07` com texto branco (contraste 4,56:1) |
| Cor secundária | Azul da Silper. Botão secundário: fundo `--blue-light`, texto `--blue-text` |
| Laranja vivo | `--accent #F47A22`, só decoração (pontos, detalhes). **Nunca** como fundo de texto |
| Neutros | Escala do iOS (`--bg`, `--surface`, `--text-*`), nos modos claro e escuro |
| Fonte | Do sistema: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif`. **Sempre com a pilha completa** (um `font-family` com só `-apple-system` cai em serifa fora da Apple) |
| Idioma | pt-BR |

### Marca

| Arquivo | Uso |
|---|---|
| `silper_logo.svg` | Logo completa, fundo claro (menu lateral do desktop) |
| `silper_logo_fundo_escuro.svg` | Logo completa, fundo escuro |
| `silper_icone.svg` e `silper_icone_fundo_escuro.svg` | Só o símbolo (engrenagem com os raios), 45 × 30 px no cabeçalho do celular |

Os SVGs foram redesenhados a partir de um PNG de 150 px. **Substituir pelos arquivos originais da marca**, se o cliente os tiver.

## 2. Tipografia (escala final)

| Papel | Celular | Desktop | Peso |
|---|---|---|---|
| Título de página (h1) | 21 px | 24 px | 700, espaçamento de letras −0,02 em, altura de linha 1,15 |
| Nome no cartão do motor / da O.S. | 17 px | 20 px | 700 |
| Número grande dos cartões de informação | 20 px | 24 px | 700 |
| Texto de lista e de linha | 14 px | 14 px | 600 no título, 400 no valor |
| Botão | 14 px | 14 px | 600 |
| Campo | 13,5 px | 13 px | 400 |
| Apoio, legenda, rótulo de campo | 12 px | 12 px | 500 a 600 |
| Título de seção | 12 px, caixa alta, +0,02 em, cor terciária | igual | 500 |
| Rótulo do menu de baixo | 10 px | n/a | 600 |

Nenhum texto abaixo de 12 px, exceto a legenda do menu de baixo. Números alinhados em coluna usam algarismos tabulares.

## 3. Forma e espaço

| Elemento | Valor |
|---|---|
| Card | Raio **22 px**, fundo `--surface`, sem borda e sem sombra |
| Botão | Pílula (raio 999), altura **46 px**, 14 px/600 |
| Campo | Raio 12 px, altura **42 px** no celular e 40 px no desktop, fundo `--surface` (dentro de card: `--fill`), borda 1 px `--separator` |
| Controle segmentado | Contêiner `--bg-2`, raio 10, padding 2. Item: raio 8, 12 px/600. Ativo: fundo `--primary`, texto branco |
| Selo (rastreio) | Pílula, 12 px/600, fundo `--orange-light`, texto `--orange-text` |
| Ícone em quadrado | 30 px, raio 8, fundo sólido, traço branco de 18 px |
| Linha de lista | Preenchimento 10 × 16 px, divisor de 1 px que começa **depois do ícone** |
| Espaço entre blocos | 10 px no celular, 20 px no desktop |
| Margem lateral da tela | 18 px no celular, 36 px no desktop |

Altura mínima de toque: o protótipo usa campos de 42 px. Ao implementar no celular, **subir para 44 px** (é a única exceção aceita ao protótipo, por acessibilidade).

## 4. Ícones e ilustrações

- Biblioteca: **Phosphor Regular**. Cor herdada do texto. Menu: 24 px; linhas e botões: 18 px.
- Quadrados coloridos: azul `#3A55B6` (motores), laranja `#EE6B10` (O.S.), verde `#34C759`, cinza. Símbolo sempre branco.
- **3D só em três pontos**, nunca em listas, menus ou botões:
  1. Motor elétrico animado, no cartão da ficha (SVG próprio, em `public/assets/motor-animado.svg`).
  2. Prancheta animada, no cartão da O.S. (`public/assets/os-prancheta-animada.svg`).
  3. Etiqueta 3D na tela de sucesso do cadastro (Fluent Emoji 3D, licença MIT).
- Animações: o eixo do motor gira, o motor vibra de leve e uma luz verde pisca; na prancheta os três "vistos" são desenhados em sequência e o lápis balança. Todas **param com `prefers-reduced-motion`**.

## 5. Componentes e mapeamento para o shadcn/ui

| Componente do protótipo | shadcn/ui | Observação |
|---|---|---|
| Botão principal / secundário / contorno | `Button` | Variantes `default` (laranja), `secondary` (azul claro), `outline`, `ghost` |
| Campo, seleção, área de texto | `Input`, `Select`, `Textarea`, `Label` | Prefixo "R$" dentro do campo de valor |
| Formulário | `Form` (react-hook-form + zod) | Erro abaixo do campo, em vermelho |
| Abas e alternadores | `Tabs` (abas da ficha) e `ToggleGroup` (rastreio, tipo do motor, "Na abertura / Ficha atual") | |
| Selo | `Badge` | |
| Cartão | `Card` | Raio 22 |
| Tabela (desktop) | `Table` | Linhas clicáveis |
| Gaveta (celular) | `Drawer` | |
| Janela (desktop) | `Dialog` | |
| Menu lateral (desktop) | `Sidebar` | |
| Menu de baixo (celular) | **Próprio** (`BottomNav`) | Cápsula flutuante, 3 itens |
| Busca | `Command` + `Input` | |
| Aviso | `Alert` | Fundo `--orange-light` |
| Confirmação de ação | `Sonner` | |
| Envio de fotos | **Próprio** (`Dropzone`) | Borda tracejada |
| Conta no menu | `Avatar` + `Button` ghost | |
| Carregando | `Skeleton` | |

## 6. Padrões de tela

### 6.1 Cabeçalho de página
- **Celular:** uma linha com o **título à esquerda** e o **ícone da Silper (45 × 30 px) à direita**. **Nada mais** no topo: nem botão, nem link de voltar.
- **Desktop:** a logo completa fica no topo do menu lateral e o título (h1) abre o conteúdo. Sem botões soltos no topo.
- As ações da página ficam **no conteúdo**: cartões de ação, cartão do motor e rodapé das janelas.

### 6.2 Navegação
- **Celular:** cápsula flutuante (58 px, a 7 px do fundo e 22 px das laterais, vidro translúcido), 3 itens com ícone e legenda: Início, Motores, O.S. Ativo: texto e ícone `--orange-text`. **A aba ativa corresponde à seção da tela**: a ficha do motor pertence a Motores; a O.S. aberta pertence a O.S.
- **Desktop:** menu lateral de 240 px, vidro translúcido, logo no topo com divisor, 3 itens (ícone cinza + texto) e, no rodapé, a conta. Ativo: fundo `--orange-light`, texto e ícone `--orange-text`, semi-negrito. Hover: fundo `--separator`.
- **Rodapé da conta (desktop):** foto da conta Google (32 px; iniciais se não houver), nome (13 px/600) e e-mail (11 px, cinza), com reticências, e botão **Sair** (ícone + texto, fundo avermelhado suave no hover).

### 6.3 Gaveta (celular) e janela (desktop)
Tudo o que **adiciona ou edita** abre por cima da tela de origem, que fica escurecida.
- Anatomia: título à esquerda e **X cinza claro** à direita (círculo de 30 px, fundo `--fill`, traço cinza; nunca vermelho); conteúdo; ação principal.
- **Gaveta:** sobe do fundo, começa a 60 px do topo, cantos de cima com raio 26, alça no topo. A ação principal fica numa **barra fixa embaixo** (16 px de margem em cima e embaixo). Secundária à esquerda, principal à direita.
- **Janela:** centralizada, 940 px de largura nos cadastros e 600 px na Nova O.S. A ação principal fica no **rodapé, à direita**.
- Fecha com X, `Esc` ou clique fora. Cobre o menu enquanto aberta.
- Cada gaveta/janela tem rota própria (rotas interceptadas do Next.js), para o botão voltar do navegador funcionar.

### 6.4 Lista de atalhos
Linha clicável: ícone em quadrado + nome (14/600) + apoio (12, cinza) + valor à direita (12, cinza, tabular) + seta. Sem selo colorido dentro da linha. O título da seção traz uma dica à direita: "Toque para abrir" (celular) ou "Clique para abrir" (desktop). Linha selecionada em lista de escolha: fundo `--blue-light` e visto azul no lugar da seta, sem contorno.

### 6.5 Cartões
- **Ação:** ícone em quadrado (36 px no celular, 40 no desktop), título 14/700 e descrição de **duas linhas** com altura reservada. No celular ficam 2 por linha; no desktop, em linha horizontal com seta.
- **Informação:** ícone em quadrado colorido suave (36/40 px), número grande, descrição pequena. Grade 2 × 2 no celular e 4 em linha no desktop. O quadrado de cada cartão: azul, laranja, verde e cinza.
- **Motor / O.S.:** quadro suave à esquerda com a ilustração animada, nome, selo do rastreio, cliente e os botões da página.

### 6.6 Linha de informação (rótulo e valor)
Rótulo em **preto** à esquerda, valor em **cinza** à direita, sem negrito, divisor começando com recuo de 16 px. Usada na ficha, no detalhe da O.S. e nas telas de resumo.

### 6.7 Estados
| Estado | Padrão |
|---|---|
| Vazio | Texto curto e a ação principal ("Nenhum motor ainda. Cadastre o primeiro.") |
| Carregando | `Skeleton` no formato das linhas e cartões |
| Erro de campo | Texto vermelho abaixo do campo, borda vermelha, `aria-invalid` |
| Erro de rede | Toast com "Tentar de novo" |
| Sem permissão | Tela com mensagem e botão para voltar ao Início |

### 6.8 Modo escuro
Tema por classe `.dark` na raiz. Fundo preto `#000`, cards `#1C1C1E`. Os quadrados de ícone mantêm a cor. O QR Code fica em quadro branco. A logo troca para a versão de fundo escuro.

## 7. Acessibilidade
- Contraste mínimo de 4,5:1 em texto. Cinza de apoio `--text-tertiary` já atende.
- Foco visível em todo controle (anel azul `--ring`).
- Todo botão só com ícone tem `aria-label` (X de fechar, Sair).
- Gavetas e janelas com `role="dialog"`, foco preso e devolvido ao fechar.
- Respeitar `prefers-reduced-motion`.
