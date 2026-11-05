# 01 · Produto, modelo de dados e regras de negócio

Legenda: **PDF** = pedido pelo cliente no documento de especificação. **★** = decisão tomada durante o refinamento, que não está no PDF e precisa de validação do cliente. **(a confirmar)** = proposta minha onde o PDF é omisso.

## 1. Objetivo

Organizar os dados técnicos dos motores que passam pela Silper, localizar cadastros rapidamente e manter o histórico de O.S. de cada equipamento, no celular e no computador, com dados sincronizados.

## 2. Escopo da primeira versão

| Entra | Não entra (pendente no PDF ou fora de escopo) |
|---|---|
| Cadastro permanente do motor, com rastreio automático ou digitado | Funcionamento offline |
| Dados gerais e de bobinagem (trifásico e monofásico) | Backup e recuperação (decisão de infraestrutura) |
| Cadastrar a partir de outro motor (modelo) | Níveis de acesso detalhados (só se o cliente pedir) |
| Etiqueta com QR Code (opcional, também depois) | Relatórios além dos cartões da Início |
| O.S. separada, vinculada ao motor, com número digitado | Custo, lucro e status da O.S. ★ |
| Fotos do equipamento e do esquema, no motor ou na O.S. | Notificações e avisos |
| Busca por qualquer campo e por O.S. | Importação de dados antigos |
| Tela Início com busca, atalhos e visão geral | |
| Login com Google ★ | |
| Valor da nota na O.S. e Faturamento do mês ★ | |

## 3. Glossário

| Termo | Significado |
|---|---|
| Motor | Equipamento físico. Tem uma ficha técnica permanente. |
| Rastreio | Número interno da Silper que identifica **um** motor físico. Único e nunca reutilizado. |
| Ficha técnica | Dados gerais e de bobinagem do motor. Representa o estado **atual**. |
| O.S. | Ordem de serviço: registro de **uma** visita do motor à oficina. |
| Bobinagem | Passo, voltas, fio, ligação e camada das bobinas. |
| Bobina de trabalho / auxiliar | As duas bobinas de um motor monofásico. |
| Modelo | Motor existente usado como ponto de partida para cadastrar outro. |
| Retrato (snapshot) | Cópia dos dados técnicos no momento da abertura de uma O.S. |

## 4. Modelo de dados

Todos os ids são UUID. `criadoEm`, `atualizadoEm`, `criadoPorId` e `atualizadoPorId` existem em todas as tabelas de negócio.

### 4.1 `Usuario` ★
`id`, `googleId` (único), `nome`, `email` (único), `fotoUrl`, `papel` (a confirmar), `ativo`.

### 4.2 `Motor`
| Campo | Tipo | Regra |
|---|---|---|
| `rastreio` | texto, **único** | Nunca reutilizado. Comparação sem diferenciar maiúsculas e sem espaços nas pontas. |
| `rastreioOrigem` | `AUTOMATICO` ou `MANUAL` | Informativo. |
| `clienteNome` | texto | Obrigatório (a confirmar). |
| `marca`, `modelo`, `tipoEquipamento` | texto | Opcionais. |
| `potenciaValor` + `potenciaUnidade` | decimal + `CV`/`HP`/`KW` | Opcionais. |
| `tensao`, `corrente`, `rpm`, `fatorServico` | texto ou decimal | Tensão e RPM vêm de listas (valores pendentes). |
| `item`, `pacote`, `diametro` | texto | Opcionais. |
| `tipoMotor` | `MONOFASICO` ou `TRIFASICO` | Obrigatório. |
| `ativo` | booleano | Desativar em vez de apagar ★ (RN-17). |
| `modeloOrigemId` | FK opcional para `Motor` | Só auditoria. Sem efeito depois de copiar. |

### 4.3 `Bobinagem`
`id`, `motorId`, `funcao` (`UNICA` para trifásico, `TRABALHO` ou `AUXILIAR` para monofásico), `passo`, `voltas` (inteiro), `fio`, `ligacao` (`SERIE`/`PARALELO`), `camada` (`UNICA`/`DUPLA`). Único por (`motorId`, `funcao`).

### 4.4 `OrdemServico`
| Campo | Tipo | Regra |
|---|---|---|
| `motorId` | FK | Vínculo pelo motor (e portanto pelo rastreio). |
| `numero` | texto | Digitado pelo usuário. **Sem restrição de unicidade** (RN-07, RN-08). |
| `dataEntrada` | data | Obrigatória, padrão hoje. |
| `defeito`, `servicoExecutado`, `observacoes` | texto longo | Opcionais. |
| `valorNota` ★ | decimal(12,2), nulo | Opcional, maior ou igual a zero. |
| `retratoTecnico` | JSON | Cópia dos dados do motor e da bobinagem na abertura (RN-18). |

### 4.5 `Foto`
`id`, `motorId`, `osId` (nulo), `tipo` (`EQUIPAMENTO`, `ESQUEMA`, `SERVICO`), `chaveArmazenamento`, `mime`, `tamanhoBytes`, `largura`, `altura`. Foto de O.S. tem `osId`; foto do motor não tem.

### 4.6 `AcessoRecente` ★
`usuarioId`, `motorId`, `acessadoEm`. Alimenta "Acessados recentemente". Chave única (`usuarioId`, `motorId`).

### 4.7 `SequenciaRastreio`
`prefixo`, `ultimoNumero`. Atualizada em transação com bloqueio de linha para gerar o próximo número sem repetir.

## 5. Regras de negócio

### 5.1 Regras do PDF

| ID | Regra | Como implementar | Aceite |
|---|---|---|---|
| RN-01 | Cada motor tem um cadastro técnico permanente | Tabela `Motor` com `Bobinagem` | Abrir um motor mostra seus dados sempre que ele voltar |
| RN-02 | Rastreio próprio e não reutilizável | Restrição única no banco; motor desativado mantém o rastreio ocupado | Não existe forma de gerar ou digitar um rastreio já usado, mesmo por motor desativado |
| RN-03 | Rastreio automático ou digitado | Alternância na tela de novo motor | Os dois caminhos salvam um motor com rastreio válido |
| RN-04 | Duplicados bloqueados | Validação no servidor (autoridade) e verificação ao sair do campo | Digitar um rastreio existente mostra o erro e impede salvar |
| RN-05 | QR e etiqueta opcionais, também depois | Etiqueta na conclusão do cadastro e na ficha | Dá para pular a etiqueta e gerar depois |
| RN-06 | Cada O.S. é um registro separado, vinculado ao motor | `OrdemServico.motorId` | Duas visitas geram duas O.S. no mesmo motor |
| RN-07 | Número da O.S. digitado à mão | Campo de texto; sem geração automática | O sistema nunca preenche o número |
| RN-08 | Números de O.S. podem repetir | Sem índice único. Identificar sempre por `id`. | Duas O.S. "4310" salvam sem aviso e aparecem como itens distintos |
| RN-09 | Editar a ficha não altera O.S. antigas | O.S. guarda o retrato; a edição só atualiza `Motor`/`Bobinagem` | Depois de editar as voltas, a O.S. antiga mostra o valor antigo na aba "Na abertura" |
| RN-10 | Criar por modelo copia dados técnicos, sem O.S. nem fotos | Ver 5.3 | O novo motor não tem O.S. nem fotos; alterá-lo não muda o original |
| RN-11 | Fotos e esquemas ficam no motor ou na O.S. corretos | `Foto.motorId` e `Foto.osId` | Foto de uma O.S. nunca aparece como foto geral do motor |
| RN-12 | Monofásico tem bobina de trabalho e auxiliar separadas | Duas linhas em `Bobinagem` | Ao escolher monofásico aparecem os dois grupos de campos |
| RN-13 | Celular e PC, com sincronização | Um único backend; sem cópia local própria | Um cadastro feito no celular aparece no computador ao recarregar |

### 5.2 Regras acrescentadas ★

| ID | Regra | Observação |
|---|---|---|
| RN-14 | O.S. tem **valor da nota** opcional, em reais, maior ou igual a zero | Preenchido na abertura ou depois |
| RN-15 | **Faturamento do mês** = soma de `valorNota` das O.S. com `dataEntrada` no mês corrente | Provisório. Pode mudar quando existir "data da nota" (ver `04`, pergunta 4) |
| RN-16 | Acesso só com conta Google autenticada | Quem pode entrar: a confirmar |
| RN-17 | Motor não é apagado, é **desativado** | Preserva o histórico e o rastreio ocupado |
| RN-18 | Ao abrir uma O.S., o sistema grava o **retrato** dos dados técnicos (alternativa **C** do PDF, ainda pendente) | A O.S. mostra "Na abertura" (retrato) e "Ficha atual" (dados de hoje) |
| RN-19 | O QR Code aponta para `/m/{rastreio}`, que respeita o login | Sem login, vai ao login e volta |
| RN-20 | Início mostra cartões: motores cadastrados, faturamento do mês, O.S. no mês e clientes atendidos | Definições em 5.5 |

### 5.3 Copiar de um motor existente (RN-10)

| Copia | Não copia |
|---|---|
| Marca, modelo, tipo de equipamento, potência e unidade, tensão, corrente, RPM, F.S., item, pacote, diâmetro, tipo do motor | Cliente (o usuário preenche) |
| Todas as linhas de bobinagem (uma, ou as duas do monofásico) | Rastreio (o novo é gerado ou digitado) |
| | O.S., fotos e esquemas |

O usuário revisa e edita tudo antes de salvar. O motor novo é independente: não existe vínculo que propague alterações.

### 5.4 Rastreio

- **Formato**: ainda não definido. O PDF dá o exemplo `MOT-000125`, só como ilustração; o protótipo usa `SIL-000125`. Tornar o prefixo e a quantidade de dígitos **configuráveis** (`RASTREIO_PREFIXO`, `RASTREIO_DIGITOS`).
- **Automático**: o próximo número é gerado **no servidor, dentro da transação que salva o motor**. A tela mostra uma previsão. Se outro usuário salvar antes, o número definitivo aparece na confirmação.
- **Digitado**: aceito como digitado, depois de remover espaços nas pontas. Comparação sem diferenciar maiúsculas. Tamanho de 3 a 32 caracteres, com letras, números e `- _ . /` (a confirmar).
- **Erro padrão**: "`{valor}` já está em uso por outro motor. Digite outro número."
- **Nunca reutilizar**: o número fica ocupado mesmo se o motor for desativado.

### 5.5 Início: definição dos cartões e listas

| Item | Definição |
|---|---|
| Motores cadastrados | Quantidade de motores ativos |
| Faturamento de {mês} ★ | Soma de `valorNota` das O.S. com `dataEntrada` no mês corrente. O.S. sem valor não entram. Sem valores no mês: `R$ 0,00` |
| O.S. neste mês | Quantidade de O.S. com `dataEntrada` no mês corrente |
| Clientes atendidos | Quantidade de nomes de cliente distintos (comparação sem acento e sem diferenciar maiúsculas) entre os motores ativos com ao menos uma O.S. (a confirmar) |
| Acessados recentemente | Últimos motores abertos **pelo próprio usuário** (3 no celular, 4 no desktop) |
| Últimas O.S. (desktop) | As 4 O.S. mais recentes por `dataEntrada`, desempate por criação |

### 5.6 Busca

- Um campo único procura em: rastreio, cliente, número da O.S., marca, modelo, potência, tensão, RPM, pacote, diâmetro, tipo de equipamento.
- Vários termos se combinam com **E** ("weg 5 cv 1730").
- Ignora acentos e maiúsculas. Atualiza ao digitar, com espera de 250 ms.
- Resultado em dois grupos: **Motores** e **Ordens de serviço**. Abrir uma O.S. leva à ficha do motor, na aba de O.S., com a O.S. selecionada.
- Filtros avançados (marca, potência, RPM, tensão, pacote, diâmetro, tipo) ficam escondidos atrás de um botão e se somam à busca.
- Máximo de 20 resultados por grupo, com "Ver mais".

### 5.7 Fotos (todos os limites a confirmar)

- Tipos: equipamento, esquema de ligação e foto de serviço (da O.S.).
- Formatos aceitos: JPG, PNG, WebP e HEIC. Tamanho máximo de 10 MB por foto. Redução no navegador para até 2048 px no lado maior.
- Quantidade máxima por motor e por O.S.: a definir.
- Nunca copiar fotos ao cadastrar por modelo.

### 5.7.1 Etiqueta e QR Code

- QR com correção de erro nível M, módulos pretos sobre fundo branco e margem de silêncio de 4 módulos, também no modo escuro.
- Conteúdo: `{APP_URL}/m/{rastreio}`. Mostrar o rastreio em texto abaixo do QR.
- Tamanho de impressão e layout: pendentes. Criar folha de impressão (`@media print`) com o QR e o rastreio.

## 6. Validação de campos

| Campo | Obrigatório | Regra |
|---|---|---|
| Rastreio | Sim | Ver 5.4 |
| Cliente | Sim (a confirmar) | Texto de 2 a 120 caracteres |
| Tipo do motor | Sim | Trifásico ou monofásico |
| Potência | Não | Número maior que zero e uma unidade |
| Voltas | Não | Inteiro maior que zero |
| Passo | Não | Texto livre (exemplo `1-9`) |
| Número da O.S. | Sim | Texto livre, 1 a 20 caracteres, sem unicidade |
| Data de entrada | Sim | Data válida, padrão hoje; não pode estar no futuro (a confirmar) |
| Valor da nota ★ | Não | Moeda BRL, maior ou igual a zero, 2 casas, máscara no campo |
| Foto | Não | Ver 5.7 |

Mensagens de erro em português, curtas e dizendo o que fazer. A validação roda no servidor (autoridade) e no navegador (feedback).

## 7. Acesso e segurança

- Login com Google (Auth.js). Quem pode entrar: lista de e-mails autorizados ou qualquer conta (a confirmar).
- Papéis: pendentes no PDF. Proposta mínima: todos veem tudo, e **valores em dinheiro só para quem for administrador** (a confirmar com o cliente).
- Toda rota do app exige sessão. O QR respeita o login (RN-19).
- Registrar quem criou e quem alterou cada registro.

## 8. Requisitos não funcionais

| Tema | Meta |
|---|---|
| Desempenho | Busca com resposta em menos de 300 ms para até 10 mil motores |
| Responsivo | Celular 390 px e desktop 1280 px, com os mesmos dados |
| Acessibilidade | Contraste 4,5:1 (o botão laranja `#C94F07` com texto branco dá 4,56:1), foco visível, rótulo em todo campo |
| Movimento | As animações (motor, prancheta) param com `prefers-reduced-motion` |
| Idioma | pt-BR |
| Auditoria | Autor e data em todo registro |
| Dados | Backup e recuperação: pendentes |
