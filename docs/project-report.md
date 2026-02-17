# Relatório do Projeto — Módulo Pedagógico (Hackathon)

> **Entrega:** Hackathon 5FSDT — Inovação no Auxílio aos Professores e Professoras do Ensino Público.  
> Este documento atende à estrutura obrigatória do relatório e pode ser exportado para PDF.

**Atualizado em:** 2026-02-12.

---

## 1. Resumo Executivo

O projeto desenvolve um **módulo pedagógico** de acompanhamento voltado ao ensino público, com foco em **auxiliar professores e professoras** a identificar rapidamente **quem está atrasado em cada matéria** e a indicar **reforços específicos por tópico**, em vez de depender apenas de uma nota geral. A solução oferece **trilha de aprendizado por matéria e série** (níveis 1 → 2 → 3), registra o **nível do aluno por matéria**, aplica **avaliações por nível** com correção automática e gera **recomendações de reforço determinísticas** a partir das tags das questões erradas. Professores e coordenadores dispõem de **dashboards** para acompanhar alunos, trilhas e recomendações ativas.

O **impacto esperado** é dar visibilidade objetiva do nível de cada aluno em cada matéria, um caminho claro de estudo (trilha) e sugestões de conteúdo de reforço explicáveis (“você teve dificuldade em frações” → conteúdo com tag “frações”), apoiando a **equiparação** e o planejamento pedagógico em sala.

---

## 2. Problema Identificado

Professores e professoras do ensino público enfrentam dificuldade para **acompanhar quem está atrasado** e **nivelar a turma**: alunos com dificuldade em tópicos específicos ficam “invisíveis” quando a visão é apenas uma nota geral. Não há, na prática, um caminho claro de **reforço por tópico** nem uma forma objetiva de saber **em que nível cada aluno está em cada matéria** (por exemplo, nível 3 em Português e nível 1 em Matemática). Além disso, falta um mecanismo que indique **quais conteúdos sugerir** para quem errou em quê, de forma transparente e acionável.

O módulo pedagógico foi desenhado para atender diretamente a essa dor: visão de nível por matéria, trilha explícita (concluído / disponível / bloqueado / recomendado), avaliações por nível com correção automática e recomendações de conteúdos de reforço baseadas nas tags das questões erradas, permitindo que o professor priorize intervenções e que o aluno saiba o próximo passo.

---

## 3. Descrição da Solução

A solução é uma **API REST** (backend) que implementa:

- **Perfis:** aluno, professor e coordenador (autenticação JWT, refresh token, logout).
- **Conteúdo pedagógico:** criação e edição por professores, com nível (1, 2, 3 ou reforço), tags, tópicos e metadados de acessibilidade; professor só atua nas matérias que leciona (`tb_teacher_subject`).
- **Trilha de aprendizado:** uma trilha padrão por matéria e série, com conteúdos ordenados (níveis 1, 2 e 3; conteúdo de reforço não entra na trilha).
- **Progresso do aluno:** registro de status por conteúdo (não iniciado, em progresso, concluído); liberação de avaliação quando todos os conteúdos do nível na trilha estão concluídos.
- **Avaliações:** criação por professor (matéria que leciona, nível), questões com tags; submissão pelo aluno; correção automática (comparação normalizada); nota ≥ 70% atualiza o nível do aluno na matéria.
- **Recomendações:** após o submit da avaliação, o sistema extrai as tags das questões erradas e recomenda conteúdos de **reforço** (`level = 'reforco'`) da mesma matéria e série com interseção de tags; o aluno pode listar (pending/completed/dismissed) e marcar como concluída ou descartada.
- **Dashboards:**
  - **Aluno:** trilhas por matéria, progresso (nível, percentual) e recomendações pendentes.
  - **Professor:** lista de alunos (filtrada por série), nível por matéria e recomendações ativas; visão analítica por série/matéria (resumo por série, matérias com contagens, trilhas com módulos/alunos/% conclusão); rota para listar matérias que leciona com contagem de conteúdos e trilhas (paginado).
  - **Coordenador:** visão agregada (totais de alunos, professores, conteúdos, trilhas, avaliações, recomendações; breakdown por série e por matéria).

A solução **não** é um LMS genérico: o diferencial está no **nível por matéria**, nas **recomendações explicáveis por tags** e no **dashboard do professor** focado em equiparação e plano de ação.

---

## 4. Processo de Desenvolvimento

_[Preencher com a organização da equipe: divisão de tarefas (front/back/design), uso de Design Thinking ou brainstorming, etapas de prototipação, ferramentas de gestão (Trello, Notion, etc.), ciclos de entrega e validação interna. Incluir como as decisões do módulo pedagógico (trilha, tags, nível por matéria) foram tomadas e validadas.]_

Exemplo de estrutura que pode ser usada:

- **Fase de entendimento:** mapeamento do problema (dores dos professores), definição de persona e escopo MVP.
- **Fase de desenho:** escolha da solução (trilha + nível por matéria + recomendações por tags), wireframes/protótipos de baixa fidelidade, definição da arquitetura técnica (Node/Express, Prisma, Postgres).
- **Fase de desenvolvimento:** divisão em tarefas (auth, usuários, conteúdos, trilhas, progresso, avaliações, recomendações, dashboards), desenvolvimento em ciclos curtos, testes contínuos (unitários e integração).
- **Fase de validação:** testes do MVP como se fossem professores/alunos, ajustes de interface e fluxo; preparação do pitch e do vídeo do MVP.

---

## 5. Detalhes Técnicos

### 5.1. Stack

- **Runtime:** Node.js 20+
- **Linguagem:** TypeScript
- **Framework HTTP:** Express
- **ORM:** Prisma 7 com driver adapter `@prisma/adapter-pg`
- **Banco de dados:** PostgreSQL 16
- **Validação:** Zod (body, query, params)
- **Segurança:** Helmet, express-rate-limit, JWT (access + refresh token)
- **Testes:** Vitest (unitários em `src/application/**/*.spec.ts`, integração HTTP em `src/infrastructure/http/api.spec.ts`)
- **Qualidade:** ESLint, Prettier, Husky + lint-staged
- **Container:** Docker + Docker Compose (serviços `db` e `api`)

### 5.2. Arquitetura

Arquitetura em camadas (Clean Architecture / Hexagonal):

- **domain/** — entidades e contratos (regras de negócio puras).
- **application/** — serviços de caso de uso (auth, user, content, learningPath, assessment, progress, recommendation, dashboard, subject); orquestram regras e usam Prisma por injeção.
- **infrastructure/** — adaptadores: HTTP (Express, rotas, controllers, middlewares) e persistência (Prisma + Postgres).
- **shared/** — config (env), erros (AppError), auth (JWT), constantes.

Fluxo de uma requisição: **Rota → Controller → Service → Prisma → Postgres**; middlewares tratam autenticação, autorização por role e validação (Zod).

### 5.3. Modelo de dados (resumo)

Principais tabelas: `tb_user`, `tb_role`, `tb_teacher_subject`, `tb_category`, `tb_content`, `tb_learning_path`, `tb_learning_path_content`, `tb_student_learning_level`, `tb_assessment`, `tb_question`, `tb_student_answer`, `tb_assessment_result`, `tb_recommendation`, `tb_student_progress`, `tb_refresh_token`. Turmas e matrículas estão fora do MVP (Fase 2).

Para diagrama e detalhes das entidades, ver **`docs/architecture.md`**.

---

## 6. Links Úteis

| Item | Link / Observação |
|------|-------------------|
| **Repositório de código** | _[Inserir URL do repositório — ex.: GitHub/GitLab]_ |
| **Protótipos visuais** | _[Inserir link para Figma, Miro ou outro, se houver]_ |
| **Vídeo do Pitch** | _[Inserir link do drive com o vídeo de pitch, máx. 8 min]_ |
| **Vídeo do MVP funcionando** | _[Inserir link do drive com o vídeo da demo, máx. 8 min]_ |
| **Documentação do projeto** | `docs/pitch.md`, `docs/business-rules.md`, `docs/architecture.md`, `docs/api-tests.md`, `docs/mvp-developer-checklist.md` (no repositório) |

---

## 7. Aprendizados e Próximos Passos

### Aprendizados

_[Preencher com o que a equipe aprendeu no projeto: técnico (ex.: Clean Architecture, Prisma, JWT, testes) e sobre o problema pedagógico (nível por matéria, importância das tags para recomendações explicáveis, necessidade de dashboards distintos para professor e coordenador).]_

### Próximos passos

- **Turmas e matrículas:** modelo `tb_class`, `tb_enrollment`, vínculo professor–turma–matéria; filtro do dashboard por turma.
- **Dashboards avançados:** gráficos de distribuição por nível, indicador de “alunos em risco”, heatmap de tópicos com mais dificuldade.
- **Múltiplas trilhas:** trilhas personalizadas por turma ou perfil (além da trilha padrão).
- **Questões dissertativas:** correção pelo professor e integração ao sistema de recomendações (tags).
- **Ajuste manual de nível:** permitir que o professor altere o nível do aluno por matéria quando necessário.
- **Integração:** com sistemas já utilizados na rede pública (ex.: diário de classe, secretaria escolar), quando houver APIs ou convenções de dados.

---

**Documento preparado para exportação em PDF e entrega no drive do hackathon (link no documento de entrega na plataforma FIAP).**
