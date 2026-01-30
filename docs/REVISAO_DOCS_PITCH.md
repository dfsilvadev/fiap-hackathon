# Revisão dos documentos em docs/ — Alinhamento ao PITCH_MODULO_PEDAGOGICO.md

**Objetivo:** Verificar se todos os arquivos em `docs/` estão alinhados ao escopo definido no pitch: **apenas módulo pedagógico**, sem blog/publicações no escopo de implementação do MVP.

**Referência:** `PITCH_MODULO_PEDAGOGICO.md` (escopo: trilha, nível por matéria, avaliações por nível, recomendações por tag, tela mínima do professor; MVP sem turmas; Fase 2: turmas, dashboards agregados).

**Data:** 2025-01-30.

---

## Resumo da revisão

| Documento                                 | Alinhado ao pitch? | Ação                                                                                           |
| ----------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| PITCH_MODULO_PEDAGOGICO.md                | —                  | Referência (fonte da verdade)                                                                  |
| REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md       | ✅ Sim             | Nenhuma                                                                                        |
| USER_STORIES_MODULO_PEDAGOGICO.md         | ✅ Sim             | Nenhuma                                                                                        |
| ORDEM_IMPLEMENTACAO_MVP.md                | ✅ Sim             | Nenhuma                                                                                        |
| CHECKLIST_IMPLEMENTACAO_MVP.md            | ✅ Sim             | Nenhuma                                                                                        |
| API_ENDPOINTS.md                          | ✅ Sim             | Nenhuma                                                                                        |
| ANALISE_PEDAGOGICA_HACKATHON.md           | ✅ Sim             | Nenhuma                                                                                        |
| VALIDACAO_REGRAS_NEGOCIO_MVP_HACKATHON.md | ✅ Sim             | Nenhuma                                                                                        |
| FUNCIONALIDADE_E_CASOS_DE_USO.md          | ⚠️ Parcial         | Inclui Blog (UC 4.1); **nota de escopo** adicionada                                            |
| ANALISE_ARQUITETURA_E_INTEGRACOES.md      | ⚠️ Contexto        | Descreve API/SPA atuais (blog); **nota** de que MVP pedagógico é o foco                        |
| ARCHITECTURE_SUMMARY.md                   | ⚠️ Pequeno ajuste  | Coordenador/turmas; **nota** de escopo MVP                                                     |
| BUSINESS_RULES.md                         | ⚠️ Contexto        | Inclui blog + pedagógico; **nota** para usar REGRAS_NEGOCIO_MODULO_PEDAGOGICO na implementação |
| DATA_MODEL.md                             | ⚠️ Detalhe         | `order_number` em tb_content; regras dizem ordem na trilha; **nota** adicionada                |
| DESIGN.md                                 | ⚠️ Contexto        | Design da API de **blog**; **nota** para módulo pedagógico                                     |
| USER_STORIES_KANBANIZE.md                 | ⚠️ Inclui Blog     | Épico 1 = Blog; **nota** para usar USER_STORIES_MODULO_PEDAGOGICO na implementação             |

---

## Documentos já alinhados (nenhuma alteração)

- **PITCH_MODULO_PEDAGOGICO.md** — Define escopo: apenas módulo pedagógico, sem blog.
- **REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md** — Escopo explícito “apenas módulo pedagógico; blog fora do escopo”; MVP e Fase 2 alinhados ao pitch.
- **USER_STORIES_MODULO_PEDAGOGICO.md** — Apenas stories pedagógicas (auth, usuários, conteúdo, trilha, avaliações, progresso, recomendações, dashboards); sem Épico Blog.
- **ORDEM_IMPLEMENTACAO_MVP.md** — Referencia PITCH e REGRAS_NEGOCIO_MODULO_PEDAGOGICO; ordem só do pedagógico.
- **CHECKLIST_IMPLEMENTACAO_MVP.md** — Partes e stories do USER_STORIES_MODULO_PEDAGOGICO; sem blog.
- **API_ENDPOINTS.md** — Título “Sistema de Acompanhamento Pedagógico”; endpoints de conteúdo, trilha, avaliação, recomendações, etc.; sem conflito com pitch.
- **ANALISE_PEDAGOGICA_HACKATHON.md** — Foco em problema pedagógico, pontos fortes/fracos; alinhado.
- **VALIDACAO_REGRAS_NEGOCIO_MVP_HACKATHON.md** — Validação do acompanhamento pedagógico; escopo MVP coerente com pitch.

---

## Documentos com nota de alinhamento (alterações feitas)

### 1. FUNCIONALIDADE_E_CASOS_DE_USO.md

- **Situação:** Abre com “Blog Escolar + Acompanhamento Pedagógico”; tem seção 4.1 Blog (UC-1.1 a UC-1.5) e ator Visitante (posts).
- **Alinhamento:** Para o **MVP do pitch**, o escopo é **só o módulo pedagógico**; blog fica fora.
- **Ação:** Inserido no início um box **“Escopo para implementação MVP (PITCH_MODULO_PEDAGOGICO.md)”** indicando: usar apenas visão geral pedagógica, atores (aluno, professor, coordenador, sistema), casos de uso 4.2 Autenticação, 4.3 Conteúdos pedagógicos, 4.4 Trilha, 4.5 Avaliações, 4.6 Progresso e recomendações, 4.7 Dashboards (MVP), 4.8 Níveis iniciais; **seção 4.1 Blog (UC-1.1 a UC-1.5) fora do escopo de implementação do MVP**.

### 2. ANALISE_ARQUITETURA_E_INTEGRACOES.md

- **Situação:** Descreve a **arquitetura atual** (blog, posts, comentários, usuários, categorias).
- **Alinhamento:** O MVP a implementar é o **módulo pedagógico**; este doc continua válido como “estado atual”.
- **Ação:** Inserido no início uma **nota**: escopo de implementação MVP em PITCH_MODULO_PEDAGOGICO.md; este documento descreve a arquitetura atual (blog); o MVP pedagógico será acrescentado conforme CHECKLIST_IMPLEMENTACAO_MVP e REGRAS_NEGOCIO_MODULO_PEDAGOGICO.

### 3. ARCHITECTURE_SUMMARY.md

- **Situação:** Coordenador “Gestão completa de usuários, turmas e conteúdos”; Professor “Acompanhamento de turmas/alunos (Fase 2)”.
- **Alinhamento:** No **MVP** do pitch, coordenador **não** gerencia turmas; professor tem **tela mínima** (lista de alunos com nível e recomendações), sem turma.
- **Ação:** Inserida **nota de escopo MVP**: no MVP (PITCH), coordenador gerencia apenas usuários; turmas e matrículas são Fase 2; professor tem tela mínima (lista de alunos com nível e recomendações), sem dashboards por turma.

### 4. BUSINESS_RULES.md

- **Situação:** Regras completas (blog + pedagógico); inclui relação Posts vs Conteúdos.
- **Alinhamento:** Para **implementação do MVP** do pitch, a referência principal é **REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md** (só pedagógico).
- **Ação:** Inserida **nota**: para implementar apenas o módulo pedagógico (sem blog), usar PITCH_MODULO_PEDAGOGICO e REGRAS_NEGOCIO_MODULO_PEDAGOGICO; BUSINESS_RULES descreve o sistema completo (incluindo blog).

### 5. DATA_MODEL.md

- **Situação:** `tb_content` tem campo `order_number`; em REGRAS_NEGOCIO_MODULO_PEDAGOGICO a **ordem de aprendizado** é da trilha (`tb_learning_path_content.order_number`), não do conteúdo.
- **Alinhamento:** No MVP, a ordem é **só na trilha**; conteúdo não precisa de `order_number` (ou fica opcional/deprecated).
- **Ação:** Inserida **nota** em tb_content: para o MVP (REGRAS_NEGOCIO_MODULO_PEDAGOGICO), a ordem de aprendizado é definida em `tb_learning_path_content.order_number`; `order_number` em `tb_content` pode ser removido ou ignorado no MVP.

### 6. DESIGN.md

- **Situação:** Design da **API de blog** (posts, professores, alunos, categorias).
- **Alinhamento:** O **módulo pedagógico** (trilha, nível, avaliações, recomendações) não está neste design; a implementação segue PITCH e REGRAS_NEGOCIO_MODULO_PEDAGOGICO.
- **Ação:** Inserida **nota** no início: este documento é o design da API de blog existente; para o módulo pedagógico, ver PITCH_MODULO_PEDAGOGICO, REGRAS_NEGOCIO_MODULO_PEDAGOGICO e CHECKLIST_IMPLEMENTACAO_MVP.

### 7. USER_STORIES_KANBANIZE.md

- **Situação:** Inclui **Épico 1 — Blog** (stories 1.1 a 1.7) e épicos pedagógicos.
- **Alinhamento:** Para o **MVP do pitch**, o escopo é **só o pedagógico**; usar **USER_STORIES_MODULO_PEDAGOGICO.md** na implementação.
- **Ação:** Inserida **nota** de escopo de implementação: para implementar apenas o módulo pedagógico (PITCH), usar USER_STORIES_MODULO_PEDAGOGICO (sem Épico Blog); USER_STORIES_KANBANIZE permanece como documento completo Blog + Pedagógico.

---

## Conclusão

- Os documentos **focados no módulo pedagógico** (PITCH, REGRAS_NEGOCIO_MODULO_PEDAGOGICO, USER_STORIES_MODULO_PEDAGOGICO, ORDEM, CHECKLIST, API_ENDPOINTS, ANALISE_PEDAGOGICA, VALIDACAO) estão **alinhados** ao pitch.
- Nos demais (FUNCIONALIDADE_E_CASOS_DE_USO, ANALISE_ARQUITETURA, ARCHITECTURE_SUMMARY, BUSINESS_RULES, DATA_MODEL, DESIGN, USER_STORIES_KANBANIZE) foram adicionadas **notas de escopo** no topo, indicando que o **escopo de implementação do MVP** é o definido em **PITCH_MODULO_PEDAGOGICO.md** e que, para isso, as referências principais são **REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md** e **USER_STORIES_MODULO_PEDAGOGICO.md**.

**Documento em evolução.** Atualizado em: 2025-01-30.
