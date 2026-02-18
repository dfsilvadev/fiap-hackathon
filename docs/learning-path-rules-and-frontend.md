# Regras de Trilhas (Professor) e Requisitos do Frontend

Documento de referência: regras de negócio de trilhas de aprendizado para o professor e o que o frontend precisa para cada tela relacionada.

---

## Parte 1 — Regras de Trilhas para o Professor

### 1.1 Quem pode gerenciar trilhas

- **Professor**: pode criar, editar, adicionar/remover/reordenar conteúdos em trilhas **apenas das matérias que leciona** (`tb_teacher_subject`).
- **Coordenador**: pode gerenciar trilhas de **qualquer matéria**.

Se a matéria não for lecionada pelo professor, a API retorna **403** com mensagem do tipo: *"You can only manage paths for subjects you teach"*.

---

### 1.2 Conceito de trilha

Uma **trilha de aprendizado** é uma sequência ordenada de conteúdos que define o caminho pedagógico em uma **matéria** e **série** específicas.

- Cada trilha pertence a uma **matéria** (categoryId) e uma **série** (grade).
- Os conteúdos na trilha têm **ordem** definida por `order_number` (0, 1, 2, …).
- Conteúdos na trilha **mantêm seu nível** (1, 2 ou 3) — o nível está no conteúdo; a trilha só define a ordem.
- **Conteúdos de reforço** (`level = 'reforco'`) **não** entram na trilha (regra validada ao adicionar).

---

### 1.3 Trilha padrão (is_default)

- **No máximo uma trilha padrão** por combinação (matéria, série): `is_default = true`.
- O aluno, ao ver a trilha por matéria, usa a trilha **padrão** da sua série.
- Ao criar ou editar uma trilha e marcar `isDefault: true`, o sistema desmarca a outra trilha que era padrão para a mesma (matéria, série).

---

### 1.4 Criação de trilha

- **Campos obrigatórios**
  - **name** (string, não vazio)
  - **categoryId** (UUID) — matéria
  - **grade** (série) — valores: `"6"`, `"7"`, `"8"`, `"9"`, `"1EM"`, `"2EM"`, `"3EM"`

- **Campos opcionais**
  - **isDefault** (boolean) — padrão é `true` na API; se `true`, garante unicidade por (matéria, série)
  - **description** (string)

- **Regras**
  - O usuário deve poder gerenciar a matéria (professor: matérias que leciona; coordenador: qualquer).
  - Categoria deve existir.

---

### 1.5 Edição de trilha

- **Campos editáveis**: `name`, `isDefault`, `description`. Não é permitido alterar `categoryId` nem `grade` (a API atual não expõe isso).
- Se marcar `isDefault: true`, a outra trilha padrão da mesma (matéria, série) passa a `isDefault: false`.

---

### 1.6 Adicionar conteúdo à trilha

- **Regras**
  - O conteúdo deve existir e ser da **mesma matéria** e **mesma série** da trilha.
  - O conteúdo deve ter **nível 1, 2 ou 3** — conteúdo com `level = 'reforco'` **não** pode ser adicionado (API retorna 400).
  - O mesmo conteúdo **não** pode aparecer duas vezes na mesma trilha (API retorna 400: "Content already in path").
  - **orderNumber**: inteiro ≥ 0; a API renumera os existentes para abrir espaço (insere na posição informada).

- **Resposta de sucesso:** 204 (sem body).

---

### 1.7 Remover conteúdo da trilha

- O conteúdo deve estar na trilha; caso contrário 404 ("Content not in path").
- Após remoção, a API renumera os `order_number` dos conteúdos seguintes para manter sequência sem buracos.

---

### 1.8 Reordenar conteúdos na trilha

- **Body**: `{ "items": [ { "contentId": "uuid", "orderNumber": 0 }, ... ] }`.
- Todos os `contentId` devem pertencer à trilha; senão 400.
- Cada item recebe o novo `orderNumber`; a ordem final é a definida pelo array.

---

### 1.9 Listagem de trilhas (professor/coordenador)

- Professor vê **somente** trilhas das **matérias que leciona**.
- Coordenador vê todas.
- Filtros opcionais: **categoryId**, **grade**, **page**, **limit**.

---

### 1.10 Visualização de uma trilha (GET por id)

- Professor/coordenador: ao chamar `GET /learning-paths/:id`, o backend verifica se o usuário pode gerenciar a matéria da trilha. Retorna a trilha com lista de conteúdos ordenados (contentId, orderNumber, title, level).

---

### 1.11 Resumo das regras

| Ação                    | Professor                    | Coordenador |
|-------------------------|-----------------------------|-------------|
| Criar trilha            | Só matérias que leciona      | Qualquer    |
| Editar trilha           | Só matérias que leciona      | Qualquer    |
| Adicionar conteúdo      | Mesma matéria/série; nível 1/2/3 | Idem    |
| Remover conteúdo        | Conteúdo na trilha          | Idem        |
| Reordenar conteúdos     | Conteúdos da trilha         | Idem        |
| Listar trilhas          | Só trilhas das suas matérias | Todas      |
| Ver trilha (id)         | Se for matéria que leciona  | Sempre      |

---

## Parte 2 — O que o frontend precisa por tela

### 2.1 Tela: Listagem de trilhas (professor/coordenador)

**Objetivo:** Listar trilhas com filtros e ações (criar, editar, abrir detalhe para gerenciar conteúdos).

**Rota da API**

- **GET** `/api/learning-paths?categoryId=...&grade=...&page=1&limit=20`

**Query params (todos opcionais)**

| Parâmetro   | Tipo   | Descrição                        |
|------------|--------|----------------------------------|
| categoryId | UUID   | Filtrar por matéria              |
| grade      | string | `"6"` … `"9"`, `"1EM"` … `"3EM"` |
| page       | number | Paginação                       |
| limit      | number | Itens por página (máx. 100)     |

**Resposta esperada**

```json
{
  "paths": [
    {
      "id": "uuid",
      "name": "string",
      "categoryId": "uuid",
      "category": { "id": "uuid", "name": "string" },
      "grade": "string",
      "isDefault": true,
      "description": "string ou null"
    }
  ],
  "total": 0
}
```

**O que o frontend precisa**

- Lista de **categorias/matérias** para o filtro e para o formulário (ex.: mesma fonte usada em conteúdos).
- Constantes **séries** (`GRADES`) para filtro e formulário.
- Tabela/cards com: nome da trilha, matéria (category.name), série (grade), se é padrão (isDefault), descrição (opcional).
- Ações: **Nova trilha**, **Editar** (nome/descrição/padrão), **Abrir** (tela de detalhe da trilha para adicionar/remover/reordenar conteúdos).
- Tratar **403** com mensagem clara.

---

### 2.2 Tela: Criar trilha (professor/coordenador)

**Objetivo:** Formulário para cadastrar uma nova trilha.

**Rota da API**

- **POST** `/api/learning-paths`

**Body (JSON)**

| Campo       | Obrigatório | Tipo    | Descrição                          |
|------------|-------------|---------|------------------------------------|
| name       | Sim         | string  | Nome da trilha                     |
| categoryId | Sim         | UUID    | ID da matéria                      |
| grade      | Sim         | string  | Série (GRADES)                     |
| isDefault  | Não         | boolean | Trilha padrão para (matéria, série); default true |
| description| Não         | string  | Descrição                          |

**Resposta de sucesso:** `201` + `{ "id": "uuid", "name": "string" }`.

**O que o frontend precisa**

- Select de **matéria** (categoryId): apenas matérias que o professor leciona (ou todas para coordenador).
- Select de **série** (grade) com as constantes do sistema.
- Campo texto: **nome** da trilha.
- Checkbox (ou similar): **Trilha padrão** (isDefault). Explicar que só pode haver uma trilha padrão por matéria/série.
- Campo opcional: **descrição**.
- Validação: nome, categoryId e grade obrigatórios.
- Após criar, redirecionar para a tela de **detalhe da trilha** (para adicionar conteúdos) ou exibir sucesso e link "Gerenciar conteúdos".

---

### 2.3 Tela: Editar trilha (professor/coordenador)

**Objetivo:** Alterar nome, descrição e se é trilha padrão (não altera matéria/série nem a lista de conteúdos).

**Rotas da API**

- **GET** `/api/learning-paths/:id` — carregar dados atuais.
- **PATCH** `/api/learning-paths/:id` — salvar alterações.

**Body do PATCH (todos opcionais)**

- `name`, `isDefault`, `description`.

**Resposta de sucesso do PATCH:** `200` + `{ "id": "uuid", "name": "string" }`.

**O que o frontend precisa**

- Ao abrir (ex.: `/learning-paths/:id/edit`), chamar GET e preencher nome, isDefault, description (matéria e série exibidos somente leitura).
- Formulário com os campos editáveis; submeter PATCH.
- Tratar 403 e 404.

---

### 2.4 Tela: Detalhe da trilha — gerenciar conteúdos (professor/coordenador)

**Objetivo:** Ver a lista ordenada de conteúdos da trilha e adicionar, remover e reordenar.

**Rotas da API**

- **GET** `/api/learning-paths/:id` — obter trilha com lista de conteúdos.

**Resposta do GET (detalhe)**

```json
{
  "id": "uuid",
  "name": "string",
  "categoryId": "uuid",
  "category": { "id": "uuid", "name": "string" },
  "grade": "string",
  "isDefault": true,
  "description": "string ou null",
  "createdBy": "uuid",
  "isActive": true,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "contents": [
    { "contentId": "uuid", "orderNumber": 0, "title": "string", "level": "string" }
  ]
}
```

- **POST** `/api/learning-paths/:id/contents` — adicionar conteúdo.  
  **Body:** `{ "contentId": "uuid", "orderNumber": 0 }`  
  **Resposta:** 204.

- **DELETE** `/api/learning-paths/:id/contents/:contentId` — remover conteúdo.  
  **Resposta:** 204.

- **PATCH** `/api/learning-paths/:id/contents/reorder` — reordenar.  
  **Body:** `{ "items": [ { "contentId": "uuid", "orderNumber": 0 }, ... ] }`  
  **Resposta:** 204.

**O que o frontend precisa**

- Exibir cabeçalho da trilha (nome, matéria, série) e lista de conteúdos em ordem (orderNumber, title, level).
- **Adicionar conteúdo**: lista de conteúdos elegíveis (mesma matéria e série da trilha, nível 1/2/3, ativos). Pode usar `GET /api/contents?categoryId=...&grade=...&level=1` (e 2, 3) e excluir os que já estão na trilha. Ao escolher conteúdo e posição (orderNumber), POST em `/learning-paths/:id/contents`. Tratar 400: conteúdo já na trilha, matéria/série diferente, conteúdo de reforço.
- **Remover**: botão por item; DELETE `/learning-paths/:id/contents/:contentId`; atualizar lista após sucesso.
- **Reordenar**: arrastar-e-soltar ou setas. Montar array `items` com todos os contentId da trilha e os novos orderNumber (0, 1, 2, …); PATCH em `.../contents/reorder`. Atualizar lista após sucesso.
- Mensagens de erro claras: "Conteúdo de reforço não pode entrar na trilha", "Conteúdo já está na trilha", "Conteúdo deve ser da mesma matéria e série".

---

### 2.5 Tela: Trilha do aluno — por matéria (aluno)

**Objetivo:** Aluno escolhe uma matéria e vê a trilha padrão da sua série com status de cada conteúdo (concluído, disponível, bloqueado).

**Rota da API**

- **GET** `/api/learning-paths/for-student?categoryId=...`  
  **Obrigatório:** `categoryId` (UUID da matéria).

**Resposta esperada**

```json
{
  "id": "uuid",
  "name": "string",
  "categoryId": "uuid",
  "category": { "id": "uuid", "name": "string" },
  "grade": "string",
  "description": "string ou null",
  "contents": [
    {
      "contentId": "uuid",
      "orderNumber": 0,
      "title": "string",
      "level": "string",
      "status": "completed" | "available" | "blocked"
    }
  ]
}
```

**O que o frontend precisa**

- Select ou lista de **matérias** (categorias) para o aluno escolher. Ao selecionar, chamar GET com esse `categoryId`.
- Exibir nome da trilha e lista de conteúdos **ordenados** com indicadores visuais por **status**:
  - **completed** — concluído (ex.: ícone ✅)
  - **available** — disponível para estudar (ex.: ícone 📖)
  - **blocked** — bloqueado (ex.: ícone 🔒)
- Link/botão para abrir o conteúdo (GET `/api/contents/:id`) apenas para itens **available** (e concluídos, se quiser reabrir). Para **blocked**, exibir apenas texto explicativo (ex.: "Disponível quando você atingir o nível X").
- Recomendações de reforço vêm do dashboard/recomendações; nesta tela o foco é a trilha (concluído/disponível/bloqueado). Se a tela agregar recomendações, exibir em seção separada com indicador "recomendado".

---

## Resumo das rotas de trilhas usadas pelo frontend

| Tela / Ação                    | Método | Rota                                      | Quem usa              |
|--------------------------------|--------|-------------------------------------------|------------------------|
| Listar trilhas                 | GET    | /api/learning-paths                       | Professor, Coordenador |
| Criar trilha                   | POST   | /api/learning-paths                       | Professor, Coordenador |
| Ver/editar trilha (dados)      | GET    | /api/learning-paths/:id                   | Professor, Coordenador |
| Editar trilha (nome, padrão)   | PATCH  | /api/learning-paths/:id                    | Professor, Coordenador |
| Adicionar conteúdo na trilha   | POST   | /api/learning-paths/:id/contents          | Professor, Coordenador |
| Remover conteúdo da trilha     | DELETE | /api/learning-paths/:id/contents/:contentId| Professor, Coordenador |
| Reordenar conteúdos            | PATCH  | /api/learning-paths/:id/contents/reorder   | Professor, Coordenador |
| Trilha do aluno por matéria     | GET    | /api/learning-paths/for-student?categoryId=| Aluno                  |

Referências: `business-rules.md` (1.3), `user-stories.md` (Stories 3.1–3.4, F.4.1–F.4.2), `learningPathService.ts`, `learningPathRoutes.ts`.
