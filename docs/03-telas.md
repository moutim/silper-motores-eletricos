# 03 · Especificação das telas

Cada tela tem o **código do protótipo** (por exemplo "1.1"), a **rota** e uma tabela com o que vale no **celular (390 px)** e no **desktop (1280 px)**. As abreviações RN-xx remetem a [`01-produto-e-regras.md`](01-produto-e-regras.md). Os padrões (cabeçalho, gaveta, lista, cartões) estão em [`02-design-system.md`](02-design-system.md).

**"A desenhar"** marca o que o PDF exige ou o fluxo precisa, mas ainda não existe no protótipo. Está especificado aqui para ser implementado com o mesmo padrão visual.

## Mapa de rotas

| Rota | Tela | Celular | Desktop |
|---|---|---|---|
| `/login` | Entrar com Google | A desenhar | A desenhar |
| `/` | Início | 1.1 | 4.1 |
| `/motores` | Motores (busca) | 2.1 | A desenhar (reaproveita a busca da Início) |
| `/motores/novo` | Novo motor (gaveta/janela) | 1.2 a 1.8 | 4.2 |
| `/motores/novo/base` | Escolher motor-base | 1.3 | A desenhar |
| `/motores/[rastreio]` | Ficha do motor, abas `?aba=dados\|os\|fotos` | 3.1 a 3.3, 3.7 | 4.3, 4.4, 4.5 |
| `/motores/[rastreio]/editar` | Editar dados (gaveta/janela) | 3.8 | 4.7 |
| `/motores/[rastreio]/os/nova` | Nova O.S. (gaveta/janela) | 3.4 | 4.6 |
| `/motores/[rastreio]/etiqueta` | Etiqueta e QR | 1.9 | A desenhar |
| `/os` | Lista de O.S. | A desenhar | A desenhar |
| `/os/[id]` | O.S. aberta | 3.5, 3.6 | Painel da aba O.S. (4.4) |
| `/m/[rastreio]` | Destino do QR (redireciona para a ficha) | n/a | n/a |

---

## Passo 1 · Cadastrar um motor novo

### 1.1 Início · `/`  (desktop 4.1)

| | Celular | Desktop |
|---|---|---|
| Cabeçalho | Título "Início" + ícone Silper | Menu lateral + título "Início" |
| Busca | Campo largo com lupa; placeholder "Rastreio, cliente, O.S., marca, potência". Abre a busca (2.1) | Igual, 52 px de altura |
| Atalhos | 2 cartões: **Cadastrar motor** ("Registrar um novo motor na oficina") abre 1.2; **Abrir O.S.** ("Registrar a entrada de um motor") leva a Motores para escolher o motor e abrir a Nova O.S. | 3 cartões horizontais: Cadastrar motor, Abrir ordem de serviço, Copiar de outro motor (abre o cadastro já em "Partir de um motor") |
| Informação | Grade 2 × 2: Motores cadastrados, **Faturamento de {mês}**, O.S. neste mês, Clientes atendidos | 4 cartões em linha |
| Listas | "Acessados recentemente": 3 linhas | "Motores recentes" (4 linhas, 3 colunas) e "Últimas O.S." (4 linhas) lado a lado |
| Filtros avançados | **A desenhar**: botão "Filtros" ao lado da busca, abrindo gaveta (celular) ou painel (desktop) com marca, potência, RPM, tensão, pacote, diâmetro e tipo | Igual |
| Regras | Definições dos cartões: 5.5. Linha de recentes abre a ficha. O valor do faturamento só aparece para quem pode ver valores (RN-14, ver 7) | |
| Estados | Base vazia: cartões em 0 e "Nenhum motor ainda. Cadastre o primeiro." Carregando: `Skeleton` nos cartões e linhas | |
| Aceite | Cadastrar um motor muda os totais e põe o motor no topo dos recentes; abrir uma ficha o move para o topo | |

### 1.2 / 1.5 / 1.6 Novo motor, passo 1 · `/motores/novo`  (desktop 4.2)

| | Celular (gaveta) | Desktop (janela) |
|---|---|---|
| Cabeçalho | Título "Novo motor" + X | Igual, janela de 940 px |
| Ordem dos blocos | 1) Alternador **Rastreio automático / Digitar rastreio**; 2) área do rastreio; 3) "Partir de um motor já cadastrado (opcional)"; 4) dados gerais | Duas colunas: à esquerda rastreio, motor-base e dados gerais; à direita bobinagem e fotos |
| Rastreio automático (1.2) | Cartão com o número previsto (`SIL-000126`) e a nota "Único e nunca reutilizado. Duplicados são bloqueados." | Igual |
| Rastreio digitado (1.5) | Campo "Digite o rastreio" | Igual |
| Rastreio em uso (1.6) | Borda e texto vermelhos: "`M-0457` já está em uso por outro motor. Digite outro número." Salvar fica bloqueado | A desenhar, mesma regra |
| Campos | Cliente, Marca, Modelo, Tipo de equipamento, Potência (valor + CV/HP/kW), Tensão (lista), Corrente, RPM (lista), F.S., Item, Pacote, Diâmetro. Em grade de 2 colunas (Item, Pacote e Diâmetro em 3) | Grade de 3 colunas |
| Ação | Barra fixa: **Continuar** (vai ao passo 2) | Botão **Salvar motor** no rodapé, à direita |
| Regras | RN-03, RN-04, 5.4. A verificação de duplicado roda ao sair do campo e de novo ao salvar (o servidor é a autoridade) | |
| Estados | Salvando: botão desabilitado com indicador. Erro de rede: toast | |
| Aceite | Digitar um rastreio existente bloqueia; o automático nunca repete mesmo com dois usuários salvando ao mesmo tempo | |

### 1.3 Escolher um motor já cadastrado · `/motores/novo/base`

| | Celular (gaveta) | Desktop |
|---|---|---|
| Estrutura | Título "Escolher motor" + X; busca; filtros em cápsulas (Potência, Marca, RPM, Pacote); lista "N motores parecidos" com dica "Toque para escolher"; aviso sobre o cliente; barra fixa **Usar este motor como base** | **A desenhar**: lista em painel suspenso (`Command` em `Popover`) dentro da janela de novo motor |
| Linha | Ícone azul, nome curto (marca e potência), "{cliente} · {RPM}", rastreio à direita. **Selecionada**: fundo azul suave e visto azul | Igual |
| Regras | Busca como em 5.6. Só um motor pode ser escolhido. Motor desativado não aparece | |
| Aceite | Escolher um motor leva ao formulário preenchido (1.4) | |

### 1.4 Formulário preenchido a partir do modelo

| | Celular | Desktop |
|---|---|---|
| Estrutura | Igual ao 1.2, mais o cartão **Base do cadastro** ("WEG 5 CV · SIL-000125", link **Trocar**) e a nota "Copiados: dados técnicos e bobinagem. Não copiados: O.S., fotos e esquemas. Preencha o cliente." | Cartão do motor-base dentro da coluna da esquerda |
| Regras | RN-10 e 5.3. O rastreio é novo (automático ou digitado). O cliente vem **em branco** e é obrigatório | |
| Aceite | Alterar o novo motor não altera o original; o novo motor não tem O.S. nem fotos | |

### 1.7 / 1.8 Bobinagem, passo 2 · `/motores/novo` (passo 2)

| | Celular | Desktop |
|---|---|---|
| Estrutura | Título "Bobinagem" + X; alternador **Trifásico / Monofásico**; grupos de campos; fotos | Coluna da direita da janela única |
| Trifásico (1.7) | Um grupo: Passo, Voltas, Fio, Ligação (série/paralelo), Camada (única/dupla) | Igual |
| Monofásico (1.8) | Dois grupos, **Bobina de trabalho** e **Bobina auxiliar**, com os mesmos cinco campos cada. A dica diz "Monofásico: dados separados para cada bobina." | Igual |
| Fotos | "Foto do equipamento" e "Foto do esquema de ligação" (opcionais) | Igual |
| Ação | Barra fixa com **Voltar** (secundário) e **Salvar motor** (principal) | Rodapé: Salvar motor |
| Regras | RN-12. Trocar o tipo preserva o que foi digitado até salvar; ao salvar como trifásico, o grupo auxiliar é descartado | |
| Aceite | Salvar cria o motor e as linhas de bobinagem corretas e abre a etiqueta (1.9) | |

### 1.9 Etiqueta e QR Code · `/motores/[rastreio]/etiqueta`

| | Celular | Desktop |
|---|---|---|
| Estrutura | Gaveta com X no canto; etiqueta 3D; "Motor cadastrado" e "{motor} · {cliente}"; **QR Code real** com o rastreio embaixo e a legenda "Aponte a câmera do celular para abrir a ficha deste motor"; linha **Abrir ficha do motor**; barra fixa com **Agora não** e **Imprimir etiqueta** | **A desenhar**: mesma janela, centralizada |
| Regras | RN-05, RN-19, 5.7.1. Imprimir abre a folha de impressão com QR e rastreio. A etiqueta também é gerada depois, pelo menu da ficha ("Gerar etiqueta"), **a desenhar** | |
| Aceite | O QR lido por um celular abre a ficha do motor (pedindo login se preciso) | |

---

## Passo 2 · Encontrar um motor

### 2.1 Motores · `/motores`

| | Celular | Desktop |
|---|---|---|
| Cabeçalho | Título "Motores" + ícone. **Nenhum botão no topo** | A desenhar |
| Estrutura | Busca; cartão horizontal **Cadastrar motor**; "Motores (n)" com dica; "Ordens de serviço (n)" | Igual, em largura total |
| Linhas | Motor: nome curto, cliente, rastreio, seta. O.S.: ícone laranja, "O.S. 4821", "WEG 5 CV · Usina Boa Vista", rastreio, seta | |
| Regras | 5.6. Abrir uma O.S. leva à **ficha do motor**, na aba O.S., com a O.S. selecionada | |
| Estados | Sem resultado: "Nenhum resultado para '{termo}'" e botão **Limpar busca**. Sem termo: lista dos motores mais recentes | |
| Menu | Aba **Motores** ativa | |

### 2.2 Atalho: usar como modelo
**Não implementar.** O fluxo de modelo é o campo "Partir de um motor já cadastrado" (1.3 e 1.4). A tela fica no protótipo só como registro.

---

## Passo 3 · Abrir O.S. e consultar o histórico

### 3.1 / 3.2 Ficha do motor · Dados técnicos · `/motores/[rastreio]`  (desktop 4.3)

| | Celular | Desktop |
|---|---|---|
| Cabeçalho | Título "Ficha do motor" + ícone | Menu lateral (item Motores ativo) |
| Cartão do motor | Motor animado, nome (marca e potência), selo do rastreio, "{tipo} · {cliente}", botões **Editar dados** e **Nova O.S.** | Cartão horizontal; botões à direita |
| Abas | Dados técnicos, Ordens de serviço, Fotos | Dados técnicos, Ordens de serviço, Fotos e esquemas |
| Conteúdo | Linhas de informação: **todos** os dados gerais (cliente, marca e modelo, tipo de equipamento, potência com kW, tensão, corrente, RPM, F.S., item, pacote, diâmetro) e a **bobinagem** (um grupo, ou dois no monofásico) | 3 colunas: dados gerais, bobinagem, últimas O.S. com o esquema |
| Menu "mais" | **A desenhar**: Gerar etiqueta, Desativar motor (RN-17) | Igual |
| Regras | RN-01 e RN-09. Abrir a ficha registra o acesso recente. O protótipo mostra só parte dos campos; **a implementação mostra todos** | |
| Estados | Motor inexistente: página 404 com botão para Motores. Desativado: faixa "Motor desativado" e ações bloqueadas | |
| Menu | Aba **Motores** ativa | |

### 3.3 Ficha · Ordens de serviço  (desktop 4.4)

| | Celular | Desktop |
|---|---|---|
| Lista | "Histórico (n)" com dica; linha: ícone laranja, "O.S. {número}", "{defeito} · {serviço}", data à direita, seta. Ordem: data de entrada, mais recente primeiro | Coluna da **direita**, 340 px |
| Detalhe | Abre a O.S. aberta (3.5) | Coluna da **esquerda**: cartão da O.S. (prancheta animada, número, data, **Editar O.S.**); "Serviço"; "Fotos desta O.S."; "Dados técnicos desta O.S." |
| Regras | RN-06 e RN-08. Duas O.S. com o mesmo número aparecem como itens distintos, identificados internamente por `id` | |
| Estados | Sem O.S.: "Nenhuma O.S. ainda" e o botão **Nova O.S.** | |

### 3.4 Nova O.S. · `/motores/[rastreio]/os/nova`  (desktop 4.6)

| | Celular (gaveta) | Desktop (janela de 600 px) |
|---|---|---|
| Cabeçalho | Título "Nova O.S." + X | Título, selo "{rastreio} · {motor}" e X |
| Campos | Cartão do motor vinculado; **Número da O.S.** (dica "Você informa o número. Ele pode se repetir."); **Data de entrada** (hoje); **Defeito relatado**; **Serviço executado**; **Valor da nota** ★ (opcional, prefixo R$); Fotos da O.S. | Primeira linha: Número, Data, Valor da nota; depois Defeito e Serviço lado a lado; fotos |
| Campo a acrescentar | **Observações** (texto longo). Está no PDF (7.2) e falta no protótipo | Igual |
| Ação | Barra fixa **Salvar O.S.** | Rodapé: Salvar O.S. |
| Regras | RN-07, RN-08, RN-14, RN-18. O número nunca é gerado nem verificado quanto a duplicidade. Ao salvar, grava o **retrato** dos dados técnicos | |
| Aceite | Salvar volta à aba de O.S., com a nova O.S. no topo e um aviso de confirmação | |

### 3.5 / 3.6 O.S. aberta · `/os/[id]`  (desktop: painel de 4.4)

| | Celular | Desktop |
|---|---|---|
| Cabeçalho | Título "Ordem de serviço" + ícone | |
| Cartão | Prancheta animada, "O.S. 4821", selo do rastreio, "{motor} · {cliente}", botão **Editar O.S.** | Cartão no topo do painel |
| Serviço | Linhas: Entrada, Defeito, Executado, Observações, **Valor da nota** ★ (formato `R$ 1.234,56`; vazio mostra "Não informado") | Igual |
| Dados técnicos | Alternador **Na abertura / Ficha atual**. "Na abertura" mostra o retrato; "Ficha atual" mostra os dados de hoje. **A desenhar**: destacar os campos que mudaram. O aviso de pendência (A, B ou C) é só do protótipo e **não vai para o produto** | Igual |
| Fotos | Fotos desta O.S. | Igual |
| Menu | Aba **O.S.** ativa | |
| Regras | RN-09 e RN-18 | |
| Aceite | Editar a ficha depois da O.S. não muda a aba "Na abertura" | |

### 3.7 Ficha · Fotos e esquemas  (desktop 4.5)

| | Celular | Desktop |
|---|---|---|
| Estrutura | Seções "Motor" (foto do equipamento, esquema de ligação) e uma seção por O.S. ("Da O.S. 4821"); área tracejada **Adicionar foto** no fim | Grade de 3 colunas |
| Regras | RN-11 e 5.7. As fotos de O.S. ficam agrupadas por O.S. e nunca viram foto do motor | |
| A desenhar | Visualizador ampliado e exclusão de foto com confirmação | Igual |

### 3.8 Editar dados · `/motores/[rastreio]/editar`  (desktop 4.7)

| | Celular (gaveta) | Desktop (janela) |
|---|---|---|
| Estrutura | Título "Editar dados" + X; linha **Rastreio** "não editável"; abas **Dados gerais** e **Bobinagem**; campos preenchidos; barra fixa **Salvar alterações** | Janela de 940 px igual ao novo motor, com o rastreio fixo |
| A desenhar | O conteúdo da aba **Bobinagem** (mesmos campos de 1.7 e 1.8, com troca de tipo e aviso: "Ao trocar o tipo, os dados da bobina auxiliar serão criados ou descartados") | Igual |
| Regras | RN-09. Atualiza só `Motor` e `Bobinagem`, nunca as O.S. Grava quem e quando alterou | |
| Aceite | Depois de salvar, a ficha mostra os novos dados e as O.S. antigas continuam com o retrato | |

---

## Telas que o fluxo exige e ainda não existem

### Login · `/login`
Logo, título "Entrar" e botão **Entrar com Google**. Conta não autorizada: mensagem "Esta conta não tem acesso. Fale com o responsável." e botão para trocar de conta. Depois de entrar, volta à rota de origem (`next`).

### Lista de O.S. · `/os`
Aba **O.S.** do menu. Título "Ordens de serviço"; busca; filtro por mês; lista no padrão 6.4 (O.S., motor, cliente, data, valor se permitido). Toque abre 3.5.

### Conta (celular)
O desktop tem a conta no rodapé do menu. No celular, **a desenhar**: gaveta de conta (foto, nome, e-mail, **Sair**) acessada a partir do ícone no cabeçalho da Início.

### Filtros avançados
Ver 1.1. Campos: marca, potência, RPM, tensão, pacote, diâmetro e tipo do motor. Botões **Limpar** e **Aplicar**.

### Estados globais
Página 404, sem permissão, erro de servidor e carregamento por `Skeleton`, no padrão do design system.

---

## Modo escuro (6.1 a 6.4)
Início e Ficha no celular; Início e Novo motor no desktop. As demais telas herdam o tema pelos tokens, sem desenho próprio.
