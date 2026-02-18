# Testes E2E guiados — API no Hoppscotch

Testes **passo a passo** simulando o uso da plataforma por **Coordenador**, **Professor**, **Aluno 1** e **Aluno 2** (níveis diferentes). Execute as rotas na ordem indicada.

**Pré-requisitos:** API rodando (`npm run dev`), banco com migrations e seed (`npm run db:migrate` e `npm run db:seed`).

---

## Configuração no Hoppscotch

1. Crie um **Environment** com:
   - `baseUrl` = `http://localhost:3000`
2. Em todas as requisições use: `{{baseUrl}}/api/...`
3. Para rotas protegidas, adicione no Environment:
   - `accessToken` = (cole o token do login atual)
   - **Header:** `Authorization` = `Bearer {{accessToken}}`
4. Troque o `accessToken` sempre que fizer login com outra pessoa (Coordenador, Professor, Aluno 1, Aluno 2).

---

## Anote aqui (preencha ao longo dos testes)

| Variável     | Valor (cole após o passo indicado) |
|-------------|-------------------------------------|
| categoryId  | _Passo 1.5 — copie de um professor em users_ |
| userId Aluno 2 | _Passo 1.7 — id retornado ao criar aluno 2_ |
| contentId 1 | _Passo 2.2 — id do primeiro conteúdo_ |
| contentId 2 | _Passo 2.3 — id do segundo conteúdo_ |
| pathId     | _Passo 2.6 — id da trilha_ |

---

## Credenciais (seed + aluno criado no fluxo)

| Persona      | Email                 | Senha     | Observação |
|-------------|------------------------|-----------|------------|
| **Coordenador** | admin@example.com      | Admin@123 | Seed |
| **Professor**   | professor@example.com | Senha123  | Seed — 1 matéria |
| **Aluno 1**     | aluno@example.com      | Senha123  | Seed — série 7 |
| **Aluno 2**     | aluno2@example.com     | Senha123  | Criado no Passo 1.7 — série 8 |

---

# Fase 0 — Health (sem login)

| Passo | Método | URL | Resposta esperada |
|-------|--------|-----|--------------------|
| **0.1** | GET | `{{baseUrl}}/api/health` | **200** — API ok |

---

# Fase 1 — Coordenador (Admin)

Simula o coordenador configurando a plataforma: listar usuários, obter matéria (categoryId) e criar um segundo aluno em outra série.

| Passo | Método | URL | Body / Headers | Resposta esperada |
|-------|--------|-----|-----------------|--------------------|
| **1.1** | POST | `{{baseUrl}}/api/auth/login` | Ver abaixo | **200** — `accessToken`, `refreshToken` |
| **1.2** | GET | `{{baseUrl}}/api/auth/me` | Header: `Authorization: Bearer {{accessToken}}` | **200** — `user.role` = `coordinator` |
| **1.3** | GET | `{{baseUrl}}/api/auth/me/coordinator` | Idem | **200** — só coordenador |
| **1.4** | GET | `{{baseUrl}}/api/users` | Idem | **200** — `users`, `total` |
| **1.5** | — | — | Na resposta 1.4: abra um usuário com `role: "teacher"` e copie `teacherSubjects[0].categoryId` → anote como **categoryId** | — |
| **1.6** | GET | `{{baseUrl}}/api/users?role=student` | Idem | **200** — lista só alunos |
| **1.7** | POST | `{{baseUrl}}/api/users` | Body abaixo (criar **Aluno 2**, série 8) | **201** — `id`, `email` → anote o **id** como userId Aluno 2 |
| **1.8** | GET | `{{baseUrl}}/api/users/<userIdAluno2>` | Substituir `<userIdAluno2>` pelo id do passo 1.7 | **200** — dados do Aluno 2 |
| **1.9** | PATCH | `{{baseUrl}}/api/users/<userIdAluno2>` | Body: `{ "name": "Aluno Dois Atualizado" }` | **200** — confirmação |

**Body para 1.1 (login Coordenador):**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Body para 1.7 (criar Aluno 2 — série 8):**
```json
{
  "name": "Aluno Dois",
  "email": "aluno2@example.com",
  "password": "Senha123",
  "role": "student",
  "currentGrade": "8",
  "guardians": [
    {
      "name": "Responsável Aluno 2",
      "phone": "11988887777",
      "email": "resp2@example.com",
      "relationship": "mãe"
    }
  ]
}
```

*(Opcional)* Desativar/reativar usuário:  
PATCH `{{baseUrl}}/api/users/<id>/active` com body `{ "isActive": false }` → **204**. Para reativar: `{ "isActive": true }`.

---

# Fase 2 — Professor

Simula o professor criando conteúdos e uma trilha para a série 7, usando o **categoryId** anotado na Fase 1.

**Troque o token:** faça login como Professor e atualize o `accessToken` no Environment.

| Passo | Método | URL | Body / Headers | Resposta esperada |
|-------|--------|-----|-----------------|--------------------|
| **2.1** | POST | `{{baseUrl}}/api/auth/login` | Ver abaixo | **200** — novo `accessToken` |
| **2.2** | POST | `{{baseUrl}}/api/contents` | Body abaixo (conteúdo nível 1, série 7) | **201** — `id`, `title` → anote **contentId 1** |
| **2.3** | POST | `{{baseUrl}}/api/contents` | Body abaixo (conteúdo nível 2, série 7) | **201** — anote **contentId 2** |
| **2.4** | GET | `{{baseUrl}}/api/contents` | Header: `Authorization: Bearer {{accessToken}}` | **200** — `contents` (inclui os 2 criados) |
| **2.5** | GET | `{{baseUrl}}/api/contents/<contentId1>` | Substituir pelo contentId 1 | **200** — objeto do conteúdo |
| **2.6** | POST | `{{baseUrl}}/api/learning-paths` | Body abaixo (trilha série 7) | **201** — `id`, `name` → anote **pathId** |
| **2.7** | POST | `{{baseUrl}}/api/learning-paths/<pathId>/contents` | Body: `{ "contentId": "<contentId1>", "orderNumber": 0 }` | **204** |
| **2.8** | POST | `{{baseUrl}}/api/learning-paths/<pathId>/contents` | Body: `{ "contentId": "<contentId2>", "orderNumber": 1 }` | **204** |
| **2.9** | GET | `{{baseUrl}}/api/learning-paths` | Idem | **200** — `paths` |
| **2.10** | GET | `{{baseUrl}}/api/learning-paths/<pathId>` | Idem | **200** — trilha com `contents` ordenados |
| **2.11** | GET | `{{baseUrl}}/api/teachers/subjects?page=1&limit=10` | Header: `Authorization: Bearer {{accessToken}}` | **200** — `subjects[]` com matérias que o professor leciona (`id`, `name`, `contentsCount`, `pathsCount`), além de `total`, `page`, `limit`, `totalPages` |

**Body para 2.1 (login Professor):**
```json
{
  "email": "professor@example.com",
  "password": "Senha123"
}
```

**Body para 2.2 (primeiro conteúdo — nível 1, série 7):**  
Substitua `<categoryId>` pelo valor anotado.
```json
{
  "title": "Introdução às frações",
  "contentText": "Conteúdo do primeiro módulo da trilha.",
  "categoryId": "<categoryId>",
  "grade": "7",
  "level": "1",
  "tags": ["frações", "matemática"]
}
```

**Body para 2.3 (segundo conteúdo — nível 2, série 7):**  
Mesmo `categoryId`, `grade` "7", `level` "2".
```json
{
  "title": "Operações com frações",
  "contentText": "Conteúdo do segundo módulo.",
  "categoryId": "<categoryId>",
  "grade": "7",
  "level": "2",
  "tags": ["frações"]
}
```

**Body para 2.6 (criar trilha — série 7):**
```json
{
  "name": "Trilha Matemática 7º ano",
  "categoryId": "<categoryId>",
  "grade": "7",
  "isDefault": true,
  "description": "Trilha padrão para o 7º ano"
}
```

*(Opcional)* Professor: PATCH `{{baseUrl}}/api/contents/<id>` (editar título); PATCH `{{baseUrl}}/api/contents/<id>/active` com `{ "isActive": false }`; PATCH `{{baseUrl}}/api/learning-paths/<pathId>/contents/reorder` para reordenar; DELETE `{{baseUrl}}/api/learning-paths/<pathId>/contents/<contentId>` para remover conteúdo da trilha.

---

# Fase 3 — Aluno 1 (série 7)

Simula o aluno da **série 7** vendo conteúdos e a trilha da sua série. Deve listar os conteúdos e a trilha criados na Fase 2.

**Troque o token:** login como Aluno 1 e atualize o `accessToken`.

| Passo | Método | URL | Body / Headers | Resposta esperada |
|-------|--------|-----|-----------------|--------------------|
| **3.1** | POST | `{{baseUrl}}/api/auth/login` | Ver abaixo | **200** — token do Aluno 1 |
| **3.2** | GET | `{{baseUrl}}/api/contents/for-student` | Header: `Authorization: Bearer {{accessToken}}` | **200** — `contents` da série 7 (os 2 criados) |
| **3.3** | GET | `{{baseUrl}}/api/contents/for-student?categoryId=<categoryId>` | Mesmo header; usar **categoryId** anotado | **200** — conteúdos filtrados por matéria |
| **3.4** | GET | `{{baseUrl}}/api/contents/<contentId1>` | Idem | **200** — conteúdo (aluno vê só da sua série) |
| **3.5** | GET | `{{baseUrl}}/api/learning-paths/for-student?categoryId=<categoryId>` | Idem | **200** — trilha da série 7 com `contents[].status` (available/blocked/completed) |
| **3.6** | PATCH | `{{baseUrl}}/api/progress` | Body: `{ "contentId": "<contentId1>", "status": "in_progress" }` | **200** — progresso criado/atualizado |
| **3.7** | PATCH | `{{baseUrl}}/api/progress` | Body: `{ "contentId": "<contentId1>", "status": "completed", "timeSpent": 5 }` | **200** — `completedAt` registrado |
| **3.8** | GET | `{{baseUrl}}/api/progress?categoryId=<categoryId>` | Idem | **200** — `currentLevel`, `totalContents`, `completedCount`, `percentage`, `contents[]` com status e `completedAt` |
| **3.9** | GET | `{{baseUrl}}/api/progress/assessment-available?categoryId=<categoryId>&level=1` | Idem | **200** — `{ "available": true }` (todos os conteúdos do nível 1 na trilha concluídos) |
| **3.10** | PATCH | `{{baseUrl}}/api/progress` | Body: `{ "contentId": "<contentId2>", "status": "completed" }` | **200** — segundo conteúdo concluído |
| **3.11** | GET | `{{baseUrl}}/api/progress?categoryId=<categoryId>` | Idem | **200** — `percentage: 100`, `completedCount: 2` |
| **3.12** | GET | `{{baseUrl}}/api/progress/assessment-available?categoryId=<categoryId>&level=2` | Idem | **200** — `{ "available": true }` |

**Body para 3.1 (login Aluno 1):**
```json
{
  "email": "aluno@example.com",
  "password": "Senha123"
}
```

Resultado esperado: Aluno 1 (série 7) vê os 2 conteúdos e a trilha com os conteúdos em ordem; cada item tem `status` (ex.: `available`, `blocked`, `completed` conforme nível e progresso).

**Parte 6 — Progresso (passos 3.6 a 3.12):**  
O aluno marca o primeiro conteúdo como **in_progress** (3.6) e depois **completed** com `timeSpent` opcional (3.7). Em **GET /api/progress?categoryId=** (3.8) aparecem `currentLevel`, `percentage`, `completedCount` e cada conteúdo com `progressStatus` e `completedAt`. Em **assessment-available?level=1** (3.9) retorna `available: true` quando todos os conteúdos do nível 1 na trilha estão concluídos. Ao concluir o segundo conteúdo (3.10–3.12), o progresso sobe para 100% e a avaliação do nível 2 fica disponível.

**Status de progresso:** `not_started` \| `in_progress` \| `completed`.

---

# Fase 4 — Aluno 2 (série 8)

Simula o aluno da **série 8** (outro nível). Não há conteúdo nem trilha para série 8 criados neste fluxo, então as respostas devem refletir isso.

**Troque o token:** login como Aluno 2 e atualize o `accessToken`.

| Passo | Método | URL | Body / Headers | Resposta esperada |
|-------|--------|-----|-----------------|--------------------|
| **4.1** | POST | `{{baseUrl}}/api/auth/login` | Ver abaixo | **200** — token do Aluno 2 |
| **4.2** | GET | `{{baseUrl}}/api/contents/for-student` | Header: `Authorization: Bearer {{accessToken}}` | **200** — `contents` da série 8 (vazio ou outros; não os da série 7) |
| **4.3** | GET | `{{baseUrl}}/api/learning-paths/for-student?categoryId=<categoryId>` | Idem | **404** ou resposta indicando que não há trilha padrão para série 8 + essa matéria |

**Body para 4.1 (login Aluno 2):**
```json
{
  "email": "aluno2@example.com",
  "password": "Senha123"
}
```

Resultado esperado: Aluno 2 (série 8) **não** vê os conteúdos da série 7; ao pedir a trilha para a mesma matéria (`categoryId`), a API retorna **404** (ou equivalente) porque não existe trilha padrão para série 8. Isso demonstra o isolamento por série/nível.

---

# Fase 5 — Auth (refresh e logout)

Pode ser feita com qualquer usuário logado (ex.: volte ao token do Coordenador ou use um dos alunos).

| Passo | Método | URL | Body | Resposta esperada |
|-------|--------|-----|------|--------------------|
| **5.1** | POST | `{{baseUrl}}/api/auth/refresh` | `{ "refreshToken": "<refreshToken do último login>" }` | **200** — novo `accessToken`, novo `refreshToken` |
| **5.2** | POST | `{{baseUrl}}/api/auth/logout` | `{ "refreshToken": "<refreshToken>" }` (opcional) | **204** |

Após o logout, usar o mesmo `refreshToken` de novo em refresh ou login deve falhar ou retornar erro conforme a regra de revogação.

---

# Fase 6 — Avaliações e Recomendações (Aluno 1)

Simula o **Aluno 1** realizando uma avaliação disponível, vendo o resultado e consultando recomendações de reforço.

**Pré-condição:** já ter seguido a **Fase 3** (progresso) até liberar ao menos uma avaliação para a matéria (`available: true` em `/api/progress/assessment-available`).

**Troque o token:** volte a logar como Aluno 1 e atualize o `accessToken`.

| Passo | Método | URL | Body / Headers | Resposta esperada |
|-------|--------|-----|-----------------|--------------------|
| **6.1** | GET | `{{baseUrl}}/api/assessments/available` | Header: `Authorization: Bearer {{accessToken}}` | **200** — `assessments[]` (pelo menos 1 avaliação disponível) |
| **6.2** | GET | `{{baseUrl}}/api/assessments/<assessmentId>/for-student` | Use um `id` da resposta 6.1 | **200** — avaliação com questões **sem** `correctAnswer` |
| **6.3** | POST | `{{baseUrl}}/api/assessments/<assessmentId>/submit` | Body com respostas (ex.: algumas corretas, outras erradas) | **200** — `totalScore`, `maxScore`, `percentage`, `levelUpdated` |
| **6.4** | GET | `{{baseUrl}}/api/assessments/<assessmentId>/result` | Idem | **200** — `result` + `questions[]` com `correctAnswer` e `studentAnswer` (detalhe por questão) |
| **6.5** | GET | `{{baseUrl}}/api/recommendations?status=pending` | Idem | **200** — `recommendations[]` com conteúdos de **reforço** relacionados às questões erradas |

Resultado esperado: após o submit (6.3), o aluno vê seu desempenho detalhado (6.4) e passa a ter recomendações de conteúdos de reforço (6.5).

**Exemplo de body real para 6.3 (submit de avaliação com 2 questões):**

Suponha que a resposta de 6.2 retornou algo como:

```json
{
  "assessment": {
    "id": "a1f51a4b-2f8f-4a4a-9a70-5b9c0e8c1111",
    "title": "Avaliação de Gramática",
    "level": "1",
    "questions": [
      {
        "id": "q-gramatica-1",
        "questionText": "Assinale a alternativa em que todas as palavras estão escritas corretamente.",
        "questionType": "multiple_choice_single",
        "options": [
          "exceção, necessário, consequencia",
          "excessão, nescessário, consequência",
          "exceção, necessário, consequência",
          "excessão, necessário, consequencia"
        ]
      },
      {
        "id": "q-gramatica-2",
        "questionText": "Explique com suas palavras o que é um sujeito na frase.",
        "questionType": "open"
      }
    ]
  }
}
```

Para enviar **uma correta e uma errada**, o body de 6.3 poderia ser:

```json
{
  "answers": [
    {
      "questionId": "q-gramatica-1",
      "answerText": "2"
    },
    {
      "questionId": "q-gramatica-2",
      "answerText": "Um verbo qualquer que apareça na frase"
    }
  ]
}
```

Onde:
- `"2"` é o índice da alternativa correta na questão de múltipla escolha.
- A segunda resposta é considerada **errada** na correção automática.

**Exemplo de resposta real para 6.4 (result):**

```json
{
  "result": {
    "totalScore": 1,
    "maxScore": 2,
    "percentage": 50,
    "levelUpdated": false,
    "completedAt": "2026-02-12T12:34:56.000Z"
  },
  "assessment": {
    "id": "a1f51a4b-2f8f-4a4a-9a70-5b9c0e8c1111",
    "title": "Avaliação de Gramática",
    "description": "Avaliação sobre ortografia e regras gramaticais.",
    "category": {
      "id": "cat-portugues",
      "name": "Português"
    },
    "level": "1"
  },
  "questions": [
    {
      "id": "q-gramatica-1",
      "questionText": "Assinale a alternativa em que todas as palavras estão escritas corretamente.",
      "questionType": "multiple_choice_single",
      "options": [
        "exceção, necessário, consequencia",
        "excessão, nescessário, consequência",
        "exceção, necessário, consequência",
        "excessão, necessário, consequencia"
      ],
      "points": 1,
      "orderNumber": 1,
      "correctAnswer": "2",
      "studentAnswer": {
        "answerText": "2",
        "isCorrect": true,
        "pointsEarned": 1
      }
    },
    {
      "id": "q-gramatica-2",
      "questionText": "Explique com suas palavras o que é um sujeito na frase.",
      "questionType": "open",
      "options": null,
      "points": 1,
      "orderNumber": 2,
      "correctAnswer": "",
      "studentAnswer": {
        "answerText": "Um verbo qualquer que apareça na frase",
        "isCorrect": false,
        "pointsEarned": 0
      }
    }
  ]
}
```

**Exemplo de resposta real para 6.5 (recomendações pendentes após erros em Gramática):**

```json
{
  "recommendations": [
    {
      "id": "rec-gramatica-1",
      "contentId": "content-reforco-gramatica",
      "content": {
        "id": "content-reforco-gramatica",
        "title": "Reforço de Gramática",
        "categoryId": "cat-portugues",
        "category": {
          "id": "cat-portugues",
          "name": "Português"
        },
        "grade": "7",
        "level": "reforco"
      },
      "reason": "Difficulty in: gramatica, ortografia",
      "sourceType": "assessment",
      "sourceId": "assessment-result-id",
      "status": "pending",
      "createdAt": "2026-02-12T12:35:10.000Z",
      "updatedAt": "2026-02-12T12:35:10.000Z"
    }
  ]
}
```

---

# Fase 7 — Dashboards (Aluno, Professor e Coordenador)

Fluxo opcional para validar os **dashboards** do aluno, do professor e do coordenador.

| Passo | Persona | Método | URL | Body / Headers | Resposta esperada |
|-------|---------|--------|-----|-----------------|--------------------|
| **7.1** | Aluno 1 | GET | `{{baseUrl}}/api/dashboard/student` | Header: `Authorization: Bearer {{accessToken do Aluno 1}}` | **200** — `grade`, `pathsBySubject[]` com trilhas, status dos conteúdos e `pendingRecommendations[]` |
| **7.2** | Professor | GET | `{{baseUrl}}/api/dashboard/professor/students?currentGrade=7` | Header: `Authorization: Bearer {{accessToken do Professor}}` | **200** — `students[]` (alunos da série 7) com `levelsBySubject[]` (nível por matéria) e `pendingRecommendations[]` para as matérias que o professor leciona + blocos analíticos `summaryByGrade`, `subjectsByGrade`, `learningPaths` |
| **7.3** | Coordenador | GET | `{{baseUrl}}/api/dashboard/coordinator` | Header: `Authorization: Bearer {{accessToken do Coordenador}}` | **200** — `summary` (totais de alunos/professores/conteúdos/trilhas/avaliações/recomendações), `byGrade[]` (alunos e recomendações por série) e `bySubject[]` (matérias com contagens e alunos com recomendações pendentes) |

Resultado esperado: o aluno vê uma visão unificada da própria trilha/progresso/recomendações; o professor vê, por série, em que nível os alunos estão em cada matéria, quais trilhas existem e quais alunos têm recomendações ativas; o coordenador vê um painel agregado por série e matéria para apoiar decisões de gestão pedagógica.

---

# Resumo — Ordem dos fluxos

1. **Fase 0** — Health.
2. **Fase 1 — Coordenador:** login → me → me/coordinator → listar usuários → obter categoryId → listar alunos → criar Aluno 2 (série 8) → obter/atualizar usuário.
3. **Fase 2 — Professor:** login → criar 2 conteúdos (série 7) → listar/obter conteúdo → criar trilha → adicionar conteúdos à trilha → listar/obter trilha.
4. **Fase 3 — Aluno 1 (série 7):** login → listar conteúdos/trilha → **marcar progresso** (in_progress, completed) → listar progresso por matéria → verificar avaliação disponível por nível (Parte 6).
5. **Fase 4 — Aluno 2 (série 8):** login → listar conteúdos (série 8) → obter trilha (esperado 404/sem trilha).
6. **Fase 5 — Auth:** refresh e logout.
7. **Fase 6 — Avaliações e Recomendações (Aluno 1):** listar avaliações disponíveis → fazer prova → ver resultado detalhado → consultar recomendações de reforço.
8. **Fase 7 — Dashboards:** aluno vê trilha/progresso/recomendações; professor vê lista de alunos + visão analítica por série/matéria; coordenador vê visão agregada por série/matéria.

---

# Referência rápida — Variáveis e credenciais

| Variável     | Como obter |
|-------------|------------|
| baseUrl     | `http://localhost:3000` |
| accessToken | Resposta de POST `/api/auth/login` (trocar ao mudar de persona) |
| categoryId  | Fase 1, passo 1.5 — `users[].teacherSubjects[0].categoryId` |
| contentId   | Resposta de POST `/api/contents` |
| pathId      | Resposta de POST `/api/learning-paths` |
| userId      | Resposta de POST `/api/users` ou `user.sub` em GET `/api/auth/me` |

| Persona      | Email                 | Senha     |
|-------------|------------------------|-----------|
| Coordenador | admin@example.com      | Admin@123 |
| Professor   | professor@example.com | Senha123  |
| Aluno 1     | aluno@example.com      | Senha123  |
| Aluno 2     | aluno2@example.com     | Senha123  |

Séries válidas: `6`, `7`, `8`, `9`, `1EM`, `2EM`, `3EM`.  
Níveis de conteúdo (trilha): `1`, `2`, `3` (reforço `reforco` não entra na trilha).

---

# Parte 6 — Progresso do aluno (referência)

| Método | URL | Body / Query | Resposta |
|--------|-----|--------------|----------|
| PATCH | `{{baseUrl}}/api/progress` | Body: `{ "contentId": "<uuid>", "status": "not_started" \| "in_progress" \| "completed", "timeSpent": 5 }` (timeSpent opcional) | **200** — objeto do progresso |
| GET | `{{baseUrl}}/api/progress?categoryId=<uuid>` | Query: `categoryId` obrigatório | **200** — `categoryId`, `category`, `grade`, `pathId`, `pathName`, `currentLevel`, `totalContents`, `completedCount`, `percentage`, `contents[]` |
| GET | `{{baseUrl}}/api/progress/assessment-available?categoryId=<uuid>&level=1` | Query: `categoryId` e `level` (1, 2 ou 3) | **200** — `{ "available": true \| false }` |

Todas as rotas de progresso exigem **aluno** autenticado (`Authorization: Bearer <token>`). O aluno só altera o próprio progresso; o conteúdo deve ser da sua série e nível acessível.

---

# Parte 7 — Avaliações (referência)

| Método | URL | Body / Query | Resposta |
|--------|-----|--------------|----------|
| GET | `{{baseUrl}}/api/assessments/available` | — | **200** — `assessments[]` disponíveis para o aluno (student) |
| GET | `{{baseUrl}}/api/assessments/:id/for-student` | Params: `id` = assessmentId | **200** — avaliação com questões **sem** `correctAnswer` (para realizar a prova) |
| POST | `{{baseUrl}}/api/assessments/:id/submit` | Body: `{ "answers": [{ "questionId": "<uuid>", "answerText": "..." }] }` | **200** — `totalScore`, `maxScore`, `percentage`, `levelUpdated` |
| GET | `{{baseUrl}}/api/assessments/:id/result` | Params: `id` = assessmentId | **200** — `result` (nota, percentual, levelUpdated, completedAt), `assessment`, `questions[]` com `correctAnswer` e `studentAnswer` (answerText, isCorrect, pointsEarned) — **só após ter submetido** |

Fluxo aluno: listar disponíveis → obter prova (for-student) → enviar respostas (submit) → **consultar resultado** (result) para ver o que acertou/errou e a resposta correta de cada questão.

---

# Parte 8 — Recomendações (referência)

Após o aluno submeter uma avaliação com questões erradas, o backend gera recomendações de conteúdos de **reforço** (level = reforco) da mesma matéria e série, cujas tags tenham interseção com as tags das questões erradas.

| Método | URL | Body / Query | Resposta |
|--------|-----|--------------|----------|
| GET | `{{baseUrl}}/api/recommendations` | Query: `status` opcional (pending, completed, dismissed) | **200** — `recommendations[]` com `id`, `contentId`, `content` (title, category, grade, level), `reason`, `sourceType`, `status`, `createdAt` |
| PATCH | `{{baseUrl}}/api/recommendations/:id` | Body: `{ "status": "completed" \| "dismissed" }` | **200** — recomendação atualizada (apenas o aluno dono pode alterar) |

Todas as rotas de recomendações exigem **aluno** autenticado (`Authorization: Bearer <token>`).

---

# Parte 9 — Dashboard do aluno (referência)

Visão única: trilhas por matéria (com status de cada conteúdo), progresso por matéria e recomendações pendentes.

| Método | URL | Resposta |
|--------|-----|----------|
| GET | `{{baseUrl}}/api/dashboard/student` | **200** — `grade`, `pathsBySubject[]` (categoryId, category, pathId, pathName, currentLevel, totalContents, completedCount, percentage, contents com status: blocked/available/completed), `pendingRecommendations[]` (id, contentId, reason, content com title, category, etc.) |

Requer **aluno** autenticado (`Authorization: Bearer <token>`).

---

# Parte 10 — Dashboard do professor (referência)

Lista de alunos com nível por matéria e recomendações pendentes, para **plano de ação e equiparação**. Professor vê apenas matérias que leciona; coordenador vê todas.

| Método | URL | Query | Resposta |
|--------|-----|-------|----------|
| GET | `{{baseUrl}}/api/dashboard/professor/students` | `currentGrade` opcional (6, 7, 8, 9, 1EM, 2EM, 3EM) | **200** — `students[]` (id, name, email, currentGrade, levelsBySubject[], pendingRecommendations[]), `total`, `subjects[]` |

Requer **professor** ou **coordenador** autenticado (`Authorization: Bearer <token>`).
