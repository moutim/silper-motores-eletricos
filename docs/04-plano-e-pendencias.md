# 04 · Rastreabilidade, pendências e plano de implementação

## 1. Rastreabilidade: PDF → especificação

| PDF | Assunto | Onde está |
|---|---|---|
| 1 | Objetivo | `01` seção 1 |
| 2 | Motor permanente + O.S. separadas | `01` 4.2, 4.4 e RN-01, RN-06, RN-09 |
| 3.1 | Número de rastreio | `01` 5.4, RN-02 |
| 3.2 | Automático ou digitado, sem duplicados, etiqueta e QR | `01` 5.4, 5.7.1, RN-03 a RN-05 · `03` 1.2, 1.5, 1.6, 1.9 |
| 4.1 / 4.2 | Dados gerais e bobinagem | `01` 4.2, 4.3 · `03` 1.2, 1.7, 3.1 |
| 4.3 | Campos do monofásico | RN-12 · `03` 1.8 |
| 5 | Fotos e esquemas | `01` 5.7, RN-11 · `03` 3.7 |
| 6 | Criar a partir de modelo | `01` 5.3, RN-10 · `03` 1.3, 1.4 |
| 7.1 | Número da O.S. manual e repetível | RN-07, RN-08 · `03` 3.4 |
| 7.2 | Campos da O.S. | `01` 4.4 · `03` 3.4 (inclui **Observações**) |
| 8 | Dados técnicos dentro da O.S. (A, B ou C) | RN-18 · `03` 3.5, 3.6 (**pendente**) |
| 9.1 | Tela inicial simples | `03` 1.1 |
| 9.2 / 9.3 | Ficha em abas e ações separadas | `03` 3.1 a 3.8 |
| 10 | Busca e filtros | `01` 5.6 · `03` 1.1, 2.1 |
| 11 | Plataforma, sincronização, offline, backup | RN-13 · seção 3 abaixo |
| 12 | Fluxos principais | `03` passos 1 a 3 |
| 13 | RN-01 a RN-13 | `01` 5.1 |
| 14 | Pendências | seção 3 abaixo |
| 15 | Orientações ao desenvolvedor | seção 5 abaixo |

## 2. O que existe no protótipo e **não** está no PDF (validar com o cliente)

1. Valor da nota e Faturamento do mês (RN-14, RN-15).
2. Login com Google, foto, nome, e-mail e botão Sair (RN-16).
3. Cartões "Motores cadastrados", "O.S. neste mês" e "Clientes atendidos".
4. Tabela "Últimas O.S." na Início do desktop.
5. Cartões de atalho "Abrir O.S." e "Copiar de outro motor".
6. Botão "Editar O.S.".
7. Desativar motor em vez de apagar (RN-17).
8. Visual: modo escuro, ícones 3D e animações.

## 3. Pendências do PDF e decisão necessária

| Pendência | Proposta | Quem decide |
|---|---|---|
| Dados técnicos dentro da O.S. (A, B ou C) | **C**: retrato na abertura e acesso à ficha atual | Cliente |
| Campos definitivos da O.S. | Número, data de entrada, defeito, serviço, observações, fotos, **valor da nota** | Cliente |
| Formato do rastreio | Prefixo e dígitos configuráveis; exemplo do PDF `MOT-000125` | Cliente |
| Listas de tensão e RPM | Levantar valores (por exemplo 110/220/380/440 V; 1730/3450 RPM) | Cliente |
| Funcionamento offline | Fora da primeira versão | Cliente |
| Usuários, login e permissões | Google; lista de e-mails autorizados; valores em dinheiro só para administradores | Cliente |
| Backup e recuperação | Backup diário do banco e das fotos, com teste de restauração | Você + cliente |
| Relatórios e indicadores | Só os 4 cartões da Início | Cliente |
| Formato da etiqueta | Definir tamanho e impressora; começar com impressão pelo navegador | Cliente |
| Limites de fotos | 10 MB, JPG/PNG/WebP/HEIC, até N por motor e por O.S. | Cliente |
| Tecnologia, hospedagem, custos | Next.js, PostgreSQL e armazenamento de objetos em nuvem | Você |

## 4. Perguntas para o cliente

1. Confirma o **retrato dos dados na abertura** da O.S. (opção C)?
2. No dia a dia, o que é mais comum: o mesmo motor voltar, ou chegarem motores iguais de empresas diferentes?
3. O cliente (dono do motor) tem cadastro próprio (telefone, endereço) ou é só o nome?
4. Em que mês conta um serviço: quando o motor entra, quando é entregue ou quando a nota é paga? Existe **data da nota**?
5. Existem serviços em garantia ou sem cobrança? Como marcar?
6. Você quer controlar dinheiro dentro do sistema? O "valor da nota" é o total da nota ou só o serviço? Quer lançar também o **custo**?
7. Quem pode entrar? Todos veem os valores em dinheiro?
8. Em que situação você digitaria o rastreio em vez de usar o automático? Qual o formato preferido?
9. Onde a etiqueta será colada e qual o tamanho?
10. Precisa funcionar sem internet na oficina?
11. Quais valores entram nas listas de tensão e RPM?
12. No monofásico, os campos genéricos de bobinagem somem ou continuam?
13. Limites de fotos (quantidade, tamanho)?

## 5. Orientações do PDF que viram regras do projeto

- Priorizar cadastro rápido, busca eficiente e facilidade de uso na oficina.
- Manter a separação clara entre o cadastro permanente e as O.S. históricas.
- **Não tomar decisões de negócio implícitas**: o que está pendente é confirmado com o usuário antes de ser implementado.
- Cada motor, O.S., foto e esquema fica associado ao registro correto.
- Entregar uma solução utilizável no celular e no computador.

## 6. Plano de implementação

Ordem sugerida. Cada fase termina com as telas comparadas ao protótipo no celular e no desktop, nos modos claro e escuro.

| Fase | Entrega | Telas |
|---|---|---|
| 0 | Projeto Next.js, Tailwind v4, shadcn/ui, tokens do `tokens.css`, fonte do sistema, tema claro/escuro, banco e migrações | n/a |
| 1 | Login com Google, layout autenticado: menu lateral, menu de baixo, cabeçalho de página, conta e Sair | Login, estrutura de todas as telas |
| 2 | Motores: modelo de dados, rastreio (automático, digitado e duplicado), cadastro em gaveta/janela, bobinagem trifásica e monofásica | 1.2, 1.5 a 1.8 |
| 3 | Ficha do motor com abas e edição | 3.1, 3.2, 3.8 |
| 4 | O.S.: nova O.S. (com valor da nota e observações), histórico, retrato dos dados, O.S. aberta | 3.3 a 3.6 |
| 5 | Fotos e esquemas: envio, armazenamento, agrupamento por motor e por O.S. | 3.7 |
| 6 | Início e busca: cartões, recentes, busca por qualquer campo e por O.S., filtros avançados, escolher motor-base | 1.1, 1.3, 1.4, 2.1 |
| 7 | Etiqueta e QR Code, rota `/m/[rastreio]` e impressão | 1.9 |
| 8 | Lista de O.S. e conta no celular, estados vazios e de erro, acessibilidade, desempenho | `/os`, estados |

## 7. Critérios de pronto (por tela)

- Igual ao protótipo em 390 px e 1280 px, nos dois temas.
- Todos os estados desenhados (vazio, carregando, erro).
- Regras de negócio da tela cobertas por teste.
- Navegável por teclado, com foco visível e rótulos.
- Texto em pt-BR e formatos de data e moeda corretos.

## 8. Testes mínimos

| Regra | Teste |
|---|---|
| RN-02, RN-04 | Dois cadastros simultâneos nunca geram o mesmo rastreio; digitar duplicado é recusado |
| RN-08 | Duas O.S. com o mesmo número salvam e aparecem separadas |
| RN-09, RN-18 | Editar a ficha não muda o retrato de uma O.S. antiga |
| RN-10 | Copiar de um modelo não copia cliente, O.S. nem fotos, e o original não muda |
| RN-12 | Monofásico grava duas bobinagens; trifásico grava uma |
| RN-15 | Faturamento do mês soma só as O.S. do mês corrente, ignorando as sem valor |
| RN-19 | O QR abre a ficha certa e pede login se preciso |
| Busca | Termos com acento e sem acento retornam o mesmo resultado |

## 9. Lacunas do protótipo a desenhar antes ou durante o desenvolvimento

Login, lista de O.S., conta no celular, filtros avançados, aba Bobinagem da edição, desktop de Motores, Etiqueta, Escolher motor e variações de rastreio (digitado e duplicado), visualizador de foto, estados vazios, de erro e de carregamento, e a lista completa de campos na ficha.
