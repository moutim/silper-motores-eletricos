# Decisões, contradições e lacunas

Registro de tudo o que foi decidido, achado nos documentos ou deixado em aberto. Nada aqui altera os documentos 01 a 04: eles continuam como estão até você aprovar a correção.

Status: **decidido** (você disse), **proposta** (implementada como padrão, fácil de trocar), **aberto** (pergunta pendente).

## Decisões de arquitetura

| ID | Decisão | Status |
|---|---|---|
| D-01 | **Banco = Google Sheets**, no Drive da conta Google da Silper, em vez de PostgreSQL + Prisma (que o README marcava como proposta). Mesmo modelo do `financeiro-os`: login Google com escopo `drive.file`; o app cria e usa a planilha `SilperMotores` com o token dessa conta. Tudo atrás de `src/server/repositories` e `src/server/storage`, para trocar depois. | decidido |
| D-02 | **Uma conta só** para toda a oficina. Consequências: papéis e "valores em dinheiro só para administrador" (doc 01, seção 7) deixam de ter sentido; o Faturamento aparece para todos. Quem pode entrar vira uma lista de e-mails (provavelmente um só). | decidido; confirmar na Fase 1 |
| D-03 | "Acessados recentemente" passa a ser **compartilhado** (todo mundo usa o mesmo login), não "do próprio usuário" (doc 01, 5.5). A aba `AcessosRecentes` guarda a conta; `criadoPor`/`atualizadoPor` guardam o e-mail da conta. Não existe tabela `Usuarios`. | proposta |
| D-04 | **Rastreio único sem banco**: o Sheets não tem restrição única nem transação. Estratégia (Fase 2): gravar a linha com `rastreioChave` e reler a coluna; vale a linha de menor posição, quem perdeu apaga a sua e recebe o erro de duplicado. O automático usa o maior número já ocupado + 1 (inclui digitados e desativados) e repete se perder. O append do Sheets é atômico, então funciona com várias instâncias. Teste de gravação simultânea obrigatório. | proposta |
| D-05 | O doc 01 (5.4) permite `/` no rastreio digitado, mas o rastreio vai na URL (`/motores/[rastreio]`, `/m/{rastreio}`). `/` fica **fora** (`config.rastreio.padraoDigitado`). | proposta; perguntar na Fase 2 |
| D-06 | `rastreioChave` = rastreio sem espaços nas pontas e em minúsculas; é a chave de unicidade (RN-04). | proposta |
| D-07 | Tipos: `tensao`, `corrente`, `rpm`, `fatorServico`, `item`, `pacote`, `diametro` são **texto** (o doc diz "texto ou decimal"; o protótipo mostra "220/380 V" e "0,95 mm"). `potenciaValor` é número. Valores da planilha são gravados em modo RAW para o Sheets não converter "1-9" em data. | proposta |
| D-08 | Datas de calendário (`dataEntrada`) são `AAAA-MM-DD` sem fuso; instantes são ISO 8601. "Mês corrente" e "hoje" usam `America/Sao_Paulo`. | proposta |
| D-09 | A busca (sem acento, termos com E) roda **em memória** sobre a planilha lida e mantida em cache no servidor. Meta de 300 ms com 10 mil motores depende disso; cota da API do Sheets (~60 leituras/min por usuário) exige cache. Validar na Fase 6. | proposta |
| D-10 | Fotos ficam no **Google Drive** da mesma conta (Fase 5); a planilha guarda só o id do arquivo. | proposta |
| D-11 | Credenciais do OAuth copiadas do `financeiro-os` para o `.env` local (você autorizou). **Criar um cliente OAuth novo antes de subir.** O redirect `http://localhost:3000/api/auth/callback/google` precisa estar autorizado nele. | decidido |
| D-26 | **Tela de login antecipada** (era Fase 1), a pedido: card centralizado como no financeiro, porém chapado (sem sombra, sem vidro, sem degradê, conforme o doc 02), com logo, "Entrar", uma frase, 3 linhas sobre o sistema e o botão "Entrar com Google". **Sempre no tema claro** (`ThemeProvider` força claro em `/login`). Não usei o motor animado: o doc 02 limita o 3D a três pontos. Os textos são proposta minha. Erros: `sem_acesso` ("Esta conta não tem acesso. Fale com o responsável." + "Trocar de conta"), `drive_permission`, `drive_quota`, `setup_failed`, `AccessDenied`. | proposta |
| D-27 | **Quem pode entrar**: `AUTH_ALLOWED_EMAILS` (lista). Vazia = qualquer conta Google, o que é seguro no modelo atual (cada conta cria e lê só a própria planilha), mas **defina a lista antes de subir**. | proposta |
| D-28 | **Cookies do Auth.js com nome próprio** (`silper.*`). No `localhost` os cookies valem para todas as portas; o cookie do `financeiro-os` (outro segredo) derrubava a sessão com `no matching decryption secret`. | decidido (correção técnica) |
| D-29 | O redirect autorizado no cliente OAuth é `http://localhost:3000/...`. O Silper precisa rodar na **porta 3000**, então o `financeiro-os` tem de estar parado. Ao criar o cliente OAuth novo (D-11), autorize também a porta que for usar. | aberto |
| D-30 | Next 16 renomeou `middleware` para `proxy` (`src/proxy.ts`). Com Cache Components ligado, ler `searchParams` ou `auth()` fora de `Suspense` bloqueia o pré-render (tela de login e página inicial já tratadas). | decidido |

## Contradições e lacunas nos documentos

| ID | Achado | Tratamento |
|---|---|---|
| D-12 | Divergências **dentro do protótipo**: `SIL-000118` é "WEG 3 CV · Granja Sol · 1720" na Início desktop e "WEG 5 CV · Granja Sol · 1730 RPM" em Escolher motor. A O.S. 4821 tem "Rebobinado completo" (histórico) e "Rebobinado" (O.S. aberta). A O.S. 4310 repetida só mostra o texto "Número repetido é permitido". O protótipo não mostra valor de nota por O.S., só o total do mês (R$ 18.450, 9 O.S., 128 motores, 37 clientes). | Seed: usei a Início desktop e "Rebobinado completo"; o texto da 4310 repetida foi para `servicoExecutado`; valores de nota ficam vazios; só os 6 motores citados. Nada inventado. |
| D-13 | `README.md` era um stub e o README real estava em `README copy.md`. `CLAUDE.md` não existia. | README substituído pelo conteúdo da cópia; CLAUDE.md criado. |
| D-14 | Nomes dos assets no doc 02 (`silper_logo.svg`) diferem dos arquivos (`silper-logo.svg`). | Valem os arquivos reais. |
| D-15 | Doc 02 manda copiar `tokens.css` para `app/globals.css`, mas a estrutura usa `src/app/`. | Está em `src/app/globals.css`, valores intactos; o mapeamento para Tailwind/shadcn está em bloco separado. |
| D-16 | "ui/ não editar além do tema" (README) conflita com o design (botão pílula 46 px, card 22 px sem sombra, campo 12 px). | Ajustei só `button`, `card`, `input` e `badge`. Os demais serão ajustados quando a tela os usar. **Aguarda sua aprovação.** |
| D-17 | O shadcn atual **não tem** o componente `form`; o substituto é `field`, usado com react-hook-form. O README mandava `add form`. | Instalei `field`. |
| D-18 | O doc 02 usa `Popover` e menu "mais", que não estavam na lista do README. | Adicionei `popover`, `dropdown-menu` (e `tooltip`, `sheet`, `input-group`, que o shadcn puxa como dependência). |
| D-19 | O topo do celular é "só título e ícone", mas a gaveta de Conta abre pelo ícone do cabeçalho. | Aberto (Fase 8). |
| D-20 | Fase 2 e Fase 4 incluem fotos (Fase 5) e "abre a etiqueta" (Fase 7). | Placeholders desabilitados até lá. |
| D-21 | Nome do cliente é só texto no motor, mas a pergunta 3 do doc 04 pode pedir cadastro próprio. | Texto por enquanto (aba `Motores`). |
| D-22 | "Auditoria em todas as tabelas de negócio" não dizia quais. | `Motores`, `Bobinagens`, `OrdensServico` e `Fotos` têm os 4 campos; `AcessosRecentes` e `SequenciaRastreio` não. |
| D-23 | Ícones: o shadcn vem com Lucide; o projeto usa Phosphor. | `components.json` com `iconLibrary: phosphor`; os componentes gerados já usam Phosphor. |
| D-24 | Next.js 16 e Auth.js v5 são recentes (o `financeiro-os` usa `middleware.ts` com `next-auth@beta`). | Conferir na Fase 1 o nome atual (`proxy`) lendo `node_modules/next/dist/docs`. |
| D-25 | O `use-mobile.ts` gerado pelo shadcn falhava no lint (`set-state-in-effect`). | Reescrito com `useSyncExternalStore`, mesmo comportamento. |

## Pendências de negócio (valores atuais = proposta dos documentos, em `src/lib/config.ts`)

| Pendência | Valor atual | Pergunta |
|---|---|---|
| Formato do rastreio | prefixo `SIL-`, 6 dígitos | doc 04, perguntas 8 |
| Tamanho e caracteres do rastreio digitado | 3 a 32, `A-Z a-z 0-9 . _ -` | doc 01, 5.4 |
| Campos obrigatórios | só cliente (2 a 120) e tipo do motor | doc 01, seção 6 |
| Data de entrada futura | não pode | doc 01, seção 6 |
| Listas de tensão e RPM | 110/220/380/440 e 1730/3450 | doc 04, pergunta 11 |
| Limites de fotos | 10 MB, JPG/PNG/WebP/HEIC, 2048 px, sem limite de quantidade | doc 04, pergunta 13 |
| Tamanho da etiqueta | indefinido | doc 04, pergunta 9 |
| Data da nota / faturamento | `dataEntrada` no mês corrente | doc 04, pergunta 4 |
| Quem pode entrar | lista de e-mails | D-02 |
