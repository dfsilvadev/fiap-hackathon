# Validação das Regras de Negócio — MVP Hackathon (Acompanhamento Pedagógico)

**Contexto:** Aprimorar o sistema de blog escolar para incluir alunos com dificuldade ou atraso no aprendizado, permitindo que o professor acompanhe esses alunos e tenha uma sala mais nivelada. MVP para hackathon da faculdade.

**Referência:** Análise em `ANALISE_ARQUITETURA_E_INTEGRACOES.md` (API + SPA atuais: blog, usuários, posts, categorias, comentários, roles coordinator/teacher/student).

**Data:** 2025-01-30

---

## 1. Conclusão geral: as regras fazem sentido?

**Sim.** As regras de negócio estão **coerentes** com o objetivo (acompanhamento pedagógico, nivelamento, alunos com dificuldade) e **bem alinhadas** com a arquitetura atual. O desenho é maduro o suficiente para servir de base para a proposta documentada e para o desenvolvimento do MVP.

Pontos fortes principais:

- **Separação clara** entre blog (`tb_post`) e conteúdo pedagógico (`tb_content` + trilha + avaliação + recomendações).
- **Nível por matéria** (aluno nível 3 em Português e 1 em Matemática) cobre bem o cenário de “aluno com dificuldade em uma área”.
- **Trilha + nível + reforço** (conteúdos 1/2/3 na trilha, reforço fora) dá um caminho claro de estudo e um canal para quem está atrasado.
- **Recomendações determinísticas por tags** (sem IA no MVP) são viáveis em pouco tempo e entregam valor (“teve dificuldade em frações” → ver este conteúdo).
- **Escopo de MVP vs Fase 2** está explícito (dashboard professor/coordenador, turmas avançadas, etc.), o que ajuda no hackathon.

Abaixo: alinhamento com o que já existe, o que encaixa bem no MVP, o que enxugar ou postergar, e um escopo sugerido para a proposta do hackathon.

---

## 2. Alinhamento com a arquitetura atual (análise)

### 2.1. O que já existe e se encaixa

| Existente na API/SPA                                 | Uso nas novas regras                                                                                                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **tb_user, tb_role** (coordinator, teacher, student) | Mesmos perfis; expansão de aluno (date_of_birth, current_grade, guardians) e professor (matérias em tb_teacher_subject).                                                                                                 |
| **tb_category** (portuguese, mathematics, etc.)      | Usada como “matéria” em conteúdo, trilha, avaliação e nível do aluno. Sem mudança de enum.                                                                                                                               |
| **Auth JWT + authorizeRoles**                        | Professor/coordenador para conteúdo e trilha; aluno para trilha e avaliação. Novos middlewares (validateTeacherSubject, validateStudentGrade) encaixam no mesmo padrão.                                                  |
| **Padrão controller → repository → db**              | Novos módulos (content, learningPath, assessment, etc.) seguem o mesmo fluxo. Serviços (recommendationService, levelUpdateService) podem ficar como camada entre controller e repository ou dentro do controller no MVP. |
| **SPA: rotas privadas, useAuth, ApiPrivate**         | Aluno acessa `/student/learning-path`, `/student/assessments`, `/student/recommendations`; professor acessa dashboard de conteúdos/trilhas/avaliações. Mesmo esquema de token e roles.                                   |

Conclusão: as regras **não conflitam** com o que já está implementado; exigem **expansão** de modelo (novas tabelas, novos endpoints) e **reuso** de auth, roles e categorias.

### 2.2. Pontos de atenção técnicos

- **tb_user hoje:** tem `phone` obrigatório; não tem `date_of_birth`, `current_grade`, `guardians`. Aluno hoje é só um user com role student. A expansão (campos opcionais ou migration) é simples.
- **Coordenador cria professor/aluno:** já existe na API (CRUD user só para coordinator). As regras só detalham o que o coordenador cadastra (aluno com responsáveis, série; professor com matérias).
- **Professor só atua em matérias que leciona:** hoje não existe `tb_teacher_subject`; posts são por `user_id` e `category_id` sem checagem de “professor leciona esta matéria”. As novas regras introduzem essa validação de forma consistente.

Nada disso invalida as regras; só reforça a necessidade de migrations e novos middlewares.

---

## 3. O que faz sentido para o MVP (hackathon)

### 3.1. Muito alinhado ao objetivo e viável no prazo

- **Perfis (1.1):** Aluno (nome, email, data nascimento, série, responsáveis, nível por matéria), Professor (matérias que leciona), Coordenador (gerencia usuários/turmas). Essencial e claro.
- **Conteúdo pedagógico (1.2):** Conteúdo com nível 1/2/3/reforço, série, matéria, tags e campos de acessibilidade (tópicos, glossário, metadados). Diferencia bem do post do blog e sustenta trilha + recomendações.
- **Trilha (1.3):** Trilha por matéria/série, ordem dos conteúdos, aluno vê só até o próprio nível (disponível/bloqueado/concluído/recomendado). É o cerne do “caminho de aprendizado” e do nivelamento.
- **Avaliação (1.4):** Por matéria e nível, questões com tags, correção automática, atualização de nível (≥70%). Liberar avaliação quando o aluno completa os conteúdos do nível na trilha fecha o ciclo.
- **Recomendações determinísticas (1.5):** Tags das questões erradas → conteúdos de reforço com mesma tag. Simples de implementar e comunica bem no pitch (“sistema recomenda reforço onde o aluno errou”).
- **Dashboard do aluno (1.6.1):** Trilha por matéria, progresso (nível, % conclusão), recomendações. Dá visibilidade ao aluno e ao professor (se depois houver tela do professor enxuta).
- **Entidades (seção 3):** tb_teacher_subject, tb_content, tb_learning_path, tb_learning_path_content, tb_student_learning_level, tb_assessment, tb_question, tb_student_answer, tb_assessment_result, tb_recommendation, tb_student_progress. Todas necessárias para o fluxo acima; turma/matrícula (tb_class, tb_enrollment) podem ser simplificadas no MVP (ver abaixo).

Isso já forma um **MVP forte e narrativa clara** para o hackathon: “aluno segue trilha por nível, faz avaliação, sobe de nível ou recebe reforço por tag”.

### 3.2. O que enxugar ou postergar no MVP (hackathon)

- **Turmas e matrículas (1.1.3, 3.6–3.8):**  
  Regras e entidades (tb_class, tb_enrollment, tb_class_teacher_subject) fazem sentido para “professor vê sua turma”. Para o hackathon, dá para **simplificar:**
  - **Opção A:** Não implementar turma/matrícula no MVP; professor vê “todos os alunos” (ou lista filtrada por série) e a trilha/nível por aluno já entrega o acompanhamento.
  - **Opção B:** Implementar só turma + matrícula (aluno pertence a uma turma, professor vê lista da turma), sem “turma por matéria” nem dashboards agregados.  
    Recomendação: **Opção A** no MVP; deixar turma/matrícula para Fase 2 na proposta.

- **Dashboard do professor (1.6.2) e coordenador (1.6.3):**  
  Já marcados como Fase 2. No MVP, basta **uma tela mínima:** lista de alunos (ou por série) com nível por matéria e lista de “recomendações ativas” por aluno. Gráficos e “alunos em risco” podem ser Fase 2.

- **Histórico escolar (1.1.1), questões dissertativas corrigidas por professor (1.4.4), refresh token, criptografia de responsáveis (2.2):**  
  Já opcionais ou Fase 2. Manter assim no documento.

- **Múltiplas trilhas (trilha acelerada, 1.3.1):**  
  Fase 2. MVP: uma trilha padrão por (matéria, série).

- **Acessibilidade (2.3):**  
  Manter como requisito não funcional; no MVP dá para priorizar estrutura de conteúdo (tópicos, glossário) e uma checklist mínima (contraste, labels), sem certificação formal.

Assim, as regras **continuam corretas**; só se explicita **o que entra no MVP do hackathon** e o que fica para “proposta pós-MVP”.

---

## 4. Consistências e pequenos refinamentos

- **level vs is_reinforcement:** Usar só `level` ('1','2','3','reforco') e derivar “é reforço” por `level = 'reforco'` evita redundância e bugs. Se quiser manter `is_reinforcement`, deixar como campo calculado ou deprecated no MVP.
- **Liberação da avaliação:** “Avaliação aplicada ao final de cada nível (quando aluno completa todos os conteúdos do nível na trilha)” está claro. Implementação: ao marcar último conteúdo do nível como concluído, liberar avaliação daquele nível (ou job que verifica tb_student_progress + tb_learning_path_content).
- **Inicialização de níveis (6.2):** Trigger (ou serviço no cadastro) criando nível 1 em todas as matérias da série para o aluno novo é essencial; manter como descrito.
- **Série do aluno:** Fonte da verdade é `tb_user.current_grade` (ou equivalente). Conteúdos e trilhas filtram por `grade`; aluno só vê conteúdos da própria série. Alinhado às regras.

Nenhuma inconsistência que invalide o desenho; só detalhes para implementação.

---

## 5. Proposta documentada e pitch (hackathon)

Sugestão de estrutura para a **proposta documentada** entregue no hackathon:

1. **Problema:** Professores têm dificuldade de acompanhar alunos com atraso ou dificuldade e de nivelar a sala.
2. **Solução:** Plataforma que combina blog escolar (já existente) com:
   - Trilha de aprendizado por matéria e série (níveis 1 → 2 → 3).
   - Nível do aluno por matéria (iniciante/intermediário/avançado).
   - Avaliações por nível com correção automática e atualização de nível (≥70%).
   - Recomendações de reforço por tags (onde o aluno errou).
   - Dashboard do aluno (trilha, progresso, recomendações) e visão mínima do professor (alunos e níveis).
3. **Diferencial:** Nivelamento explícito por matéria + reforço baseado em erros (tags), sem IA no MVP.
4. **Escopo MVP (hackathon):**
   - Cadastro de aluno (série, responsáveis, nível inicial 1 em todas as matérias).
   - Cadastro de professor (matérias que leciona).
   - Conteúdos pedagógicos (nível 1/2/3/reforço, série, matéria, tags).
   - Trilha padrão por matéria/série (ordem dos conteúdos).
   - Progresso do aluno (concluído/disponível/bloqueado) e liberação de avaliação ao completar nível.
   - Avaliações por nível, questões com tags, correção automática, atualização de nível.
   - Recomendações determinísticas (tags das questões erradas → conteúdos de reforço).
   - Dashboard aluno (trilha, progresso, recomendações) e tela mínima professor (lista de alunos com nível por matéria).
5. **Fora do MVP (Fase 2):** Turmas/matrículas completas, dashboards agregados (gráficos, “alunos em risco”), múltiplas trilhas, questões dissertativas corrigidas pelo professor.

Isso deixa claro que as **regras de negócio que você descreveu fazem sentido** e que o **MVP é realizável e bem delimitado** para o hackathon.

---

## 6. Resumo

| Pergunta                                                                         | Resposta                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| As regras fazem sentido para o objetivo (alunos com dificuldade, sala nivelada)? | **Sim.** Nível por matéria, trilha, avaliação por nível e recomendações por tag atendem bem ao objetivo.                                                                                                        |
| Estão alinhadas com a arquitetura atual (blog + usuários/roles/categorias)?      | **Sim.** Reaproveitam auth, roles e categorias; exigem novas tabelas e endpoints, sem quebrar o existente.                                                                                                      |
| São viáveis para um MVP de hackathon?                                            | **Sim**, desde que turma/matrícula e dashboards avançados fiquem para Fase 2 e o MVP foque em: conteúdo + trilha + progresso + avaliação + nível + recomendações + dashboard aluno + visão mínima do professor. |
| A proposta documentada fica madura?                                              | **Sim.** O documento de regras já serve de base; com o escopo MVP explícito (seção 5 acima), a proposta fica pronta para desenvolvimento e entrega.                                                             |

**Recomendação final:** Manter as regras de negócio como estão (com o refinamento opcional de usar só `level` para reforço). Para o hackathon, **fixar em documento único** o escopo MVP (itens da seção 5) e o que fica para Fase 2, e usar isso como guia de implementação e de pitch.

---

**Documento em evolução.** Atualizado em: 2025-01-30.
