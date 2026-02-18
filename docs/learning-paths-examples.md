# Exemplos de trilhas (7º ano) — Matemática, Português e História

Trilhas alinhadas aos conteúdos de **`content-by-level-examples.md`**.  
Cada trilha é **padrão** para a matéria e série; os conteúdos entram na ordem **nível 1 → 2 → 3**.

**Fluxo:**  
1. Criar os 3 conteúdos da matéria (níveis 1, 2 e 3) e anotar os `id`.  
2. Criar a trilha (POST abaixo) e anotar o `pathId`.  
3. Adicionar cada conteúdo à trilha na ordem: `orderNumber` 0, 1, 2.

---

## Anote aqui (após criar conteúdos e trilhas)

| Matéria   | pathId (trilha) | contentId nível 1 | contentId nível 2 | contentId nível 3 |
|-----------|------------------|-------------------|-------------------|-------------------|
| Matemática |                  |                   |                   |                   |
| Português  |                  |                   |                   |                   |
| História   |                  |                   |                   |                   |

Substitua `<uuid-categoria-matematica>`, `<uuid-categoria-portugues>` e `<uuid-categoria-historia>` pelos UUIDs reais da tabela **Category**.

---

## 1. Trilha Matemática 7º ano

**Criar trilha — POST** `{{baseUrl}}/api/learning-paths`

```json
{
  "name": "Trilha Matemática 7º ano",
  "categoryId": "fdf4484c-b041-472a-b5b8-a1aa334af0db",
  "grade": "7",
  "isDefault": true,
  "description": "Trilha padrão de Matemática para o 7º ano: frações e equações do 1º grau."
}
```

**Adicionar conteúdos à trilha** (use os `id` retornados ao criar cada conteúdo em `content-by-level-examples.md`):

| Ordem | Conteúdo (título)              | Método | URL | Body |
|-------|--------------------------------|--------|-----|------|
| 0 | Introdução às frações          | POST | `{{baseUrl}}/api/learning-paths/<pathId>/contents` | `{ "contentId": "<id-nivel-1>", "orderNumber": 0 }` |
| 1 | Operações com frações          | POST | idem | `{ "contentId": "<id-nivel-2>", "orderNumber": 1 }` |
| 2 | Equações do 1º grau com uma incógnita | POST | idem | `{ "contentId": "<id-nivel-3>", "orderNumber": 2 }` |

Resposta esperada de cada POST: **204**.

---

## 2. Trilha Português 7º ano

**Criar trilha — POST** `{{baseUrl}}/api/learning-paths`

```json
{
  "name": "Trilha Português 7º ano",
  "categoryId": "201b3c62-6367-47c6-8dc7-cc6149014988",
  "grade": "7",
  "isDefault": true,
  "description": "Trilha padrão de Português para o 7º ano: classes de palavras, verbos e análise sintática."
}
```

**Adicionar conteúdos à trilha:**

| Ordem | Conteúdo (título)              | Body |
|-------|--------------------------------|------|
| 0 | Classes de palavras: substantivo e adjetivo | `{ "contentId": "<id-nivel-1>", "orderNumber": 0 }` |
| 1 | Verbos: tempo, modo e conjugação | `{ "contentId": "<id-nivel-2>", "orderNumber": 1 }` |
| 2 | Análise sintática: sujeito, predicado e complementos | `{ "contentId": "<id-nivel-3>", "orderNumber": 2 }` |

URL: **POST** `{{baseUrl}}/api/learning-paths/<pathId>/contents` (troque `<pathId>` pelo id da trilha de Português).

---

## 3. Trilha História 7º ano

**Criar trilha — POST** `{{baseUrl}}/api/learning-paths`

```json
{
  "name": "Trilha História 7º ano",
  "categoryId": "<uuid-categoria-historia>",
  "grade": "7",
  "isDefault": true,
  "description": "Trilha padrão de História para o 7º ano: Brasil colonial, Independência e Segundo Reinado."
}
```

**Adicionar conteúdos à trilha:**

| Ordem | Conteúdo (título)              | Body |
|-------|--------------------------------|------|
| 0 | Brasil Colonial: economia e sociedade | `{ "contentId": "<id-nivel-1>", "orderNumber": 0 }` |
| 1 | Independência do Brasil e Primeiro Reinado | `{ "contentId": "<id-nivel-2>", "orderNumber": 1 }` |
| 2 | Segundo Reinado: café, imigração e abolição | `{ "contentId": "<id-nivel-3>", "orderNumber": 2 }` |

URL: **POST** `{{baseUrl}}/api/learning-paths/<pathId>/contents` (troque `<pathId>` pelo id da trilha de História).

---

## Ordem sugerida de execução

1. **Obter categoryIds**  
   GET `/api/users` (como coordenador) ou Prisma Studio → Category. Anote os UUIDs de Matemática, Português e História.

2. **Criar os 9 conteúdos** (3 por matéria)  
   Use os bodies de `content-by-level-examples.md` com o `categoryId` e `grade` "7" corretos. Anote os 9 `id` (3 Matemática, 3 Português, 3 História).

3. **Criar as 3 trilhas**  
   - POST `/api/learning-paths` com o body da **Trilha Matemática** → anote `pathId` Matemática.  
   - POST `/api/learning-paths` com o body da **Trilha Português** → anote `pathId` Português.  
   - POST `/api/learning-paths` com o body da **Trilha História** → anote `pathId` História.

4. **Preencher cada trilha com os 3 conteúdos**  
   Para cada trilha, 3 requisições **POST** `.../learning-paths/<pathId>/contents` com `contentId` (nível 1, 2, 3) e `orderNumber` 0, 1, 2.

5. **Validar**  
   GET `/api/learning-paths/<pathId>` (como professor/coordenador) ou GET `/api/learning-paths/for-student?categoryId=<uuid>` (como aluno série 7).

---

## Headers

Em todas as requisições use: **`Authorization: Bearer <accessToken>`** (token de **Professor** que leciona a matéria ou de **Coordenador**).
