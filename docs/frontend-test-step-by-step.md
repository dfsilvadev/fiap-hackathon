# Passo a passo para testes no frontend

Este documento descreve roteiros de teste para **professor** e **aluno**, com dados reais para criação de conteúdos, trilhas, avaliações e reforço para **6º e 7º ano** nas matérias **Português** e **Matemática**.

---

## Pré-requisitos

- Backend rodando (ex.: `npm run dev`).
- Seed executado (`npx prisma db seed`) para ter categorias (Português, Matemática, etc.), um coordenador, um professor e um aluno de teste.
- **Importante:** No seed padrão, o professor (`professor@example.com`) está vinculado apenas à **primeira** categoria (Português). Para testar as duas matérias:
  - **Opção A:** Como **coordenador**, editar o usuário professor e adicionar a matéria **Matemática** (além de Português) em "Matérias que leciona".
  - **Opção B:** Executar apenas os passos de Português com o professor do seed; criar um segundo professor (via coordenador) vinculado a Matemática, ou usar o coordenador para criar conteúdos/trilhas/avaliações de Matemática.

**Credenciais do seed:**

| Perfil       | Email                  | Senha    |
|-------------|------------------------|----------|
| Coordenador | admin@example.com      | Admin@123 |
| Professor   | professor@example.com  | Senha123  |
| Aluno       | aluno@example.com      | Senha123  |

**Séries usadas nos dados:** `"6"` (6º ano), `"7"` (7º ano).  
**Matérias:** Português, Matemática (nomes exatos das categorias no seed).

---

# Parte 1 — Testes como PROFESSOR

Objetivo: criar conteúdos, trilhas, avaliações e conteúdos de reforço para 6º e 7º ano em Português e Matemática, e validar listagens/edição.

---

## 1.1 Login como professor

1. Acesse a tela de login.
2. Email: `professor@example.com`
3. Senha: `Senha123`
4. Submeta o formulário.
5. **Esperado:** Redirecionamento para a área do professor (ex.: dashboard ou listagem de alunos/conteúdos).

---

## 1.2 Obter IDs das matérias (se a tela precisar)

- Se o frontend não carregar as matérias sozinho: faça **GET** `/api/contents` ou **GET** `/api/learning-paths` e use os `category.id` e `category.name` das respostas para identificar **Português** e **Matemática**.
- Anote ou use no formulário: **categoryId de Português** e **categoryId de Matemática**.

---

## 1.3 Criar conteúdos — Português (6º ano)

Criar quatro conteúdos: nível 1, 2, 3 e reforço.

**1.3.1 Conteúdo Nível 1 — Interpretação de texto**

- Acesse: Criar novo conteúdo (ou **POST** `/api/contents`).
- Preencha:
  - **Título:** Leitura e compreensão de textos curtos
  - **Matéria:** Português
  - **Série:** 6
  - **Nível:** 1
  - **Texto principal:**  
    "Neste conteúdo você vai praticar a leitura de textos curtos e identificar a ideia principal. Leia com atenção e responda às perguntas ao final. A ideia principal é o que o autor mais quer comunicar. Exemplo: em um texto sobre cuidados com a água, a ideia principal pode ser a importância de economizar."
  - **Tags (opcional):** `["interpretação", "ideia principal", "leitura"]`
- Salve.
- **Esperado:** Mensagem de sucesso e retorno com `id` do conteúdo.

**1.3.2 Conteúdo Nível 2 — Coesão e coerência**

- **Título:** Coesão e coerência em parágrafos
- **Matéria:** Português | **Série:** 6 | **Nível:** 2
- **Texto principal:**  
  "Coesão é a ligação entre as partes do texto usando conectivos (mas, porém, portanto, assim). Coerência é o sentido lógico do texto: as ideias não podem se contradizer. Pratique identificar conectivos e verificar se o parágrafo está coerente."
- **Tags:** `["coesão", "coerência", "conectivos"]`
- Salve.

**1.3.3 Conteúdo Nível 3 — Análise de texto argumentativo**

- **Título:** Estrutura do texto argumentativo
- **Matéria:** Português | **Série:** 6 | **Nível:** 3
- **Texto principal:**  
  "O texto argumentativo apresenta uma tese, argumentos e conclusão. Identifique a tese do autor, os argumentos usados e a conclusão. Pratique com editoriais e cartas do leitor."
- **Tags:** `["argumentação", "tese", "argumentos"]`
- Salve.

**1.3.4 Conteúdo Reforço — Ortografia e gramática**

- **Título:** Reforço de ortografia e concordância (6º ano)
- **Matéria:** Português | **Série:** 6 | **Nível:** reforço
- **Texto principal:**  
  "Reforço dos principais casos de ortografia e concordância verbal e nominal para o 6º ano: uso de SS e Ç, sujeito e verbo, plural de adjetivos."
- **Tags:** `["ortografia", "gramática", "concordância"]`
- Salve.

Repita a mesma lógica para **Português — 7º ano** (quatro conteúdos: níveis 1, 2, 3 e reforço), ajustando títulos e textos para o 7º ano. Exemplo de títulos: "Interpretação e inferência (7º ano)", "Parágrafo e tipologia textual (7º ano)", "Texto dissertativo-argumentativo (7º ano)", "Reforço de pontuação e regência (7º ano)".

---

## 1.4 Criar conteúdos — Matemática (6º e 7º ano)

**1.4.1 Matemática — 6º ano**

- **Nível 1 — Título:** Números decimais e operações
  - **Texto (resumo):** Introdução a decimais, leitura, comparação e adição/subtração de decimais.
  - **Tags:** `["decimais", "operações", "números"]`

- **Nível 2 — Título:** Frações e equivalência
  - **Texto (resumo):** Frações equivalentes, simplificação, comparação e operações com frações.
  - **Tags:** `["frações", "equivalência", "operações"]`

- **Nível 3 — Título:** Números racionais e expressões
  - **Texto (resumo):** Representação de racionais, ordem e expressões numéricas com frações e decimais.
  - **Tags:** `["racionais", "expressões", "frações"]`

- **Reforço — Título:** Reforço de frações e decimais (6º ano)
  - **Texto (resumo):** Revisão de frações, decimais e problemas do dia a dia.
  - **Tags:** `["frações", "decimais", "reforço"]`

**1.4.2 Matemática — 7º ano**

- **Nível 1:** Introdução à álgebra e expressões algébricas  
- **Nível 2:** Equações do 1º grau  
- **Nível 3:** Problemas com equações e inequações  
- **Reforço:** Reforço de álgebra e equações (7º ano)  

Use os mesmos campos (matéria Matemática, série 7, nível 1/2/3/reforço, texto e tags).

---

## 1.5 Criar trilhas de aprendizado

Criar uma trilha **padrão** por (matéria, série): Português 6, Português 7, Matemática 6, Matemática 7.

**1.5.1 Trilha — Português — 6º ano**

- Acesse: Criar nova trilha (ou **POST** `/api/learning-paths`).
- **Nome:** Trilha padrão Português – 6º ano
- **Matéria:** Português
- **Série:** 6
- **Trilha padrão:** Sim (isDefault: true)
- **Descrição (opcional):** Trilha de leitura e produção de texto para o 6º ano.
- Salve.
- **Esperado:** Retorno com `id` da trilha.

**1.5.2 Adicionar conteúdos na trilha (apenas níveis 1, 2 e 3)**

- Abra a trilha criada (detalhe da trilha).
- Adicione os três conteúdos de **nível 1, 2 e 3** de Português 6º ano, **nesta ordem**, com orderNumber 0, 1, 2 (ou 1, 2, 3 conforme API).
  - **POST** `/api/learning-paths/:id/contents` com `{ "contentId": "<id conteúdo nível 1>", "orderNumber": 0 }`
  - Idem para nível 2 com orderNumber 1 e nível 3 com orderNumber 2.
- **Não** adicione o conteúdo de **reforço** na trilha (reforço não entra na trilha padrão).
- **Esperado:** Lista da trilha com os três conteúdos ordenados.

Repita para:
- **Trilha Português — 7º ano** (conteúdos nível 1, 2, 3 de Português 7º).
- **Trilha Matemática — 6º ano** (conteúdos nível 1, 2, 3 de Matemática 6º).
- **Trilha Matemática — 7º ano** (conteúdos nível 1, 2, 3 de Matemática 7º).

Lembrete: só pode haver **uma trilha padrão** por (matéria, série). Se marcar outra como padrão, a anterior deixa de ser.

---

## 1.6 Criar avaliações e questões

Criar uma avaliação por (matéria, série, nível), por exemplo nível 1 para cada matéria/série, e adicionar questões.

**1.6.1 Avaliação — Português — 6º ano — Nível 1**

- Acesse: Criar nova avaliação (ou **POST** `/api/assessments`).
- **Título:** Avaliação de interpretação de texto – 6º ano
- **Matéria:** Português | **Nível:** 1
- **Pontuação mínima:** 70
- **Data início:** hoje (formato ISO, ex.: 2026-02-17)
- **Data fim (opcional):** deixe em branco ou 30 dias à frente.
- Salve.
- **Esperado:** 201 com `id` da avaliação.

**1.6.2 Adicionar questões à avaliação**

- Abra a avaliação e use "Adicionar questão" (ou **POST** `/api/assessments/:id/questions`).

**Questão 1 — Múltipla escolha**

- **Enunciado:** Qual é a principal função de identificar a ideia central de um texto?
- **Tipo:** multiple_choice
- **Alternativas (options):** ex. `["Decorar o texto", "Compreender o que o autor quis dizer", "Copiar o texto", "Traduzir o texto"]`
- **Resposta correta:** Compreender o que o autor quis dizer (ou o índice correspondente, conforme formato da API)
- **Pontos:** 1
- **Tags:** `["interpretação", "ideia principal"]`
- **Ordem (orderNumber):** 0

**Questão 2 — Verdadeiro ou falso**

- **Enunciado:** A coerência de um texto está relacionada ao uso de conectivos entre as frases.
- **Tipo:** true_false
- **Resposta correta:** true (ou "verdadeiro", conforme API)
- **Pontos:** 1
- **Tags:** `["coerência", "coesão"]`
- **Ordem:** 1

**Questão 3 — Texto livre (opcional)**

- **Enunciado:** Em uma frase, explique o que é a "tese" em um texto argumentativo.
- **Tipo:** text
- **Resposta correta:** (pode ser uma resposta modelo; a correção no MVP é por comparação normalizada)
- **Pontos:** 1
- **Tags:** `["argumentação", "tese"]`
- **Ordem:** 2

Salve cada questão. Repita o fluxo para outras avaliações (ex.: Matemática 6º ano nível 1, Português 7º ano nível 1, etc.), variando enunciados e tags para gerar recomendações coerentes (ex.: tags alinhadas aos conteúdos de reforço).

---

## 1.7 Listar e editar conteúdos / trilhas / avaliações

- **Conteúdos:** Listar (GET `/api/contents`), filtrar por matéria e série (6 e 7), editar um conteúdo (PATCH), desativar/ativar (PATCH `/api/contents/:id/active`).
- **Trilhas:** Listar (GET `/api/learning-paths`), abrir uma trilha, adicionar/remover/reordenar conteúdos (POST/DELETE/PATCH conforme `learning-path-rules-and-frontend.md`).
- **Avaliações:** Listar (GET `/api/assessments`), abrir uma avaliação, editar dados da prova (PATCH), listar/editar/remover questões (GET/PATCH/DELETE em `/api/assessments/:id/questions`).

---

## 1.8 Tela de acompanhamento (alunos)

- Acesse a tela de acompanhamento/dashboard do professor (ex.: **GET** `/api/dashboard/professor/students`).
- **Query opcional:** `?currentGrade=6` ou `?currentGrade=7`.
- **Esperado:** Lista de alunos (ativos) com série, níveis por matéria e recomendações pendentes. Dados cadastrais (nome, email, responsáveis) devem aparecer (ex.: em modal ao clicar no aluno).

---

# Parte 2 — Testes como ALUNO

Objetivo: validar dashboard, trilha por matéria, leitura de conteúdo, marcação de conclusão, avaliações disponíveis, realização da prova, resultado e recomendações.

---

## 2.1 Login como aluno

1. Faça logout do professor (se estiver logado).
2. Tela de login: email `aluno@example.com`, senha `Senha123`.
3. **Esperado:** Redirecionamento para a área do aluno (dashboard).

---

## 2.2 Dashboard do aluno

- Acesse o dashboard (ex.: **GET** `/api/dashboard/student`).
- **Esperado:**
  - Série do aluno (ex.: 7).
  - Resumo por matéria: trilha (path), nível atual, total de conteúdos, concluídos, percentual.
  - Lista de recomendações pendentes (título do conteúdo, motivo), se houver (ex.: seed ou após errar questões na avaliação).

---

## 2.3 Trilha por matéria

- Acesse a tela de trilha (ou "Trilha por matéria").
- Selecione a matéria **Português** (ou Matemática). A API usada é **GET** `/api/learning-paths/for-student?categoryId=<id da matéria>`.
- **Esperado:**
  - Nome da trilha e lista de conteúdos **ordenados**.
  - Para cada conteúdo: status **concluído**, **disponível** ou **bloqueado** (conforme nível do aluno e progresso).
- Selecione a matéria **Matemática** e verifique novamente a lista e os status.

---

## 2.4 Abrir e ler um conteúdo

- Na trilha, clique em um conteúdo com status **disponível**.
- A tela deve chamar **GET** `/api/contents/:id` e exibir título, texto principal, tópicos e glossário (se houver).
- **Esperado:** Conteúdo legível, sem erro 403/404 (desde que o conteúdo seja da série do aluno e permitido pelo nível).

---

## 2.5 Marcar conteúdo como concluído

- Na tela de leitura do conteúdo, use o botão "Marcar como concluído" (ou equivalente).
- O frontend deve enviar **PATCH** `/api/progress` com `{ "contentId": "<id>", "status": "completed" }` (ou conforme contrato da API de progresso).
- **Esperado:** Feedback de sucesso; ao voltar à trilha ou ao dashboard, o conteúdo deve aparecer como **concluído** e o percentual atualizado.
- Repita para os demais conteúdos do nível 1 (e, se quiser, do nível 2) da trilha da matéria, até liberar a **avaliação** do nível (regra: todos os conteúdos do nível na trilha concluídos).

---

## 2.6 Avaliações disponíveis

- Acesse "Avaliações disponíveis" (ex.: **GET** `/api/assessments/available`).
- **Esperado:** Lista apenas das avaliações que o aluno **pode** fazer: mesmo nível na matéria, trilha do nível concluída, dentro do período e ainda não submeteu. Cada item com título, matéria, nível e link para "Realizar".

---

## 2.7 Realizar uma avaliação

- Clique em "Realizar" em uma das avaliações disponíveis.
- O frontend deve carregar a prova com **GET** `/api/assessments/:id/for-student` (questões **sem** resposta correta).
- Responda todas as questões (múltipla escolha, V/F ou texto) e clique em "Enviar".
- O frontend deve enviar **POST** `/api/assessments/:id/submit` com body:  
  `{ "answers": [ { "questionId": "<uuid>", "answerText": "<resposta>" }, ... ] }`
- **Esperado:** Resposta 200 com `totalScore`, `maxScore`, `percentage`, `levelUpdated`. Redirecionamento para a tela de resultado ou mensagem de sucesso.

---

## 2.8 Ver resultado da avaliação

- Na tela de resultado (ou ao acessar o link do resultado), o frontend chama **GET** `/api/assessments/:id/result`.
- **Esperado:**
  - Nota total, pontuação máxima, percentual.
  - Indicação "Nível atualizado" (ou não), conforme pontuação mínima (ex.: ≥ 70%).
  - Por questão: enunciado, sua resposta, resposta correta, se acertou ou errou.
- Se houver questões erradas com tags, o sistema gera **recomendações** de conteúdos de reforço; exibir link para "Minhas recomendações".

---

## 2.9 Minhas recomendações

- Acesse "Minhas recomendações" (ex.: **GET** `/api/recommendations` ou com filtro `?status=pending`).
- **Esperado:** Lista de recomendações pendentes com título do conteúdo, motivo (reason) e link para abrir o conteúdo de reforço.
- Abra um conteúdo recomendado (GET `/api/contents/:id`) e, se desejar, marque a recomendação como concluída ou descartada (PATCH na API de recomendações).

---

## 2.10 Progresso por matéria

- Acesse a tela "Meu progresso" (ou equivalente), que usa **GET** `/api/progress` (com `categoryId` opcional).
- **Esperado:** Por matéria: nível atual, total de conteúdos da trilha, quantos concluídos, percentual. Lista de conteúdos com status (concluído/pendente/bloqueado).

---

## Resumo de dados de teste (referência rápida)

| Item        | Valores |
|------------|---------|
| Séries     | 6, 7 |
| Matérias   | Português, Matemática |
| Níveis     | 1, 2, 3, reforço |
| Professor  | professor@example.com / Senha123 |
| Aluno      | aluno@example.com / Senha123 |
| Coordenador| admin@example.com / Admin@123 |

**Conteúdos:** 4 por (matéria, série): 1, 2, 3 e reforço.  
**Trilhas:** 1 padrão por (matéria, série), com 3 conteúdos (níveis 1, 2, 3).  
**Avaliações:** Pelo menos 1 por (matéria, série, nível), com 2–3 questões (tipos: multiple_choice, true_false, text).  
**Reforço:** Conteúdos com nível "reforço" e tags alinhadas às questões para gerar recomendações após erro na avaliação.
