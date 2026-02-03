# Backend — Módulo Pedagógico (Hackathon)

API Node.js com **Express**, **Prisma**, **TypeScript**, seguindo **Clean Architecture** e **SOLID**. Backend do módulo pedagógico para acompanhamento de alunos, trilhas de aprendizado, avaliações e recomendações.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express
- **ORM:** Prisma 7 (PostgreSQL, driver adapter `@prisma/adapter-pg`)
- **Validação:** Zod
- **Segurança:** Helmet, express-rate-limit
- **Testes:** Vitest, Supertest
- **Qualidade:** ESLint, Prettier, Husky + lint-staged
- **Container:** Docker + Docker Compose

## Estrutura (Clean Architecture)

```
src/
  domain/          # Entidades (regras de negócio puras)
  application/     # Casos de uso — assessment, auth, content, dashboard,
                   # learningPath, progress, recommendation, user
  infrastructure/  # HTTP (Express, rotas, middlewares), persistência (Prisma)
  shared/          # Config (env), erros, constantes (grades, contentLevels), auth (JWT)
prisma/
  schema.prisma    # Modelo de dados (MVP pedagógico)
  seed.ts          # Roles, categorias, admin, professor e aluno de teste
```

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (ou uso via Docker)
- npm

## Setup

1. **Clonar e instalar dependências:**

   ```bash
   npm install
   ```

2. **Variáveis de ambiente:**

   ```bash
   cp .env.example .env
   # Ajuste DATABASE_URL e JWT_SECRET
   ```

   - **DATABASE_URL:** Em desenvolvimento local (push, seed, `npm run dev`) use **`localhost`** no `.env` (ex.: `postgresql://postgres:postgres@localhost:5433/hackathon`). O host `db` vale apenas dentro do Docker; o `prisma.config.ts` troca `db` por `localhost` quando não está em Docker.
   - **EADDRINUSE:** Se a porta estiver em uso, defina `PORT` no `.env` ou encerre o processo que a utiliza.

3. **Prisma (client e banco):**

   O client é gerado em `src/generated/prisma`. Use a URL do `.env` (via `prisma.config.ts`).

   ```bash
   npm run prisma:generate   # Gera o client (obrigatório após clone)
   npm run prisma:push       # Sincroniza schema com o banco (sem migrations)
   npm run prisma:seed       # Insere roles, categorias, admin, professor e aluno de teste
   ```

   Com migrations: `npm run prisma:migrate` (primeira vez: `npx prisma migrate dev --name init`).

4. **Desenvolvimento:**

   ```bash
   npm run dev
   ```

   API em `http://localhost:3000`. Health: `GET /api/health`.  
   Login de teste (após seed): **admin@example.com** / **Admin@123**. Defina `JWT_SECRET` no `.env`.

## API — Visão geral

Todas as rotas abaixo (exceto health e login) exigem `Authorization: Bearer <accessToken>`.

### Health e Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |
| POST | `/api/auth/login` | Body: `{ email, password }` → `accessToken`, `refreshToken`, `expiresIn`, `tokenType` |
| POST | `/api/auth/refresh` | Body: `{ refreshToken }` → novos tokens (rotação) |
| POST | `/api/auth/logout` | Body opcional: `{ refreshToken }` → revoga refresh (204) |
| GET | `/api/auth/me` | Retorna `{ user: { sub, role } }` |
| GET | `/api/auth/me/coordinator` | Idem; apenas role `coordinator` (403 para outros) |

### Usuários

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| POST | `/api/users` | Coordenador | Criar aluno (role `student`, currentGrade, guardians[]) ou professor (role `teacher`, categoryIds[]) |
| GET | `/api/users` | Coordenador | Listar; query: role, currentGrade, page, limit |
| GET | `/api/users/:id` | Próprio ou coordenador | Obter usuário (com role e teacherSubjects se professor) |
| PATCH | `/api/users/:id` | Próprio ou coordenador | Atualizar nome, email, dateOfBirth, série, guardians (aluno), categoryIds (professor) |
| PATCH | `/api/users/:id/active` | Coordenador | Body: `{ isActive }` — ativar/desativar usuário |

Séries: `"6"`, `"7"`, `"8"`, `"9"`, `"1EM"`, `"2EM"`, `"3EM"`. Guardian: `{ name, phone, email, relationship }`.

### Conteúdo (Content)

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| POST | `/api/contents` | Professor/Coordenador | Criar conteúdo (categoryId, grade, level, title, contentText, etc.) |
| GET | `/api/contents` | Professor/Coordenador | Listar; query: categoryId, grade, level, isActive, page, limit |
| GET | `/api/contents/student` | Aluno | Listar conteúdos disponíveis para a série do aluno |
| GET | `/api/contents/:id` | Todos* | Detalhe (aluno: só se ativo e da sua série) |
| PATCH | `/api/contents/:id` | Professor/Coordenador | Atualizar conteúdo |
| PATCH | `/api/contents/:id/active` | Professor/Coordenador | Body: `{ isActive }` |

### Trilhas (Learning path)

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| POST | `/api/learning-paths` | Professor/Coordenador | Criar trilha (categoryId, grade, name, isDefault) |
| GET | `/api/learning-paths` | Professor/Coordenador | Listar; query: categoryId, grade, page, limit |
| GET | `/api/learning-paths/:id` | Professor/Coordenador | Detalhe com conteúdos ordenados |
| GET | `/api/learning-paths/student/:categoryId` | Aluno | Trilha padrão da matéria para a série do aluno |
| PATCH | `/api/learning-paths/:id` | Professor/Coordenador | Atualizar nome, isDefault, description |
| POST | `/api/learning-paths/:pathId/contents` | Professor/Coordenador | Adicionar conteúdo à trilha (contentId, orderNumber) |
| DELETE | `/api/learning-paths/:pathId/contents/:contentId` | Professor/Coordenador | Remover conteúdo da trilha |
| PATCH | `/api/learning-paths/:pathId/contents/reorder` | Professor/Coordenador | Reordenar; body: `{ items: [{ contentId, orderNumber }] }` |

### Progresso (Progress)

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| PATCH | `/api/progress` | Aluno | Upsert progresso (contentId, status: not_started \| in_progress \| completed, timeSpent?) |
| GET | `/api/progress/category/:categoryId` | Aluno | Progresso por matéria (trilha + status por conteúdo, percentual, nível atual) |

### Avaliações (Assessment)

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| POST | `/api/assessments` | Professor/Coordenador | Criar avaliação (categoryId, level 1|2|3, title, startDate, endDate?, minScore?) |
| GET | `/api/assessments` | Professor/Coordenador | Listar; query: categoryId, level, page, limit |
| GET | `/api/assessments/:id` | Professor/Coordenador | Detalhe com questões |
| PATCH | `/api/assessments/:id` | Professor/Coordenador | Atualizar avaliação |
| POST | `/api/assessments/:id/questions` | Professor/Coordenador | Criar questão (questionText, questionType, correctAnswer, options?, tags?, orderNumber) |
| GET | `/api/assessments/:id/questions` | Professor/Coordenador | Listar questões |
| PATCH | `/api/assessments/questions/:questionId` | Professor/Coordenador | Atualizar questão |
| DELETE | `/api/assessments/questions/:questionId` | Professor/Coordenador | Remover questão |
| GET | `/api/assessments/student/available` | Aluno | Avaliações disponíveis (por nível e matéria, não submetidas) |
| GET | `/api/assessments/:id/student` | Aluno | Avaliação para realizar (sem correctAnswer) |
| POST | `/api/assessments/:id/submit` | Aluno | Enviar respostas; body: `{ answers: [{ questionId, answerText }] }` |
| GET | `/api/assessments/:id/result` | Aluno | Resultado detalhado (nota, respostas corretas/incorretas) |

### Recomendações (Recommendation)

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| GET | `/api/recommendations` | Aluno | Listar recomendações; query: status (pending \| completed \| dismissed) |
| PATCH | `/api/recommendations/:id` | Aluno | Atualizar status (completed \| dismissed) |

### Dashboard

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| GET | `/api/dashboard/student` | Aluno | Trilhas por matéria, progresso e recomendações pendentes |
| GET | `/api/dashboard/professor/students` | Professor/Coordenador | Lista alunos com nível por matéria e recomendações pendentes; query: currentGrade |

Testes E2E guiados (Hoppscotch): [docs/API_TESTES.md](docs/API_TESTES.md).

## Testes

- **Unitários (AuthService, UserService):** `src/application/**/*.spec.ts` — sem banco (Prisma mockado).
- **Integração HTTP (auth + users):** `src/infrastructure/http/api.spec.ts` — API real; exige banco de teste com seed (`DATABASE_URL` de teste e `npm run prisma:seed`).

Rodar só unitários (sem DB): `npm run test -- src/application`.

## Scripts

| Comando | Descrição |
|---------|------------|
| `npm run dev` | Servidor com hot reload (tsx watch) |
| `npm run build` | Build TypeScript → `dist/` |
| `npm start` | Roda `dist/server.js` |
| `npm test` | Testes (Vitest) |
| `npm run test:watch` | Testes em watch |
| `npm run test:coverage` | Cobertura |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com auto-fix |
| `npm run format` | Prettier (write) |
| `npm run format:check` | Prettier (check) |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:push` | Sincroniza schema com o banco |
| `npm run prisma:migrate` | Cria/aplica migrations (dev) |
| `npm run prisma:seed` | Insere roles, categorias e usuários iniciais |
| `npm run prisma:studio` | Abre Prisma Studio |

## Docker (banco + API)

Para subir **PostgreSQL + API** com Docker:

1. Crie o `.env` na raiz (ex.: `cp .env.example .env`).
2. Defina ao menos `JWT_SECRET`. Opcional: `POSTGRES_*`, `API_PORT` (padrão 3001 no exemplo).
3. Suba os serviços:

   ```bash
   docker compose up -d --build
   ```

4. API: **http://localhost:3001** (ou `API_PORT`). Health: `GET /api/health`. Login de teste (após seed): **admin@example.com** / **Admin@123**.

O entrypoint da API executa `prisma migrate deploy` e `prisma db seed` antes de iniciar o servidor. O seed é idempotente.

| Comando | Descrição |
|---------|-----------|
| `docker compose up -d --build` | Sobe banco + API |
| `docker compose down` | Para os containers |
| `docker compose down -v` | Para e remove volume do banco |
| `docker compose logs -f api` | Logs da API |

## Regras ESLint

- `no-console`: **error**
- `no-unused-vars`: **error** (parâmetros não usados podem usar prefixo `_`)

## Husky + lint-staged

No pre-commit: `eslint --fix` e `prettier --write` nos arquivos `.ts` staged.

## Referências

- [docs/API_TESTES.md](docs/API_TESTES.md) — Testes E2E guiados (Hoppscotch)
- [docs/REGRAS_NEGOCIO.md](docs/REGRAS_NEGOCIO.md) — Regras de negócio
- [docs/USER_STORIES.md](docs/USER_STORIES.md) — User stories
- [docs/](docs/) — Demais documentos (modelo de dados, exemplos, checklist, pitch)
