# Pitch — Módulo Pedagógico (Acompanhamento de Alunos com Dificuldade)

**Escopo:** Apenas o módulo pedagógico. Sem blog/publicações.

**Atualizado em:** 2025-01-30

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

## 7. Referências

- **Regras de negócio:** `REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md`
- **User stories:** `USER_STORIES_MODULO_PEDAGOGICO.md`
- **Casos de uso:** `FUNCIONALIDADE_E_CASOS_DE_USO.md` (seções pedagógicas)

---

**Documento em evolução.** Foco exclusivo no módulo pedagógico. Atualizado em: 2025-01-30.
