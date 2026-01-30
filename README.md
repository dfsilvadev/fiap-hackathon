# Backend — Módulo Pedagógico (Hackathon)

API Node.js com **Express**, **Prisma**, **TypeScript**, seguindo **Clean Architecture** e **SOLID**.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express
- **ORM:** Prisma (PostgreSQL)
- **Validação:** Zod
- **Segurança:** Helmet, express-rate-limit
- **Testes:** Vitest
- **Qualidade:** ESLint (no-console error, no-unused-vars error), Prettier, Husky + lint-staged
- **Container:** Docker + Docker Compose

## Estrutura (Clean Architecture)

```
src/
  domain/          # Entidades e interfaces (regras de negócio)
  application/     # Casos de uso (orquestração)
  infrastructure/  # HTTP (Express), persistência (Prisma)
  shared/          # Config, erros, utils
```

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (ou use Docker)
- npm

## Setup

1. **Clonar o repositório e instalar dependências:**

   ```bash
   npm install
   ```

2. **Variáveis de ambiente:**

   ```bash
   cp .env.example .env
   # Ajuste DATABASE_URL e JWT_SECRET
   ```

   **DATABASE_URL:** Ao rodar **no seu computador** (prisma:push, prisma:seed, npm run dev), use **`localhost`** no `.env` (ex.: `postgresql://postgres:postgres@localhost:5433/hackathon`). O host `db` só funciona **dentro do Docker**. Use o `.env.example` como base — ele já vem com `localhost:5433` e `PORT=3000`.  
   **EADDRINUSE (porta em uso):** Se der erro na porta (ex.: 3001), use `PORT=3000` no `.env` ou encerre o processo que está usando a porta.

3. **Prisma 7 (com PostgreSQL rodando localmente):**

   O projeto usa Prisma 7 com driver adapter `@prisma/adapter-pg`. A URL do banco é lida do `.env` (via `prisma.config.ts`). O client é gerado em `src/generated/prisma`.

   ```bash
   npm run prisma:generate   # ou db:generate — gera o client (obrigatório após clone)
   npm run prisma:push       # ou db:push — sincroniza schema com o banco (sem migrations)
   npm run prisma:seed       # ou db:seed — insere roles, categorias e usuário admin
   ```
   Com migrations: `npm run prisma:migrate` (na primeira vez: `npx prisma migrate dev --name init`).

4. **Rodar em desenvolvimento:**

   ```bash
   npm run dev
   ```

   API em `http://localhost:3000`. Health: `GET /api/health`.

   **Auth:** Defina `JWT_SECRET` no `.env`. Após o seed, login de teste: `admin@example.com` / `Admin@123`.

## Auth (API)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Body: `{ email, password }` → retorna `accessToken`, `refreshToken`, `expiresIn`, `tokenType` |
| POST | `/api/auth/refresh` | Body: `{ refreshToken }` → retorna novo `accessToken` e `refreshToken` (rotação) |
| POST | `/api/auth/logout` | Body opcional: `{ refreshToken }` → revoga o refresh token (204) |
| GET | `/api/auth/me` | Header: `Authorization: Bearer <accessToken>` → retorna `{ user: { sub, role } }` |
| GET | `/api/auth/me/coordinator` | Idem, apenas role `coordinator` (403 para outros) |

Usuário de teste (após `npm run db:seed`): **admin@example.com** / **Admin@123**.

## Usuários (API)

Todas as rotas abaixo exigem `Authorization: Bearer <accessToken>`, exceto onde indicado.

| Método | Rota | Quem | Descrição |
|--------|------|------|-----------|
| POST | `/api/users` | Coordenador | Criar aluno (body: name, email, password, role: "student", currentGrade, guardians[]) ou professor (role: "teacher", categoryIds[]). |
| GET | `/api/users` | Coordenador | Listar usuários; query: role, currentGrade, page, limit. |
| GET | `/api/users/:id` | Próprio ou coordenador | Obter usuário por id (com role e teacherSubjects se professor). |
| PATCH | `/api/users/:id` | Próprio ou coordenador | Atualizar: nome, email, dateOfBirth, série, guardians (aluno), categoryIds (professor). |
| PATCH | `/api/users/:id/active` | Coordenador | Body: `{ isActive }` — desativar/reativar usuário (soft delete). |

Séries válidas: `"6"`, `"7"`, `"8"`, `"9"`, `"1EM"`, `"2EM"`, `"3EM"`. Responsável: `{ name, phone, email, relationship }` (aluno com pelo menos 1).

## Testes

- **Unitários (AuthService, UserService):** `src/application/**/*.spec.ts` — rodam sem banco (Prisma mockado).
- **Integração HTTP (auth + users):** `src/infrastructure/http/api.spec.ts` — usam a API real; para passar, é preciso banco de teste com seed (`DATABASE_URL` de teste e `npm run db:seed`).

Para rodar só os unitários (sem depender do banco): `npm run test -- src/application`.

## Scripts

| Comando           | Descrição                    |
|-------------------|------------------------------|
| `npm run dev`     | Servidor com hot reload      |
| `npm run build`   | Build TypeScript → `dist/`   |
| `npm start`       | Roda `dist/server.js`        |
| `npm test`        | Testes (Vitest)              |
| `npm run test:watch` | Testes em watch           |
| `npm run test:coverage` | Cobertura               |
| `npm run test -- src/application` | Só testes unitários (sem DB) |
| `npm run lint`    | ESLint                       |
| `npm run lint:fix`| ESLint com auto-fix          |
| `npm run format`  | Prettier (write)             |
| `npm run format:check` | Prettier (check)      |
| `npm run db:generate` | Gera Prisma Client     |
| `npm run db:push` | Sincroniza schema com o DB   |
| `npm run db:migrate` | Cria/aplica migrations   |
| `npm run db:seed` | Insere roles e categorias iniciais |
| `npm run db:studio` | Abre Prisma Studio        |

## Docker

Para subir **API + banco** juntos (ex.: produção ou teste integrado):

```bash
docker compose up -d
```

- **api** — aplicação Node.js na porta `3000`
- **db** — PostgreSQL 16 na porta `5433` (host) → `5432` (container)

Defina no `.env` (ou exporte) as variáveis usadas pelo compose: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

**Limpar e rodar do zero (containers + volumes + rebuild):**

```bash
docker compose down -v
docker compose up -d --build
```

## Regras ESLint

- `no-console`: **error**
- `no-unused-vars` (via `@typescript-eslint/no-unused-vars`): **error** (variáveis/parâmetros não usados podem usar prefixo `_`)

## Husky + lint-staged

No pre-commit são executados `eslint --fix` e `prettier --write` nos arquivos `.ts` staged.

## Referências

- [docs/](docs/) — Regras de negócio, modelo de dados, user stories.
