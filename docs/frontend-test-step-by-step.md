# Contexto de dados para testes frontend (6º e 7º ano)

Este arquivo atende aos requisitos de massa de dados para frontend:

- 8 trilhas (4 matérias x 2 séries)
- 48 conteúdos
  - 24 conteúdos de trilha (níveis 1, 2 e 3)
  - 24 conteúdos de reforço (nível `reforco`)
- 24 avaliações (3 por matéria/série)
- cada avaliação com 3 questões: `multiple_choice`, `true_false`, `text`
- **campos completos de conteúdo:** `tags`, `topics` e `contentText`
- **campos completos de questões:** `tags` por questão

---

## 1) Trilhas (8)

| Série | Matéria    | Nome da trilha                | isDefault |
| ----- | ---------- | ----------------------------- | --------- |
| 6     | Português  | Trilha de Português - 6º ano  | true      |
| 6     | Matemática | Trilha de Matemática - 6º ano | true      |
| 6     | História   | Trilha de História - 6º ano   | true      |
| 6     | Ciências   | Trilha de Ciências - 6º ano   | true      |
| 7     | Português  | Trilha de Português - 7º ano  | true      |
| 7     | Matemática | Trilha de Matemática - 7º ano | true      |
| 7     | História   | Trilha de História - 7º ano   | true      |
| 7     | Ciências   | Trilha de Ciências - 7º ano   | true      |

---

## 2) Conteúdos (48)

Formato mínimo por conteúdo:

- `title`
- `grade`
- `level`
- `tags`
- `topics`
- `contentText`

## 2.1 6º ano

### Português - 6º ano

#### Nível 1

- **title:** Leitura e ideia principal
- **grade:** `6`
- **level:** `1`
- **tags:** `interpretação`, `leitura`, `ideia-principal`
- **topics:** `compreensão textual`, `tema central`, `informações explícitas`
- **contentText:** Leitura orientada de textos curtos para identificar tema, objetivo do autor e ideia principal com base em pistas textuais.

#### Nível 2

- **title:** Coesão textual e conectivos
- **grade:** `6`
- **level:** `2`
- **tags:** `coesão`, `conectivos`, `parágrafo`
- **topics:** `organização de ideias`, `conectores de oposição e conclusão`, `fluidez textual`
- **contentText:** Uso de conectivos para ligar frases e parágrafos, evitando repetições e melhorando a progressão lógica do texto.

#### Nível 3

- **title:** Produção de texto argumentativo inicial
- **grade:** `6`
- **level:** `3`
- **tags:** `argumentação`, `tese`, `opinião`
- **topics:** `tese`, `argumento`, `conclusão`
- **contentText:** Introdução ao texto argumentativo com foco na construção de opinião fundamentada e organização básica de argumentos.

#### Reforço 1

- **title:** Reforço: ortografia e acentuação
- **grade:** `6`
- **level:** `reforco`
- **tags:** `ortografia`, `acentuação`, `revisão`
- **topics:** `regras de acentuação`, `grafia correta`, `correção de erros`
- **contentText:** Revisão prática das principais regras de ortografia e acentuação com exercícios contextualizados.

#### Reforço 2

- **title:** Reforço: pontuação básica
- **grade:** `6`
- **level:** `reforco`
- **tags:** `pontuação`, `clareza`, `frase`
- **topics:** `ponto final`, `vírgula`, `interrogação e exclamação`
- **contentText:** Aplicação de sinais de pontuação para melhorar clareza, ritmo e sentido de frases e pequenos textos.

#### Reforço 3

- **title:** Reforço: concordância verbal e nominal
- **grade:** `6`
- **level:** `reforco`
- **tags:** `concordância`, `gramática`, `sujeito-verbo`
- **topics:** `concordância verbal`, `concordância nominal`, `erros frequentes`
- **contentText:** Prática de concordância entre sujeito e verbo, além de ajuste entre substantivos e adjetivos em diferentes contextos.

### Matemática - 6º ano

#### Nível 1

- **title:** Operações com números decimais
- **grade:** `6`
- **level:** `1`
- **tags:** `decimais`, `operações`, `valor-posicional`
- **topics:** `adição`, `subtração`, `alinhamento de vírgulas`
- **contentText:** Resolução de operações com decimais em situações de compra, medidas e comparação de valores.

#### Nível 2

- **title:** Frações equivalentes e simplificação
- **grade:** `6`
- **level:** `2`
- **tags:** `frações`, `equivalência`, `simplificação`
- **topics:** `frações equivalentes`, `MDC`, `comparação`
- **contentText:** Estudo de frações equivalentes e simplificação com problemas que envolvem parte-todo e comparação de quantidades.

#### Nível 3

- **title:** Expressões numéricas com racionais
- **grade:** `6`
- **level:** `3`
- **tags:** `racionais`, `expressões`, `ordem-de-operações`
- **topics:** `parênteses`, `prioridade de operações`, `interpretação`
- **contentText:** Resolução de expressões numéricas com números racionais, respeitando hierarquia de operações.

#### Reforço 1

- **title:** Reforço: adição e subtração com decimais
- **grade:** `6`
- **level:** `reforco`
- **tags:** `decimais`, `cálculo`, `revisão`
- **topics:** `valor posicional`, `operações básicas`, `conferência de resultado`
- **contentText:** Reforço com exercícios graduais de adição e subtração de números decimais em contextos reais.

#### Reforço 2

- **title:** Reforço: comparação de frações
- **grade:** `6`
- **level:** `reforco`
- **tags:** `frações`, `comparação`, `representação`
- **topics:** `denominadores iguais`, `denominadores diferentes`, `reta numérica`
- **contentText:** Estratégias para comparar frações por equivalência, ampliação e representação gráfica.

#### Reforço 3

- **title:** Reforço: interpretação de problemas matemáticos
- **grade:** `6`
- **level:** `reforco`
- **tags:** `problemas`, `estratégia`, `interpretação`
- **topics:** `identificação de dados`, `escolha de operação`, `resposta`
- **contentText:** Leitura de problemas com foco em extração de dados, escolha de operação adequada e validação da resposta.

### História - 6º ano

#### Nível 1

- **title:** Tempo histórico e cronologia
- **grade:** `6`
- **level:** `1`
- **tags:** `cronologia`, `século`, `linha-do-tempo`
- **topics:** `ordem temporal`, `periodização`, `eventos históricos`
- **contentText:** Introdução ao tempo histórico e organização de acontecimentos em sequência cronológica.

#### Nível 2

- **title:** Fontes históricas e memória
- **grade:** `6`
- **level:** `2`
- **tags:** `fontes`, `memória`, `documentos`
- **topics:** `fontes escritas`, `fontes visuais`, `interpretação`
- **contentText:** Uso de diferentes fontes históricas para construir narrativas sobre o passado.

#### Nível 3

- **title:** Povos antigos e organização social
- **grade:** `6`
- **level:** `3`
- **tags:** `antiguidade`, `sociedade`, `cultura`
- **topics:** `vida cotidiana`, `trabalho`, `formas de poder`
- **contentText:** Estudo comparativo de povos antigos e seus modos de organização social e cultural.

#### Reforço 1

- **title:** Reforço: leitura de linha do tempo
- **grade:** `6`
- **level:** `reforco`
- **tags:** `linha-do-tempo`, `datas`, `sequência`
- **topics:** `antes/depois`, `marcos históricos`, `ordenação`
- **contentText:** Atividades de leitura e montagem de linhas do tempo para consolidar noções de anterioridade e posterioridade.

#### Reforço 2

- **title:** Reforço: interpretação de documentos históricos
- **grade:** `6`
- **level:** `reforco`
- **tags:** `fontes`, `análise`, `contexto`
- **topics:** `autor e contexto`, `intenção`, `evidência`
- **contentText:** Prática de análise guiada de documentos e imagens para identificar informações históricas relevantes.

#### Reforço 3

- **title:** Reforço: noções de período histórico
- **grade:** `6`
- **level:** `reforco`
- **tags:** `períodos`, `revisão`, `história`
- **topics:** `periodização`, `continuidade`, `mudança`
- **contentText:** Revisão de critérios de divisão do tempo histórico e reconhecimento de mudanças e permanências.

### Ciências - 6º ano

#### Nível 1

- **title:** Célula e organização dos seres vivos
- **grade:** `6`
- **level:** `1`
- **tags:** `célula`, `seres-vivos`, `organização`
- **topics:** `célula`, `tecido`, `órgão e sistema`
- **contentText:** Estudo da célula como unidade básica da vida e dos níveis de organização biológica.

#### Nível 2

- **title:** Misturas e separação de materiais
- **grade:** `6`
- **level:** `2`
- **tags:** `misturas`, `separação`, `matéria`
- **topics:** `homogênea/heterogênea`, `filtração`, `decantação`
- **contentText:** Identificação de tipos de mistura e aplicação de métodos de separação em exemplos do cotidiano.

#### Nível 3

- **title:** Ecossistemas e cadeias alimentares
- **grade:** `6`
- **level:** `3`
- **tags:** `ecossistema`, `cadeia-alimentar`, `equilíbrio`
- **topics:** `produtores e consumidores`, `teia alimentar`, `fluxo de energia`
- **contentText:** Relações ecológicas básicas com foco em cadeia alimentar e equilíbrio ambiental.

#### Reforço 1

- **title:** Reforço: partes da célula
- **grade:** `6`
- **level:** `reforco`
- **tags:** `célula`, `organelas`, `funções`
- **topics:** `membrana`, `núcleo`, `citoplasma`
- **contentText:** Revisão das principais estruturas celulares e suas funções em linguagem acessível.

#### Reforço 2

- **title:** Reforço: estados físicos da matéria
- **grade:** `6`
- **level:** `reforco`
- **tags:** `matéria`, `estados-físicos`, `mudanças`
- **topics:** `sólido/líquido/gasoso`, `fusão`, `evaporação`
- **contentText:** Reforço sobre estados físicos da matéria e mudanças de estado com exemplos diários.

#### Reforço 3

- **title:** Reforço: relações alimentares no ambiente
- **grade:** `6`
- **level:** `reforco`
- **tags:** `ecologia`, `cadeia-alimentar`, `ambiente`
- **topics:** `níveis tróficos`, `predação`, `equilíbrio`
- **contentText:** Exercícios de identificação de níveis tróficos e análise de impacto ambiental em cadeias alimentares.

## 2.2 7º ano

### Português - 7º ano

#### Nível 1

- **title:** Interpretação e inferência textual
- **grade:** `7`
- **level:** `1`
- **tags:** `inferência`, `interpretação`, `contexto`
- **topics:** `informação implícita`, `pistas textuais`, `sentido global`
- **contentText:** Desenvolvimento da leitura inferencial para compreender sentidos não explícitos no texto.

#### Nível 2

- **title:** Estrutura de parágrafos argumentativos
- **grade:** `7`
- **level:** `2`
- **tags:** `parágrafo`, `argumentação`, `organização`
- **topics:** `frase temática`, `desenvolvimento`, `fechamento`
- **contentText:** Construção de parágrafos argumentativos com organização lógica e progressão de ideias.

#### Nível 3

- **title:** Defesa de ponto de vista em texto
- **grade:** `7`
- **level:** `3`
- **tags:** `tese`, `argumentos`, `persuasão`
- **topics:** `seleção de argumentos`, `refutação`, `conclusão`
- **contentText:** Estratégias de escrita para defender ponto de vista com consistência e clareza.

#### Reforço 1

- **title:** Reforço: interpretação de enunciados
- **grade:** `7`
- **level:** `reforco`
- **tags:** `interpretação`, `enunciado`, `compreensão`
- **topics:** `verbos de comando`, `objetivo da questão`, `resposta adequada`
- **contentText:** Treino de leitura de enunciados para evitar erros por interpretação inadequada.

#### Reforço 2

- **title:** Reforço: uso de conectores lógicos
- **grade:** `7`
- **level:** `reforco`
- **tags:** `conectores`, `coesão`, `argumentação`
- **topics:** `adição`, `oposição`, `conclusão`
- **contentText:** Aplicação de conectores para garantir fluidez e coerência em textos argumentativos.

#### Reforço 3

- **title:** Reforço: revisão gramatical aplicada
- **grade:** `7`
- **level:** `reforco`
- **tags:** `gramática`, `revisão`, `reescrita`
- **topics:** `pontuação`, `concordância`, `clareza`
- **contentText:** Revisão orientada de aspectos gramaticais com foco em qualidade de texto e reescrita.

### Matemática - 7º ano

#### Nível 1

- **title:** Introdução à álgebra
- **grade:** `7`
- **level:** `1`
- **tags:** `álgebra`, `incógnita`, `expressão`
- **topics:** `variável`, `termos algébricos`, `modelagem simples`
- **contentText:** Primeiros conceitos algébricos com tradução de linguagem verbal para expressões matemáticas.

#### Nível 2

- **title:** Equações do 1º grau
- **grade:** `7`
- **level:** `2`
- **tags:** `equações`, `resolução`, `verificação`
- **topics:** `isolamento da incógnita`, `operações inversas`, `checagem`
- **contentText:** Resolução de equações lineares com passo a passo e validação das soluções encontradas.

#### Nível 3

- **title:** Problemas com equações e inequações
- **grade:** `7`
- **level:** `3`
- **tags:** `inequações`, `problemas`, `interpretação`
- **topics:** `modelagem`, `conjunto solução`, `aplicações`
- **contentText:** Situações-problema envolvendo equações e inequações com interpretação de resultados.

#### Reforço 1

- **title:** Reforço: manipulação algébrica básica
- **grade:** `7`
- **level:** `reforco`
- **tags:** `álgebra`, `simplificação`, `termos`
- **topics:** `termos semelhantes`, `redução`, `operações algébricas`
- **contentText:** Reforço de regras operatórias em expressões algébricas simples.

#### Reforço 2

- **title:** Reforço: validação de soluções
- **grade:** `7`
- **level:** `reforco`
- **tags:** `equações`, `verificação`, `erro-comum`
- **topics:** `substituição`, `conferência`, `análise de erro`
- **contentText:** Estratégias para verificar soluções e identificar erros frequentes em resolução de equações.

#### Reforço 3

- **title:** Reforço: tradução de texto para expressão matemática
- **grade:** `7`
- **level:** `reforco`
- **tags:** `modelagem`, `problemas`, `linguagem-matemática`
- **topics:** `interpretação verbal`, `símbolos`, `montagem de sentença`
- **contentText:** Conversão de enunciados verbais em expressões, equações e inequações.

### História - 7º ano

#### Nível 1

- **title:** Formação do mundo moderno
- **grade:** `7`
- **level:** `1`
- **tags:** `modernidade`, `transformações`, `história`
- **topics:** `mudanças sociais`, `expansão comercial`, `novas ideias`
- **contentText:** Panorama das transformações que marcaram a passagem para a modernidade.

#### Nível 2

- **title:** Brasil Colonial: economia e sociedade
- **grade:** `7`
- **level:** `2`
- **tags:** `brasil-colonial`, `economia`, `sociedade`
- **topics:** `engenho`, `trabalho`, `estratificação social`
- **contentText:** Relações entre economia colonial e organização social no Brasil.

#### Nível 3

- **title:** Iluminismo e movimentos de independência
- **grade:** `7`
- **level:** `3`
- **tags:** `iluminismo`, `independência`, `direitos`
- **topics:** `razão`, `cidadania`, `mudança política`
- **contentText:** Ideias iluministas e sua influência em processos de independência e direitos políticos.

#### Reforço 1

- **title:** Reforço: economia colonial e trabalho
- **grade:** `7`
- **level:** `reforco`
- **tags:** `economia`, `colonização`, `trabalho`
- **topics:** `produção açucareira`, `mão de obra`, `circuitos comerciais`
- **contentText:** Revisão dos elementos econômicos centrais do período colonial e suas implicações sociais.

#### Reforço 2

- **title:** Reforço: leitura crítica de processos históricos
- **grade:** `7`
- **level:** `reforco`
- **tags:** `análise`, `contexto`, `interpretação`
- **topics:** `causa e consequência`, `contextualização`, `perspectivas`
- **contentText:** Leitura crítica de processos históricos com foco em relações de causa e consequência.

#### Reforço 3

- **title:** Reforço: revoluções e mudanças políticas
- **grade:** `7`
- **level:** `reforco`
- **tags:** `revoluções`, `política`, `transformações`
- **topics:** `rupturas`, `novas formas de governo`, `participação`
- **contentText:** Consolidação de conceitos sobre revoluções e seus impactos políticos e sociais.

### Ciências - 7º ano

#### Nível 1

- **title:** Organização dos ecossistemas
- **grade:** `7`
- **level:** `1`
- **tags:** `ecossistemas`, `fatores-bióticos`, `fatores-abióticos`
- **topics:** `componentes do ecossistema`, `interações`, `equilíbrio`
- **contentText:** Estrutura de ecossistemas e interações entre componentes vivos e não vivos.

#### Nível 2

- **title:** Transformações químicas no cotidiano
- **grade:** `7`
- **level:** `2`
- **tags:** `transformações`, `química`, `reações`
- **topics:** `evidências de reação`, `substâncias`, `mudanças irreversíveis`
- **contentText:** Identificação de transformações químicas em fenômenos do dia a dia.

#### Nível 3

- **title:** Saúde, prevenção e qualidade de vida
- **grade:** `7`
- **level:** `3`
- **tags:** `saúde`, `prevenção`, `qualidade-de-vida`
- **topics:** `hábitos saudáveis`, `vacinação`, `ambiente e saúde`
- **contentText:** Relação entre prevenção, hábitos de vida e promoção da saúde individual e coletiva.

#### Reforço 1

- **title:** Reforço: cadeia alimentar e teia trófica
- **grade:** `7`
- **level:** `reforco`
- **tags:** `cadeia-alimentar`, `teia-trófica`, `energia`
- **topics:** `níveis tróficos`, `fluxo de energia`, `desequilíbrio`
- **contentText:** Revisão de cadeias e teias alimentares com análise de impactos em ecossistemas.

#### Reforço 2

- **title:** Reforço: evidências de transformação química
- **grade:** `7`
- **level:** `reforco`
- **tags:** `reação`, `evidências`, `química`
- **topics:** `mudança de cor`, `liberação de gás`, `formação de precipitado`
- **contentText:** Exercícios para reconhecer evidências de transformações químicas em experimentos simples.

#### Reforço 3

- **title:** Reforço: hábitos saudáveis e vacinação
- **grade:** `7`
- **level:** `reforco`
- **tags:** `prevenção`, `vacinação`, `autocuidado`
- **topics:** `imunização`, `higiene`, `rotina saudável`
- **contentText:** Práticas de prevenção e autocuidado para promoção de saúde no contexto escolar.

---

## 3) Avaliações (24)

Formato fixo em todas as avaliações:

- Q1: `multiple_choice` + `tags`
- Q2: `true_false` + `tags`
- Q3: `text` + `tags`

## 3.1 Português - 6º ano (3 avaliações)

### Avaliação 1: Compreensão textual básica

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: A ideia principal de um texto é:
  - Alternativas: A) detalhe secundário B) mensagem central C) nome do autor D) última frase
  - Resposta esperada: B
  - **tags:** `interpretação`, `ideia-principal`
- **Q2 (true_false)**
  - Enunciado: Título e palavras repetidas ajudam a identificar o tema do texto.
  - Resposta esperada: true
  - **tags:** `leitura`, `tema`
- **Q3 (text)**
  - Enunciado: Explique em uma frase o que é ideia principal.
  - **tags:** `produção-escrita`, `síntese`

### Avaliação 2: Coesão e conectivos

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: Qual conectivo indica oposição?
  - Alternativas: A) portanto B) além disso C) porém D) porque
  - Resposta esperada: C
  - **tags:** `conectivos`, `coesão`
- **Q2 (true_false)**
  - Enunciado: Coesão e coerência possuem o mesmo significado exato.
  - Resposta esperada: false
  - **tags:** `coesão`, `coerência`
- **Q3 (text)**
  - Enunciado: Escreva uma frase com conectivo de conclusão.
  - **tags:** `escrita`, `conclusão`

### Avaliação 3: Argumentação inicial

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: Em texto argumentativo, tese é:
  - Alternativas: A) opinião defendida B) referência bibliográfica C) data de publicação D) saudação inicial
  - Resposta esperada: A
  - **tags:** `tese`, `argumentação`
- **Q2 (true_false)**
  - Enunciado: Argumentos devem sustentar a tese.
  - Resposta esperada: true
  - **tags:** `argumentos`, `coerência`
- **Q3 (text)**
  - Enunciado: Escreva uma tese sobre uso consciente de água na escola.
  - **tags:** `produção-textual`, `opinião`

## 3.2 Matemática - 6º ano (3 avaliações)

### Avaliação 1: Decimais

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: `2,4 + 1,3 =`
  - Alternativas: A) `3,7` B) `3,1` C) `2,7` D) `4,7`
  - Resposta esperada: A
  - **tags:** `decimais`, `adição`
- **Q2 (true_false)**
  - Enunciado: `1,9` é maior que `1,89`.
  - Resposta esperada: true
  - **tags:** `comparação`, `decimais`
- **Q3 (text)**
  - Enunciado: Explique por que alinhar vírgulas ajuda em operações com decimais.
  - **tags:** `valor-posicional`, `procedimento`

### Avaliação 2: Frações

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: Fração equivalente a `2/4`:
  - Alternativas: A) `1/2` B) `2/3` C) `3/5` D) `4/7`
  - Resposta esperada: A
  - **tags:** `frações`, `equivalência`
- **Q2 (true_false)**
  - Enunciado: `3/6` e `1/2` representam o mesmo valor.
  - Resposta esperada: true
  - **tags:** `frações`, `simplificação`
- **Q3 (text)**
  - Enunciado: Descreva como comparar duas frações de mesmo denominador.
  - **tags:** `comparação`, `raciocínio`

### Avaliação 3: Expressões numéricas

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: `10 - (2 + 3) =`
  - Alternativas: A) 15 B) 5 C) 8 D) 10
  - Resposta esperada: B
  - **tags:** `expressões`, `ordem-de-operações`
- **Q2 (true_false)**
  - Enunciado: Em expressões numéricas, parênteses devem ser resolvidos antes.
  - Resposta esperada: true
  - **tags:** `prioridade`, `procedimento`
- **Q3 (text)**
  - Enunciado: Escreva uma expressão com duas operações e mostre o resultado.
  - **tags:** `expressões`, `resolução`

## 3.3 História - 6º ano (3 avaliações)

### Avaliação 1: Cronologia

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: Século XXI corresponde a:
  - Alternativas: A) 1901-2000 B) 2001-2100 C) 1801-1900 D) 2101-2200
  - Resposta esperada: B
  - **tags:** `cronologia`, `século`
- **Q2 (true_false)**
  - Enunciado: Cronologia organiza fatos em ordem temporal.
  - Resposta esperada: true
  - **tags:** `tempo-histórico`, `ordem`
- **Q3 (text)**
  - Enunciado: Explique em uma frase o que é linha do tempo.
  - **tags:** `linha-do-tempo`, `conceito`

### Avaliação 2: Fontes históricas

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: Exemplo de fonte histórica escrita:
  - Alternativas: A) jornal antigo B) raio-x C) termômetro D) satélite
  - Resposta esperada: A
  - **tags:** `fontes`, `documentos`
- **Q2 (true_false)**
  - Enunciado: Fotografias também podem ser fontes históricas.
  - Resposta esperada: true
  - **tags:** `fontes-visuais`, `memória`
- **Q3 (text)**
  - Enunciado: Cite uma fonte histórica e explique o que ela pode revelar.
  - **tags:** `análise`, `interpretação`

### Avaliação 3: Povos antigos

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: Civilizações antigas costumavam se desenvolver próximas a:
  - Alternativas: A) desertos sem água B) rios C) montanhas nevadas D) ilhas vulcânicas
  - Resposta esperada: B
  - **tags:** `antiguidade`, `território`
- **Q2 (true_false)**
  - Enunciado: A organização social muda ao longo do tempo histórico.
  - Resposta esperada: true
  - **tags:** `mudança`, `sociedade`
- **Q3 (text)**
  - Enunciado: Escreva uma diferença entre a vida antiga e a atual.
  - **tags:** `comparação-histórica`, `cotidiano`

## 3.4 Ciências - 6º ano (3 avaliações)

### Avaliação 1: Célula

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: Unidade básica dos seres vivos:
  - Alternativas: A) átomo B) célula C) tecido D) órgão
  - Resposta esperada: B
  - **tags:** `célula`, `seres-vivos`
- **Q2 (true_false)**
  - Enunciado: Órgãos são formados por tecidos.
  - Resposta esperada: true
  - **tags:** `organização-biológica`, `tecidos`
- **Q3 (text)**
  - Enunciado: Cite uma função da membrana celular.
  - **tags:** `organelas`, `função`

### Avaliação 2: Misturas

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: Método para separar areia e água:
  - Alternativas: A) filtração B) fusão C) sublimação D) condensação
  - Resposta esperada: A
  - **tags:** `misturas`, `separação`
- **Q2 (true_false)**
  - Enunciado: Mistura homogênea apresenta uma fase visível.
  - Resposta esperada: true
  - **tags:** `matéria`, `fases`
- **Q3 (text)**
  - Enunciado: Dê um exemplo de mistura heterogênea.
  - **tags:** `misturas`, `exemplos`

### Avaliação 3: Ecossistemas

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: Produtores na cadeia alimentar são:
  - Alternativas: A) plantas e algas B) fungos C) carnívoros D) herbívoros
  - Resposta esperada: A
  - **tags:** `cadeia-alimentar`, `produtores`
- **Q2 (true_false)**
  - Enunciado: Alterar uma espécie pode afetar o equilíbrio do ecossistema.
  - Resposta esperada: true
  - **tags:** `equilíbrio`, `ecossistema`
- **Q3 (text)**
  - Enunciado: Explique em uma frase o que é cadeia alimentar.
  - **tags:** `ecologia`, `conceito`

## 3.5 Português - 7º ano (3 avaliações)

### Avaliação 1: Inferência textual

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: Inferir em leitura é:
  - Alternativas: A) copiar frases B) deduzir informações implícitas C) decorar palavras D) ignorar contexto
  - Resposta esperada: B
  - **tags:** `inferência`, `interpretação`
- **Q2 (true_false)**
  - Enunciado: Inferência depende de pistas no texto e do conhecimento prévio.
  - Resposta esperada: true
  - **tags:** `leitura`, `contexto`
- **Q3 (text)**
  - Enunciado: Escreva uma inferência possível a partir de um texto sobre chuva intensa.
  - **tags:** `produção`, `compreensão`

### Avaliação 2: Estrutura argumentativa

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: Qual opção representa argumento?
  - Alternativas: A) Eu concordo porque... B) Meu nome é... C) Data de entrega D) Fim
  - Resposta esperada: A
  - **tags:** `argumentação`, `estrutura`
- **Q2 (true_false)**
  - Enunciado: Todo texto argumentativo precisa ter um ponto de vista.
  - Resposta esperada: true
  - **tags:** `tese`, `opinião`
- **Q3 (text)**
  - Enunciado: Escreva um argumento curto defendendo leitura diária.
  - **tags:** `escrita`, `persuasão`

### Avaliação 3: Revisão linguística

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: Frase com pontuação adequada:
  - Alternativas: A) Vamos estudar agora. B) Vamos estudar agora C) Vamos estudar, agora, D) Vamos estudar agora,,
  - Resposta esperada: A
  - **tags:** `pontuação`, `norma-padrão`
- **Q2 (true_false)**
  - Enunciado: Revisão textual inclui ortografia e clareza de ideias.
  - Resposta esperada: true
  - **tags:** `revisão`, `clareza`
- **Q3 (text)**
  - Enunciado: Reescreva uma frase simples melhorando a clareza.
  - **tags:** `reescrita`, `coerência`

## 3.6 Matemática - 7º ano (3 avaliações)

### Avaliação 1: Introdução à álgebra

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: Em `x + 3`, `x` representa:
  - Alternativas: A) constante fixa B) variável C) fração imprópria D) porcentagem
  - Resposta esperada: B
  - **tags:** `álgebra`, `variável`
- **Q2 (true_false)**
  - Enunciado: Uma variável pode assumir diferentes valores.
  - Resposta esperada: true
  - **tags:** `conceitos`, `álgebra`
- **Q3 (text)**
  - Enunciado: Escreva uma expressão algébrica para “o dobro de um número”.
  - **tags:** `modelagem`, `expressão`

### Avaliação 2: Equações do 1º grau

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: Resolver `x - 5 = 9`:
  - Alternativas: A) `x=4` B) `x=14` C) `x=9` D) `x=-4`
  - Resposta esperada: B
  - **tags:** `equações`, `resolução`
- **Q2 (true_false)**
  - Enunciado: Se `x + 2 = 7`, então `x = 5`.
  - Resposta esperada: true
  - **tags:** `equações`, `verificação`
- **Q3 (text)**
  - Enunciado: Monte uma equação para “um número somado com 8 dá 20”.
  - **tags:** `modelagem`, `linguagem-matemática`

### Avaliação 3: Inequações e problemas

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: `x + 4 > 10` implica:
  - Alternativas: A) `x > 6` B) `x < 6` C) `x = 6` D) `x >= 4`
  - Resposta esperada: A
  - **tags:** `inequações`, `conjunto-solução`
- **Q2 (true_false)**
  - Enunciado: Inequações podem ter mais de uma solução.
  - Resposta esperada: true
  - **tags:** `inequações`, `interpretação`
- **Q3 (text)**
  - Enunciado: Dê um exemplo de situação cotidiana modelada por inequação.
  - **tags:** `problemas`, `modelagem`

## 3.7 História - 7º ano (3 avaliações)

### Avaliação 1: Mundo moderno

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: Uma característica da modernidade é:
  - Alternativas: A) ausência de comércio B) expansão das trocas e mudanças políticas C) fim das cidades D) inexistência de conflitos
  - Resposta esperada: B
  - **tags:** `modernidade`, `transformações`
- **Q2 (true_false)**
  - Enunciado: Processos históricos podem ocorrer de forma gradual e desigual.
  - Resposta esperada: true
  - **tags:** `processos-históricos`, `temporalidade`
- **Q3 (text)**
  - Enunciado: Explique em uma frase o que significa transformação histórica.
  - **tags:** `conceito`, `história`

### Avaliação 2: Brasil Colonial

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: No período colonial, o engenho estava ligado principalmente a:
  - Alternativas: A) extração de ouro no século XX B) produção de açúcar C) indústria automobilística D) informática
  - Resposta esperada: B
  - **tags:** `brasil-colonial`, `economia`
- **Q2 (true_false)**
  - Enunciado: O trabalho compulsório foi parte da estrutura colonial.
  - Resposta esperada: true
  - **tags:** `trabalho`, `sociedade`
- **Q3 (text)**
  - Enunciado: Cite uma consequência social do modelo econômico colonial.
  - **tags:** `impactos-sociais`, `análise`

### Avaliação 3: Iluminismo e independências

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: O Iluminismo defendia:
  - Alternativas: A) razão e crítica B) censura absoluta C) rejeição da ciência D) imobilidade social
  - Resposta esperada: A
  - **tags:** `iluminismo`, `ideias`
- **Q2 (true_false)**
  - Enunciado: Ideias iluministas influenciaram debates sobre direitos e governo.
  - Resposta esperada: true
  - **tags:** `direitos`, `política`
- **Q3 (text)**
  - Enunciado: Relacione Iluminismo com movimentos de independência em uma frase.
  - **tags:** `independência`, `contexto-histórico`

## 3.8 Ciências - 7º ano (3 avaliações)

### Avaliação 1: Ecossistemas

- **Nível:** 1
- **Q1 (multiple_choice)**
  - Enunciado: Exemplo de fator biótico:
  - Alternativas: A) temperatura B) água C) planta D) luz solar
  - Resposta esperada: C
  - **tags:** `ecossistemas`, `fatores-bióticos`
- **Q2 (true_false)**
  - Enunciado: Fatores abióticos influenciam os seres vivos.
  - Resposta esperada: true
  - **tags:** `fatores-abióticos`, `ambiente`
- **Q3 (text)**
  - Enunciado: Explique em uma frase a relação entre ser vivo e ambiente.
  - **tags:** `ecologia`, `interação`

### Avaliação 2: Transformações químicas

- **Nível:** 2
- **Q1 (multiple_choice)**
  - Enunciado: Exemplo de transformação química:
  - Alternativas: A) derretimento do gelo B) evaporação da água C) ferrugem no ferro D) quebra de vidro
  - Resposta esperada: C
  - **tags:** `química`, `transformações`
- **Q2 (true_false)**
  - Enunciado: Nem toda transformação observada é física; algumas são químicas.
  - Resposta esperada: true
  - **tags:** `reação-química`, `evidências`
- **Q3 (text)**
  - Enunciado: Cite um indício de reação química observado no dia a dia.
  - **tags:** `observação`, `evidências`

### Avaliação 3: Saúde e prevenção

- **Nível:** 3
- **Q1 (multiple_choice)**
  - Enunciado: Prática de prevenção em saúde:
  - Alternativas: A) ignorar vacinas B) higiene das mãos C) automedicação sem orientação D) sedentarismo extremo
  - Resposta esperada: B
  - **tags:** `saúde`, `prevenção`
- **Q2 (true_false)**
  - Enunciado: Hábitos saudáveis ajudam na qualidade de vida.
  - Resposta esperada: true
  - **tags:** `qualidade-de-vida`, `hábitos`
- **Q3 (text)**
  - Enunciado: Escreva uma ação simples de prevenção para ambiente escolar.
  - **tags:** `autocuidado`, `escola`

---

## 4) Checklist final

- [x] 8 trilhas (4 matérias x 2 séries)
- [x] 48 conteúdos com `tags`, `topics`, `contentText`
- [x] 24 avaliações (3 por matéria/série)
- [x] 3 questões por avaliação (`multiple_choice`, `true_false`, `text`)
- [x] `tags` em todas as questões
