# Regras de Negócio - Sistema de Acompanhamento Pedagógico

> **Escopo MVP (Hackathon):** Este documento descreve as regras completas do sistema. Para o MVP do hackathon, vigora o seguinte:
>
> - **Dentro do MVP:** Perfis (aluno, professor, coordenador), conteúdo pedagógico (nível 1/2/3/reforço), trilha padrão por matéria/série, progresso do aluno, avaliações por nível com tags, recomendações determinísticas, **dashboard do aluno** (trilha, progresso, recomendações) e **tela mínima do professor** (lista de alunos com nível por matéria e recomendações ativas por aluno). Turmas e matrículas **não** são implementadas no MVP: o professor vê lista de alunos (ou filtrada por série) e acompanha níveis/recomendações sem o conceito de turma.
> - **Fase 2 (fora do MVP):** Turmas e matrículas (`tb_class`, `tb_enrollment`, `tb_class_teacher_subject`), dashboards agregados do professor e do coordenador (gráficos, "alunos em risco"), múltiplas trilhas, questões dissertativas corrigidas pelo professor.
> - **Refinamento técnico:** "É conteúdo de reforço" é derivado exclusivamente de `level = 'reforco'`; não se usa campo redundante `is_reinforcement` no MVP (ver nota em 1.2.1 e 3.3).
>
> **Implementação MVP (módulo pedagógico):** Use **PITCH_MODULO_PEDAGOGICO.md** e **REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md** como referência principal; este documento pode conter escopo ampliado (blog + pedagógico).

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

### 1.2. Estrutura de Conteúdo

#### 1.2.1. Definição de Conteúdo

Um conteúdo é uma unidade didática criada pelo professor, com estrutura pensada para **inclusão e acessibilidade**.

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

#### 1.2.2. Relação entre Posts e Conteúdos

- **`tb_post`**: Mantida para blog/notícias/comunicações gerais (sistema atual)
- **`tb_content`**: Nova entidade para conteúdos pedagógicos estruturados
- **Separação clara**: Posts são informativos, Conteúdos são didáticos com trilha de aprendizado
- **Futuro (Fase 3)**: Avaliar migração ou unificação se necessário

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
  // 1. Extrair tags únicas das questões erradas
  const failedTags = extractTagsFromWrongAnswers(wrongAnswers);

  // 2. Buscar conteúdos de reforço com essas tags
  const reinforcementContents = findReinforcementContents(
    failedTags,
    studentCategory,
    studentGrade,
    studentLevel
  );

  // 3. Retornar recomendações
  return createRecommendations(reinforcementContents, failedTags);
}
```

---

### 1.6. Dashboard de Acompanhamento

> **Escopo do MVP (Hackathon):** Prioriza a **trilha do aluno**. No MVP, o professor tem apenas **uma tela mínima**: lista de alunos (ou filtrada por série) com nível por matéria e lista de recomendações ativas por aluno. Dashboards completos do professor e do coordenador (gráficos, alunos em risco, turmas) ficam para **Fase 2**. A arquitetura/modelo de dados já prevê turma/matrícula, progresso, níveis e recomendações — o que torna o dashboard completo viável na Fase 2.

#### 1.6.1. Dashboard do Aluno (MVP)

- **Trilha de aprendizado**:
  - Visualização clara do caminho a seguir
  - Conteúdos organizados por matéria → nível → ordem da trilha
  - Indicadores visuais:
    - ✅ Concluído
    - 🔒 Bloqueado (nível não alcançado)
    - 📖 Disponível (próximo a ser estudado)
    - ⚠️ Recomendado (conteúdo de reforço)
- **Progresso por matéria**:
  - Nível atual em cada matéria
  - Percentual de conclusão da trilha
  - Conteúdos concluídos vs pendentes
- **Recomendações pessoais**:
  - Lista de conteúdos de reforço sugeridos
  - Justificativa (ex: "Você teve dificuldade em frações")

#### 1.6.2. Dashboard do Professor

- **MVP:** Tela mínima: lista de alunos (ou por série) com nível por matéria e lista de recomendações ativas por aluno. Sem turmas, sem gráficos.
- **Fase 2 — Visão por turma**:
  - Distribuição de alunos por nível de aprendizagem (gráfico)
  - Lista de alunos em risco (nível 1 ou com avaliações abaixo da média)
  - Conteúdos com maior taxa de dificuldade
- **Fase 2 — Visão por aluno**:
  - Histórico de avaliações (linha do tempo)
  - Nível atual por matéria
  - Conteúdos concluídos e pendentes
  - Recomendações ativas

#### 1.6.3. Dashboard do Coordenador (Fase 2)

- **Visão agregada**:
  - Distribuição de níveis por série, turma, matéria
  - Taxa de alunos em risco por turma
  - Conteúdos mais problemáticos (maior taxa de dificuldade)
  - Relatórios de progresso geral

---

### 1.7. Fluxos Principais

#### 1.7.1. Fluxo do Professor - Criar Conteúdo

1. Professor acessa área de criação de conteúdo
2. Sistema valida se professor leciona a matéria selecionada (via `tb_teacher_subject`)
3. Preenche informações básicas (título, série, **nível**: 1, 2, 3 ou "reforço"; se for "reforço", o conteúdo não entra na trilha padrão)
4. Adiciona tags (para recomendações futuras)
5. Escreve conteúdo com estrutura acessível (tópicos, legendas)
6. Marca metadados de acessibilidade
7. Salva conteúdo
8. Sistema valida permissões (professor leciona a matéria)

#### 1.7.2. Fluxo do Professor - Criar Trilha de Aprendizado

1. Professor acessa área de gerenciamento de trilhas
2. Seleciona matéria que leciona e série
3. Visualiza trilha padrão existente (ou cria nova)
4. Adiciona/remove/reordena conteúdos na trilha (via `tb_learning_path_content`)
5. Sistema valida que conteúdos pertencem à matéria/série selecionada
6. Sistema valida que conteúdos têm nível 1, 2 ou 3 (conteúdos de reforço `level = 'reforco'` não podem entrar na trilha)
7. Sistema permite organizar conteúdos de diferentes níveis em sequência (ex: nível 1, depois nível 2, depois nível 3)
8. Salva trilha

#### 1.7.3. Fluxo do Professor - Criar Avaliação

1. Professor acessa criação de avaliação
2. Seleciona matéria que leciona (validado via `tb_teacher_subject`), nível e conteúdo relacionado (opcional)
3. Adiciona questões (enunciado, alternativas, resposta correta, tags)
4. Define pontuação mínima para aprovação
5. Salva avaliação
6. Avaliação fica disponível para alunos do nível correspondente

#### 1.7.4. Fluxo do Aluno - Estudar Conteúdo

1. Aluno faz login
2. Visualiza dashboard com trilha de aprendizado
3. Seleciona matéria
4. Vê trilha organizada por nível → ordem
5. Identifica próximo conteúdo disponível (não bloqueado)
6. Acessa conteúdo disponível ou recomendado
7. Lê conteúdo com estrutura acessível
8. Marca como "concluído" (ou sistema marca automaticamente ao finalizar leitura)
9. Sistema atualiza progresso (`tb_student_progress`)
10. Se completou todos os conteúdos do nível, avaliação fica disponível

#### 1.7.5. Fluxo do Aluno - Fazer Avaliação

1. Aluno completa todos os conteúdos do nível atual na trilha
2. Sistema libera avaliação do nível
3. Aluno acessa avaliação disponível
4. Responde questões
5. Submete avaliação
6. Sistema corrige automaticamente (questões objetivas)
7. Sistema atualiza nível de aprendizagem do aluno (se ≥70%)
8. Sistema analisa respostas erradas e gera recomendações (baseado em tags - determinístico)
9. Aluno visualiza resultado e recomendações

---

## 2. REGRAS NÃO FUNCIONAIS

### 2.1. Performance

- **Tempo de resposta**:
  - Carregamento de dashboard: < 2 segundos
  - Carregamento de conteúdo: < 1 segundo
  - Carregamento de trilha: < 2 segundos
  - Submissão de avaliação: < 3 segundos
- **Escalabilidade**:
  - Sistema deve suportar múltiplas turmas simultâneas
  - Banco de dados otimizado com índices adequados
  - Paginação em listagens grandes
  - Cache de recomendações (evitar recálculo constante)

### 2.2. Segurança

- **Autenticação**:
  - JWT com expiração de 1 hora (já implementado)
  - Refresh token (fase 2)
- **Autorização**:
  - Professor só acessa conteúdos/avaliações das suas matérias (validado via `tb_teacher_subject`)
  - Aluno só acessa conteúdos da sua série
  - Aluno só acessa avaliações do seu nível atual
  - Validação de permissões em todas as rotas sensíveis (middlewares específicos)
- **Dados sensíveis**:
  - Informações de responsáveis criptografadas (fase 2)
  - Histórico escolar com controle de acesso

### 2.3. Acessibilidade

- **WCAG 2.1 Nível AA** (mínimo):
  - Contraste adequado em textos
  - Navegação por teclado
  - Leitores de tela compatíveis
  - Textos alternativos em imagens
- **Design inclusivo**:
  - Estrutura de conteúdo pensada para TDAH, TEA, dislexia
  - Navegação clara e intuitiva
  - Evitar sobrecarga de informações
  - Feedback visual claro

### 2.4. Usabilidade

- **Interface intuitiva**:
  - Trilha de aprendizado visualmente clara
  - Indicadores de progresso evidentes
  - Navegação simples e direta
- **Feedback ao usuário**:
  - Mensagens de sucesso/erro claras
  - Loading states em operações assíncronas
  - Confirmações em ações destrutivas

### 2.5. Confiabilidade

- **Disponibilidade**:
  - Sistema deve estar disponível durante horário escolar
  - Backup automático de dados
- **Integridade de dados**:
  - Validações no backend e frontend
  - Transações atômicas em operações críticas (ex: reordenação de trilha)
  - Histórico de alterações (auditoria - fase 2)

### 2.6. Manutenibilidade

- **Código limpo**:
  - Arquitetura em camadas bem definida
  - Separação de responsabilidades
  - Documentação de APIs
- **Testabilidade**:
  - Testes unitários em lógica de negócio
  - Testes de integração em endpoints críticos

---

## 3. ENTIDADES PRINCIPAIS (Conceitual)

### 3.1. Usuário (tb_user - existente, precisa expansão)

- Campos adicionais para aluno:
  - `date_of_birth` (data de nascimento)
  - `current_grade` (série/ano atual - padronizado: "6", "7", "8", "9" ou "1EM", "2EM", "3EM")
  - `guardians` (JSON com responsáveis)

### 3.2. Professor-Matéria (tb_teacher_subject - NOVA)

> **IMPORTANTE**: Necessária para validar permissões de criação de conteúdo.

- `id`, `teacher_id`, `category_id` (matéria)
- `created_at`, `updated_at`
- Constraint: único por (professor, matéria)

### 3.3. Conteúdo (tb_content - nova entidade)

- `id`, `title`, `content_text`, `category_id`, `grade`
- **`level`** (OBRIGATÓRIO): Nível de aprendizagem - `'1'`, `'2'`, `'3'` ou `'reforco'`. **"É conteúdo de reforço"** é derivado exclusivamente de `level = 'reforco'` (não usar campo redundante `is_reinforcement` no MVP).
- `user_id` (professor criador)
- `is_active`
- `topics` (JSONB), `glossary` (JSONB), `accessibility_metadata` (JSONB)
- `tags` (JSONB - usado para recomendações)
- `created_at`, `updated_at`
- **Nota**: O nível está no conteúdo (`level`), mas a **ordem de aprendizado** é definida na trilha (`tb_learning_path_content.order_number`)

### 3.4. Trilha de Aprendizado (tb_learning_path - NOVA)

> **IMPORTANTE**: Entidade explícita que define a sequência de conteúdos.

- `id`, `name`, `category_id` (matéria), `grade` (série)
- `is_default` (é a trilha padrão?)
- `description`, `created_by` (professor/coordenador criador)
- `is_active`, `created_at`, `updated_at`
- Constraint: apenas uma trilha padrão por (matéria, série)

### 3.5. Conteúdos na Trilha (tb_learning_path_content - NOVA)

> **IMPORTANTE**: Define a ordem dos conteúdos na trilha. O conteúdo mantém seu nível (`tb_content.level`).

- `id`, `learning_path_id`, `content_id`
- `order_number` (ordem na trilha - 1, 2, 3, ...)
- `created_at`
- Constraints: conteúdo único por trilha, ordem única na trilha
- **Validação**: Conteúdos adicionados devem ter `level IN ('1', '2', '3')` - reforço não entra na trilha

### 3.6. Turma (tb_class - nova entidade) — **Fase 2 (fora do MVP)**

- No MVP do hackathon, turmas **não** são implementadas; o professor vê lista de alunos (ou filtrada por série) sem o conceito de turma.
- `id`, `name`, `grade`, `shift` (manhã/tarde/noite/integral)
- `school_year` (ano letivo)
- `is_active`, `created_at`, `updated_at`

### 3.7. Matrícula (tb_enrollment - nova entidade) — **Fase 2 (fora do MVP)**

- `id`, `student_id`, `class_id`
- `enrollment_date`, `status` (ativo/inativo/transferido)
- `created_at`, `updated_at`

### 3.8. Turma-Professor-Matéria (tb_class_teacher_subject - nova entidade) — **Fase 2 (fora do MVP)**

- `id`, `class_id`, `teacher_id`, `category_id` (matéria)
- `created_at`, `updated_at`

### 3.9. Nível de Aprendizagem do Aluno (tb_student_learning_level - nova entidade)

- `id`, `student_id`, `category_id` (matéria), `level` (1-3)
- `updated_at`, `created_at`
- **Inicialização**: Trigger cria nível 1 para todas as matérias ao cadastrar aluno

### 3.10. Avaliação (tb_assessment - nova entidade)

- `id`, `title`, `description`, `category_id`, `level` (1-3)
- `content_id` (opcional - avaliação específica de conteúdo)
- `teacher_id`, `min_score` (pontuação mínima)
- `start_date`, `end_date`
- `is_active`, `created_at`, `updated_at`

### 3.11. Questão (tb_question - nova entidade)

- `id`, `assessment_id`, `question_text`, `question_type` (multiple_choice, true_false, text)
- `options` (JSONB), `correct_answer`
- `points`, `tags` (JSONB - tópicos relacionados)
- `order_number` (ordem na avaliação)
- `created_at`, `updated_at`

### 3.12. Resposta do Aluno (tb_student_answer - nova entidade)

- `id`, `student_id`, `assessment_id`, `question_id`
- `answer_text`, `is_correct`, `points_earned`
- `answered_at`

### 3.13. Resultado da Avaliação (tb_assessment_result - nova entidade)

- `id`, `student_id`, `assessment_id`
- `total_score`, `max_score`, `percentage`
- `completed_at`, `level_updated` (nível foi atualizado?)
- `created_at`

### 3.14. Recomendação (tb_recommendation - nova entidade)

- `id`, `student_id`, `content_id`, `reason` (texto explicativo)
- `source_type` (assessment, manual, system)
- `source_id` (ID da avaliação que gerou, se aplicável)
- `status` (pending, completed, dismissed)
- `created_at`, `updated_at`

### 3.15. Progresso do Aluno (tb_student_progress - nova entidade)

- `id`, `student_id`, `content_id`
- `status` (not_started, in_progress, completed)
- `started_at`, `completed_at`
- `time_spent` (em minutos, opcional)
- `created_at`, `updated_at`

---

## 4. DECISÕES DE ARQUITETURA

### 4.1. Backend (Node.js)

- **Novos módulos (MVP)**:
  - `contentController`, `contentRepository`
  - `learningPathController`, `learningPathRepository`
  - `assessmentController`, `assessmentRepository`
  - `questionController`, `questionRepository`
  - `studentAnswerController`, `studentAnswerRepository`
  - `recommendationController`, `recommendationRepository`
  - `studentProgressController`, `studentProgressRepository`
  - `teacherSubjectController`, `teacherSubjectRepository`
  - Endpoint/tela mínima para lista de alunos com nível por matéria e recomendações ativas (MVP)
- **Fase 2:** `classController`, `classRepository`; `dashboardController` (agregações, gráficos, turmas)

- **Serviços**:
  - `recommendationService` (lógica de recomendação baseada em regras determinísticas - MVP)
  - `assessmentCorrectionService` (correção automática)
  - `levelUpdateService` (atualização de nível baseado em avaliações)
  - `learningPathService` (lógica de trilha - validação de disponibilidade, bloqueios)

- **Middlewares de validação**:
  - `validateTeacherSubject` - valida se professor leciona a matéria
  - `validateStudentGrade` - valida se aluno acessa conteúdo da sua série
  - `validateStudentLevel` - valida se aluno acessa avaliação do seu nível

### 4.2. Frontend (React)

- **Novas páginas**:
  - `/dashboard/contents` (professor - gerenciar conteúdos)
  - `/dashboard/contents/create` (criar conteúdo)
  - `/dashboard/contents/:id/edit` (editar conteúdo)
  - `/dashboard/learning-paths` (professor - gerenciar trilhas)
  - `/dashboard/learning-paths/:id/edit` (editar trilha)
  - `/dashboard/assessments` (professor - gerenciar avaliações)
  - `/dashboard/assessments/create` (criar avaliação)
  - **MVP:** `/dashboard/students` (professor/coordenador - tela mínima: lista de alunos com nível por matéria e recomendações ativas)
  - **Fase 2:** `/dashboard/classes` (gerenciar turmas), `/dashboard/analytics` (dashboards agregados)
  - `/student/learning-path` (aluno - trilha de aprendizado)
  - `/student/assessments` (aluno - fazer avaliações)
  - `/student/recommendations` (aluno - ver recomendações)

- **Novos componentes**:
  - `ContentCard` (card de conteúdo com indicadores)
  - `LearningPathView` (visualização da trilha) (NOVO)
  - `LearningPathEditor` (editor de trilha para professor) (NOVO)
  - `AssessmentForm` (formulário de avaliação)
  - `QuestionCard` (card de questão)
  - `ProgressChart` (gráficos de progresso)
  - `RecommendationList` (lista de recomendações)

### 4.3. Sistema de Recomendação (MVP - Determinístico)

- **Abordagem**:
  - **Sem IA/NLP no MVP** - apenas regras determinísticas
  - Análise simples de tags/tópicos
  - Identificar padrões nas respostas erradas através de tags
  - Mapear tags → conteúdos de reforço
- **Implementação**:
  - Serviço `recommendationService` no backend
  - Endpoint `POST /recommendations/generate` que analisa avaliação e gera recomendações
  - Cache de recomendações para evitar recálculo constante
  - **Fase 2**: Avaliar uso de biblioteca leve de NLP (ex: `natural`) se necessário

---

## 5. PRÓXIMOS PASSOS

1. **Validar regras de negócio** com stakeholders
2. **Criar migrations** SQL para novas tabelas do **MVP** (tb_teacher_subject, tb_content, tb_learning_path, tb_learning_path_content, tb_student_learning_level, tb_assessment, tb_question, tb_student_answer, tb_assessment_result, tb_recommendation, tb_student_progress; **não** incluir tb_class, tb_enrollment, tb_class_teacher_subject no MVP)
3. **Definir endpoints da API** (REST) para o escopo MVP
4. **Protótipo de telas** principais (dashboard aluno, tela mínima professor, trilha, avaliações, recomendações)
5. **Plano de implementação** por fases (MVP Hackathon → Fase 2: turmas, dashboards agregados)

---

## 6. NOTAS IMPORTANTES

### 6.1. Padronização de Série/Ano

- Formato padronizado: "6", "7", "8", "9" (fundamental) ou "1EM", "2EM", "3EM" (médio)
- Evita inconsistências como "7º ano", "7o ano", "7"
- Validação no backend e frontend

### 6.2. Inicialização de Níveis

- Ao cadastrar aluno, trigger cria automaticamente nível 1 para todas as matérias
- Evita problemas de níveis não inicializados

### 6.3. Trilha vs Nível vs Ordem

- **Nível**: Continua no conteúdo (`tb_content.level` - obrigatório: '1', '2', '3' ou 'reforco')
  - O nível define a dificuldade/complexidade do conteúdo
  - **"É conteúdo de reforço"** é derivado exclusivamente de `level = 'reforco'`; não se usa campo redundante (ex.: `is_reinforcement`) no MVP
  - Conteúdos de reforço não entram na trilha padrão
- **Ordem**: Agora está na trilha (`tb_learning_path_content.order_number`)
  - Define a sequência de aprendizado dentro da trilha
  - Permite organizar conteúdos de diferentes níveis em sequência
- **Trilha organiza por nível**:
  - A trilha pode ter conteúdos de nível 1, depois nível 2, depois nível 3
  - A visualização agrupa por nível, mas a ordem é definida pela trilha
  - Exemplo: Trilha pode ter [Conteúdo N1-Ordem1, Conteúdo N1-Ordem2, Conteúdo N2-Ordem1, Conteúdo N2-Ordem2, ...]
- **Conteúdos de reforço**: Não entram na trilha (`level = 'reforco'`)
- **Vantagem**: Permite múltiplas trilhas, reordenação sem afetar conteúdo, mais flexível

### 6.4. Sistema de Recomendação

- **MVP**: Apenas regras determinísticas (sem IA)
- **Fase 2**: Avaliar necessidade de NLP leve
- Baseado em tags/tópicos, não em análise de texto complexa

---

**Documento em constante evolução.** Ajustes conforme validação MVP Hackathon (`VALIDACAO_REGRAS_NEGOCIO_MVP_HACKATHON.md`). Atualizado em: 2025-01-30.
