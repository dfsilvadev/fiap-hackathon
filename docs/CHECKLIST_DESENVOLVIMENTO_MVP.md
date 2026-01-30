# Checklist de Desenvolvimento — MVP Módulo Pedagógico (Hackathon)

Plano de implementação em etapas para não perder escopo. Ordem pensada para dependências (backend primeiro, depois frontend que consome a API).

**Referências:** `PITCH_MODULO_PEDAGOGICO.md`, `REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md`, `USER_STORIES_MODULO_PEDAGOGICO.md`, `DATA_MODEL.md`.

**Atualizado em:** 2025-01-30.

---

## Visão geral das partes

| Parte | Foco | Resumo |
|-------|------|--------|
| **Parte 1** | Banco + seed | Migrations, roles e categorias iniciais |
| **Parte 2** | Autenticação | Login, JWT, middlewares de rota |
| **Parte 3** | Usuários e perfis | CRUD coordenador, aluno (série, responsáveis), professor (matérias), níveis iniciais |
| **Parte 4** | Conteúdo pedagógico | CRUD conteúdo, validação professor-matéria |
| **Parte 5** | Trilha de aprendizado | CRUD trilha, conteúdos na trilha, ordem |
| **Parte 6** | Progresso do aluno | Marcar conteúdo concluído, listar progresso/trilha com status |
| **Parte 7** | Avaliações | CRUD avaliação e questões, submissão, correção, atualização de nível |
| **Parte 8** | Recomendações | Geração (tags das erradas), listar, marcar concluída/descartada |
| **Parte 9** | Dashboard aluno | API + tela: trilha, progresso, recomendações |
| **Parte 10** | Tela professor | API + tela: lista de alunos com nível e recomendações ativas |

---

## Parte 1 — Banco de dados e seed

**Objetivo:** Schema no ar e dados iniciais (roles, categorias/matérias).

### Backend

- [x] **1.1** Garantir que o schema Prisma está alinhado ao `DATA_MODEL.md` (já criado; revisar se necessário).
- [x] **1.2** Criar migration inicial (ou `db push` documentado) e aplicar no ambiente local.  
  _Implementado:_ Ordem documentada no README (`db:migrate` ou `db:push`). A pasta `prisma/migrations` e o SQL inicial são criados ao rodar `npx prisma migrate dev --name init` com o banco ligado.
- [x] **1.3** Criar seed do Prisma:
  - [x] Inserir **roles**: `coordinator`, `teacher`, `student`.
  - [x] Inserir **categorias (matérias)** usadas no MVP (ex.: Português, Matemática, etc.).  
  _Implementado:_ `prisma/seed.ts` com roles e categorias (Português, Matemática, Ciências, História, Geografia); idempotente (findFirst + create).
- [x] **1.4** Documentar no README: `npm run db:seed` (ou comando equivalente) e ordem: migrate → seed.  
  _Implementado:_ Script `db:seed` e config `prisma.seed` no `package.json`; README com ordem generate → migrate → seed.

### Entregável

- [x] Banco com tabelas do MVP preenchidas com roles e categorias; seed reproduzível.  
  _Pendente para o dev:_ ter PostgreSQL rodando, rodar `npm run db:migrate` (ou `db:push`) e em seguida `npm run db:seed`.

---

## Parte 2 — Autenticação

**Objetivo:** Login com email/senha, JWT, refresh token, sessão (armazenamento de refresh token), logout e middlewares nas rotas protegidas.

### Backend

- [x] **2.1** Implementar hash de senha (ex.: bcrypt) no cadastro e comparação no login.  
  _Implementado:_ bcrypt no login (AuthService.login) e no seed (usuário admin); cadastro de usuário (hash) será na Parte 3.
- [x] **2.2** Endpoint **POST /auth/login** (email, senha) → valida credenciais, retorna accessToken + refreshToken (payload JWT: sub, role).  
  _Implementado:_ `POST /api/auth/login` com validação Zod; retorna `{ accessToken, refreshToken, expiresIn, tokenType }`.
- [x] **2.3** Configurar expiração do token (ex.: 15m para access, 7d para refresh) e mensagem genérica para credenciais inválidas.  
  _Implementado:_ `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` no env; mensagem "Invalid credentials" (401).
- [x] **2.4** Middleware **authenticate**: extrair e validar JWT; retornar 401 se inválido/ausente.  
  _Implementado:_ `src/infrastructure/http/middlewares/authenticate.ts` (Bearer token, verifyAccessToken, req.user).
- [x] **2.5** Middleware **authorizeRoles(roles)**: após authenticate, verificar se o usuário tem um dos roles; 403 se não.  
  _Implementado:_ `src/infrastructure/http/middlewares/authorizeRoles.ts`; uso em `GET /api/auth/me/coordinator`.
- [x] **2.6** Aplicar authenticate (e onde couber authorizeRoles) nas rotas que já existirem e nas que forem criando.  
  _Implementado:_ `GET /api/auth/me` (authenticate), `GET /api/auth/me/coordinator` (authenticate + authorizeRoles("coordinator")).
- [x] **Refresh token e sessão:** tb_refresh_token (tokenHash, userId, expiresAt, revokedAt); rota **POST /api/auth/refresh** (rotação de refresh token); rota **POST /api/auth/logout** (revogar refresh token).  
  _Implementado:_ Prisma model RefreshToken; AuthService.refresh (rotação), AuthService.logout (revokedAt).

### Frontend (quando houver SPA)

- [ ] **2.7** Tela de login (email, senha) chamando POST /auth/login.
- [ ] **2.8** Armazenar token (ex.: localStorage ou cookie) e enviar no header (ex.: Authorization: Bearer &lt;token&gt;) nas requisições.
- [ ] **2.9** Redirecionar para área restrita após login; em 401/403 redirecionar para login.
- [ ] **2.10** Logout: remover token e redirecionar para login.

### Entregável

- [x] Login, refresh, logout e rotas protegidas (JWT + authorizeRoles) no backend.  
  _Pendente:_ frontend (Parte 2.7–2.10).

---

## Parte 3 — Usuários e perfis

**Objetivo:** CRUD de usuários (coordenador), perfis aluno (série, responsáveis) e professor (matérias), e criação de níveis iniciais do aluno.

### Análise pré-implementação (REGRAS_NEGOCIO + REVISAO_DOCS_PITCH + USER_STORIES)

| Fonte | Exigência | Garantir na implementação |
|-------|-----------|----------------------------|
| **REGRAS 1.1.1 (Aluno)** | Cadastro: nome, email, data nascimento, série padronizada, **mín. 1 responsável** (nome, telefone, email, parentesco). Nível inicial = 1 em **todas as matérias** ao cadastrar. | Validação guardians.length ≥ 1; estrutura `{ name, phone, email, relationship }`; serviço de níveis iniciais por categoria. |
| **REGRAS 1.1.2 (Professor)** | Nome, email, telefone, **matérias que leciona** (tb_teacher_subject, mín. 1). | Validação categoryIds.length ≥ 1; persistir tb_teacher_subject no create/update. |
| **REGRAS 1.1.3 (Coordenador)** | Gerencia usuários (criar, editar, deletar professores e alunos). **Não** gerencia turmas no MVP. | Rotas de usuário: apenas coordenador cria/edita/desativa; sem turmas. |
| **REGRAS 6 (Notas)** | Série: "6","7","8","9" ou "1EM","2EM","3EM". Níveis iniciais ao cadastrar aluno. | Enum/validação de série; trigger ou serviço pós-create aluno. |
| **Story 1.4 (Perfil aluno)** | Apenas **próprio aluno ou coordenador** atualiza dados do aluno. | PATCH /users/:id: se aluno, permitir só se req.user.sub === id ou role coordinator. |
| **Story 1.5 (Perfil professor)** | Matérias em tb_teacher_subject; coordenador **ou** professor pode alterar (conforme regra do produto). | PATCH professor: permitir coordenador sempre; permitir professor editar **próprias** matérias (lista de categorias). |
| **Story 1.6 (Coordenador)** | Apenas coordenador **cria** usuários (professor/aluno). Coordenador **edita** (dados, série, responsáveis, matérias) e **desativa/reativa**. Exclusão = desativação (soft delete). | POST /users → authorizeRoles('coordinator'). PATCH is_active para reativar. Sem hard delete. |

### Backend

- [x] **3.1** Expandir **tb_user** se faltar: `date_of_birth`, `current_grade`, `guardians` (JSON).  
  _Implementado:_ Schema Prisma já possui `dateOfBirth`, `currentGrade`, `guardians` (Json).
- [x] **3.2** **tb_teacher_subject**: CRUD (ou apenas create/delete) para vincular professor a categorias (matérias).  
  _Implementado:_ No create de professor, `TeacherSubject.createMany`; no update, `deleteMany` + `createMany` com nova lista de categoryIds.
- [x] **3.3** Endpoints de usuário (somente coordenador ou próprio usuário conforme regra):
  - [x] Listar usuários (filtros por role, série se aplicável). **Coordenador apenas.**  
    _Implementado:_ `GET /api/users` com `authenticate` + `authorizeRoles("coordinator")`; query: role, currentGrade, page, limit.
  - [x] Criar usuário (aluno ou professor): nome, email, senha, role; aluno: série, responsáveis (mín. 1 com name, phone, email, relationship); professor: matérias (categoryIds, mín. 1). **Coordenador apenas.**  
    _Implementado:_ `POST /api/users` com body validado por Zod (discriminatedUnion por role); aluno: currentGrade (enum GRADES), guardians (array min 1); professor: categoryIds (array uuid min 1).
  - [x] Obter por id (próprio usuário ou coordenador), atualizar (PATCH): aluno — próprio ou coordenador (nome, email, dateOfBirth, série, guardians); professor — próprio (matérias) ou coordenador (todos os campos); reativar/desativar (is_active) **apenas coordenador**.  
    _Implementado:_ `GET /api/users/:id` e `PATCH /api/users/:id` com `requireSelfOrCoordinator`; `PATCH /api/users/:id/active` com `authorizeRoles("coordinator")` e body `{ isActive }`.
- [x] **3.4** Validações: email único; série padronizada ("6","7","8","9","1EM","2EM","3EM"); aluno com pelo menos 1 responsável; professor com pelo menos 1 matéria.  
  _Implementado:_ `src/shared/constants/grades.ts` (GRADES, isGrade); UserService valida email único, guardians/categoryIds; userRoutes Zod: z.enum(GRADES), guardianSchema, categoryIds.min(1).
- [x] **3.5** **Níveis iniciais do aluno:** ao criar usuário com role student e current_grade, criar registros em **tb_student_learning_level** com level = 1 para todas as categorias (seed ou serviço/trigger).  
  _Implementado:_ `UserService.createInitialLearningLevels(studentId)` chamado após criar aluno; insere level = 1 para todas as categorias.

### Frontend

- [ ] **3.6** Tela coordenador: listar usuários, criar aluno (série, responsáveis), criar professor (matérias), editar/desativar.
- [ ] **3.7** Tela de perfil do aluno: editar nome, email, data nascimento, série, responsáveis (próprio ou coordenador).
- [ ] **3.8** Tela de perfil do professor: exibir/editar matérias que leciona (se permitido pela regra).

### Entregável

- [x] Coordenador consegue criar aluno e professor; níveis 1 criados para aluno; perfis editáveis conforme regras (backend).  
  _Pendente:_ frontend (Parte 3.6–3.8).

---

## Parte 4 — Conteúdo pedagógico

**Objetivo:** Professor cria/edita/desativa conteúdos com nível (1, 2, 3, reforço) e tags; aluno lista/vê conteúdos da sua série.

### Backend

- [ ] **4.1** Endpoints **CRUD conteúdo** (tb_content): create, read by id, list (filtros: category_id, grade, level, is_active), update, desativar (is_active = false).
- [ ] **4.2** Validação: professor só cria/edita conteúdo para **matérias que leciona** (consultar tb_teacher_subject); coordenador pode para qualquer matéria.
- [ ] **4.3** Campos obrigatórios: título, category_id, grade, level ('1','2','3','reforco'), content_text; opcionais: topics, glossary, accessibility_metadata, tags (JSON).
- [ ] **4.4** Middleware ou validação **validateTeacherSubject**: garantir que o professor autenticado leciona a matéria do recurso.
- [ ] **4.5** Endpoint para **aluno**: listar conteúdos ativos por série (current_grade) e opcionalmente categoria; não expor dados sensíveis de criação.

### Frontend

- [ ] **4.6** Telas professor: listar conteúdos, criar conteúdo (título, matéria, série, nível, texto, tags, tópicos/glossário se MVP incluir), editar, desativar.
- [ ] **4.7** Telas aluno: listar conteúdos da sua série/matéria, abrir conteúdo para leitura (título, texto, tópicos, glossário).

### Entregável

- Conteúdos criados por professor por matéria; aluno vê apenas conteúdos da sua série; reforço = level 'reforco'.

---

## Parte 5 — Trilha de aprendizado

**Objetivo:** Trilha padrão por matéria/série com ordem de conteúdos (níveis 1, 2, 3; reforço não entra na trilha).

### Backend

- [ ] **5.1** Endpoints **tb_learning_path**: criar/editar trilha (name, category_id, grade, is_default, description); garantir no máximo uma trilha padrão por (category_id, grade).
- [ ] **5.2** Endpoints **tb_learning_path_content**: adicionar conteúdo à trilha (content_id, order_number), remover, reordenar (atualizar order_number). Validar: conteúdo com level 1, 2 ou 3 (reforço não entra); mesmo category_id e grade da trilha.
- [ ] **5.3** Validação: professor só gerencia trilhas de matérias que leciona; coordenador pode qualquer matéria.
- [ ] **5.4** Endpoint para **aluno**: obter trilha por matéria (e série do aluno) com lista de conteúdos ordenados e, por conteúdo, status (concluído/disponível/bloqueado) conforme nível do aluno e tb_student_progress (Parte 6).

### Frontend

- [ ] **5.5** Telas professor/coordenador: listar trilhas, criar/editar trilha, adicionar/remover/reordenar conteúdos na trilha (apenas nível 1/2/3).
- [ ] **5.6** Tela aluno: escolher matéria e ver trilha com indicadores (concluído, disponível, bloqueado, recomendado quando houver recomendações).

### Entregável

- Trilha padrão por matéria/série definida; aluno vê trilha com status por conteúdo.

---

## Parte 6 — Progresso do aluno

**Objetivo:** Aluno marca conteúdo como concluído; sistema registra progresso; liberação de avaliação ao completar todos os conteúdos do nível na trilha.

### Backend

- [ ] **6.1** Endpoint **POST/PATCH progress** (student_id, content_id, status: not_started | in_progress | completed). Validar: aluno só altera próprio progresso; conteúdo acessível (série e nível).
- [ ] **6.2** Ao marcar conteúdo como **completed**, registrar completed_at (e opcionalmente time_spent).
- [ ] **6.3** Endpoint para aluno: **listar progresso** por matéria (conteúdos da trilha com status, percentual concluído, nível atual).
- [ ] **6.4** Lógica (ou endpoint) **avaliação disponível**: para um aluno e uma matéria/nível, verificar se todos os conteúdos desse nível na trilha estão com status completed; se sim, avaliação daquele nível fica disponível (usado na Parte 7).

### Frontend

- [ ] **6.5** Na tela de leitura do conteúdo: botão/ação "Marcar como concluído"; atualizar trilha e progresso após marcar.
- [ ] **6.6** Exibir progresso por matéria (nível atual, % conclusão, lista concluídos/pendentes).

### Entregável

- Progresso persistido; trilha refletindo concluído/disponível/bloqueado; regra de liberação de avaliação implementada.

---

## Parte 7 — Avaliações

**Objetivo:** Professor cria avaliações e questões; aluno responde; correção automática; atualização de nível (≥70%); integração com geração de recomendações (Parte 8).

### Backend

- [ ] **7.1** Endpoints **CRUD avaliação** (tb_assessment): título, description, category_id, level (1,2,3), teacher_id, min_score, start_date, end_date. Validar professor leciona a matéria.
- [ ] **7.2** Endpoints **CRUD questão** (tb_question): assessment_id, question_text, question_type (multiple_choice, true_false, text), options, correct_answer, points, tags, order_number.
- [ ] **7.3** Endpoint **listar avaliações disponíveis** para o aluno: por matéria e nível do aluno; respeitar datas (start_date, end_date) e regra "disponível só após completar todos os conteúdos do nível na trilha" (Parte 6).
- [ ] **7.4** Endpoint **POST submit assessment**: receber respostas (question_id, answer_text); corrigir automaticamente (comparar com correct_answer); persistir tb_student_answer e tb_assessment_result (total_score, max_score, percentage, level_updated).
- [ ] **7.5** **Atualização de nível:** se percentage >= min_score (ex.: 70%), atualizar tb_student_learning_level para aquele nível na matéria (ou lógica equivalente/trigger).
- [ ] **7.6** Chamar **geração de recomendações** após submissão (Parte 8): passar respostas erradas (e tags) e dados do aluno para criar registros em tb_recommendation.

### Frontend

- [ ] **7.7** Telas professor: criar/editar avaliação (título, matéria, nível, datas, min_score); adicionar/editar/remover questões (enunciado, tipo, alternativas, resposta correta, tags).
- [ ] **7.8** Tela aluno: listar avaliações disponíveis; realizar avaliação (exibir questões, enviar respostas); exibir resultado (nota, %; se nível foi atualizado; link para recomendações).

### Entregável

- Avaliações aplicadas; correção automática; nível atualizado quando ≥70%; recomendações geradas após a prova.

---

## Parte 8 — Recomendações

**Objetivo:** Gerar recomendações por tags das questões erradas; aluno vê e marca como concluída ou descartada.

### Backend

- [ ] **8.1** **Serviço de geração de recomendações** (regras determinísticas): dado assessment_result (ou respostas erradas), extrair tags das questões erradas; buscar conteúdos com level = 'reforco' (e mesma matéria, série do aluno) que tenham pelo menos uma tag em comum; criar registros em tb_recommendation (student_id, content_id, reason, source_type: 'assessment', source_id, status: 'pending').
- [ ] **8.2** Integrar chamada a esse serviço no fluxo de submissão da avaliação (Parte 7).
- [ ] **8.3** Endpoint **listar recomendações** do aluno (filtro por status: pending, completed, dismissed).
- [ ] **8.4** Endpoint **PATCH recomendação** (id): atualizar status para 'completed' ou 'dismissed'. Validar que o aluno é o dono da recomendação.

### Frontend

- [ ] **8.5** Tela aluno: "Minhas recomendações" com lista (título do conteúdo, reason, link para abrir conteúdo); ações "Marcar como concluída" e "Descartar".

### Entregável

- Recomendações geradas após avaliação; aluno vê e gerencia status das recomendações.

---

## Parte 9 — Dashboard do aluno

**Objetivo:** Uma visão única: trilha por matéria, progresso e recomendações ativas.

### Backend

- [ ] **9.1** Endpoint **GET dashboard/aluno** (ou equivalente): agregar para o aluno autenticado:
  - Trilhas por matéria (com status de cada conteúdo: concluído/disponível/bloqueado/recomendado).
  - Progresso por matéria (nível atual, % conclusão).
  - Lista de recomendações pendentes (content_id, reason, título do conteúdo).
- [ ] **9.2** Garantir performance (ex.: evitar N+1; resposta &lt; 2s conforme regras não funcionais).

### Frontend

- [ ] **9.3** Página **Dashboard do aluno**: exibir resumo da trilha por matéria (ou link para trilha), resumo de progresso (nível e % por matéria), lista de recomendações ativas com link para o conteúdo.
- [ ] **9.4** Navegação clara: dashboard → trilha, dashboard → conteúdo, dashboard → recomendações.

### Entregável

- Dashboard do aluno funcionando (API + tela) com trilha, progresso e recomendações.

---

## Parte 10 — Tela mínima do professor

**Objetivo:** Professor (e coordenador) vê lista de alunos com nível por matéria e recomendações ativas.

### Backend

- [ ] **10.1** Endpoint **GET dashboard/professor/alunos** (ou equivalente): listar alunos (no MVP sem turma: todos ou filtro por série); para cada aluno: nome, série, níveis por matéria (tb_student_learning_level), recomendações pendentes (content title, reason). Professor vê apenas matérias que leciona; coordenador vê tudo.
- [ ] **10.2** Filtro opcional por série (current_grade).

### Frontend

- [ ] **10.3** Tela **Acompanhamento** (professor/coordenador): lista de alunos com opção de filtrar por série; para cada aluno: nível por matéria e lista de recomendações ativas (título, reason).
- [ ] **10.4** Acesso apenas para roles teacher e coordinator.

### Entregável

- Tela mínima do professor com lista de alunos, níveis e recomendações ativas; API com permissões corretas.

---

## Resumo da ordem de implementação

1. **Parte 1** — Banco + seed  
2. **Parte 2** — Autenticação (login, JWT, middlewares)  
3. **Parte 3** — Usuários e perfis (CRUD, níveis iniciais)  
4. **Parte 4** — Conteúdo pedagógico  
5. **Parte 5** — Trilha de aprendizado  
6. **Parte 6** — Progresso do aluno  
7. **Parte 7** — Avaliações (inclui chamada à geração de recomendações)  
8. **Parte 8** — Recomendações (serviço + endpoints + integração com Parte 7)  
9. **Parte 9** — Dashboard aluno  
10. **Parte 10** — Tela professor  

---

## Fora do MVP (Fase 2)

- Turmas e matrículas (tb_class, tb_enrollment, tb_class_teacher_subject).
- Dashboards agregados (gráficos, alunos em risco).
- Múltiplas trilhas (ex.: trilha acelerada).
- Questões dissertativas corrigidas pelo professor.
- Histórico escolar completo, refresh token, criptografia de responsáveis.

---

**Documento em evolução.** Use este checklist para planejar sprints e validar entrega do MVP. Atualizado em: 2025-01-30.
