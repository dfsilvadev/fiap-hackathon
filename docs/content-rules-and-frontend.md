# Regras de Conteúdo (Professor) e Requisitos do Frontend

Documento de referência: regras de negócio de conteúdo para o professor e o que o frontend precisa para cada tela relacionada a conteúdo.

---

## Parte 1 — Regras de Conteúdo para o Professor

### 1.1 Quem pode gerenciar conteúdo

- **Professor**: pode criar, editar e desativar conteúdos **apenas das matérias que leciona** (vínculo em `tb_teacher_subject`). Na implementação atual, qualquer professor que lecione a matéria do conteúdo pode editar/desativar (não apenas o autor).
- **Coordenador**: pode criar, editar e desativar conteúdos de **qualquer matéria**.

Se a matéria não for lecionada pelo professor, a API retorna **403** com mensagem do tipo: *"You can only manage content for subjects you teach"*.

---

### 1.2 Criação de conteúdo

- **Campos obrigatórios**
  - **title** (string, não vazio)
  - **contentText** (string, não vazio) — texto principal
  - **categoryId** (UUID) — matéria/categoria
  - **grade** (série) — valores: `"6"`, `"7"`, `"8"`, `"9"`, `"1EM"`, `"2EM"`, `"3EM"`
  - **level** (nível de aprendizagem) — valores: `"1"`, `"2"`, `"3"`, `"reforco"`

- **Campos opcionais**
  - **topics** (objeto/array) — seções/tópicos do conteúdo
  - **glossary** (objeto/array) — pares palavra → definição
  - **accessibilityMetadata** (objeto) — ex.: adequado para TDAH/TEA/dislexia, tempo de leitura, complexidade
  - **tags** (array de strings) — ex.: `["frações", "operações básicas"]`; usadas nas recomendações

- **Regras**
  - O professor só pode criar conteúdo para categorias em que ele leciona (validado no backend).
  - Nível é obrigatório; todo conteúdo tem exatamente um nível.
  - Conteúdo de **reforço** é identificado por `level = "reforco"` e **não** entra na trilha padrão.

---

### 1.3 Edição de conteúdo

- Os mesmos campos da criação podem ser enviados (parcialmente) no PATCH.
- **Validação**: categoria do conteúdo deve ser uma matéria que o usuário pode gerenciar (professor: matérias que leciona; coordenador: qualquer).
- Título, texto, série e nível continuam obrigatórios do ponto de vista de regra de negócio: ao editar, não enviar campos vazios/inválidos; o backend aceita apenas o que for enviado.

---

### 1.4 Desativação / ativação

- **Desativação** é soft delete: `isActive = false`. O conteúdo some da listagem e da trilha para o aluno, mas permanece no banco.
- **Reativação**: enviar `isActive: true` no mesmo endpoint.
- Apenas quem pode “gerenciar” a matéria do conteúdo (professor da matéria ou coordenador) pode ativar/desativar.

---

### 1.5 Listagem de conteúdos (professor/coordenador)

- Professor vê **somente** conteúdos das **matérias que leciona** (filtro aplicado no backend por `tb_teacher_subject`).
- Coordenador vê conteúdos de todas as matérias.
- Filtros opcionais: **categoryId**, **grade**, **level**, **isActive**, **page**, **limit**.

---

### 1.6 Visualização de um conteúdo (GET por id)

- Professor/coordenador: ao chamar `GET /contents/:id`, o backend verifica se o usuário pode gerenciar a matéria do conteúdo. Se sim, retorna o conteúdo completo (incluindo `topics`, `glossary`, `accessibilityMetadata`, `tags`, `isActive`, `userId`, etc.).
- Aluno: só acessa se o conteúdo for da série do aluno, estiver ativo e o nível for permitido (nível do aluno na matéria); caso contrário recebe 404.

---

### 1.7 Resumo das regras

| Ação              | Professor                          | Coordenador   |
|-------------------|------------------------------------|---------------|
| Criar conteúdo    | Só matérias que leciona            | Qualquer      |
| Editar conteúdo   | Só matérias que leciona            | Qualquer      |
| Desativar/ativar | Só matérias que leciona            | Qualquer      |
| Listar conteúdos  | Só conteúdos das suas matérias      | Todos         |
| Ver conteúdo (id) | Se for matéria que leciona         | Sempre        |

---

## Parte 2 — O que o frontend precisa por tela

### 2.1 Tela: Listagem de conteúdos (professor/coordenador)

**Objetivo:** Listar conteúdos com filtros e ações (criar, editar, desativar/ativar).

**Rota da API**

- **GET** `/api/contents?categoryId=...&grade=...&level=...&isActive=...&page=1&limit=20`

**Query params (todos opcionais)**

| Parâmetro   | Tipo    | Descrição                          |
|------------|---------|------------------------------------|
| categoryId | UUID    | Filtrar por matéria                |
| grade      | string  | `"6"` … `"9"`, `"1EM"` … `"3EM"`   |
| level      | string  | `"1"`, `"2"`, `"3"`, `"reforco"`   |
| isActive   | boolean | `true` / `false` (via string na URL) |
| page       | number  | Paginação                          |
| limit      | number  | Itens por página (máx. 100)        |

**Resposta esperada**

```json
{
  "contents": [
    {
      "id": "uuid",
      "title": "string",
      "contentText": "string",
      "categoryId": "uuid",
      "category": { "id": "uuid", "name": "string" },
      "grade": "string",
      "level": "string",
      "userId": "uuid",
      "isActive": true,
      "topics": {},
      "glossary": {},
      "accessibilityMetadata": {},
      "tags": [],
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "total": 0
}
```

**O que o frontend precisa**

- Lista de **categorias/matérias** para o filtro e para o select do formulário (ex.: `GET /api/categories` ou lista vinda de outra rota já usada no app).
- Constantes **séries** (`GRADES`) e **níveis** (`CONTENT_LEVELS`: `"1"`, `"2"`, `"3"`, `"reforco"`) para filtros e formulários.
- Exibir na tabela/cards: pelo menos `title`, `category.name`, `grade`, `level`, `isActive`; opcionalmente trecho de `contentText`, `updatedAt`.
- Botões/ações: **Novo conteúdo**, **Editar** (leva ao formulário com `id`), **Desativar** / **Ativar** (chamada a `PATCH .../active`).
- Tratar **403**: exibir mensagem clara (ex.: “Você só pode gerenciar conteúdos das matérias que leciona”).

---

### 2.2 Tela: Criar conteúdo (professor/coordenador)

**Objetivo:** Formulário para cadastrar um novo conteúdo.

**Rota da API**

- **POST** `/api/contents`

**Body (JSON)**

| Campo                 | Obrigatório | Tipo           | Descrição |
|-----------------------|-------------|----------------|-----------|
| title                 | Sim         | string         | Título    |
| contentText           | Sim         | string         | Texto principal |
| categoryId            | Sim         | UUID           | ID da matéria |
| grade                 | Sim         | string         | Série (GRADES) |
| level                 | Sim         | string         | `"1"`, `"2"`, `"3"`, `"reforco"` |
| topics                | Não         | object/array   | Seções/tópicos |
| glossary              | Não         | object/array   | Glossário |
| accessibilityMetadata | Não         | object         | Metadados de acessibilidade |
| tags                  | Não         | string[]       | Tags para recomendações |

**Resposta de sucesso:** `201` + `{ "id": "uuid", "title": "string" }`.

**O que o frontend precisa**

- Select de **matéria** (categoria): apenas matérias que o professor leciona (ou todas para coordenador). Se a lista de matérias vier de um endpoint, usar essa mesma lista.
- Selects de **série** (`grade`) e **nível** (`level`) com as constantes do sistema.
- Campos de texto: **título**, **texto principal** (área de texto).
- Campos opcionais (conforme MVP): **tópicos** (ex.: lista de blocos título + conteúdo), **glossário** (ex.: lista de palavra + definição), **metadados de acessibilidade** (checkboxes/selects conforme definição do produto), **tags** (lista de strings ou input com chips).
- Validação no front: obrigatoriedade de título, texto, categoryId, grade, level.
- Ao submeter: em **403**, exibir mensagem de permissão; em **400**, exibir erros de validação retornados pela API.

---

### 2.3 Tela: Editar conteúdo (professor/coordenador)

**Objetivo:** Formulário pré-preenchido para alterar um conteúdo existente.

**Rotas da API**

- **GET** `/api/contents/:id` — carregar dados atuais (professor/coordenador recebem o DTO completo, incluindo `userId`, `isActive`, `topics`, `glossary`, `accessibilityMetadata`, `tags`).
- **PATCH** `/api/contents/:id` — salvar alterações.

**Body do PATCH (todos opcionais)**

- Mesmos campos da criação: `title`, `contentText`, `grade`, `level`, `topics`, `glossary`, `accessibilityMetadata`, `tags`.  
- Não é permitido alterar `categoryId` pela API atual; se a API evoluir para permitir, o frontend poderá expor esse campo.

**Resposta de sucesso do PATCH:** `200` + `{ "id": "uuid", "title": "string" }`.

**O que o frontend precisa**

- Ao abrir a tela (ex.: `/contents/:id/edit`), chamar **GET** `/api/contents/:id` e preencher o formulário com a resposta.
- Mesmo layout/componentes da tela de criação, com campos opcionais preenchidos quando existirem.
- Enviar no **PATCH** apenas os campos alterados (ou o objeto completo, conforme contrato da API).
- Tratar **403** e **404** (conteúdo não encontrado ou sem permissão).

---

### 2.4 Tela: Desativar / ativar conteúdo

**Objetivo:** Alternar se o conteúdo aparece ou não para alunos (soft delete).

**Rota da API**

- **PATCH** `/api/contents/:id/active`  
- **Body:** `{ "isActive": true }` ou `{ "isActive": false }`  
- **Resposta de sucesso:** `204` (sem body).

**O que o frontend precisa**

- Na listagem (ou na tela de detalhe/edição), botão **Desativar** quando `isActive === true` e **Ativar** quando `isActive === false`.
- Ao clicar: chamar PATCH com o novo valor de `isActive`; em seguida atualizar a lista ou o estado local (e, se existir, indicador visual de “inativo” na linha/card).

---

### 2.5 Tela: Listagem de conteúdos para o aluno

**Objetivo:** Aluno vê conteúdos da sua série e matéria (para estudo).

**Rota da API**

- **GET** `/api/contents/for-student?categoryId=...&page=1&limit=20`

**Query params**

- `categoryId` (opcional) — filtrar por matéria.
- `page`, `limit` (opcionais) — paginação.

**Resposta**

- `{ "contents": [ ... ], "total": 0 }`. Cada item no formato resumido para aluno (ex.: `id`, `title`, `category`, `grade`, `level`; detalhes completos ao abrir o conteúdo).

**O que o frontend precisa**

- Lista/cards com título, matéria, nível (e opcionalmente série).
- Filtro por matéria (categoryId) se houver mais de uma matéria.
- Link/botão para abrir o conteúdo (leva à tela de leitura com `id`).

---

### 2.6 Tela: Leitura do conteúdo (aluno)

**Objetivo:** Exibir o conteúdo completo para estudo (título, texto, tópicos, glossário).

**Rota da API**

- **GET** `/api/contents/:id` (com usuário aluno no token).

O backend valida série do aluno, nível do aluno na matéria e se o conteúdo está ativo; se não permitido, retorna **404**.

**Resposta**

- Objeto com `title`, `contentText`, `category`, `grade`, `level`, `topics`, `glossary`, `tags` (e sem dados sensíveis de gestão como `userId` no DTO do aluno, conforme implementação).

**O que o frontend precisa**

- Exibir título, texto principal, tópicos (se houver) e glossário (palavra/definição ou tooltip).
- Layout acessível (estrutura de headings, contraste, navegação por teclado).
- Opcional: botão **Marcar como concluído** (chamada à API de progresso, não à de conteúdo).
- Tratar **404**: mensagem do tipo “Conteúdo não encontrado ou ainda não disponível para você”.

---

## Resumo das rotas de conteúdo usadas pelo frontend

| Tela / Ação              | Método | Rota                         | Quem usa        |
|--------------------------|--------|------------------------------|-----------------|
| Listar conteúdos         | GET    | /api/contents                | Professor, Coordenador |
| Criar conteúdo           | POST   | /api/contents                | Professor, Coordenador |
| Ver/editar conteúdo      | GET    | /api/contents/:id            | Professor, Coordenador, Aluno (leitura) |
| Editar conteúdo          | PATCH  | /api/contents/:id            | Professor, Coordenador |
| Desativar/ativar         | PATCH  | /api/contents/:id/active      | Professor, Coordenador |
| Listar (aluno)           | GET    | /api/contents/for-student     | Aluno           |
| Abrir conteúdo (leitura) | GET    | /api/contents/:id            | Aluno           |

Referências: `business-rules.md`, `user-stories.md` (Stories 2.1–2.5, F.3.1–F.3.2), `contentService.ts`, `contentRoutes.ts`.
