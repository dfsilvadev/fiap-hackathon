# Pitch — Módulo Pedagógico (Acompanhamento de Alunos com Dificuldade)

**Escopo:** Apenas o módulo pedagógico. Sem blog/publicações.

**Atualizado em:** 2026-02-03

---

## 1. Problema (1–2 frases)

Professores têm dificuldade de **acompanhar quem está atrasado** e **nivelar a sala**: alunos com dificuldade ficam invisíveis e não há um caminho claro de reforço por tópico. O professor não sabe, de forma objetiva, em que nível cada aluno está em cada matéria nem quais conteúdos sugerir para quem errou em quê.

---

## 2. Solução (em uma frase)

Plataforma de **acompanhamento pedagógico** que oferece: **trilha de aprendizado por matéria e série** (níveis 1 → 2 → 3), **nível do aluno por matéria**, **avaliações por nível** com correção automática e **recomendações de reforço por tópico** (tags das questões erradas → conteúdos de reforço com a mesma tag), além de **visão do professor** (lista de alunos com nível por matéria e recomendações ativas).

---

## 3. Diferencial (não é LMS genérico)

- **Nível por matéria:** o aluno pode estar nível 3 em Português e nível 1 em Matemática; o sistema trata cada matéria de forma independente.
- **Reforço explicável:** “Você teve dificuldade em **frações**” → o sistema sugere conteúdos de reforço com tag “frações”. Sem caixa preta.
- **Trilha explícita:** o aluno vê concluído / disponível / bloqueado / recomendado e sabe o próximo passo.
- **Foco em dificuldade/atraso:** não é só entregar conteúdo; é **saber onde cada um está** e **sugerir o reforço certo no tópico certo**.

**Frase de apoio:** “Não é só mais conteúdo; é nivelamento por matéria e reforço no tópico em que o aluno errou.”

---

## 4. Público e valor

| Público         | Valor                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Aluno**       | Trilha clara por matéria, progresso visível, recomendações com justificativa (“por que este conteúdo”).       |
| **Professor**   | Lista de alunos com nível por matéria e recomendações ativas; em um relance sabe quem priorizar.              |
| **Coordenador** | Gestão de usuários (aluno/professor) e visão mínima de acompanhamento; Fase 2: turmas e dashboards agregados. |

---

## 5. Demo (um fluxo redondo)

1. **Coordenador** cadastra um **aluno** (série, responsáveis) → sistema cria **nível 1 em todas as matérias**.
2. **Aluno** faz login e acessa o **dashboard** (trilha, progresso, recomendações).
3. **Aluno** escolhe **Matemática**, vê a **trilha** (concluído / disponível / bloqueado / recomendado).
4. **Aluno** abre um conteúdo **disponível**, lê e **marca como concluído**.
5. Ao completar **todos os conteúdos do nível** na trilha, a **avaliação do nível** fica disponível.
6. **Aluno** faz a **avaliação**, erra questões com tag **“frações”**, submete.
7. **Sistema** corrige, mantém/atualiza o nível (≥70%) e **gera recomendações** (conteúdos de reforço com tag “frações”).
8. **Aluno** vê o **resultado** e as **recomendações** (“Você teve dificuldade em frações”); pode abrir o conteúdo sugerido.
9. **Professor** abre a **tela de acompanhamento**: vê esse aluno com **nível por matéria** e **recomendações ativas** (ex.: “frações”).

**Mensagem da demo:** “O aluno errou em frações → o sistema recomendou reforço em frações → o professor vê quem está com essa recomendação.”

---

## 6. Escopo MVP (hackathon)

| Dentro do MVP                                                                           | Fora do MVP (Fase 2)                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Perfis: aluno, professor, coordenador                                                   | Turmas e matrículas                              |
| Conteúdo pedagógico (nível 1/2/3/reforço, tags)                                         | Dashboards agregados (gráficos, alunos em risco) |
| Trilha padrão por matéria/série                                                         | Múltiplas trilhas                                |
| Progresso do aluno (concluído na trilha)                                                | Questões dissertativas corrigidas pelo professor |
| Avaliações por nível (questões com tags, correção automática, ≥70% atualiza nível)      |                                                  |
| Recomendações determinísticas (tags das erradas → conteúdos de reforço)                 |                                                  |
| Dashboard do aluno (trilha, progresso, recomendações)                                   |                                                  |
| Tela mínima do professor (lista de alunos com nível por matéria e recomendações ativas) |                                                  |

---

## 7. Referências internas do módulo

- **Regras de negócio:** `REGRAS_NEGOCIO.md`
- **User stories:** `USER_STORIES.md`
- **Checklists de implementação:** `CHECKLIST_DESENVOLVIMENTO_MVP.md`
- **Roteiro de testes da API:** `API_TESTES.md`

---

## 8. Guia de entrega para o hackathon

### 8.1. Regras gerais (resumo)

- **Tema central:** Auxílio aos Professores no Ensino Público.
  - Este módulo atende diretamente o tema ao **dar visão de nível por matéria**, **recomendações de reforço** e **dashboard do professor** para apoiar a equiparação dos alunos.
- **Formato da equipe:** até **5 pessoas**.
- **Ferramentas:** livres (linguagens, frameworks, nuvem, IA etc.).
- **Entrega oficial:**
  - Até **13/02/2026**, pela plataforma da FIAP.
  - Um documento `.txt` ou `.doc` com **link para um drive público** contendo:
    - Vídeo do **Pitch** (máx. 8 min).
    - Vídeo do **MVP funcionando** (máx. 8 min).
    - **Relatório do projeto** (PDF/Doc).

Esta seção orienta **como usar o módulo pedagógico** para montar esses três entregáveis.

### 8.2. Vídeo de Pitch (máx. 8 minutos)

Use a estrutura abaixo, conectando diretamente com as seções deste pitch:

1. **Introdução (≈1 min)**
   - Apresentar a equipe (nome + função de cada pessoa).
   - Reforçar o **tema**: “auxílio aos professores do ensino público”.
   - Usar a seção **1. Problema** para contar, em linguagem simples, a dor dos professores.

2. **A Solução (≈3 min)**
   - Basear-se nas seções **2. Solução**, **3. Diferencial** e **4. Público e valor**.
   - Mostrar **qual jornada** o sistema resolve:
     - Professor passa a **saber quem está atrasado e em qual nível** por matéria.
     - Aluno tem **trilha clara** e recomendações quando erra nas avaliações.
   - Destacar diferenciais:
     - Nível por matéria, não só “nota geral”.
     - Recomendações de reforço **explicáveis** por tags (“frações”, “equações” etc.).
     - Tela do professor focada em **plano de ação e equiparação**.

3. **Impacto (≈2 min)**
   - Conectar com **casos de uso reais** (professores em escolas públicas):
     - Ex.: turma com alunos de níveis muito diferentes em Matemática.
     - Como o módulo ajuda a **identificar desníveis** e **sugerir reforço direcionado**.
   - Usar a parte de “Público e valor” para explicitar benefícios para:
     - Professor (priorizar quem precisa de ajuda).
     - Aluno (caminho claro e reforço personalizado).

4. **Próximos passos (≈2 min)**
   - Apoiar-se na tabela de **Escopo MVP vs Fase 2 (seção 6)**:
     - Fase 2: turmas e matrículas, dashboards agregados, múltiplas trilhas, questões dissertativas.
   - Explicar o que vocês fariam com **mais tempo**:
     - Agrupar alunos em “alunos em risco”.
     - Painéis por turma para coordenadores.
     - Integração com ferramentas já usadas na rede pública.

**Mensagem-chave do pitch:**

> “Nossa solução ajuda professores da rede pública a enxergar rapidamente quem está atrasado em cada matéria e a indicar reforços específicos, com base nas dificuldades reais dos alunos (tags das questões erradas).”

### 8.3. Vídeo do MVP funcionando (máx. 8 minutos)

Foque em **um fluxo principal bem redondo**, usando como base a seção **5. Demo** e o roteiro de testes do `API_TESTES.md`:

Sugestão de roteiro de demo:

1. **Login e perfil**
   - Mostrar login (Coordenador, Professor, Aluno) rapidamente.

2. **Professor cria conteúdo e trilha**
   - Criar/mostrar conteúdos com níveis 1/2/3 e tags.
   - Mostrar trilha por matéria/série (níveis 1 → 2 → 3).

3. **Aluno consome trilha e marca progresso**
   - Aluno vê trilha, marca conteúdos como concluídos.
   - Mostrar porcentagem de conclusão e nível atual.

4. **Avaliação e recomendações**
   - Aluno faz uma avaliação, erra em um tópico (ex.: frações).
   - Mostrar:
     - Correção automática e resultado detalhado.
     - Recomendações de reforço geradas (conteúdos `level = reforco` com a mesma tag).

5. **Dashboard do aluno e do professor**
   - **Aluno:** tela com trilha + progresso + recomendações.
   - **Professor:** visão de alunos por série, **nível por matéria** e recomendações ativas (quem precisa de reforço em quê).

Se alguma parte ainda não tiver UI, use rapidamente:

- Prints / mockups (ex.: Figma) **+** trechos de resposta da API via Hoppscotch/Postman (já roteirizados no doc de testes).

### 8.4. Relatório do projeto (estrutura sugerida)

Use a estrutura obrigatória das regras, conectando com este pitch:

1. **Resumo Executivo**
   - 1–2 parágrafos resumindo seções **1–4** deste documento (problema, solução, diferencial, público).

2. **Problema Identificado**
   - Expandir a seção **1. Problema** com dados/anedotas sobre ensino público (quando possível).

3. **Descrição da Solução**
   - Basear-se em **2. Solução**, **3. Diferencial**, **5. Demo** e **6. Escopo MVP**.

4. **Processo de Desenvolvimento**
   - Descrever como a equipe se organizou (brainstorm, divisão de tarefas, iterações).
   - Relacionar com decisões do módulo pedagógico (por que trilha, por que tags, etc.).

5. **Detalhes Técnicos**
   - Tecnologias usadas (Node/TS, Express, Prisma, Postgres, Docker, etc.).
   - Arquitetura resumida (API REST, camadas application/infrastructure, banco relacional).
   - Referenciar diagramas simples, se houver.

6. **Links úteis**
   - Repositório (GitHub/GitLab).
   - Protótipos visuais (Figma, Miro, etc.).
   - Link para o **documento de testes da API** e outros docs relevantes.

7. **Aprendizados e próximos passos**
   - O que a equipe aprendeu com o projeto (técnico e sobre o problema pedagógico).
   - Próximos passos baseados na seção **6. Escopo MVP (Fase 2)**.

### 8.5. Checklist rápido de entrega

- [ ] **Pitch (vídeo)** cobre: problema, solução, diferencial, impacto no ensino público, próximos passos.
- [ ] **Vídeo do MVP** mostra:
  - [ ] Trilhas por matéria/série.
  - [ ] Progresso do aluno e liberação de avaliação.
  - [ ] Avaliação com correção automática + recomendações de reforço.
  - [ ] Dashboard do aluno.
  - [ ] Dashboard do professor/coordenador com níveis por matéria e recomendações.
- [ ] **Relatório** segue a estrutura de resumo → problema → solução → processo → técnica → links → aprendizados.
- [ ] Link para drive público com **todos os materiais** está no documento de entrega na plataforma da FIAP.

---

## 9. Critérios de avaliação e como endereçar

Critérios oficiais:

- **Problema e Impacto (20%)**
  - Deixar muito claro **qual dor do professor da rede pública** vocês estão resolvendo e **como isso melhora a prática em sala**.
  - Usar exemplos concretos (turma com desnível, dificuldade em frações etc.).

- **Inovação (20%)**
  - Reforçar o que diferencia este módulo de um LMS genérico:
    - Nível por matéria.
    - Recomendações baseadas em tags de questões erradas (explicável).
    - Dashboard do professor focado em **equiparação**, não apenas relatório de notas.

- **Funcionalidade do MVP (30%)**
  - Garantir que o fluxo principal (demo) esteja sólido:
    - Trilhas, progresso, avaliações, recomendações e dashboards.
  - Se algo não estiver 100% pronto, explicar claramente no vídeo **o que falta e como seria implementado**.

- **Apresentação (20%)**
  - Pitch objetivo, visual, com storytelling (história de um professor e sua turma).
  - MVP demonstrado de forma fluida (do login até o acompanhamento do professor).

- **Documentação (10%)**
  - Este pitch + `CHECKLIST_DESENVOLVIMENTO_MVP.md` + `API_TESTES.md` + relatório formam o pacote de documentação.

---

**Documento em evolução.** Foco exclusivo no módulo pedagógico e, agora, alinhado às regras do hackathon (tema, entregáveis e critérios). Atualizado em: 2026-02-03.
