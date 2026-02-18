# Regras de Avaliações (Professor) e Requisitos do Frontend

Documento de referência: regras de negócio de avaliações para o professor e o que o frontend precisa para cada tela relacionada.

---

## Parte 1 — Regras de Avaliações para o Professor

### 1.1 Quem pode gerenciar avaliações

- **Professor**: pode criar, editar, ativar/desativar avaliações e gerenciar questões **apenas das matérias que leciona** (`tb_teacher_subject`).
- **Coordenador**: pode gerenciar avaliações de **qualquer matéria**.

Se a matéria não for lecionada pelo professor, a API retorna **403** com mensagem do tipo: *"You can only manage assessments for subjects you teach"*.

---

### 1.2 Conceito de avaliação

Uma **avaliação** é uma prova vinculada a uma **matéria** (categoria) e a um **nível de aprendizagem** (1, 2 ou 3). Ela possui título, descrição, pontuação mínima (%), datas de início e fim, e uma lista ordenada de **questões**.

- **Nível**: apenas `"1"`, `"2"` ou `"3"` (não existe avaliação de reforço).
- A avaliação fica **disponível para o aluno** quando: (1) ele está naquele nível na matéria; (2) completou todos os conteúdos desse nível na trilha; (3) está no período (startDate ≤ hoje ≤ endDate, se endDate existir); (4) está ativa; (5) ainda não submeteu.
- Após submissão, o sistema **corrige automaticamente** (comparação normalizada de resposta), calcula pontuação e, se **percentual ≥ minScore** (ex.: 70%), **atualiza o nível** do aluno naquela matéria. Caso contrário, gera **recomendações** com base nas tags das questões erradas.

---

### 1.3 Criação de avaliação

- **Campos obrigatórios**
  - **title** (string, não vazio)
  - **categoryId** (UUID) — matéria
  - **level** (string) — `"1"`, `"2"` ou `"3"`
  - **startDate** (string ISO de data) — início do período de aplicação

- **Campos opcionais**
  - **description** (string)
  - **minScore** (number 0–100) — percentual mínimo para atualizar nível; default 70
  - **endDate** (string ISO) — fim do período (se omitido, sem prazo final)

- **Regras**
  - O usuário deve poder gerenciar a matéria (professor: matérias que leciona; coordenador: qualquer).
  - Categoria deve existir.
  - Nível deve ser 1, 2 ou 3.

---

### 1.4 Edição de avaliação

- **Campos editáveis**: `title`, `description`, `minScore`, `startDate`, `endDate`, `isActive`. Não é permitido alterar `categoryId` nem `level` (a API atual não expõe isso).
- Apenas quem pode gerenciar a matéria da avaliação pode editar.

---

### 1.5 Questões

- Cada avaliação tem uma lista de questões com **orderNumber** (0, 1, 2, …).
- **Tipos de questão** (questionType): `multiple_choice`, `true_false`, `text`.
- **Campos por questão**
  - **questionText** (obrigatório) — enunciado
  - **questionType** (obrigatório)
  - **options** (opcional) — em múltipla escolha, estrutura de alternativas (ex.: array de strings ou objeto; formato definido no frontend/API)
  - **correctAnswer** (obrigatório) — resposta correta (texto normalizado na correção: trim + lowercase)
  - **points** (opcional) — peso da questão; default 1
  - **tags** (opcional) — array ou objeto; usado para gerar recomendações quando o aluno erra
  - **orderNumber** (obrigatório na criação) — inteiro ≥ 0

- **Regras**
  - Professor/coordenador só adiciona/edita/remove questões em avaliações cuja matéria pode gerenciar.
  - Na correção, comparação é feita com **normalização** (trim + lowercase); questões do tipo `text` são corrigidas da mesma forma no MVP (sem correção manual).

---

### 1.6 Disponibilidade para o aluno

- A avaliação aparece em **GET /api/assessments/available** (aluno) somente se:
  - Está **ativa** (`isActive = true`).
  - **startDate** ≤ hoje e (endDate é null ou **endDate** ≥ hoje).
  - O aluno está no **nível correspondente** naquela matéria.
  - O aluno **completou todos os conteúdos desse nível** na trilha (regra delegada ao `ProgressService.isAssessmentAvailable`).
  - O aluno **ainda não submeteu** essa avaliação (não existe registro em `tb_assessment_result`).

---

### 1.7 Submissão e correção

- **Uma submissão por aluno por avaliação** (nova submissão retorna 400).
- Body da submissão: `{ "answers": [ { "questionId": "uuid", "answerText": "string" }, ... ] }`.
- O sistema calcula totalScore, maxScore, percentual; se percentual ≥ minScore, atualiza o nível do aluno na matéria e retorna `levelUpdated: true`.
- São geradas **recomendações** a partir das tags das questões erradas (conteúdos de reforço com tags compatíveis).

---

### 1.8 Resultado (aluno)

- O aluno vê seu próprio resultado em **GET /api/assessments/:id/result** (apenas se já tiver submetido). Retorna: totalScore, maxScore, percentage, levelUpdated, completedAt, e por questão: enunciado, resposta do aluno, resposta correta, isCorrect, pointsEarned.

---

### 1.9 Professor/coordenador: resultados dos alunos

- Nas user stories, o professor deve poder ver **resultados por avaliação** (quem fez, nota, %, nível atualizado). Na API atual, **não existe** um endpoint dedicado do tipo GET /api/assessments/:id/results que retorne a lista de alunos que realizaram a avaliação com seus resultados. Esse dado pode vir de um **dashboard** ou de um **endpoint futuro**. O frontend pode precisar de um endpoint como **GET /api/assessments/:id/results** (lista de resultados por aluno) para a tela “Resultados dos alunos” da avaliação.

---

### 1.10 Resumo das regras

| Ação                    | Professor                    | Coordenador |
|-------------------------|------------------------------|-------------|
| Criar avaliação         | Só matérias que leciona       | Qualquer    |
| Editar avaliação        | Só matérias que leciona       | Qualquer    |
| Adicionar/editar/remover questão | Só avaliações de matérias que leciona | Qualquer |
| Listar avaliações       | Só avaliações das suas matérias | Todas     |
| Ver avaliação (id)      | Se for matéria que leciona    | Sempre      |
| Ver resultados por avaliação | Story 5.6; endpoint específico pode não existir no MVP | Idem |

---

## Parte 2 — O que o frontend precisa por tela

### 2.1 Tela: Listagem de avaliações (professor/coordenador)

**Objetivo:** Listar avaliações com filtros e ações (criar, editar, abrir para gerenciar questões).

**Rota da API**

- **GET** `/api/assessments?categoryId=...&level=...&page=1&limit=20`

**Query params (todos opcionais)**

| Parâmetro   | Tipo   | Descrição              |
|------------|--------|------------------------|
| categoryId | UUID   | Filtrar por matéria    |
| level      | string | `"1"`, `"2"`, `"3"`    |
| page       | number | Paginação              |
| limit      | number | Itens por página (máx. 100) |

**Resposta esperada**

```json
{
  "assessments": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string ou null",
      "categoryId": "uuid",
      "category": { "id": "uuid", "name": "string" },
      "level": "string",
      "minScore": 70,
      "startDate": "ISO8601",
      "endDate": "ISO8601 ou null"
    }
  ],
  "total": 0
}
```

**O que o frontend precisa**

- Lista de **categorias/matérias** para filtro (e para formulário de criação).
- Constantes **níveis** (`ASSESSMENT_LEVELS`: `"1"`, `"2"`, `"3"`) para filtro e formulário.
- Tabela/cards: título, matéria (category.name), nível, minScore, startDate, endDate.
- Ações: **Nova avaliação**, **Editar** (dados da prova), **Abrir** (tela de questões e, se existir, resultados).
- Tratar **403** com mensagem clara.

---

### 2.2 Tela: Criar avaliação (professor/coordenador)

**Objetivo:** Formulário para cadastrar uma nova avaliação (sem questões nesta etapa).

**Rota da API**

- **POST** `/api/assessments`

**Body (JSON)**

| Campo       | Obrigatório | Tipo   | Descrição                          |
|------------|-------------|--------|------------------------------------|
| title      | Sim         | string | Título                             |
| categoryId | Sim         | UUID   | ID da matéria                      |
| level      | Sim         | string | `"1"`, `"2"` ou `"3"`              |
| startDate  | Sim         | string | Data de início (ex.: ISO)          |
| description| Não         | string | Descrição                          |
| minScore   | Não         | number | 0–100; default 70                  |
| endDate    | Não         | string | Data de fim (ex.: ISO)             |

**Resposta de sucesso:** `201` + `{ "id": "uuid", "title": "string" }`.

**O que o frontend precisa**

- Select de **matéria** (categoryId): apenas matérias que o professor leciona (ou todas para coordenador).
- Select de **nível** (1, 2, 3).
- Campos: **título**, **descrição** (opcional), **pontuação mínima** (número 0–100, default 70), **data início**, **data fim** (opcional).
- Validação: título, categoryId, level, startDate obrigatórios; minScore entre 0 e 100.
- Após criar, redirecionar para a **tela da avaliação** (gerenciar questões) ou exibir sucesso e link "Adicionar questões".

---

### 2.3 Tela: Editar avaliação (professor/coordenador)

**Objetivo:** Alterar título, descrição, minScore, datas e isActive (não altera matéria/nível nem questões).

**Rotas da API**

- **GET** `/api/assessments/:id` — carregar dados atuais (inclui lista de questões, com id, questionText, questionType, options, points, tags, orderNumber; **não** inclui correctAnswer no DTO do professor por segurança — verifique na API; no código atual o toAssessmentDto **não** envia correctAnswer nas questions).
- **PATCH** `/api/assessments/:id` — salvar alterações.

**Body do PATCH (todos opcionais)**

- `title`, `description`, `minScore`, `startDate`, `endDate`, `isActive`.

**Resposta de sucesso do PATCH:** `200` + `{ "id": "uuid", "title": "string" }`.

**O que o frontend precisa**

- Ao abrir a tela de edição, GET da avaliação e preencher formulário (título, descrição, minScore, startDate, endDate, isActive). Matéria e nível em somente leitura.
- Tratar 403 e 404.

---

### 2.4 Tela: Gerenciar questões da avaliação (professor/coordenador)

**Objetivo:** Listar, criar, editar, remover e reordenar questões.

**Rotas da API**

- **GET** `/api/assessments/:id` — avaliação com `questions` (id, questionText, questionType, options, points, tags, orderNumber). Nota: a API de detalhe do professor **não** retorna `correctAnswer` nas questões no DTO atual (toAssessmentDto omite); para editar resposta correta o backend pode precisar expor em outro momento ou a edição de questão já envia correctAnswer no PATCH).
- **GET** `/api/assessments/:id/questions` — lista de questões (id, questionText, questionType, options, points, tags, orderNumber) — mesmo formato, sem correctAnswer.
- **POST** `/api/assessments/:id/questions` — criar questão. Body: `questionText`, `questionType`, `correctAnswer`, `orderNumber` (obrigatórios); `options`, `points`, `tags` (opcionais). Resposta: 201 + `{ "id": "uuid", "questionText": "string" }`.
- **PATCH** `/api/assessments/:id/questions/:questionId` — editar questão (mesmos campos, todos opcionais).
- **DELETE** `/api/assessments/:id/questions/:questionId` — remover questão. Resposta: 204.

**O que o frontend precisa**

- Lista de questões ordenadas por `orderNumber` (exibir enunciado, tipo, pontos; resposta correta só no formulário de criar/editar).
- **Criar questão**: formulário com enunciado, tipo (multiple_choice, true_false, text), alternativas (se múltipla escolha), resposta correta, pontos, tags, orderNumber. POST em `/api/assessments/:id/questions`.
- **Editar questão**: abrir formulário com dados da questão; para alterar resposta correta, o PATCH aceita `correctAnswer` (a listagem não retorna correctAnswer — pode ser necessário GET de uma questão específica se a API expuser, ou o frontend guarda o valor ao criar e ao editar envia de volta).
- **Remover**: DELETE com confirmação; atualizar lista.
- **Reordenar**: alterar `orderNumber` das questões e enviar PATCH por questão com o novo orderNumber (a API atual não tem um único PATCH de reordenação em lote).
- Constantes **QUESTION_TYPES**: `multiple_choice`, `true_false`, `text`. Para múltipla escolha, definir formato de `options` (ex.: `["A", "B", "C"]` ou `{ "A": "texto", "B": "texto" }`) conforme backend.

---

### 2.5 Tela: Avaliações disponíveis (aluno)

**Objetivo:** Listar avaliações que o aluno pode fazer (nível, trilha concluída, período, não submetida).

**Rota da API**

- **GET** `/api/assessments/available` (sem query; o backend usa o studentId do token).

**Resposta esperada**

- Array de objetos no formato resumo: id, title, description, categoryId, category, level, minScore, startDate, endDate.

**O que o frontend precisa**

- Exibir lista/cards com título, matéria, nível, datas. Botão/link "Realizar" que leva à tela de realização (GET da prova + formulário de respostas).

---

### 2.6 Tela: Realizar avaliação (aluno)

**Objetivo:** Exibir questões (sem resposta correta) e enviar respostas.

**Rotas da API**

- **GET** `/api/assessments/:id/for-student` — avaliação com questões **sem** correctAnswer. Campos: id, title, description, category, level, minScore, startDate, endDate, questions (id, questionText, questionType, options, points, tags, orderNumber).
- **POST** `/api/assessments/:id/submit` — enviar respostas. Body: `{ "answers": [ { "questionId": "uuid", "answerText": "string" }, ... ] }`.

**Resposta do submit (sucesso)**

```json
{
  "totalScore": 0,
  "maxScore": 0,
  "percentage": 0,
  "levelUpdated": true
}
```

**O que o frontend precisa**

- Carregar a prova com GET `/api/assessments/:id/for-student`. Exibir cada questão (enunciado, tipo, alternativas quando for multiple_choice, ou campo de texto para true_false/text). Coletar answerText por questionId.
- Botão "Enviar": POST submit com array de { questionId, answerText }. Tratar 403 (prova indisponível, fora do período, já submetida, trilha não concluída) e 400 (já submetida).
- Após sucesso, redirecionar para a **tela de resultado** (GET /api/assessments/:id/result) ou exibir resumo (nota, %, levelUpdated) e link para resultado detalhado e recomendações.

---

### 2.7 Tela: Resultado da avaliação (aluno)

**Objetivo:** Exibir nota, percentual, se o nível foi atualizado e detalhe por questão (resposta do aluno, resposta correta, acerto/erro).

**Rota da API**

- **GET** `/api/assessments/:id/result` (aluno autenticado; apenas o próprio resultado).

**Resposta esperada**

```json
{
  "result": {
    "totalScore": 0,
    "maxScore": 0,
    "percentage": 0,
    "levelUpdated": true,
    "completedAt": "ISO8601"
  },
  "assessment": { "id", "title", "description", "category", "level" },
  "questions": [
    {
      "id": "uuid",
      "questionText": "string",
      "questionType": "string",
      "options": {},
      "points": 0,
      "orderNumber": 0,
      "correctAnswer": "string",
      "studentAnswer": {
        "answerText": "string",
        "isCorrect": true,
        "pointsEarned": 0
      }
    }
  ]
}
```

**O que o frontend precisa**

- Exibir totais (totalScore, maxScore, percentage), mensagem "Nível atualizado" (ou não) e lista de questões com enunciado, resposta do aluno, resposta correta e indicador de acerto/erro.
- Link ou navegação para **Minhas recomendações** quando houver recomendações geradas.

---

### 2.8 Tela: Resultados dos alunos por avaliação (professor/coordenador)

**Objetivo:** Selecionar uma avaliação e ver quem realizou, com nota, percentual e se o nível foi atualizado (e opcionalmente detalhe por aluno).

- Na API atual **não há** endpoint GET /api/assessments/:id/results (lista de resultados por aluno). O frontend pode depender de um **endpoint futuro** como **GET /api/assessments/:id/results** retornando, por exemplo, `{ "results": [ { "studentId", "studentName", "totalScore", "maxScore", "percentage", "levelUpdated", "completedAt" }, ... ] }`. Ou os dados podem ser agregados no dashboard do professor. Enquanto o endpoint não existir, a tela pode ser esboçada (lista vazia ou “em breve”) ou consumir outro recurso disponível (ex.: dashboard).

---

## Resumo das rotas de avaliações usadas pelo frontend

| Tela / Ação                    | Método | Rota                                | Quem usa              |
|--------------------------------|--------|-------------------------------------|------------------------|
| Listar avaliações               | GET    | /api/assessments                     | Professor, Coordenador |
| Criar avaliação                | POST   | /api/assessments                     | Professor, Coordenador |
| Ver/editar avaliação           | GET    | /api/assessments/:id                 | Professor, Coordenador |
| Editar avaliação               | PATCH  | /api/assessments/:id                 | Professor, Coordenador |
| Listar questões                | GET    | /api/assessments/:id/questions       | Professor, Coordenador |
| Criar questão                  | POST   | /api/assessments/:id/questions       | Professor, Coordenador |
| Editar questão                 | PATCH  | /api/assessments/:id/questions/:questionId | Professor, Coordenador |
| Remover questão                | DELETE | /api/assessments/:id/questions/:questionId | Professor, Coordenador |
| Avaliações disponíveis (aluno)  | GET    | /api/assessments/available           | Aluno                  |
| Prova para realizar (aluno)     | GET    | /api/assessments/:id/for-student      | Aluno                  |
| Submeter prova (aluno)         | POST   | /api/assessments/:id/submit           | Aluno                  |
| Ver resultado (aluno)          | GET    | /api/assessments/:id/result            | Aluno                  |
| Resultados por avaliação (prof.)| GET    | (futuro: /api/assessments/:id/results?) | Professor, Coordenador |

Referências: `business-rules.md` (1.4), `user-stories.md` (Stories 5.1–5.6, F.6.1–F.6.2), `assessmentService.ts`, `assessmentRoutes.ts`, `types.ts` (ASSESSMENT_LEVELS, QUESTION_TYPES).
