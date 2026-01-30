# Regras de Negócio — Módulo Pedagógico (Acompanhamento de Alunos com Dificuldade)

> **Escopo deste documento:** Apenas o **módulo pedagógico**. Blog, publicações e comentários estão **fora do escopo**. Todas as regras abaixo referem-se exclusivamente a: perfis (aluno, professor, coordenador), conteúdo pedagógico, trilha de aprendizado, avaliações, progresso, recomendações e dashboards de acompanhamento.

> **Escopo MVP (Hackathon):**
>
> - **Dentro do MVP:** Perfis (aluno, professor, coordenador), conteúdo pedagógico (nível 1/2/3/reforço), trilha padrão por matéria/série, progresso do aluno, avaliações por nível com tags, recomendações determinísticas, **dashboard do aluno** (trilha, progresso, recomendações) e **tela mínima do professor** (lista de alunos com nível por matéria e recomendações ativas por aluno). Turmas e matrículas **não** são implementadas no MVP: o professor vê lista de alunos (ou filtrada por série) e acompanha níveis/recomendações sem o conceito de turma.
> - **Fase 2 (fora do MVP):** Turmas e matrículas (`tb_class`, `tb_enrollment`, `tb_class_teacher_subject`), dashboards agregados do professor e do coordenador (gráficos, "alunos em risco"), múltiplas trilhas, questões dissertativas corrigidas pelo professor.
> - **Refinamento técnico:** "É conteúdo de reforço" é derivado exclusivamente de `level = 'reforco'`; não se usa campo redundante `is_reinforcement` no MVP (ver nota em 1.2.1 e 3.3).

**Referências:** `PITCH_MODULO_PEDAGOGICO.md`, `USER_STORIES_MODULO_PEDAGOGICO.md`.

**Atualizado em:** 2025-01-30.

---

## 1. REGRAS FUNCIONAIS

### 1.1. Perfis de Usuário

#### 1.1.1. Aluno

- **Cadastro obrigatório**:
  - Nome completo
  - Email (único)
  - Data de nascimento (idade calculada automaticamente)
  - Série/Ano letivo atual (padronizado: "6", "7", "8", "9" para fundamental ou "1EM", "2EM", "3EM" para médio)
  - Responsáveis (nome, telefone, email) - mínimo 1 responsável
  - Histórico escolar (opcional no MVP, mas estrutura deve suportar)
- **Nível de aprendizagem por matéria**:
  - Cada aluno possui um nível de aprendizagem **independente por matéria**
  - Exemplo: Aluno pode estar no **nível 3 em Português** mas no **nível 1 em Matemática**
  - Níveis: `1` (Básico/Iniciante), `2` (Intermediário), `3` (Avançado)
  - **Nível inicial**: Ao cadastrar aluno, sistema cria automaticamente nível 1 para todas as matérias da série
  - O nível é atualizado conforme o aluno progride nas avaliações

- **Acesso à plataforma**:
  - Aluno faz login e vê apenas conteúdos da sua série/ano letivo
  - Visualiza matérias habilitadas para seu ano
  - Acessa trilha de aprendizado personalizada
  - Recebe orientação sobre o caminho de aprendizagem a seguir

#### 1.1.2. Professor

- **Cadastro**:
  - Nome completo
  - Email (único)
  - Telefone
  - **Matérias que leciona** (obrigatório - mínimo 1 matéria, registrado em `tb_teacher_subject`)
- **Permissões**:
  - Criar, editar e deletar conteúdos **apenas** das matérias que leciona (validado via `tb_teacher_subject`)
  - Criar e aplicar avaliações **apenas** para matérias que leciona
  - Criar e gerenciar trilhas de aprendizado para matérias que leciona
  - **MVP:** Ver lista de alunos (ou filtrada por série) com nível por matéria e recomendações ativas por aluno (tela mínima de acompanhamento)
  - **Fase 2:** Visualizar dashboard de acompanhamento das suas turmas (gráficos, alunos em risco, etc.)
  - Acessar recomendações de conteúdos de reforço

#### 1.1.3. Coordenador

- **Cadastro**: Similar ao professor
- **Permissões**:
  - Todas as permissões do professor
  - Gerenciar usuários (criar, editar, deletar professores e alunos)
  - **Gerenciar turmas e matrículas** (Fase 2 — fora do MVP; no MVP o coordenador não gerencia turmas)
  - **Visualizar dashboards agregados** por série, turma, matéria (Fase 2)
  - Acessar relatórios gerais de desempenho (Fase 2)

---

### 1.2. Estrutura de Conteúdo (Pedagógico)

#### 1.2.1. Definição de Conteúdo

Um conteúdo é uma unidade didática criada pelo professor, com estrutura pensada para **inclusão e acessibilidade**. O sistema trabalha **apenas** com conteúdos pedagógicos (`tb_content`); não há escopo para blog/publicações neste documento.

**Campos obrigatórios**:

- Título (curto e objetivo)
- Categoria/Matéria (ligada a `tb_category` existente)
- Série/Ano letivo (padronizado: "6", "7", "8", "9" ou "1EM", "2EM", "3EM")
- **Nível de aprendizagem** (OBRIGATÓRIO): `'1'`, `'2'`, `'3'` ou `'reforco'`
- Conteúdo principal (texto estruturado)

**Campos para acessibilidade**:

- **Tópicos/Seções**: Conteúdo dividido em seções curtas e claras (JSONB)
- **Legendas para palavras difíceis**: Glossário inline ou tooltips (JSONB)
- **Metadados de acessibilidade** (JSONB):
  - Indicador se conteúdo é adequado para TDAH, TEA, dislexia
  - Sugestões de tempo de leitura
  - Nível de complexidade textual
- **Tags** (JSONB): Tags/tópicos relacionados (ex: ["frações", "operações básicas"]) - usado para recomendações

**Regras de negócio**:

- Professor só pode criar conteúdo para matérias que ele leciona (validado via `tb_teacher_subject`)
- **Nível é obrigatório**: Todo conteúdo deve ter um nível (1, 2, 3 ou "reforço")
- **Conteúdo de reforço** é identificado exclusivamente por `level = 'reforco'`; não se usa campo redundante. Conteúdos de reforço **não** fazem parte da trilha padrão.
- Conteúdo pode estar ativo ou inativo (`is_active`)
- **Nota**: O nível está no conteúdo (`tb_content.level`), mas a **ordem de aprendizado** é definida na trilha (`tb_learning_path_content.order_number`)

---

### 1.3. Trilha de Aprendizado

#### 1.3.1. Conceito de Trilha

Uma **trilha de aprendizado** é uma sequência ordenada de conteúdos que define o caminho pedagógico que um aluno deve seguir em uma matéria específica.

**Características**:

- Cada trilha pertence a uma **matéria** e **série**
- Uma trilha contém múltiplos conteúdos em ordem sequencial
- **Conteúdos na trilha mantêm seu nível** (1, 2 ou 3) - o nível está em `tb_content.level`
- A trilha organiza conteúdos de diferentes níveis em sequência (ex: conteúdos nível 1, depois nível 2, depois nível 3)
- Permite múltiplas trilhas para o mesmo contexto (ex: trilha padrão, trilha acelerada) - Fase 2
- **Conteúdos de reforço** (`level = 'reforco'`) **não** fazem parte da trilha padrão

#### 1.3.2. Estrutura da Trilha

- **Trilha Padrão** (`is_default = true`): Sequência principal de conteúdos organizados por nível
  - A trilha pode conter conteúdos de nível 1, depois nível 2, depois nível 3
  - A ordem é definida por `tb_learning_path_content.order_number`
  - Conteúdos mantêm seu nível original (`tb_content.level`)
  - **Exemplo prático**:
    - Ordem 1: Conteúdo "Introdução à Frações" (nível 1)
    - Ordem 2: Conteúdo "Operações com Frações" (nível 1)
    - Ordem 3: Conteúdo "Frações Complexas" (nível 2)
    - Ordem 4: Conteúdo "Aplicações de Frações" (nível 2)
    - Ordem 5: Conteúdo "Frações Avançadas" (nível 3)
- **Trilhas Personalizadas** (Fase 2): Trilhas específicas por turma ou aluno
- **Conteúdos de Reforço** (`level = 'reforco'`): Aparecem separadamente, não na trilha principal

#### 1.3.3. Regras de Trilha

- Conteúdo só pode estar em uma trilha por vez (mesma matéria/série) - no MVP
- **Conteúdos na trilha devem ter nível 1, 2 ou 3** - conteúdos de reforço (`level = 'reforco'`) não entram na trilha
- Ordem na trilha é única e sequencial (`tb_learning_path_content.order_number`)
- Aluno só vê conteúdos da trilha até seu nível atual (ex: se está no nível 2, só vê conteúdos de nível 1 e 2)
- Conteúdos bloqueados aparecem visualmente mas não são acessíveis até nível ser alcançado
- Professor/Coordenador pode criar e editar trilhas para matérias que leciona
- Ao adicionar conteúdo na trilha, sistema valida que o conteúdo não é de reforço

#### 1.3.4. Visualização da Trilha para Aluno

Aluno visualiza trilha organizada por:

1. **Matéria** (ex: Português, Matemática)
2. **Nível** (1, 2, 3) - conteúdos agrupados por nível (`tb_content.level`), dentro de cada nível ordenados pela trilha (`tb_learning_path_content.order_number`)
3. **Status de cada conteúdo**:
   - ✅ **Concluído**: Aluno já completou (`tb_student_progress.status = 'completed'`)
   - 📖 **Disponível**: Próximo conteúdo a ser estudado (nível do conteúdo ≤ nível do aluno e não concluído)
   - 🔒 **Bloqueado**: Ainda não disponível (nível do conteúdo > nível do aluno)
   - ⚠️ **Recomendado**: Conteúdo de reforço sugerido (não faz parte da trilha, `level = 'reforco'`)

---

### 1.4. Avaliações

#### 1.4.1. Cadastro de Avaliação

- Professor cria avaliação vinculada a:
  - Matéria (que ele leciona - validado via `tb_teacher_subject`)
  - Nível de aprendizagem (1, 2 ou 3)
  - Conteúdo específico (opcional - avaliação pode ser geral para o nível)
  - Data de aplicação
  - Prazo de entrega (opcional)

#### 1.4.2. Estrutura da Avaliação

- Avaliação contém:
  - Título e descrição
  - Lista de questões (múltipla escolha, verdadeiro/falso, texto livre)
  - Cada questão tem:
    - Enunciado
    - Alternativas (se múltipla escolha)
    - Resposta correta
    - Pontos/peso
    - Tags/tópicos relacionados (JSONB - para identificar dificuldades)

#### 1.4.3. Aplicação da Avaliação

- Avaliação é aplicada **ao final de cada nível** (quando aluno completa todos os conteúdos do nível na trilha)
- Aluno responde avaliação online
- Sistema registra:
  - Respostas do aluno (corretas e incorretas)
  - Pontuação total
  - Tempo de realização (opcional)
  - Data/hora de conclusão

#### 1.4.4. Correção e Nível de Aprendizagem

- **Correção automática**:
  - Sistema corrige questões objetivas automaticamente
  - Questões dissertativas podem ser corrigidas pelo professor (fase 2)
- **Atualização de nível**:
  - Se aluno atinge pontuação mínima (≥70%) → nível pode ser atualizado
  - Se aluno não atinge pontuação mínima → nível permanece
  - Professor pode revisar e ajustar nível manualmente
  - Sistema valida se avaliação é do nível correto antes de atualizar

---

### 1.5. Sistema de Recomendação

#### 1.5.1. Análise de Respostas (Regras Determinísticas - MVP)

> **IMPORTANTE**: No MVP, não usaremos IA/NLP. Apenas regras determinísticas baseadas em tags.

- Sistema analisa respostas erradas do aluno na avaliação
- Identifica **tags/tópicos** relacionados às questões erradas
- Exemplo:
  - Aluno errou questões com tag "frações" → sistema identifica dificuldade em "frações"
  - Aluno errou questões com tag "interpretação de texto" → sistema identifica dificuldade em "compreensão textual"

#### 1.5.2. Recomendação de Conteúdos de Reforço

- Com base nas tags identificadas, sistema recomenda:
  - Conteúdos de reforço (`level = 'reforco'`) que possuem as mesmas tags
  - Conteúdos de nível anterior (ex: se aluno está no nível 2 mas errou, recomendar conteúdos de nível 1 com tags relacionadas)
  - Conteúdos da mesma matéria e série

#### 1.5.3. Regras de Recomendação (Determinísticas)

- **Para aluno**:
  - Se nível atual < 3 e avaliação < 70% → recomendar conteúdos de reforço
  - Se errou questões com tag X → recomendar conteúdos com tag X (que sejam de reforço ou nível ≤ atual)
  - Priorizar conteúdos de nível igual ou inferior ao atual do aluno
- **Para professor** (Fase 2):
  - Dashboard mostra alunos com dificuldades identificadas
  - Lista de conteúdos mais recomendados para cada aluno
  - Alertas quando muitos alunos têm dificuldade no mesmo tópico

#### 1.5.4. Implementação Técnica (MVP)

```typescript
// Lógica determinística - sem IA
function generateRecommendations(
  wrongAnswers: StudentAnswer[],
  studentLevel: number,
  studentCategory: string,
  studentGrade: string
): Recommendation[] {
  const failedTags = extractTagsFromWrongAnswers(wrongAnswers);
  const reinforcementContents = findReinforcementContents(
    failedTags,
    studentCategory,
    studentGrade,
    studentLevel
  );
  return createRecommendations(reinforcementContents, failedTags);
}
```

---

### 1.6. Dashboard de Acompanhamento

#### 1.6.1. Dashboard do Aluno (MVP)

- **Trilha de aprendizado**: visualização clara do caminho; conteúdos por matéria → nível → ordem; indicadores ✅ Concluído, 🔒 Bloqueado, 📖 Disponível, ⚠️ Recomendado.
- **Progresso por matéria**: nível atual, percentual de conclusão da trilha, concluídos vs pendentes.
- **Recomendações pessoais**: lista de conteúdos de reforço sugeridos com justificativa (ex.: "Você teve dificuldade em frações").

#### 1.6.2. Dashboard do Professor

- **MVP:** Tela mínima: lista de alunos (ou por série) com nível por matéria e lista de recomendações ativas por aluno. Sem turmas, sem gráficos.
- **Fase 2:** Visão por turma (distribuição por nível, alunos em risco, conteúdos com maior dificuldade); visão por aluno (histórico de avaliações, nível, progresso, recomendações).

#### 1.6.3. Dashboard do Coordenador (Fase 2)

- Visão agregada: distribuição de níveis por série/turma/matéria, taxa de alunos em risco, conteúdos mais problemáticos, relatórios.

---

### 1.7. Fluxos Principais

#### 1.7.1. Fluxo do Professor - Criar Conteúdo

1. Professor acessa área de criação de conteúdo
2. Sistema valida se professor leciona a matéria (via `tb_teacher_subject`)
3. Preenche título, série, nível (1, 2, 3 ou "reforço"), tags, conteúdo com estrutura acessível
4. Salva; sistema valida permissões

#### 1.7.2. Fluxo do Professor - Criar Trilha

1. Professor acessa gerenciamento de trilhas; seleciona matéria e série
2. Adiciona/remove/reordena conteúdos (apenas nível 1, 2 ou 3)
3. Sistema valida matéria/série e nível; salva trilha

#### 1.7.3. Fluxo do Professor - Criar Avaliação

1. Professor acessa criação de avaliação; seleciona matéria (que leciona), nível
2. Adiciona questões (enunciado, alternativas, resposta correta, tags)
3. Define pontuação mínima; salva; avaliação fica disponível para alunos do nível correspondente

#### 1.7.4. Fluxo do Aluno - Estudar Conteúdo

1. Aluno faz login; visualiza dashboard com trilha
2. Seleciona matéria; vê trilha (concluído/disponível/bloqueado/recomendado)
3. Acessa conteúdo disponível ou recomendado; lê; marca como concluído
4. Sistema atualiza progresso; se completou todos os conteúdos do nível, avaliação fica disponível

#### 1.7.5. Fluxo do Aluno - Fazer Avaliação

1. Aluno completa conteúdos do nível na trilha; sistema libera avaliação
2. Aluno acessa avaliação disponível; responde; submete
3. Sistema corrige, atualiza nível (se ≥70%), gera recomendações (tags das erradas)
4. Aluno visualiza resultado e recomendações

---

## 2. REGRAS NÃO FUNCIONAIS

(Performance, Segurança, Acessibilidade WCAG 2.1 AA, Usabilidade, Confiabilidade, Manutenibilidade — conforme seção 2 do documento completo `BUSINESS_RULES.md`; aplicam-se apenas ao módulo pedagógico.)

---

## 3. ENTIDADES PRINCIPAIS (Conceitual)

(Usuário expandido, tb_teacher_subject, tb_content, tb_learning_path, tb_learning_path_content, tb_class/tb_enrollment/tb_class_teacher_subject Fase 2, tb_student_learning_level, tb_assessment, tb_question, tb_student_answer, tb_assessment_result, tb_recommendation, tb_student_progress — conforme seção 3 do `BUSINESS_RULES.md`.)

---

## 4. DECISÕES DE ARQUITETURA

(Backend Node.js, Frontend React, Sistema de Recomendação determinístico — conforme seção 4 do `BUSINESS_RULES.md`; apenas módulo pedagógico.)

---

## 5. PRÓXIMOS PASSOS

1. Validar regras com stakeholders
2. Criar migrations SQL para tabelas do MVP (sem turmas/matrículas no MVP)
3. Definir endpoints da API para o escopo pedagógico
4. Protótipo de telas: dashboard aluno, tela mínima professor, trilha, avaliações, recomendações
5. Plano de implementação: MVP Hackathon → Fase 2 (turmas, dashboards agregados)

---

## 6. NOTAS IMPORTANTES

- **Padronização de série:** "6", "7", "8", "9" ou "1EM", "2EM", "3EM"
- **Inicialização de níveis:** Ao cadastrar aluno, nível 1 em todas as matérias
- **Trilha vs nível vs ordem:** Nível no conteúdo (`level`); ordem na trilha (`order_number`); reforço = `level = 'reforco'`, não entra na trilha
- **Recomendação:** MVP apenas regras determinísticas (tags); sem IA/NLP

---

**Documento em evolução.** Escopo: apenas módulo pedagógico. Atualizado em: 2025-01-30.
