# Silper Motores Elétricos

Sistema web (celular e computador) para cadastrar os motores elétricos que passam pela oficina, guardar a "receita" de bobinagem de cada um e manter o histórico de Ordens de Serviço (O.S.).

> **Status:** especificação concluída, desenvolvimento do front-end a iniciar.
> **Protótipo visual (fonte de verdade do front):** https://claude.ai/artifact/BwdKk6V5kQnnFtrjTHW4fj

## O problema

O cliente conserta e rebobina motores industriais. Os dados técnicos de cada motor (voltas, fio, passo, ligação) ficam na memória, no papel ou com o cliente. Quando o mesmo motor volta, ou chega um parecido, o levantamento é refeito do zero. O sistema guarda essa receita, permite achá-la rápido e registra cada visita do motor como uma O.S. separada.

## Conceito central

- **Motor** = ficha técnica permanente, com **rastreio** próprio, único e nunca reutilizado.
- **O.S.** = registro de uma visita do motor à oficina. Um motor tem várias. Editar a ficha **não** altera O.S. antigas.
- **Modelo** = qualquer motor já cadastrado pode servir de base para cadastrar outro (copia só os dados técnicos).

## Stack

| Camada | Escolha | Origem da decisão |
|---|---|---|
| Framework | **Next.js** (App Router) + React + TypeScript | Definida |
| UI | **shadcn/ui** + **Tailwind CSS v4** | Definida |
| Ícones | **Phosphor** (regular), via `@phosphor-icons/react` | Definida no protótipo |
| Tema | CSS variables + classe `.dark` (`next-themes`) | Definida no protótipo |
| Login | Google (**Auth.js**) | Definida |
| Formulários | react-hook-form + zod | Proposta |
| Banco | **Google Sheets** no Drive da conta da Silper (atrás de `src/server/repositories`) | Decidida (ver `docs/DECISOES.md`, D-01) |
| Fotos | Google Drive da mesma conta (atrás de `src/server/storage`) | Decidida (D-10) |
| QR Code | `qrcode` (SVG) | Proposta |
| Toasts | Sonner | Proposta |
| Testes | Vitest + Playwright | Proposta |

As linhas marcadas como **Proposta** precisam de aprovação (ver `docs/04-plano-e-pendencias.md`). Decisões e contradições encontradas: [`docs/DECISOES.md`](docs/DECISOES.md).

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/01-produto-e-regras.md`](docs/01-produto-e-regras.md) | Escopo, glossário, modelo de dados, regras de negócio e validações |
| [`docs/02-design-system.md`](docs/02-design-system.md) | Tokens, tipografia, componentes (mapeados para shadcn/ui) e padrões de tela |
| [`docs/03-telas.md`](docs/03-telas.md) | Especificação de cada tela, no celular e no desktop |
| [`docs/04-plano-e-pendencias.md`](docs/04-plano-e-pendencias.md) | Rastreabilidade com o PDF, pendências, perguntas ao cliente e plano de implementação |
| [`docs/tokens.css`](docs/tokens.css) | Variáveis de cor do tema claro e escuro, extraídas do protótipo |

## Fidelidade ao protótipo

O front deve ser **idêntico ao protótipo**. Regras:

1. Copiar `docs/tokens.css` para o `globals.css` sem alterar valores.
2. Os tamanhos, espaços e textos vêm de `docs/02-design-system.md` e `docs/03-telas.md`. Em dúvida, vale o protótipo.
3. Qualquer desvio é registrado e aprovado antes de ser feito.
4. Uma tela só é considerada pronta depois de comparada lado a lado com o protótipo, em **celular (390 px)** e **desktop (1280 px)**, nos modos **claro** e **escuro**.

## Começando

```bash
npx create-next-app@latest silper-motores-eletricos --typescript --tailwind --eslint --app
cd silper-motores-eletricos
npx shadcn@latest init
npx shadcn@latest add button card input select textarea label tabs toggle-group badge table dialog drawer sidebar alert command form sonner avatar skeleton separator
npm i @phosphor-icons/react next-themes react-hook-form zod @hookform/resolvers qrcode next-auth
```

Depois:

1. Colar o conteúdo de `docs/tokens.css` no `app/globals.css`.
2. Configurar a fonte do sistema (sem fonte web): `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif`.
3. Seguir a ordem de entrega do `docs/04-plano-e-pendencias.md`.

## Estrutura de pastas sugerida

```
src/
  app/
    (app)/                    # área autenticada, com menu
      page.tsx                # Início
      motores/
        page.tsx              # Motores (busca)
        @modal/(.)novo/       # gaveta/janela: novo motor
        [rastreio]/
          page.tsx            # Ficha (abas)
          editar/
          os/nova/
          etiqueta/
      os/[id]/page.tsx        # O.S. aberta
    login/
    m/[rastreio]/route.ts     # destino do QR Code
  components/
    ui/                       # shadcn/ui (não editar além do tema)
    layout/                   # Sidebar, BottomNav, PageHeader
    motores/  os/  fotos/     # componentes de domínio
  lib/                        # regras puras (rastreio, formatadores, busca)
  server/                     # repositórios, armazenamento e ações (Google Sheets/Drive)
scripts/                      # planilha (login, setup, seed)
docs/
```

## Convenções

- Idioma: **pt-BR** em toda a interface. Datas `dd/mm/aaaa`, moeda `R$ 1.234,56`, fuso `America/Sao_Paulo`.
- Componentes de UI vêm do shadcn/ui e são ajustados pelo tema. Não criar componente novo se existir equivalente.
- Regras de negócio ficam em `lib/` e no servidor, nunca só no componente.
- Acessibilidade: contraste mínimo 4,5:1, foco visível, rótulo em todo campo, respeito a `prefers-reduced-motion`.
