@AGENTS.md

# Silper Motores Elétricos

Sistema web (celular e desktop) de cadastro de motores e ordens de serviço. Especificação em `README.md` e `docs/`. **Leia `docs/DECISOES.md`** antes de mexer: ele registra o que foi decidido, as contradições dos documentos e as pendências.

## Comandos

```bash
npm install
cp .env.example .env        # preencher GOOGLE_CLIENT_ID/SECRET e AUTH_SECRET

npm run dev                 # servidor de desenvolvimento (http://localhost:3000; o login Google exige a porta 3000)
npm run build               # build de produção
npm run lint                # ESLint
npm run typecheck           # tsc --noEmit
npm test                    # Vitest (uma vez); npm run test:watch para observar

# Planilha (Google Sheets no Drive da conta da Silper). Pare o `npm run dev` antes do login.
npm run sheet:login         # consentimento do Google; guarda o refresh token em .sheet-token.json
npm run sheet:setup         # acha ou cria a planilha SilperMotores, com abas e cabeçalhos
npm run sheet:seed          # DESTRUTIVO: apaga os dados e grava os exemplos do protótipo
```

## Regras do projeto

- O front é **idêntico ao protótipo** (390 px e 1280 px, claro e escuro). Cores, tipografia, raios e alturas: `docs/02-design-system.md` e `docs/tokens.css`. Os valores de `docs/tokens.css` ficam em `src/app/globals.css` **sem alteração**. Qualquer desvio precisa de aprovação.
- Regras de negócio ficam em `src/lib` (puras, testadas) e no servidor. O servidor é a autoridade.
- Acesso a dados só por `src/server/repositories`; fotos só por `src/server/storage`. Hoje a implementação é Google Sheets (`src/server/sheets`).
- **Não decida regra de negócio pendente.** O que está pendente tem valor-proposta em `src/lib/config.ts`; ao mudar, registre em `docs/DECISOES.md` e pergunte.
- Interface em pt-BR. Datas `dd/mm/aaaa`, moeda `R$ 1.234,56`, fuso `America/Sao_Paulo`.
- Acessibilidade: contraste 4,5:1, foco visível, rótulo em todo campo, `aria-label` em botão só com ícone, `prefers-reduced-motion`. Campos com no mínimo 44 px no celular.
- shadcn/ui com Radix e ícones Phosphor. Componente próprio só para `BottomNav` e `Dropzone`.
- Nunca commite `.env`, `.env.local` nem `.sheet-token.json`.

## Estrutura

`src/app` (rotas), `src/components/{ui,layout,motores,os,fotos}`, `src/lib` (regras puras e tipos), `src/server/{repositories,storage,sheets}`, `scripts/` (planilha e seed), `docs/`.
