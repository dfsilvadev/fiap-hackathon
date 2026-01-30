# Passo a passo — Testar a API no Hoppscotch

Use este guia para testar no **Hoppscotch** (ou Postman/Insomnia) todas as rotas já implementadas (Auth + Usuários).

**Pré-requisitos:** API rodando (`npm run dev`) e banco com seed aplicado (`npm run db:seed`).

---

## 1. Configuração no Hoppscotch

1. **URL base:** crie um Environment (ou use o padrão) com:
   - `baseUrl` = `http://localhost:3000`
2. **Requisições:** use a URL como `{{baseUrl}}/api/...` (ex.: `{{baseUrl}}/api/health`).
3. **Header padrão (depois do login):** em Environment, adicione:
   - `accessToken` = (deixe vazio; você vai colar o token após o login)
   - Em **Headers** da requisição: `Authorization` = `Bearer {{accessToken}}`

Se não usar variáveis, use sempre `http://localhost:3000/api/...` e, nas rotas protegidas, header `Authorization: Bearer <token>`.

---

## 2. Health (sem autenticação)

| # | Método | URL | Body | Resposta esperada |
|---|--------|-----|------|--------------------|
| 1 | GET | `http://localhost:3000/api/health` | — | **200** — body com status da API |

**Exemplo de teste:**  
GET `http://localhost:3000/api/health` → deve retornar 200.

---

## 3. Auth — Login

| # | Método | URL | Body | Resposta esperada |
|---|--------|-----|------|--------------------|
| 2 | POST | `http://localhost:3000/api/auth/login` | JSON abaixo | **200** — `accessToken`, `refreshToken`, `expiresIn`, `tokenType` |

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**O que fazer:**  
- Envie a requisição.  
- Copie o `accessToken` da resposta e use em todas as rotas protegidas (header `Authorization: Bearer <accessToken>`).  
- Se quiser testar refresh/logout, guarde também o `refreshToken`.

**Teste de erro (senha errada):**
- Body: `{ "email": "admin@example.com", "password": "WrongPassword" }`  
- Resposta esperada: **401** com `message` (ex.: "Invalid credentials").

---

## 4. Auth — Rotas protegidas (use o token do passo 2)

Adicione o header em todas as requisições abaixo:

- **Header:** `Authorization` = `Bearer <accessToken>` (token do login).

| # | Método | URL | Body | Resposta esperada |
|---|--------|-----|------|--------------------|
| 3 | GET | `http://localhost:3000/api/auth/me` | — | **200** — `{ "user": { "sub": "<uuid>", "role": "coordinator" } }` |
| 4 | GET | `http://localhost:3000/api/auth/me/coordinator` | — | **200** — mesmo formato (só coordenador) |
| 5 | POST | `http://localhost:3000/api/auth/refresh` | JSON abaixo | **200** — novo `accessToken` e `refreshToken` |
| 6 | POST | `http://localhost:3000/api/auth/logout` | JSON abaixo (opcional) | **204** — sem body |

**Body para refresh (5):**
```json
{
  "refreshToken": "<cole aqui o refreshToken do login>"
}
```

**Body para logout (6):** opcional.
```json
{
  "refreshToken": "<refreshToken>"
}
```

**Teste sem token:**  
- GET `http://localhost:3000/api/auth/me` **sem** header `Authorization` → **401**.

---

## 5. Usuários — Listar (só coordenador)

| # | Método | URL | Headers | Query (opcional) | Resposta esperada |
|---|--------|-----|---------|------------------|--------------------|
| 7 | GET | `http://localhost:3000/api/users` | `Authorization: Bearer <token>` | `role=student`, `role=teacher`, `currentGrade=7`, `page=1`, `limit=10` | **200** — `{ "users": [...], "total": N }` |

**Exemplos de URL:**
- `http://localhost:3000/api/users`
- `http://localhost:3000/api/users?role=student`
- `http://localhost:3000/api/users?role=teacher&page=1&limit=5`
- `http://localhost:3000/api/users?currentGrade=7`

Séries válidas para `currentGrade`: `6`, `7`, `8`, `9`, `1EM`, `2EM`, `3EM`.

---

## 6. Usuários — Criar aluno (só coordenador)

| # | Método | URL | Body | Resposta esperada |
|---|--------|-----|------|--------------------|
| 8 | POST | `http://localhost:3000/api/users` | JSON abaixo | **201** — `{ "id": "<uuid>", "email": "..." }` |

**Body (JSON) — troque o email se for testar de novo:**
```json
{
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "password": "Senha123",
  "role": "student",
  "currentGrade": "7",
  "guardians": [
    {
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao.silva@example.com",
      "relationship": "pai"
    }
  ],
  "dateOfBirth": "2012-03-15"
}
```

Guarde o `id` retornado para usar em **Obter por id** e **Atualizar**.

**Teste de validação (erro):**  
- Remova `guardians` ou envie `guardians: []` → **400**.

---

## 7. Usuários — Criar professor (só coordenador)

Precisa de pelo menos um **categoryId** (UUID de uma matéria). Para obter:

- Abra o **Prisma Studio:** `npm run db:studio` → tabela **Category** → copie o `id` de uma categoria (ex.: Português, Matemática).  
- Ou use o `id` de uma categoria que apareça em `teacherSubjects` ao listar usuários (GET /api/users) se já existir um professor.

| # | Método | URL | Body | Resposta esperada |
|---|--------|-----|------|--------------------|
| 9 | POST | `http://localhost:3000/api/users` | JSON abaixo | **201** — `{ "id": "<uuid>", "email": "..." }` |

**Body (JSON) — substitua `categoryIds` pelos UUIDs reais:**
```json
{
  "name": "Carlos Professor",
  "email": "carlos.prof@example.com",
  "password": "Senha123",
  "role": "teacher",
  "categoryIds": ["<uuid-da-categoria-1>", "<uuid-da-categoria-2>"],
  "phone": "11988887777",
  "dateOfBirth": "1985-06-20"
}
```

Exemplo com **um** categoryId (válido após você colar um UUID do Prisma Studio):
```json
{
  "name": "Carlos Professor",
  "email": "carlos.prof@example.com",
  "password": "Senha123",
  "role": "teacher",
  "categoryIds": ["COLE_AQUI_UUID_DA_CATEGORIA"]
}
```

Guarde o `id` do professor para os próximos passos.

---

## 8. Usuários — Obter por id (próprio usuário ou coordenador)

| # | Método | URL | Resposta esperada |
|---|--------|-----|--------------------|
| 10 | GET | `http://localhost:3000/api/users/<id>` | **200** — objeto do usuário (com `role`, `teacherSubjects` se for professor) |

Substitua `<id>` pelo UUID de um usuário (ex.: o retornado ao criar aluno ou professor, ou o `sub` do `/auth/me`).

**Teste de erro:**  
- GET `http://localhost:3000/api/users/00000000-0000-0000-0000-000000000000` → **404** (ou **400** se o formato do UUID for inválido).

---

## 9. Usuários — Atualizar (PATCH) — próprio ou coordenador

| # | Método | URL | Body | Resposta esperada |
|---|--------|-----|------|--------------------|
| 11 | PATCH | `http://localhost:3000/api/users/<id>` | JSON (apenas campos que quiser alterar) | **200** — `{ "id": "<uuid>", "email": "..." }` |

**Exemplo — atualizar nome e email:**
```json
{
  "name": "Maria Silva Atualizada",
  "email": "maria.nova@example.com"
}
```

**Exemplo — aluno: atualizar série e responsável:**
```json
{
  "currentGrade": "8",
  "guardians": [
    {
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao.silva@example.com",
      "relationship": "pai"
    },
    {
      "name": "Ana Silva",
      "phone": "11977776666",
      "email": "ana.silva@example.com",
      "relationship": "mãe"
    }
  ]
}
```

**Exemplo — professor: atualizar matérias (categoryIds):**
```json
{
  "categoryIds": ["<uuid-cat-1>", "<uuid-cat-2>"]
}
```

Substitua `<id>` pelo UUID do usuário que você está editando.

---

## 10. Usuários — Desativar/reativar (só coordenador)

| # | Método | URL | Body | Resposta esperada |
|---|--------|-----|------|--------------------|
| 12 | PATCH | `http://localhost:3000/api/users/<id>/active` | JSON abaixo | **204** — sem body |

**Body para desativar:**
```json
{
  "isActive": false
}
```

**Body para reativar:**
```json
{
  "isActive": true
}
```

Substitua `<id>` pelo UUID do usuário. Após desativar, o login desse usuário não deve mais funcionar (401).

---

## Ordem sugerida para testar

1. **Health** — GET /api/health  
2. **Login** — POST /api/auth/login (guardar `accessToken` e `refreshToken`)  
3. **Me** — GET /api/auth/me (com token)  
4. **Me coordinator** — GET /api/auth/me/coordinator (com token)  
5. **Refresh** — POST /api/auth/refresh (com refreshToken)  
6. **Logout** — POST /api/auth/logout (opcional)  
7. **Listar usuários** — GET /api/users (com token)  
8. **Criar aluno** — POST /api/users (body aluno; guardar `id`)  
9. **Criar professor** — POST /api/users (body professor; categoryIds do Prisma Studio)  
10. **Obter usuário** — GET /api/users/:id (com token)  
11. **Atualizar usuário** — PATCH /api/users/:id (com token)  
12. **Desativar/reativar** — PATCH /api/users/:id/active (com token de coordenador)

---

## Credenciais de teste (seed)

| Tipo | Email | Senha |
|------|--------|--------|
| Coordenador | admin@example.com | Admin@123 |

Não há aluno nem professor no seed; use os bodies acima para criar e testar.
