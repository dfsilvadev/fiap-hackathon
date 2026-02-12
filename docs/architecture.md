# Arquitetura Técnica — Módulo Pedagógico

> **Escopo:** Apenas o backend do módulo pedagógico (API Node/Express + Postgres/Prisma). Frontend e outros módulos (blog etc.) estão fora deste documento.

---

## 1. Visão geral (camadas)

Arquitetura baseada em **Clean Architecture / Hexagonal**:

```text
src/
  domain/          # Entidades e contratos (regras de negócio puras)
  application/     # Casos de uso / serviços de aplicação
  infrastructure/  # Adaptadores (HTTP/Express, Prisma, JWT, etc.)
  shared/          # Config, erros, utilitários
```

- **domain/**  
  - Define entidades conceituais (Aluno, Professor, Conteúdo, Trilha, Avaliação, Recomendação).  
  - Não conhece Express nem Prisma.

- **application/**  
  - Implementa **serviços de caso de uso**, um por área:  
    - `authService`, `userService`, `contentService`, `learningPathService`,  
      `assessmentService`, `progressService`, `recommendationService`, `dashboardService`, `subjectService`.  
  - Orquestra regras de negócio usando o `PrismaClient` (injeção via construtor).

- **infrastructure/**  
  - **HTTP (Express):**  
    - `infrastructure/http/app.ts`: cria o `express()` e registra middlewares + rotas.  
    - `infrastructure/http/routes/*.ts`: rotas (auth, users, contents, learning-paths, progress, assessments, recommendations, dashboard, teachers).  
    - `infrastructure/http/controllers/*.ts`: recebem `Request/Response`, convertem para chamadas de serviços.
  - **Persistência (Prisma):**  
    - `infrastructure/persistence/prisma.ts`: instancia `PrismaClient` com `@prisma/adapter-pg`.  
    - `prisma/schema.prisma`: modelo relacional.  
    - `prisma/seed.ts`: seed inicial (roles, categorias, usuários de teste, conteúdos/trilhas/avaliações de exemplo).

- **shared/**  
  - `shared/config/env.ts`: leitura de variáveis de ambiente.  
  - `shared/errors/AppError.ts`: erro de domínio + HTTP.  
  - `shared/auth/jwt.ts`: geração e verificação de JWT.  
  - Constantes (séries válidas, níveis de conteúdo, etc.).

Fluxo típico de requisição:

```text
Express Route → Controller → Service (application) → Prisma (infra/persistence) → Postgres
           ↑            ↓
         Middlewares  Regras de negócio / validação (Zod)
```

---

## 2. Modelagem de dados (tabelas principais)

Modelagem em `prisma/schema.prisma` (mapeia para tabelas `tb_*` no Postgres):

- **Usuário / Perfis**
  - `User` (`tb_user`)
    - Campos: `id`, `name`, `email`, `password_hash`, `phone`, `role_id`, `date_of_birth`, `current_grade`, `guardians` (JSONB), `is_active`, timestamps.  
    - Relações: `Role`, `TeacherSubjects`, `StudentLearningLevels`, `StudentAnswers`, `AssessmentResults`, `Recommendations`, `StudentProgress`, `RefreshTokens`.
  - `Role` (`tb_role`) — valores principais: `student`, `teacher`, `coordinator`.
  - `TeacherSubject` (`tb_teacher_subject`)
    - Relaciona **professor ↔ matéria** (`teacher_id`, `category_id`), único por par.
  - `RefreshToken` (`tb_refresh_token`) — tokens de refresh com hash, expiração e revogação.

- **Conteúdo pedagógico**
  - `Category` (`tb_category`) — matérias (Português, Matemática, etc.).  
  - `Content` (`tb_content`)
    - Campos: `title`, `content_text`, `category_id`, `grade`, `level` (`"1" | "2" | "3" | "reforco"`), `user_id` (criador), `is_active`, `topics`, `glossary`, `accessibility_metadata`, `tags`.  
    - `level = 'reforco'` identifica **conteúdo de reforço** (não entra na trilha padrão).

- **Trilhas de aprendizado**
  - `LearningPath` (`tb_learning_path`)
    - Campos: `name`, `category_id`, `grade`, `is_default`, `description`, `created_by`, `is_active`.  
    - Define uma **trilha padrão por matéria/série** no MVP.
  - `LearningPathContent` (`tb_learning_path_content`)
    - Liga trilhas a conteúdos com `order_number` (ordem na trilha).

- **Nível do aluno por matéria**
  - `StudentLearningLevel` (`tb_student_learning_level`)
    - Campos: `student_id`, `category_id`, `level`, timestamps.  
    - Único por `(student_id, category_id)`.

- **Avaliações**
  - `Assessment` (`tb_assessment`)
    - Campos: `title`, `description`, `category_id`, `level`, `content_id?`, `teacher_id`, `min_score`, `start_date`, `end_date?`, `is_active`.  
  - `Question` (`tb_question`)
    - Campos: `assessment_id`, `question_text`, `question_type`, `options` (JSONB), `correct_answer`, `points`, `tags` (JSONB), `order_number`.
  - `StudentAnswer` (`tb_student_answer`)
    - Campos: `student_id`, `assessment_id`, `question_id`, `answer_text`, `is_correct`, `points_earned`, `answered_at`.  
  - `AssessmentResult` (`tb_assessment_result`)
    - Campos: `student_id`, `assessment_id`, `total_score`, `max_score`, `percentage`, `level_updated`, `completed_at`.

- **Recomendações e progresso**
  - `Recommendation` (`tb_recommendation`)
    - Campos: `student_id`, `content_id`, `reason`, `source_type` (ex.: `"assessment"`), `source_id?`, `status` (`pending|completed|dismissed`), timestamps.
  - `StudentProgress` (`tb_student_progress`)
    - Campos: `student_id`, `content_id`, `status` (`not_started|in_progress|completed`), `started_at?`, `completed_at?`, `time_spent?`.

> **Obs.:** Turmas (`tb_class`, `tb_enrollment`, etc.) são **Fase 2** e não existem no schema do MVP.

---

## 3. Principais endpoints (ligados ao fluxo do MVP)

Abaixo um resumo dos endpoints mais relevantes. O roteirão completo com exemplos de payloads e ordem de chamada está em `docs/api-tests.md`.

### 3.1. Autenticação

- `POST /api/auth/login` — login (retorna `accessToken` + `refreshToken`).  
- `POST /api/auth/refresh` — rotação de refresh token.  
- `POST /api/auth/logout` — revoga refresh token.  
- `GET /api/auth/me` — retorna `{ user: { sub, role } }`.  
- `GET /api/auth/me/coordinator` — garante que o usuário é `coordinator`.

### 3.2. Usuários

- `POST /api/users` — coordenador cria **aluno** ou **professor**.  
- `GET /api/users` — lista usuários (filtros por `role`, `currentGrade`).  
- `GET /api/users/:id` — dados do usuário; para professor inclui `teacherSubjects`.  
- `PATCH /api/users/:id` — atualização básica.  
- `PATCH /api/users/:id/active` — ativar/desativar usuário.

### 3.3. Conteúdos e trilhas

- `POST /api/contents` — criar conteúdo (professor, apenas matérias que leciona).  
- `GET /api/contents` — listar conteúdos (professor/coordenador).  
- `GET /api/contents/for-student` — conteúdos filtrados pela série/matéria do aluno.  
- `POST /api/learning-paths` — criar trilha por matéria/série.  
- `POST /api/learning-paths/:id/contents` — adicionar conteúdo à trilha.  
- `PATCH /api/learning-paths/:id/contents/reorder` — reordenar.  
- `GET /api/learning-paths/for-student` — trilha padrão por matéria/série para o aluno.

### 3.4. Progresso e avaliações

- `PATCH /api/progress` — registrar/atualizar progresso em conteúdo (`status`, `timeSpent`).  
- `GET /api/progress` — progresso por matéria (nível, % da trilha, conteúdos com status).  
- `GET /api/progress/assessment-available` — se avaliação de um nível está liberada.

- `POST /api/assessments` — criar avaliação (professor).  
- `GET /api/assessments/available` — avaliações disponíveis para o aluno.  
- `GET /api/assessments/:id/for-student` — avaliação sem respostas corretas (para fazer a prova).  
- `POST /api/assessments/:id/submit` — submissão de respostas; corrige, atualiza nível e gera recomendações.  
- `GET /api/assessments/:id/result` — resultado detalhado (por questão).

### 3.5. Recomendações

- `GET /api/recommendations?status=pending|completed|dismissed` — listar recomendações do aluno.  
- `PATCH /api/recommendations/:id` — marcar recomendação como `completed` ou `dismissed`.

### 3.6. Dashboards

- **Aluno**  
  - `GET /api/dashboard/student` — trilhas por matéria, progresso por matéria, recomendações pendentes.

- **Professor / Coordenador**  
  - `GET /api/dashboard/professor/students?currentGrade=` —  
    - Para professor: alunos filtrados pela série (opcional) e apenas matérias que leciona.  
    - Para coordenador: todas as matérias/alunos.  
    - Inclui:
      - `students[]` com níveis por matéria e recomendações pendentes.  
      - `summaryByGrade`, `subjectsByGrade`, `learningPaths` (dados analíticos por série/matéria/trilha).
  - `GET /api/teachers/subjects?page=&limit=` — matérias que o professor leciona com contagem de conteúdos e trilhas (paginação).

- **Coordenador**  
  - `GET /api/dashboard/coordinator` — visão agregada simples do módulo pedagógico:
    - `summary`: totais de alunos/professores/conteúdos/trilhas/avaliações/recomendações.  
    - `byGrade`: alunos e recomendações por série.  
    - `bySubject`: por matéria, conteúdos/trilhas/avaliações e alunos com recomendações pendentes.

---

## 4. Relação com o roteiro de testes

- O documento `docs/api-tests.md` descreve **fluxos E2E por persona** (Coordenador, Professor, Aluno), consumindo os endpoints acima **na ordem**:
  - Fase 1: coordenador configura usuários.  
  - Fase 2: professor cria conteúdos e trilhas.  
  - Fase 3: aluno estuda, registra progresso, libera avaliação.  
  - Fase 4: aluno faz avaliação, gera recomendações.  
  - Fase 5–7: dashboards (aluno, professor, coordenador).
- Esse arquivo é a base recomendada para:
  - **Testar a API** após o deploy.  
  - **Gravar o vídeo do MVP funcionando** (seguindo exatamente os passos descritos).  
  - Validar que a arquitetura (camadas + modelo de dados) está coerente com os fluxos de negócio descritos em `business-rules.md`.

