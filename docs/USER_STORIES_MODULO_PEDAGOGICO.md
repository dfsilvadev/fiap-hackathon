# User Stories — Módulo Pedagógico (Acompanhamento de Alunos com Dificuldade)

Cada story está no formato padrão para o Kanbanize.  
Labels sugeridos: `MVP` | `Fase 2` | `Backend` | `Frontend` | `API` | `SPA`.

> **Escopo deste documento:** Apenas o **módulo pedagógico**. Blog, publicações e comentários estão **fora do escopo**.  
> **Escopo MVP (Hackathon):** Autenticação e Usuários (Épico 1), Conteúdos Pedagógicos (Épico 2), Trilha (Épico 3), Avaliações (Épico 5), Progresso e Recomendações (Épico 6), **Dashboard do aluno** (7.1) e **tela mínima do professor** (7.2). Turmas e Matrículas (Épico 4) e dashboards completos (7.3–7.5) são **Fase 2**. Conteúdo de reforço é identificado apenas por `level = 'reforco'`.

**Referências:** `PITCH_MODULO_PEDAGOGICO.md`, `REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md`.

**Atualizado em:** 2025-01-30.

---

## ÉPICO 1 — Autenticação e Usuários

---

### Story 1.1 — Login com email e senha

**EU COMO:** visitante  
**DESEJO QUE:** eu possa fazer login com email e senha  
**PARA QUE:** eu acesse as áreas restritas do sistema (dashboard, trilha, avaliações, etc.).

**REGRAS NEGOCIAIS**

- **[RN001]:** O login deve ser realizado via API, retornando um token JWT válido.
- **[RN002]:** O token deve ter tempo de expiração definido (ex.: 1 hora).
- **[RN003]:** Credenciais inválidas não devem revelar se o erro foi no email ou na senha (mensagem genérica de "credenciais inválidas").

**FORA DO ESCOPO**

- Recuperação de senha (esqueci minha senha).
- Login com redes sociais ou SSO.
- Refresh token nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** O formulário de login possui campos email e senha, com validação (formato de email, senha não vazia).
- **[CA002]:** Após login com sucesso, o token é armazenado de forma segura e o usuário é redirecionado para a área restrita (ex.: dashboard do aluno ou do professor).
- **[CA003]:** Em caso de credenciais inválidas ou erro da API, uma mensagem de erro clara é exibida (sem expor detalhes de segurança).

---

### Story 1.2 — Cadastro de novo usuário

**EU COMO:** visitante  
**DESEJO QUE:** eu possa me cadastrar com nome, email, senha e perfil (quando aplicável)  
**PARA QUE:** eu me torne usuário do sistema e possa acessar funcionalidades que exigem login.

**REGRAS NEGOCIAIS**

- **[RN001]:** O email deve ser único no sistema; não é permitido dois usuários com o mesmo email.
- **[RN002]:** A senha deve atender critérios mínimos de segurança (ex.: quantidade mínima de caracteres), definidos nas regras do projeto.
- **[RN003]:** O perfil (role) pode ser definido no cadastro ou apenas pelo coordenador (conforme regra de negócio do produto).

**FORA DO ESCOPO**

- Cadastro de usuários "coordenador" ou "professor" por visitante (se apenas coordenador puder criar esses perfis).
- Verificação de email (confirmação por link).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe formulário de cadastro com nome, email, senha (e confirmação de senha) e, se aplicável, seleção de perfil (aluno/professor), com validação.
- **[CA002]:** Ao submeter com sucesso, o usuário é criado na API e o usuário recebe feedback (ex.: "Cadastro realizado. Faça login.").
- **[CA003]:** Se o email já estiver em uso, a API retorna erro e a interface exibe mensagem clara (ex.: "Este email já está cadastrado").

---

### Story 1.3 — Logout

**EU COMO:** usuário autenticado  
**DESEJO QUE:** eu possa encerrar minha sessão (logout)  
**PARA QUE:** eu saia do sistema com segurança, principalmente em computadores compartilhados.

**REGRAS NEGOCIAIS**

- **[RN001]:** O logout deve invalidar ou descartar o token no cliente; o usuário não deve mais ser considerado autenticado.
- **[RN002]:** Após logout, rotas protegidas não devem ser acessíveis sem novo login.

**FORA DO ESCOPO**

- Logout em todos os dispositivos (revogação global de tokens no servidor).
- Expiração automática de sessão por inatividade (pode ser regra futura).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe opção clara de "Sair" ou "Logout" na interface (ex.: menu do usuário ou header).
- **[CA002]:** Ao acionar logout, o token/sessão é removido e o usuário é redirecionado para a tela de login.

---

### Story 1.4 — Perfil do aluno (dados e responsáveis)

**EU COMO:** aluno  
**DESEJO QUE:** meu perfil tenha nome, email, data de nascimento, série e responsáveis  
**PARA QUE:** a escola me identifique corretamente e tenha contato com meus responsáveis.

**REGRAS NEGOCIAIS**

- **[RN001]:** Série/ano letivo deve seguir padronização definida: "6", "7", "8", "9" (fundamental) ou "1EM", "2EM", "3EM" (médio).
- **[RN002]:** Deve haver no mínimo um responsável cadastrado (nome, telefone, email, parentesco).
- **[RN003]:** Apenas o próprio aluno (ou coordenador) pode atualizar esses dados.

**FORA DO ESCOPO**

- Alteração de role (aluno não pode se tornar professor por edição de perfil).
- Histórico escolar completo nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** A tela de perfil (ou edição de usuário) exibe e permite editar: nome, email, data de nascimento, série (lista padronizada) e lista de responsáveis (campos por responsável).
- **[CA002]:** A atualização é feita via PATCH na API de usuário, com validação de série e responsáveis no backend.
- **[CA003]:** Mensagens de sucesso e erro são exibidas de forma clara após salvar.

---

### Story 1.5 — Perfil do professor (matérias que leciona)

**EU COMO:** professor  
**DESEJO QUE:** meu perfil tenha as matérias que leciono vinculadas  
**PARA QUE:** eu só possa criar conteúdos e avaliações das matérias que leciono e o sistema valide isso.

**REGRAS NEGOCIAIS**

- **[RN001]:** O vínculo professor–matéria deve ser registrado (ex.: tb_teacher_subject); o professor deve ter no mínimo uma matéria vinculada.
- **[RN002]:** Apenas coordenador (ou admin) pode cadastrar ou alterar as matérias que o professor leciona, ou o professor pode escolher dentro de uma lista permitida, conforme regra do produto.
- **[RN003]:** Criação de conteúdo e avaliação no backend deve validar se o professor leciona a matéria escolhida.

**FORA DO ESCOPO**

- Definição de turmas em que o professor leciona (Fase 2).
- Horários e carga horária por matéria.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela ou seção onde as matérias (categorias) que o professor leciona são exibidas e, se permitido, editadas (cadastro/edição de vínculos).
- **[CA002]:** A API persiste e retorna os vínculos professor–matéria e utiliza essa informação para validar criação de conteúdo/avaliação.
- **[CA003]:** Ao tentar criar conteúdo ou avaliação para matéria que o professor não leciona, o backend retorna erro (ex.: 403) e a interface exibe mensagem adequada.

---

### Story 1.6 — Coordenador gerencia usuários (criar, editar, desativar)

**EU COMO:** coordenador  
**DESEJO QUE:** eu possa gerenciar usuários (criar, editar, desativar)  
**PARA QUE:** eu mantenha alunos e professores no sistema e atribua as funções corretas.

**REGRAS NEGOCIAIS**

- **[RN001]:** Apenas o usuário com perfil coordenador pode criar novos usuários das categorias professor ou aluno.
- **[RN002]:** O coordenador pode editar dados de usuários (nome, email, série, responsáveis, matérias do professor, etc.) e desativar usuários.
- **[RN003]:** Deve ser possível incluir usuários já categorizados (aluno, professor); a distinção de funções deve estar clara na interface e na API (roles).

**FORA DO ESCOPO**

- Criação de outro usuário "coordenador" (pode ser restrito a super-admin ou fora do escopo).
- Exclusão física permanente de usuários (pode ser apenas desativação).
- Gerenciar turmas e matrículas (Fase 2 — no MVP o coordenador só gerencia usuários).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Apenas o usuário coordenador pode acessar a funcionalidade de criar novos usuários (professor ou aluno); a interface impede outros perfis de acessar.
- **[CA002]:** O coordenador pode editar usuários existentes (dados de perfil, série, responsáveis, matérias do professor) e desativar/reativar usuário.
- **[CA003]:** A API valida o role (coordenador) em todas as operações de criação/edição de usuários e retorna 403 para perfis não autorizados.

---

## ÉPICO 2 — Conteúdos Pedagógicos

---

### Story 2.1 — Professor cria conteúdo (título, matéria, série, nível, texto, tags)

**EU COMO:** professor  
**DESEJO QUE:** eu possa criar conteúdo com título, matéria, série, nível (1/2/3/reforço), texto e tags  
**PARA QUE:** eu disponibilize material didático organizado por nível e matéria.

**REGRAS NEGOCIAIS**

- **[RN001]:** O professor só pode criar conteúdo para matérias que ele leciona (validado via vínculo professor–matéria).
- **[RN002]:** O nível é obrigatório e deve ser um dos valores: 1, 2, 3 ou "reforço".
- **[RN003]:** Título, matéria (categoria), série e conteúdo principal (texto) são obrigatórios; tags são opcionais e usadas para recomendações.

**FORA DO ESCOPO**

- Conteúdos de reforço (`level = 'reforco'`) fazem parte da mesma entidade; não entram na trilha padrão (regra da trilha). Não se usa campo redundante (ex.: is_reinforcement) no MVP.
- Upload de mídia (imagens/vídeos) nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** O formulário de criação possui campos: título, matéria (select), série (padronizada), nível (1, 2, 3, reforço), texto principal e tags (opcional), com validação.
- **[CA002]:** A API valida se o professor leciona a matéria selecionada; em caso negativo, retorna 403 com mensagem clara.
- **[CA003]:** Após sucesso, o conteúdo é persistido e o usuário recebe feedback; nível e tags são salvos corretamente.

---

### Story 2.2 — Professor edita e desativa conteúdos que criou

**EU COMO:** professor  
**DESEJO QUE:** eu possa editar e desativar os conteúdos que criei  
**PARA QUE:** eu mantenha o material atualizado e retire do ar conteúdos obsoletos.

**REGRAS NEGOCIAIS**

- **[RN001]:** O professor só pode editar ou desativar conteúdos de sua autoria; o coordenador pode editar/desativar qualquer conteúdo.
- **[RN002]:** Desativação deve ser soft delete (is_active = false); o conteúdo deixa de aparecer para alunos mas permanece no banco.
- **[RN003]:** Ao editar, título, matéria, série, nível e texto continuam obrigatórios conforme regras de criação.

**FORA DO ESCOPO**

- Exclusão física (hard delete) de conteúdo.
- Transferência de autoria do conteúdo para outro professor.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Na listagem de conteúdos do professor, há opção de editar e desativar apenas para conteúdos que ele criou (ou para coordenador: todos).
- **[CA002]:** A edição abre formulário com dados atuais; ao salvar, a API persiste as alterações e valida permissões.
- **[CA003]:** Ao desativar, o conteúdo deixa de ser listado para alunos e de aparecer na trilha; a ação pode ser revertida (reativar) se a regra permitir.

---

### Story 2.3 — Professor adiciona tópicos, glossário e metadados de acessibilidade

**EU COMO:** professor  
**DESEJO QUE:** eu possa adicionar tópicos, glossário e metadados de acessibilidade ao conteúdo  
**PARA QUE:** o material fique mais acessível e estruturado (TDAH, TEA, dislexia, tempo de leitura).

**REGRAS NEGOCIAIS**

- **[RN001]:** Tópicos (seções), glossário e metadados de acessibilidade são opcionais; o conteúdo principal (título, texto, nível) continua obrigatório.
- **[RN002]:** Metadados podem incluir: adequado para (ex.: TDAH, TEA), tempo de leitura em minutos, nível de complexidade textual.
- **[RN003]:** Glossário pode ser lista de pares "palavra – definição" para exibição inline ou tooltip.

**FORA DO ESCOPO**

- Geração automática de glossário ou metadados por IA.
- Legendas para vídeos (se não houver vídeo no MVP).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** No formulário de conteúdo (criar/editar) existem campos ou seções para: tópicos (título + conteúdo por tópico), glossário (palavra, definição) e metadados de acessibilidade (checkboxes ou selects conforme definição).
- **[CA002]:** Esses dados são persistidos (ex.: JSONB) na API e retornados no GET do conteúdo.
- **[CA003]:** Na tela de leitura do conteúdo (aluno), tópicos e glossário são exibidos de forma que melhore a compreensão e acessibilidade.

---

### Story 2.4 — Aluno lista conteúdos da sua série e matéria

**EU COMO:** aluno  
**DESEJO QUE:** eu possa listar conteúdos da minha série e matéria  
**PARA QUE:** eu encontre o material de estudo adequado ao meu ano e à disciplina.

**REGRAS NEGOCIAIS**

- **[RN001]:** O aluno vê apenas conteúdos ativos da sua série (current_grade) e da matéria selecionada (ou todas as matérias da série).
- **[RN002]:** A listagem pode ser filtrada por matéria e ordenada conforme a trilha (nível e ordem) quando aplicável.
- **[RN003]:** Conteúdos de reforço podem aparecer em seção separada ou com indicador distinto.

**FORA DO ESCOPO**

- Conteúdos de outras séries visíveis ao aluno.
- Edição de conteúdo pelo aluno.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela de listagem de conteúdos em que o aluno seleciona matéria (e eventualmente série, se houver mais de uma) e vê apenas conteúdos permitidos para seu perfil.
- **[CA002]:** A API filtra por série do aluno e categoria (matéria); retorna apenas conteúdos ativos.
- **[CA003]:** A listagem exibe informações mínimas (título, nível, matéria) e permite abrir o conteúdo para leitura.

---

### Story 2.5 — Aluno visualiza conteúdo (título, texto, tópicos, glossário)

**EU COMO:** aluno  
**DESEJO QUE:** eu possa abrir um conteúdo e ver título, texto, tópicos e glossário  
**PARA QUE:** eu estude com clareza e uso a estrutura e o glossário para compreender melhor.

**REGRAS NEGOCIAIS**

- **[RN001]:** O aluno só pode acessar conteúdos disponíveis para sua série e, quando a regra existir, para seu nível (conteúdo disponível ou recomendado).
- **[RN002]:** A exibição deve seguir estrutura acessível (títulos, seções, texto alternativo para imagens quando houver).
- **[RN003]:** Glossário e tópicos devem ser exibidos de forma que favoreça leitores de tela e navegação por teclado.

**FORA DO ESCOPO**

- Marcar conteúdo como concluído nesta story (pode ser story separada de progresso).
- Download em PDF ou impressão.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** A página de leitura exibe título, conteúdo principal, tópicos (se houver) e glossário (palavra/definição ou tooltip).
- **[CA002]:** A API retorna o conteúdo completo (incluindo topics, glossary, accessibility_metadata) e o frontend renderiza de forma legível e acessível.
- **[CA003]:** Se o aluno não tiver permissão para aquele conteúdo (ex.: bloqueado por nível), a API retorna 403 e a interface exibe mensagem adequada.

---

## ÉPICO 3 — Trilha de Aprendizado

---

### Story 3.1 — Professor/coordenador cria e edita trilha padrão por matéria/série

**EU COMO:** professor ou coordenador  
**DESEJO QUE:** eu possa criar e editar a trilha padrão de uma matéria e série  
**PARA QUE:** eu defina a ordem e o conjunto de conteúdos que compõem o percurso pedagógico.

**REGRAS NEGOCIAIS**

- **[RN001]:** Apenas conteúdos com nível 1, 2 ou 3 podem fazer parte da trilha; conteúdos de nível "reforço" não entram na trilha padrão.
- **[RN002]:** Deve existir no máximo uma trilha padrão (is_default = true) por combinação (matéria, série).
- **[RN003]:** O professor só pode criar/editar trilhas de matérias que leciona; o coordenador pode para qualquer matéria.

**FORA DO ESCOPO**

- Trilhas personalizadas por turma ou aluno (Fase 2).
- Múltiplas trilhas alternativas (ex.: trilha acelerada) nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela de CRUD de trilha (nome, matéria, série, marcação como padrão) com validação de permissão (professor só para suas matérias).
- **[CA002]:** A API persiste a trilha (tb_learning_path) e garante unicidade de trilha padrão por (matéria, série).
- **[CA003]:** Ao editar, os dados atuais da trilha são carregados e salvos corretamente; mensagens de erro são exibidas em caso de falha.

---

### Story 3.2 — Professor/coordenador adiciona e reordena conteúdos na trilha

**EU COMO:** professor ou coordenador  
**DESEJO QUE:** eu possa adicionar e reordenar conteúdos na trilha  
**PARA QUE:** eu defina a sequência pedagógica (ordem de estudo) dos conteúdos.

**REGRAS NEGOCIAIS**

- **[RN001]:** Cada conteúdo pode aparecer no máximo uma vez na mesma trilha; a ordem (order_number) deve ser única na trilha.
- **[RN002]:** Só podem ser adicionados à trilha conteúdos com nível 1, 2 ou 3 (reforço não entra).
- **[RN003]:** Os conteúdos adicionados devem pertencer à mesma matéria e série da trilha.

**FORA DO ESCOPO**

- Duplicar conteúdo na trilha com ordens diferentes.
- Inclusão automática de todos os conteúdos da matéria/série (a escolha é manual).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Na tela da trilha é possível adicionar conteúdos (lista de conteúdos elegíveis) e remover conteúdos já na trilha.
- **[CA002]:** É possível alterar a ordem (arrastar-e-soltar ou setas) e a nova ordem é persistida (tb_learning_path_content.order_number).
- **[CA003]:** A API valida nível do conteúdo (1, 2 ou 3), matéria/série e unicidade de ordem; retorna erro claro em caso de violação.

---

### Story 3.3 — Aluno vê trilha por matéria com status (concluído, disponível, bloqueado, recomendado)

**EU COMO:** aluno  
**DESEJO QUE:** eu possa ver minha trilha por matéria com o status de cada conteúdo (concluído, disponível, bloqueado, recomendado)  
**PARA QUE:** eu saiba o que já fiz, o que está liberado e o que ainda está bloqueado ou recomendado como reforço.

**REGRAS NEGOCIAIS**

- **[RN001]:** Status "concluído": aluno marcou o conteúdo como concluído (ou sistema marcou ao final da leitura).
- **[RN002]:** Status "disponível": próximo conteúdo a estudar (nível do conteúdo ≤ nível do aluno e não concluído).
- **[RN003]:** Status "bloqueado": nível do conteúdo > nível do aluno.
- **[RN004]:** Status "recomendado": conteúdo de reforço sugerido (não faz parte da trilha padrão).

**FORA DO ESCOPO**

- Alteração da trilha pelo aluno.
- Gráficos ou métricas avançadas nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** A tela de trilha do aluno exibe, por matéria, a lista de conteúdos com indicadores visuais (ex.: ✅ concluído, 📖 disponível, 🔒 bloqueado, ⚠️ recomendado).
- **[CA002]:** Os dados vêm da API (ex.: GET content/learning-path ou equivalente) com status e progresso calculados no backend.
- **[CA003]:** O aluno consegue identificar claramente qual é o próximo conteúdo a estudar e quais estão bloqueados.

---

### Story 3.4 — Aluno acessa apenas conteúdos disponíveis ou recomendados para seu nível

**EU COMO:** aluno  
**DESEJO QUE:** eu só consiga acessar conteúdos que estejam disponíveis ou recomendados para meu nível  
**PARA QUE:** eu não pule etapas e siga a sequência pedagógica definida.

**REGRAS NEGOCIAIS**

- **[RN001]:** Conteúdo "disponível": nível do conteúdo ≤ nível do aluno naquela matéria e não concluído.
- **[RN002]:** Conteúdo "recomendado": sugerido pelo sistema (reforço) e acessível independentemente da trilha.
- **[RN003]:** Conteúdo "bloqueado": nível do conteúdo > nível do aluno; o aluno não deve conseguir abrir o conteúdo (API retorna 403 ou equivalente).

**FORA DO ESCOPO**

- Liberação manual pelo professor de conteúdo bloqueado para um aluno específico (pode ser Fase 2).
- Bypass por URL direta (deve ser impedido no backend).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Ao tentar abrir um conteúdo bloqueado (por URL ou link), a API retorna 403 (ou 404) e a interface exibe mensagem (ex.: "Este conteúdo ainda não está disponível para você").
- **[CA002]:** Conteúdos disponíveis e recomendados abrem normalmente e exibem o conteúdo completo.
- **[CA003]:** O nível do aluno por matéria é considerado corretamente (tb_student_learning_level) nas validações da API.

---

## ÉPICO 4 — Turmas e Matrículas (Fase 2 — fora do MVP)

> No MVP do hackathon **não** se implementam turmas nem matrículas. O professor vê lista de alunos (ou filtrada por série) na tela mínima (Story 7.2). As stories abaixo são **Fase 2**.

---

### Story 4.1 — Coordenador cria e edita turmas

**EU COMO:** coordenador  
**DESEJO QUE:** eu possa criar e editar turmas (nome, série, turno, ano letivo)  
**PARA QUE:** eu organize os alunos em turmas e gerencie ofertas por ano.

**REGRAS NEGOCIAIS**

- **[RN001]:** Turma possui: nome, série (padronizada), turno (manhã/tarde/noite/integral), ano letivo (ex.: 2024-2025).
- **[RN002]:** Apenas coordenador pode criar e editar turmas.
- **[RN003]:** Exclusão de turma deve ser soft delete (is_active = false) para preservar histórico de matrículas.

**FORA DO ESCOPO**

- Horário de aulas e grade curricular.
- Múltiplos turnos por turma.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela de listagem e CRUD de turmas com campos nome, série, turno e ano letivo, acessível apenas ao coordenador.
- **[CA002]:** A API expõe GET/POST/PATCH/DELETE de turmas (class) com validação de role; filtros por série e ano letivo funcionam.
- **[CA003]:** Após criar/editar, a lista é atualizada e mensagens de sucesso/erro são exibidas.

---

### Story 4.2 — Coordenador matricula alunos em turmas

**EU COMO:** coordenador  
**DESEJO QUE:** eu possa matricular alunos em turmas e remover matrículas  
**PARA QUE:** os alunos fiquem associados às turmas corretas e eu possa gerir as turmas.

**REGRAS NEGOCIAIS**

- **[RN001]:** Uma matrícula associa um aluno a uma turma em um período (enrollment); o aluno pode ter status ativo, inativo ou transferido.
- **[RN002]:** Apenas coordenador pode adicionar ou remover matrículas.
- **[RN003]:** Um aluno pode estar em apenas uma turma por ano letivo (ou regra definida pelo produto).

**FORA DO ESCOPO**

- Transferência automática de histórico entre turmas.
- Rematrícula em lote por planilha nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Na tela da turma é possível listar alunos matriculados, adicionar aluno (busca/seleção) e remover matrícula.
- **[CA002]:** A API expõe endpoints para listar alunos da turma, adicionar matrícula e remover matrícula, com validação de role e regras de negócio.
- **[CA003]:** A interface reflete as alterações e exibe mensagens de erro em caso de conflito (ex.: aluno já matriculado).

---

### Story 4.3 — Coordenador vincula professores a turmas por matéria

**EU COMO:** coordenador  
**DESEJO QUE:** eu possa vincular professores a turmas por matéria  
**PARA QUE:** cada turma tenha seus professores definidos por disciplina.

**REGRAS NEGOCIAIS**

- **[RN001]:** O vínculo é turma + professor + matéria (categoria); um professor pode dar aula em várias turmas e várias matérias.
- **[RN002]:** Apenas coordenador pode criar ou remover esse vínculo.
- **[RN003]:** O professor deve ter a matéria no seu perfil (tb_teacher_subject) para ser vinculado à turma nessa matéria.

**FORA DO ESCOPO**

- Definição de dias/horários de aula.
- Substituição automática de professor.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Na tela da turma (ou em seção dedicada) é possível listar professores por matéria e adicionar/remover vínculos professor–matéria para aquela turma.
- **[CA002]:** A API persiste o vínculo (ex.: tb_class_teacher_subject) e valida que o professor leciona a matéria; retorna lista de professores da turma.
- **[CA003]:** A interface exibe os vínculos atuais e atualiza após cada alteração.

---

### Story 4.4 — Professor vê lista de alunos da turma

**EU COMO:** professor  
**DESEJO QUE:** eu possa ver a lista de alunos das turmas em que leciono  
**PARA QUE:** eu acompanhe quem são os alunos e, no futuro, desempenho por turma.

**REGRAS NEGOCIAIS**

- **[RN001]:** O professor só vê turmas em que está vinculado (por matéria).
- **[RN002]:** A listagem deve considerar matrículas ativas (status ativo).
- **[RN003]:** Pode ser filtrada por matéria quando o professor leciona mais de uma matéria na mesma turma.

**FORA DO ESCOPO**

- Edição de dados do aluno pelo professor (apenas visualização nesta story).
- Exportação da lista (PDF/Excel).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela onde o professor escolhe turma (e opcionalmente matéria) e vê a lista de alunos matriculados.
- **[CA002]:** A API GET class/:id/students (ou equivalente) retorna os alunos da turma e valida se o usuário é professor daquela turma/matéria; retorna 403 se não for.
- **[CA003]:** A lista exibe dados mínimos (nome, email ou identificação) dos alunos.

---

## ÉPICO 5 — Avaliações

---

### Story 5.1 — Professor cria avaliação (título, matéria, nível, pontuação mínima, datas)

**EU COMO:** professor  
**DESEJO QUE:** eu possa criar uma avaliação com título, matéria, nível, pontuação mínima e datas  
**PARA QUE:** eu aplique provas por nível de aprendizagem.

**REGRAS NEGOCIAIS**

- **[RN001]:** O professor só pode criar avaliação para matérias que leciona.
- **[RN002]:** Nível deve ser 1, 2 ou 3; a avaliação fica disponível para alunos que estejam naquele nível na matéria.
- **[RN003]:** Pontuação mínima (ex.: 70%) define se o aluno pode ter o nível atualizado após a correção; datas definem período de aplicação.

**FORA DO ESCOPO**

- Questões na mesma tela de criação (podem ser em story separada).
- Múltiplas tentativas por aluno (regra de negócio a definir).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** O formulário de criação de avaliação possui: título, descrição (opcional), matéria, nível (1/2/3), pontuação mínima e datas (início/fim), com validação.
- **[CA002]:** A API valida se o professor leciona a matéria; persiste a avaliação (tb_assessment) e retorna sucesso ou erro claro.
- **[CA003]:** Após criar, o usuário é redirecionado para a avaliação (ex.: para adicionar questões) ou vê mensagem de sucesso.

---

### Story 5.2 — Professor adiciona questões à avaliação

**EU COMO:** professor  
**DESEJO QUE:** eu possa adicionar questões (múltipla escolha, V/F, texto) com enunciado, alternativas, resposta correta e tags  
**PARA QUE:** eu monte a avaliação e o sistema use as tags para recomendações futuras.

**REGRAS NEGOCIAIS**

- **[RN001]:** Tipos de questão: múltipla escolha, verdadeiro/falso, texto livre (texto livre pode ter correção manual em Fase 2).
- **[RN002]:** Cada questão pode ter tags (ex.: ["frações", "adição"]) usadas pelo sistema de recomendação quando o aluno errar.
- **[RN003]:** O professor só pode adicionar/editar questões em avaliações que criou (ou é coordenador).

**FORA DO ESCOPO**

- Banco de questões reutilizáveis entre avaliações (pode ser evolução futura).
- Importação de questões por arquivo.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Na tela da avaliação é possível adicionar questão com: enunciado, tipo, alternativas (se múltipla escolha), resposta correta, pontuação e tags; e editar/remover questões.
- **[CA002]:** A API persiste questões (tb_question) vinculadas à avaliação; tipos e tags são salvos corretamente.
- **[CA003]:** A ordem das questões pode ser definida (order_number) e alterada na interface.

---

### Story 5.3 — Aluno vê avaliações disponíveis para seu nível

**EU COMO:** aluno  
**DESEJO QUE:** eu possa ver as avaliações disponíveis para meu nível em cada matéria  
**PARA QUE:** eu saiba quais provas posso fazer e em que momento.

**REGRAS NEGOCIAIS**

- **[RN001]:** Uma avaliação fica disponível para o aluno quando ele está no nível correspondente naquela matéria e, se aplicável, quando completou os conteúdos do nível na trilha (conforme regra de negócio).
- **[RN002]:** O aluno não deve ver avaliações de nível superior ao seu nem de matérias/séries que não se aplicam a ele.
- **[RN003]:** Período de aplicação (start_date, end_date) deve ser respeitado.

**FORA DO ESCOPO**

- Ver avaliações já realizadas nesta story (pode ser mesma tela com abas "Disponíveis" e "Realizadas").
- Notificações de nova avaliação disponível.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela "Avaliações disponíveis" que lista avaliações que o aluno pode fazer (filtradas por matéria e nível do aluno).
- **[CA002]:** A API GET assessment/available (ou equivalente) recebe studentId e retorna apenas avaliações elegíveis; considera nível do aluno e datas.
- **[CA003]:** Cada item da lista permite abrir a avaliação para responder (ou exibe data e matéria/nível).

---

### Story 5.4 — Aluno responde e submete avaliação

**EU COMO:** aluno  
**DESEJO QUE:** eu possa responder às questões de uma avaliação e submeter  
**PARA QUE:** eu seja corrigido automaticamente e meu nível seja atualizado se eu atingir a pontuação mínima.

**REGRAS NEGOCIAIS**

- **[RN001]:** O aluno só pode submeter uma vez por avaliação (ou conforme regra: múltiplas tentativas).
- **[RN002]:** Após submissão, o sistema corrige automaticamente questões objetivas; calcula pontuação e percentual.
- **[RN003]:** Se percentual ≥ pontuação mínima (ex.: 70%), o nível do aluno naquela matéria pode ser atualizado (ex.: 1 → 2); caso contrário, permanece.

**FORA DO ESCOPO**

- Correção manual de questões dissertativas (Fase 2).
- Pausar e retomar a avaliação em outro momento (salvar rascunho).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** A tela de realização da avaliação exibe cada questão (enunciado, alternativas ou campo de texto) e um botão para submeter todas as respostas.
- **[CA002]:** Ao submeter, a API POST assessment/:id/submit recebe as respostas, corrige, persiste resultado e atualiza nível quando aplicável; retorna result_id, total_score, percentage, level_updated.
- **[CA003]:** O aluno recebe feedback de que a submissão foi recebida e é redirecionado para o resultado (ou mensagem de sucesso).

---

### Story 5.5 — Aluno vê resultado da avaliação

**EU COMO:** aluno  
**DESEJO QUE:** eu possa ver meu resultado (nota, acertos/erros e se meu nível foi atualizado)  
**PARA QUE:** eu saiba como fui e se avancei de nível.

**REGRAS NEGOCIAIS**

- **[RN001]:** O resultado inclui: pontuação total, pontuação máxima, percentual, indicação se o nível foi atualizado e, se aplicável, quais questões acertou/errou.
- **[RN002]:** Apenas o próprio aluno (ou professor/coordenador) pode ver o resultado.
- **[RN003]:** Recomendações podem ser geradas após a avaliação (story de progresso/recomendações).

**FORA DO ESCOPO**

- Comparativo com média da turma ou ranking.
- Exportação do resultado em PDF.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela de resultado que exibe: nota (total/máximo), percentual, mensagem "Nível atualizado" (ou não) e lista de questões com indicação de acerto/erro e resposta correta.
- **[CA002]:** A API GET assessment/:id/result/:studentId (ou equivalente) retorna esses dados; valida permissão (aluno próprio, professor ou coordenador).
- **[CA003]:** Se houver recomendações geradas, pode haver link ou indicação para a tela de recomendações.

---

### Story 5.6 — Professor/coordenador vê resultados dos alunos por avaliação

**EU COMO:** professor ou coordenador  
**DESEJO QUE:** eu possa ver os resultados dos alunos por avaliação  
**PARA QUE:** eu acompanhe o desempenho e identifique quem precisa de apoio.

**REGRAS NEGOCIAIS**

- **[RN001]:** O professor vê resultados das avaliações que criou (e das matérias que leciona); o coordenador vê todos. No MVP não há turma: lista é por avaliação e alunos (ou filtro por série).
- **[RN002]:** Deve ser possível listar por avaliação (quem fez, nota, se nível foi atualizado). Listagem por turma é Fase 2.
- **[RN003]:** Dados exibidos: aluno, pontuação, percentual, data de realização, level_updated.

**FORA DO ESCOPO**

- Exportação em planilha nesta story.
- Gráficos de distribuição de notas (Fase 2 no dashboard).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela onde o professor/coordenador seleciona uma avaliação e vê a lista de alunos que realizaram com resultado (nota, %, nível atualizado).
- **[CA002]:** A API permite obter resultados por avaliação (e por aluno) com validação de permissão. No MVP a listagem não depende de turma; filtro por série é suficiente. Por turma é Fase 2.
- **[CA003]:** É possível abrir o detalhe do resultado de um aluno (respostas certas/erradas) quando a API expõe esse detalhe.

---

## ÉPICO 6 — Progresso e Recomendações

---

### Story 6.1 — Aluno marca conteúdo como concluído

**EU COMO:** aluno  
**DESEJO QUE:** eu possa marcar um conteúdo como concluído (ou o sistema marcar ao final da leitura)  
**PARA QUE:** meu progresso seja registrado e a trilha mostre o que já fiz.

**REGRAS NEGOCIAIS**

- **[RN001]:** O progresso é registrado em tb_student_progress com status: not_started, in_progress, completed.
- **[RN002]:** Apenas o próprio aluno (ou sistema em nome do aluno) pode atualizar seu progresso.
- **[RN003]:** Ao marcar como concluído, pode ser registrado tempo de leitura (time_spent em minutos), se a regra permitir.

**FORA DO ESCOPO**

- Desmarcar como concluído (reabrir conteúdo) — definir se será permitido.
- Progresso parcial (ex.: 50% lido) nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Na tela de leitura do conteúdo existe botão ou ação "Marcar como concluído" (ou o sistema marca ao chegar ao fim do conteúdo).
- **[CA002]:** A API POST progress (ou PATCH) recebe student_id, content_id e status (completed); persiste em tb_student_progress.
- **[CA003]:** Após marcar, a trilha e a tela de progresso passam a refletir o conteúdo como concluído.

---

### Story 6.2 — Aluno vê progresso por matéria

**EU COMO:** aluno  
**DESEJO QUE:** eu possa ver meu progresso por matéria (concluídos, pendentes e nível atual)  
**PARA QUE:** eu acompanhe minha evolução e saiba em que nível estou em cada disciplina.

**REGRAS NEGOCIAIS**

- **[RN001]:** O progresso considera conteúdos da trilha concluídos vs pendentes e o nível atual do aluno por matéria (tb_student_learning_level).
- **[RN002]:** Percentual de conclusão pode ser calculado com base em conteúdos da trilha concluídos / total da trilha naquela matéria.
- **[RN003]:** Apenas o próprio aluno (ou professor/coordenador) pode ver esse progresso.

**FORA DO ESCOPO**

- Comparativo com outros alunos.
- Histórico de alteração de nível ao longo do tempo (pode ser evolução).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela "Meu progresso" (ou seção no dashboard) que exibe, por matéria: nível atual, quantidade ou percentual de conteúdos concluídos e pendentes.
- **[CA002]:** A API GET progress (com studentId e opcionalmente categoryId) retorna os dados de progresso e nível; os cálculos estão consistentes com a trilha.
- **[CA003]:** Os dados são exibidos de forma clara (lista ou cards por matéria).

---

### Story 6.3 — Sistema gera recomendações após avaliação (tags)

**EU COMO:** sistema (ou coordenador que dispara a geração)  
**DESEJO QUE:** após uma avaliação, sejam geradas recomendações de reforço com base nas tags das questões erradas  
**PARA QUE:** o aluno receba sugestões de conteúdo de reforço nos tópicos em que teve dificuldade.

**REGRAS NEGOCIAIS**

- **[RN001]:** A lógica é determinística: analisar respostas erradas, extrair tags dessas questões, buscar conteúdos de reforço (ou nível ≤ do aluno) que tenham essas tags.
- **[RN002]:** Recomendações são criadas em tb_recommendation com reason (ex.: "Dificuldade em frações"), source_type (assessment), source_id (resultado da avaliação).
- **[RN003]:** Não usar IA/NLP no MVP; apenas matching por tags e nível/série/matéria.

**FORA DO ESCOPO**

- Recomendações por análise de texto livre (NLP).
- Recomendações manuais pelo professor nesta story (pode ser outra story).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Após a submissão da avaliação, o sistema chama a geração de recomendações (serviço interno ou POST recommendation/generate) com assessment_result_id e student_id.
- **[CA002]:** O serviço analisa questões erradas, extrai tags, busca conteúdos com `level = 'reforco'` (e nível ≤ do aluno) compatíveis (matéria, série, tags) e cria registros em tb_recommendation com status pending.
- **[CA003]:** O número de recomendações geradas (ou sucesso) pode ser retornado na resposta da submissão da avaliação (ex.: recommendations_generated: 2).

---

### Story 6.4 — Aluno vê recomendações de reforço com justificativa

**EU COMO:** aluno  
**DESEJO QUE:** eu possa ver minhas recomendações de conteúdo de reforço com a justificativa  
**PARA QUE:** eu saiba o que estudar e por que aquele conteúdo foi sugerido.

**REGRAS NEGOCIAIS**

- **[RN001]:** Recomendações têm status: pending, completed, dismissed; a listagem pode filtrar por status (ex.: apenas pendentes).
- **[RN002]:** Cada recomendação exibe: conteúdo sugerido (título, link) e reason (ex.: "Você teve dificuldade em frações").
- **[RN003]:** Apenas o próprio aluno (ou professor/coordenador) pode ver a lista de recomendações do aluno.

**FORA DO ESCOPO**

- Notificação push quando nova recomendação é gerada.
- Ordenação por prioridade (algoritmo de relevância) além da data.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela "Minhas recomendações" que lista recomendações (pendentes por padrão) com título do conteúdo, motivo (reason) e link para abrir o conteúdo.
- **[CA002]:** A API GET recommendation?studentId=... retorna a lista com dados do conteúdo e reason; valida permissão.
- **[CA003]:** O aluno consegue abrir o conteúdo recomendado a partir dessa tela.

---

### Story 6.5 — Aluno marca recomendação como concluída ou descartada

**EU COMO:** aluno  
**DESEJO QUE:** eu possa marcar uma recomendação como concluída ou descartada  
**PARA QUE:** eu organize minha lista e o sistema saiba o que já foi trabalhado.

**REGRAS NEGOCIAIS**

- **[RN001]:** Concluída: aluno estudou o conteúdo; status = completed.
- **[RN002]:** Descartada: aluno optou por não seguir a recomendação; status = dismissed.
- **[RN003]:** Professor ou coordenador também podem marcar em nome do aluno, se a regra permitir.

**FORA DO ESCOPO**

- Reabrir recomendação descartada (mudar de volta para pending).
- Editar o motivo (reason) da recomendação.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Em cada item da lista de recomendações existem ações "Marcar como concluída" e "Descartar" (ou equivalente).
- **[CA002]:** A API expõe PATCH recommendation/:id/complete e PATCH recommendation/:id/dismiss (ou um PATCH com status); atualiza status e updated_at.
- **[CA003]:** Após a ação, o item sai da lista de pendentes (ou passa para aba "Concluídas"/"Descartadas") conforme filtro da tela.

---

### Story 6.6 — Níveis iniciais do aluno criados no cadastro

**EU COMO:** coordenador (ou sistema)  
**DESEJO QUE:** ao cadastrar um aluno, sejam criados automaticamente os níveis iniciais (nível 1) em todas as matérias da sua série  
**PARA QUE:** eu não precise configurar nível por nível manualmente e o aluno já tenha trilha definida.

**REGRAS NEGOCIAIS**

- **[RN001]:** Ao criar um aluno (role student), o sistema deve inserir um registro em tb_student_learning_level para cada matéria (categoria) aplicável à série do aluno, com level = 1.
- **[RN002]:** As matérias podem vir de uma tabela de categorias filtrada por série (ou todas as categorias ativas, conforme modelo de dados).
- **[RN003]:** Essa criação pode ser feita por trigger no banco ou por serviço na aplicação após o INSERT do usuário.

**FORA DO ESCOPO**

- Alteração manual dos níveis iniciais no momento do cadastro (pode ser edição posterior).
- Níveis iniciais diferentes de 1 para alguma matéria.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Ao cadastrar um novo aluno (POST user com role student e current_grade), os registros de nível (tb_student_learning_level) são criados automaticamente com level = 1 para cada matéria.
- **[CA002]:** O aluno, ao fazer login e acessar trilha ou progresso, já vê seu nível 1 em todas as matérias e conteúdos disponíveis conforme a trilha.
- **[CA003]:** Não é necessário nenhum passo manual adicional para "ativar" a trilha do aluno.

---

## ÉPICO 7 — Dashboards

---

### Story 7.1 — Dashboard do aluno (trilha, progresso, recomendações)

**EU COMO:** aluno  
**DESEJO QUE:** eu tenha um dashboard com minha trilha por matéria, progresso e recomendações ativas  
**PARA QUE:** eu tenha uma visão única do que fazer e por onde começar.

**REGRAS NEGOCIAIS**

- **[RN001]:** O dashboard agrega dados já existentes: trilha (conteúdos com status), progresso por matéria (nível e conclusão) e recomendações pendentes.
- **[RN002]:** Tempo de carregamento do dashboard deve ser < 2 segundos (regra não funcional).
- **[RN003]:** Apenas o próprio aluno acessa seu dashboard.

**FORA DO ESCOPO**

- Gráficos elaborados (pode ser evolução).
- Comparativo com colegas.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe página "Dashboard" do aluno que exibe: resumo da trilha por matéria (ou link para trilha), resumo de progresso (nível e % por matéria) e lista de recomendações ativas (com link para o conteúdo).
- **[CA002]:** Os dados vêm dos endpoints documentados (trilha, progress, recommendation); a API valida que o usuário é o próprio aluno.
- **[CA003]:** A interface é clara e permite ir para trilha, progresso detalhado e recomendações em um clique.

---

### Story 7.2 — Tela mínima do professor: lista de alunos com nível e recomendações (MVP)

**EU COMO:** professor  
**DESEJO QUE:** eu possa ver uma lista de alunos (ou filtrada por série) com nível por matéria e recomendações ativas por aluno  
**PARA QUE:** eu acompanhe quem está em cada nível e quais reforços foram sugeridos, sem depender de turmas no MVP.

**REGRAS NEGOCIAIS**

- **[RN001]:** No MVP **não** existe conceito de turma; a lista é de alunos (todos ou filtrados por série/ano).
- **[RN002]:** Dados exibidos por aluno: nome, série e nível por matéria (tb_student_learning_level); lista de recomendações ativas (pending) com reason e conteúdo sugerido.
- **[RN003]:** O professor vê apenas alunos (e matérias que leciona, se aplicável); o coordenador vê todos.

**FORA DO ESCOPO**

- Dashboard por turma, gráficos e alunos em risco (Fase 2 — Story 7.3).
- Edição de notas ou níveis a partir desta tela.
- Gerenciamento de turmas e matrículas (Fase 2).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela (ex.: /dashboard/students) onde o professor/coordenador vê lista de alunos com opção de filtrar por série; cada aluno exibe nível por matéria e lista de recomendações ativas (título do conteúdo, reason).
- **[CA002]:** A API expõe endpoint(s) para listar alunos com níveis (tb_student_learning_level) e recomendações pendentes; valida permissão (professor vê matérias que leciona, coordenador vê todos).
- **[CA003]:** A interface permite identificar rapidamente nível do aluno por matéria e recomendações ativas; sem dependência de turma no MVP.

---

### Story 7.3 — Dashboard do professor por turma (Fase 2)

**EU COMO:** professor  
**DESEJO QUE:** eu possa ver um dashboard por turma com distribuição de níveis e alunos em risco  
**PARA QUE:** eu priorize o acompanhamento e identifique quem precisa de mais apoio.

**REGRAS NEGOCIAIS**

- **[RN001]:** O professor vê apenas turmas em que está vinculado (por matéria).
- **[RN002]:** Dados exibidos: distribuição de alunos por nível (1, 2, 3), lista de alunos em risco (ex.: nível 1 ou avaliações abaixo da média), conteúdos com maior dificuldade.
- **[RN003]:** Fonte dos dados: matrículas, níveis (tb_student_learning_level), resultados de avaliações.

**FORA DO ESCOPO**

- Esta story é Fase 2; no MVP usa-se a tela mínima (Story 7.2).
- Edição de notas ou níveis a partir do dashboard.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela "Dashboard por turma" onde o professor seleciona turma (e opcionalmente matéria) e vê: gráfico ou números de distribuição por nível, lista de alunos em risco e, se aplicável, conteúdos com maior taxa de erro.
- **[CA002]:** A API GET dashboard/teacher/class/:id (ou equivalente) retorna esses dados com validação de permissão (professor da turma ou coordenador).
- **[CA003]:** Os dados são consistentes com o que está em turmas, matrículas, níveis e resultados de avaliações.

---

### Story 7.4 — Dashboard do professor: histórico do aluno (Fase 2)

**EU COMO:** professor  
**DESEJO QUE:** eu possa ver o histórico de um aluno (avaliações, níveis, progresso e recomendações)  
**PARA QUE:** eu dê suporte individual e entenda o percurso do aluno.

**REGRAS NEGOCIAIS**

- **[RN001]:** O professor vê alunos das turmas em que leciona (ou todas as turmas, se for coordenador).
- **[RN002]:** Histórico inclui: avaliações realizadas (data, nota, nível atualizado), nível atual por matéria, progresso na trilha (concluídos/pendentes), recomendações ativas ou recentes.
- **[RN003]:** Acesso somente leitura; não edita dados do aluno nesta tela.

**FORA DO ESCOPO**

- Envio de mensagem ao aluno pelo dashboard.
- Ajuste manual de nível pelo professor (pode ser outra story).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela "Histórico do aluno" acessível a partir da lista de alunos da turma (ou busca por aluno), exibindo avaliações, níveis, progresso e recomendações.
- **[CA002]:** A API GET dashboard/teacher/student/:studentId (ou equivalente) retorna esses dados; valida se o usuário é professor ou coordenador com acesso àquele aluno.
- **[CA003]:** A informação é apresentada de forma organizada (linha do tempo ou seções por tipo).

---

### Story 7.5 — Dashboard do coordenador — visão agregada (Fase 2)

**EU COMO:** coordenador  
**DESEJO QUE:** eu possa ver uma visão agregada por série/ano (turmas, níveis, risco)  
**PARA QUE:** eu tome decisões pedagógicas e aloque recursos onde há mais necessidade.

**REGRAS NEGOCIAIS**

- **[RN001]:** Apenas coordenador acessa esse dashboard.
- **[RN002]:** Dados: estatísticas gerais por série e ano letivo, distribuição de níveis, turmas com maior número de alunos em risco, conteúdos ou avaliações com maior dificuldade.
- **[RN003]:** Filtros por série, ano letivo e, se aplicável, turma.

**FORA DO ESCOPO**

- Relatórios exportáveis (PDF/Excel) nesta story.
- Drill-down até nível de aluno individual (pode ser link para Story 7.4 — histórico do aluno).

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe tela "Dashboard coordenador" com filtros (série, ano letivo) e visão agregada: totais, distribuição de níveis, lista de turmas em risco ou indicadores equivalentes.
- **[CA002]:** A API GET dashboard/coordinator/overview (ou equivalente) retorna os dados agregados; valida role coordenador.
- **[CA003]:** Os números e listas são consistentes com os dados de turmas, matrículas, níveis e avaliações.

---

## ÉPICO 8 — Não Funcionais

---

### Story 8.1 — Acessibilidade WCAG 2.1 AA

**EU COMO:** usuário (especialmente com necessidade de acessibilidade)  
**DESEJO QUE:** a aplicação respeite WCAG 2.1 nível AA (contraste, teclado, leitor de tela)  
**PARA QUE:** eu possa usar o sistema com autonomia, incluindo com leitor de tela e navegação por teclado.

**REGRAS NEGOCIAIS**

- **[RN001]:** Contraste de texto e fundo deve atender aos rácios mínimos definidos em WCAG 2.1 AA.
- **[RN002]:** Todas as funcionalidades principais devem ser acionáveis por teclado (tab, enter, setas).
- **[RN003]:** Elementos interativos e imagens devem ter texto alternativo ou descrição para leitores de tela.

**FORA DO ESCOPO**

- Certificação formal por terceiros.
- Suporte a todos os critérios AAA.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Foi realizada revisão (ou checklist) de acessibilidade nas telas principais: login, dashboard do aluno, trilha, conteúdo, avaliações e formulários críticos.
- **[CA002]:** Navegação por teclado funciona em fluxos principais (login, navegar listas, abrir conteúdo, enviar formulário).
- **[CA003]:** Textos alternativos estão presentes em imagens e ícones significativos; labels associados a campos de formulário.

---

### Story 8.2 — Paginação e performance

**EU COMO:** usuário  
**DESEJO QUE:** listagens grandes sejam paginadas e que as respostas críticas sejam rápidas  
**PARA QUE:** eu tenha boa experiência mesmo com muitos dados.

**REGRAS NEGOCIAIS**

- **[RN001]:** Listagens (conteúdos, usuários, avaliações, alunos, etc.) devem suportar paginação (page, limit) na API e na interface.
- **[RN002]:** Tempos desejados (conforme REGRAS_NEGOCIO_MODULO_PEDAGOGICO): carregamento do dashboard < 2 s, carregamento de conteúdo < 1 s, submissão de avaliação < 3 s.
- **[RN003]:** Respostas de erro (4xx/5xx) devem ser tratadas na interface com mensagem clara.

**FORA DO ESCOPO**

- Otimização avançada de queries (índices, cache) pode ser contínua.
- CDN e otimização de assets estáticos nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Todas as listagens que podem crescer (conteúdos, alunos, avaliações) possuem paginação na API e controles na interface (página atual, total de páginas ou "carregar mais").
- **[CA002]:** Em ambiente de homologação ou produção, os tempos de resposta das rotas críticas (dashboard, conteúdo, submit de avaliação) estão dentro dos limites definidos (ou documentado o motivo de exceção).
- **[CA003]:** A interface exibe loading durante requisições e mensagem de erro quando a API falha.

---

### Story 8.3 — Documentação da API e validação

**EU COMO:** desenvolvedor  
**DESEJO QUE:** as APIs estejam documentadas (ex.: Swagger) e com validação e códigos de erro consistentes  
**PARA QUE:** eu integre e mantenha o sistema com menos ambiguidade.

**REGRAS NEGOCIAIS**

- **[RN001]:** Endpoints públicos e protegidos devem estar documentados (parâmetros, body, respostas de sucesso e erro).
- **[RN002]:** Validação de entrada (body e query) deve ser feita no backend; erros 400 com mensagem clara (ex.: campo obrigatório, formato inválido).
- **[RN003]:** Códigos HTTP e estrutura de resposta (ex.: status, details) devem seguir o padrão definido no projeto.

**FORA DO ESCOPO**

- Documentação de arquitetura interna (código).
- SDK ou clientes gerados automaticamente.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existe documentação da API (Swagger/OpenAPI ou equivalente) com os principais endpoints (auth, users, content, assessment, recommendation, progress, learning-path, etc.) e exemplos de request/response.
- **[CA002]:** Requisições inválidas (campos faltando, tipo errado, UUID inválido) retornam 400 com detalhes; 401/403 para autenticação e autorização.
- **[CA003]:** Há um padrão de resposta de erro (ex.: { error: true, details: "..." }) usado de forma consistente.

---

### Story 8.4 — Testes automatizados em regras críticas

**EU COMO:** equipe de desenvolvimento  
**DESEJO QUE:** existam testes automatizados para regras críticas e endpoints sensíveis  
**PARA QUE:** evitemos regressões ao alterar código (auth, CRUD, nível, trilha).

**REGRAS NEGOCIAIS**

- **[RN001]:** Testes devem cobrir: autenticação (login, token inválido, rota protegida), CRUD principal (usuários, conteúdos conforme permissão), regras de nível e trilha (conteúdo bloqueado, nível após avaliação).
- **[RN002]:** Podem ser testes unitários (serviços, validadores) e de integração (controllers/rotas); cobertura mínima a ser definida pelo time.
- **[RN003]:** Testes devem rodar em pipeline (CI) e não serem ignorados sem justificativa.

**FORA DO ESCOPO**

- Cobertura 100% de todas as linhas.
- Testes E2E em interface gráfica nesta story.

**CRITÉRIOS DE ACEITE**

- **[CA001]:** Existem testes para: login (sucesso e falha), acesso a rota protegida sem token e com token inválido; criação/edição de usuário com validação de role.
- **[CA002]:** Existem testes para regras de conteúdo (professor só cria para matéria que leciona), trilha (reforço não entra) e nível (atualização após avaliação ≥ 70%).
- **[CA003]:** Os testes rodam no CI (ex.: GitHub Actions) e o build falha se os testes falharem.

---

## Resumo para Kanbanize (Módulo Pedagógico)

- **Épicos:** 8 (Autenticação e Usuários; Conteúdos Pedagógicos; Trilha de Aprendizado; Turmas e Matrículas; Avaliações; Progresso e Recomendações; Dashboards; Não Funcionais).
- **Stories:** 40 no total, todas no formato detalhado acima.
- **Escopo MVP (Hackathon):** Épicos 1, 2, 3, 5, 6; Dashboard aluno (7.1) e **tela mínima professor** (7.2). Épico 4 (Turmas e Matrículas) inteiro e Stories 7.3, 7.4, 7.5 são **Fase 2**.

**Sugestão de uso:**

1. Criar um **card de épico** para cada épico.
2. Criar **cards de story** com o bloco completo (EU COMO / DESEJO QUE / PARA QUE / REGRAS NEGOCIAIS / FORA DO ESCOPO / CRITÉRIOS DE ACEITE) no corpo do card.
3. Usar **tags**: `MVP`, `Fase 2`, `Backend`, `Frontend`, `API`, `SPA` — marcar Stories 4.1 a 4.4 e 7.3 a 7.5 como `Fase 2`; 7.1 e 7.2 como `MVP`.
4. Priorizar: Auth e Usuários → Conteúdos + Trilha → Avaliações + Progresso/Recomendações → Dashboard aluno (7.1) e tela mínima professor (7.2); por último Turmas e dashboards completos (Fase 2).

**Documento em evolução.** Escopo: apenas módulo pedagógico. Referências: PITCH_MODULO_PEDAGOGICO.md, REGRAS_NEGOCIO_MODULO_PEDAGOGICO.md. Atualizado em: 2025-01-30.
