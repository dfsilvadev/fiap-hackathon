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
   # Ajuste DATABASE_URL para seu PostgreSQL local
   ```

3. **Prisma (com PostgreSQL rodando localmente):**

   ```bash
   npm run db:generate
   npm run db:migrate   # cria e aplica migrations (na primeira vez use: prisma migrate dev --name init)
   npm run db:seed      # insere roles e categorias iniciais
   ```
   Alternativa sem histórico de migrations: `npm run db:push` (depois rode o seed).

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

## Scripts

| Comando           | Descrição                    |
|-------------------|------------------------------|
| `npm run dev`     | Servidor com hot reload      |
| `npm run build`   | Build TypeScript → `dist/`   |
| `npm start`       | Roda `dist/server.js`        |
| `npm test`        | Testes (Vitest)              |
| `npm run test:watch` | Testes em watch           |
| `npm run test:coverage` | Cobertura               |
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
