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

A solução é um **sistema completo web** composto por:

- um **backend** em Node/Express, exposto como **API REST**; e
- uma **SPA em React** (frontend) que materializa, em telas, todas as regras pedagógicas do módulo.

### 3.1. Backend (API pedagógica)

O backend implementa os fluxos de negócio centrais:

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

### 3.2. Frontend (SPA em React)

O frontend é uma **Single Page Application** em React/TypeScript que consome a API e entrega a experiência para cada persona:

- **Aluno:**
  - Tela de **login** e acesso ao **dashboard do aluno**.
  - Visualização das **trilhas por matéria**, com indicação de conteúdos concluídos, disponíveis, bloqueados e recomendados.
  - Acesso à leitura de conteúdos, marcação de conclusão e participação nas avaliações liberadas.
  - Lista e consumo dos conteúdos de **reforço recomendados** após as avaliações.

- **Professor:**
  - Telas de **gestão de conteúdos** (CRUD de conteúdos pedagógicos com nível, tags e metadados de acessibilidade).
  - Telas de **trilhas de aprendizado** (listagem, criação, edição, reorder de conteúdos na trilha).
  - Telas de **avaliações** (lista, criação, edição de questões, visualização das avaliações disponíveis).
  - **Dashboard do professor**, mostrando alunos (por série) com nível por matéria e recomendações ativas, além de visão analítica por série/matéria/trilha.

- **Coordenador:**
  - Telas de **gestão de usuários** (CRUD de alunos e professores, ativação/inativação).
  - Acesso ao **dashboard do coordenador**, com visão agregada simples do módulo pedagógico (totais, por série e por matéria).

O frontend utiliza **Axios** para comunicação com a API (instâncias pública e autenticada com Bearer token), **React Router** para o fluxo de navegação, **Tailwind CSS** para o design e componentes reutilizáveis para formulários e listagens. O objetivo é tornar visível, de forma simples, tudo o que a lógica pedagógica do backend calcula (nível por matéria, trilhas, avaliações, recomendações).

A solução **não** é um LMS genérico: o diferencial está no **nível por matéria**, nas **recomendações explicáveis por tags**, no **dashboard do professor** focado em equiparação e plano de ação e na integração clara entre backend e SPA para suportar esses fluxos de acompanhamento.

---

## 4. Processo de Desenvolvimento

O processo seguiu as **dicas de organização do hackathon** (Design Thinking → Brainstorming → Desenho da Solução → Desenvolvimento do MVP → Validação Interna → Preparação para o Pitch). As subseções abaixo correspondem a cada uma dessas etapas; preencha com o que a equipe de fato realizou.

---

### 4.1. Sessão de Design Thinking

**Objetivo:** Entender profundamente o problema e criar empatia com professores e professoras.

| Passo                      | O que fazer                                                                                                                                    | Registro da equipe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mapeamento do Problema** | Listar os principais desafios dos professores no ensino público; usar mapa de empatia para imaginar o dia a dia e identificar pontos críticos. | A equipe se reuniu on-line e cada integrante trouxe 5 dores coletadas em entrevistas com professores e professoras da rede pública, registradas em um documento compartilhado. As dores recorrentes incluíram sobrecarga administrativa e falta de tempo pedagógico, dificuldade em atender alunos com diferentes níveis de aprendizagem, falta de inclusão digital e acesso irregular à internet, falta de recursos para inclusão de alunos com deficiência, falhas de comunicação professor–aluno, falta de dados para tomada de decisão pedagógica, pouca adaptação de conteúdo didático, inclusão linguística e desafios específicos com alunos neurodivergentes (TEA, TDAH, dislexia). |
| **Definir a Persona**      | Criar uma persona do “usuário ideal” (ex.: professora do ensino médio com dificuldade em criar materiais ou acompanhar quem está atrasado).    | A persona definida foi **Elizeth**, professora do ensino fundamental em escola pública, com 9 anos de experiência. Sua principal dor é acompanhar alunos com dificuldade de aprendizagem e nivelar o conhecimento da turma; na prática, ela recorre a alunos mais avançados para apoiar colegas com dificuldade. Elizeth deseja identificar essas dificuldades mais rapidamente, acompanhar de perto a evolução dos estudantes e ter recomendações de conteúdos que apoiem o desenvolvimento de cada aluno sem aumentar ainda mais sua carga de trabalho.                                                                                                                                   |
| **Explorar Ideias**        | Levantar hipóteses de como a tecnologia pode ajudar; organizar ideias (ex.: Post-its, Miro, Microsoft Whiteboard).                             | A exploração de ideias partiu fortemente do tema da **inclusão**: inclusão de alunos neurodivergentes (TEA, TDAH, dislexia), inclusão de alunos com deficiência e também da realidade do próprio professor (acessibilidade visual, cognitiva e de tempo). O grupo listou diferentes possibilidades em documento textual e discutiu cada uma, avaliando o que era comum em todos os levantamentos, o que era viável dentro do prazo do hackathon e o que prepararia uma futura versão voltada mais diretamente à acessibilidade. A partir daí, a equipe convergiu para a solução de trilhas com nível por matéria e recomendações baseadas em tags.                                          |

Em síntese, as discussões mostraram que professores e professoras não buscam substituir o que acontece em sala de aula, mas sim uma forma de **complementar** o ensino e acompanhar mais de perto os alunos com dificuldade, reduzindo o tempo gasto na organização manual de materiais e no diagnóstico dessas dificuldades.

**Conexão com o relatório:** O **Problema Identificado** (seção 2) e o **público/valor** em `docs/pitch.md` refletem esse entendimento. Aqui vale documentar _como_ a equipe chegou a esse entendimento (sessões, ferramentas, conclusões).

---

### 4.2. Sessão de Brainstorming

**Objetivo:** Gerar o maior número possível de ideias para resolver o problema.

| Prática sugerida        | Descrição                                                                 | Registro da equipe                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sem julgamento**      | Não julgar ideias na hora da criação; incentivar contribuição de todos.   | Cada integrante fez primeiro um levantamento individual de ideias a partir de entrevistas com professores e professoras, e depois o grupo se reuniu on-line para discutir os achados. Nessa reunião, mediada por Daniel Silva, todos puderam expor suas percepções sobre as dores e oportunidades sem descartar nenhuma hipótese de imediato.                                                                                                                                 |
| **Combinar e melhorar** | Ex.: “E se combinarmos trilha de conteúdos com recomendações por tópico?” | Entre as ideias discutidas, surgiram propostas de mentoria entre pares e de uso de IA para apoio pedagógico. Considerando o tempo de desenvolvimento do hackathon, a equipe decidiu deixar a IA para uma possível versão 2 e combinar o conceito de apoio personalizado com uma abordagem mais viável: recomendações de conteúdo baseadas em tags das questões erradas.                                                                                                       |
| **Mapa Mental**         | Ramificações a partir do problema central.                                | A equipe não chegou a usar formalmente um mapa mental visual; em vez disso, cada integrante selecionou 5 dores principais dentre todas as coletadas nas entrevistas. A partir dessa consolidação (com temas como sobrecarga administrativa, falta de tempo pedagógico, dificuldade de nivelamento, inclusão de alunos com deficiência e neurodivergentes, falta de dados e de adaptação de conteúdo), o grupo identificou as dores que se repetiam em todos os levantamentos. |
| **Crazy 8**             | Cada membro cria 8 ideias rápidas em 8 minutos.                           | A técnica de Crazy 8 não foi aplicada de forma formal, mas houve um momento de “tempestade de ideias” em que as dores e possíveis soluções foram listadas e depuradas rapidamente em documento compartilhado, até chegar ao recorte mais viável para o MVP.                                                                                                                                                                                                                   |

Ao final do brainstorming, os critérios usados para escolher o caminho foram: (1) a dor em comum entre todas as entrevistas — indicando que se trata de um problema real e recorrente —, (2) o impacto potencial na rotina de professores e alunos e (3) a viabilidade de implementação no tempo do hackathon. A equipe concluiu que a melhor forma de ajudar não era apenas oferecer mais conteúdos, mas trabalhar inclusão e acompanhamento: reconhecer que o aluno pode estar bem em algumas matérias e com dificuldade em outras, e usar trilhas e recomendações para apoiar esse nivelamento.

**Conexão:** A **Descrição da Solução** (seção 3) é o resultado da ideia escolhida neste processo. Aqui ficam registradas as alternativas consideradas e os critérios que levaram à solução baseada em trilhas, nível por matéria e recomendações por tags.

---

### 4.3. Desenho da Solução

**Objetivo:** Estruturar a ideia escolhida e planejar a implementação.

| Passo                                           | O que fazer                                                                                         | Registro da equipe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Escolha da Melhor Ideia**                     | Usar critérios: impacto, viabilidade, inovação.                                                     | A combinação de **trilha + nível por matéria + recomendações por tags + dashboards** foi escolhida porque atacava diretamente as dores recorrentes de tempo, nivelamento e inclusão identificadas nas entrevistas. Além de endereçar o problema central, essa abordagem abre espaço para evoluções futuras (como uso de IA e módulos adicionais) sem quebrar o que foi feito. A decisão considerou também a viabilidade de entregar uma versão 1.0 dentro do prazo do hackathon. A escolha foi feita em uma reunião única com todo o grupo, mediada por Daniel Silva, que trouxe um olhar mais técnico e pragmático para o escopo do MVP.                                                                                                                                                                                   |
| **Wireframes / Protótipos de baixa fidelidade** | Desenhar no papel ou em Figma/Adobe XD: fluxo do sistema, telas principais e funcionalidades-chave. | Antes de iniciar a implementação, a equipe fez um levantamento e análise de requisitos e, em seguida, desenhou o fluxo de telas no Figma. Foram prototipados principalmente os fluxos de **professor** e **aluno**, incluindo trilhas, conteúdos, avaliações, recomendações e um dashboard simples. Esses protótipos serviram como guia visual para alinhar o comportamento esperado de cada persona e facilitar a divisão de tarefas no frontend.                                                                                                                                                                                                                                                                                                                                                                          |
| **Arquitetura Técnica**                         | Definir tecnologias e frameworks; estruturar funcionalidades em tarefas para distribuir na equipe.  | A arquitetura técnica foi desenhada com tecnologias já dominadas pelo time: **Node/Express + Prisma + PostgreSQL** no backend e **React + Vite + Tailwind** no frontend. O Prisma foi escolhido para acelerar o desenvolvimento, garantir tipagem forte e simplificar migrations. Após a etapa de requisitos e prototipação, o trabalho foi quebrado em blocos e priorizado: Daniel Silva ficou responsável pela documentação de requisitos, escrita das user stories e desenvolvimento da API; no SPA, Júlio Pontes cuidou das telas de login/logout, listagem de avaliações e dashboard do aluno; Clara Pontes ficou com as telas de trilhas, indicadores e fluxos de navegação/redirecionamento; Guilherme Matos assumiu a tela de conteúdos e leitura de conteúdo; e Lucas Gomes desenvolveu a tela de perfil do aluno. |

Em resumo, a equipe definiu uma arquitetura simples, mas clara, separando bem o backend — onde ficam as regras de negócio e o modelo pedagógico — e o frontend — responsável pela experiência das personas —, com foco em chegar rápido a um MVP demonstrável e coerente com o problema identificado.

**Conexão:** A **Arquitetura** (seção 5.2) e o **Modelo de dados** (5.3) são o resultado desta etapa. Aqui fica registrado o _processo_ de decisão (quem decidiu, quando e com base em quais critérios) e como isso guiou a divisão de trabalho.

---

### 4.4. Desenvolvimento do MVP

**Objetivo:** Construir uma versão mínima funcional que demonstre o valor da solução.

| Estratégia                    | Descrição                                                                                                            | Registro da equipe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Priorizar funcionalidades** | Focar no core: o indispensável para resolver o problema (trilha, nível, avaliações, recomendações, dashboards).      | No backend, a prioridade foi ter uma arquitetura simples e clara, com as regras de negócio e o modelo pedagógico bem definidos para cobrir todos os requisitos do MVP. A implementação da API foi organizada em etapas: (1) migrations, roles e categorias iniciais, (2) autenticação, (3) usuários e perfis, (4) conteúdo pedagógico, (5) trilha de aprendizado, (6) progresso do aluno, (7) avaliações, (8) recomendações, (9) dashboard do aluno e (10) tela mínima do professor. No frontend, a prioridade foi a **visão do aluno** (login, trilhas, conteúdos, avaliações, recomendações, dashboard) para facilitar a demonstração do MVP no pitch. |
| **Divisão de tarefas**        | Separar responsabilidades: front-end, back-end, design, integração; usar Trello, Notion ou similar.                  | A equipe utilizou o **GitHub Projects** associado a cada repositório (backend e frontend), com quadros Kanban contendo colunas como Backlog, Ready, In Progress, In Review e Done. As tarefas foram criadas como issues e vinculadas a branches específicas; cada integrante puxava suas próprias tarefas para desenvolvimento, passando por code review antes de concluir.                                                                                                                                                                                                                                                                              |
| **Desenvolvimento ágil**      | Ciclos curtos de entrega (sprints, entregas parciais).                                                               | A rotina foi próxima de uma esteira de desenvolvimento real, com mini-sprints, reports diários, code reviews frequentes e encontros semanais de alinhamento. Um canal no Discord foi usado para dúvidas, sugestões e decisões rápidas, facilitando a comunicação assíncrona entre as entregas.                                                                                                                                                                                                                                                                                                                                                           |
| **Testes simples**            | Testar a funcionalidade conforme o MVP é construído; garantir que o básico funcione antes de adicionar novo recurso. | Foram utilizados testes automatizados pontuais com **Vitest**, mas o foco principal esteve em testes manuais dos fluxos completos: no backend, executando o roteiro de API (auth, usuários, conteúdos, trilhas, progresso, avaliações, recomendações, dashboards); no frontend, validando o fluxo do aluno (login, navegação pelas trilhas, leitura de conteúdos, realização de avaliações e visualização de recomendações).                                                                                                                                                                                                                             |

Em síntese, a equipe focou primeiro em ter o backend consistente e alinhado às regras de negócio, para depois conectar o essencial do frontend e garantir que os principais fluxos de aluno e professor estivessem funcionando de ponta a ponta antes da apresentação.

**Conexão:** Os **Detalhes Técnicos** (seção 5) descrevem o que foi construído. Aqui documenta-se _como_ o trabalho foi organizado e executado ao longo do desenvolvimento do MVP.

---

### 4.5. Validação Interna e Ajustes

**Objetivo:** Validar o que foi desenvolvido e ajustar antes da apresentação final.

| Prática                          | Descrição                                                                              | Registro da equipe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Testar como usuário**          | Testar o MVP como se fossem professores e professoras (e alunos) utilizando a solução. | No backend, foi feita uma rodada completa de testes das regras de negócio, cobrindo autenticação, criação de usuários com perfis de professor, coordenador e aluno, gestão de conteúdos, trilhas, avaliações, progresso, recomendações e dashboards. Na SPA, o foco principal foi a visão do aluno: login, dashboard, visualização de trilhas e conteúdos de acordo com o ano letivo, realização de avaliações e recebimento de recomendações com base nas respostas erradas. Também foram simulados fluxos de coordenador (criação e administração de usuários) e professor (criar/editar/excluir conteúdos, trilhas e avaliações, além de acompanhar alunos).                                                                                                                                                                                     |
| **Ajustes de interface e fluxo** | Ajustar interface, textos ou fluxo para maior clareza.                                 | Após os testes internos, foram necessários ajustes nas interfaces de professor e coordenador, principalmente relacionados a permissões e visibilidade de ações em cada perfil. Algumas regras dos dashboards do professor foram refinadas para refletir melhor os dados relevantes e houve ajustes no comportamento do backend em relação à marcação de conclusão de conteúdos pelos alunos, garantindo que o progresso e a liberação de avaliações se alinhassem ao fluxo esperado. Tambem ajustamos o acesso a conteudos de reforco para ficar restrito a recomendacoes, a liberacao de avaliacao para exigir conteudos daquele nivel na trilha e a atualizacao de nivel para evitar rebaixamento quando o aluno aprova uma avaliacao de nivel menor. Pequenos ajustes de texto e navegação também foram feitos para tornar o uso mais intuitivo. |

Em resumo, a equipe rodou o fluxo completo como professor, coordenador e aluno, identificando e aplicando ajustes pontuais de interface, permissões e navegação, sem alteração estrutural da solução proposta.

**Conexão:** A **Descrição da Solução** (seção 3) é o que foi validado. Aqui registra-se _o que mudou_ depois dos testes internos e como isso refinou a experiência de uso.

---

### 4.6. Preparação para o Pitch

**Objetivo:** Preparar uma apresentação clara, convincente e visualmente atrativa.

A estrutura sugerida do pitch está alinhada às seções deste relatório:

| Parte do pitch                                                      | Onde está no relatório                                                                                          |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Contextualização** — problema e por que é importante              | Seção 2. Problema Identificado                                                                                  |
| **A Solução** — o que o sistema faz e como ajuda os professores     | Seção 3. Descrição da Solução                                                                                   |
| **Demonstração do MVP** — funcionamento da solução                  | Vídeo do MVP (Links Úteis, seção 6) + roteiro em `docs/api-tests.md` e fluxo em `docs/pitch.md` (seção 5. Demo) |
| **Impacto** — como a ideia impacta positivamente a educação pública | Seção 1. Resumo Executivo (impacto esperado)                                                                    |
| **Próximos passos** — melhorias ou funcionalidades futuras          | Seção 7. Próximos passos                                                                                        |

**Registro da equipe:** O pitch foi apresentado por **Daniel Silva**, que conduziu toda a narrativa: problema e contexto, solução proposta, visão técnica em alto nível, demonstração do MVP e próximos passos. A preparação seguiu as recomendações da FIAP para o hackathon, com três entregáveis principais: um vídeo de pitch (até 8 minutos), um vídeo do MVP em funcionamento (até 8 minutos) e este relatório do projeto. Daniel realizou pelo menos cinco ensaios cronometrados para garantir que a apresentação se mantivesse dentro dos limites de tempo.

Para a demo do MVP, foi seguido um roteiro fixo: primeiro, login como **professor** para criar os dados necessários (conteúdos, trilhas, avaliações) e, em seguida, login como **aluno** para consumir exatamente o que estava disponível para o seu perfil (trilhas, conteúdos, avaliações e recomendações). O MVP rodando em ambiente real foi utilizado na gravação, apoiado por um roteiro escrito em notas para não esquecer nenhum passo crítico. Em síntese, foi montada uma história única alinhada ao relatório, ensaiada com cronômetro e apoiada em um fluxo de demo estável, garantindo que o avaliador pudesse ver o funcionamento completo do módulo pedagógico.

---

## 5. Detalhes Técnicos

### 5.1. Stack

- **Backend:**
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

- **Frontend (SPA):**
  - **Framework:** React 19 + TypeScript
  - **Build/dev:** Vite
  - **Estilos:** Tailwind CSS + tailwindcss-animate
  - **Roteamento:** React Router v7 (rotas públicas/privadas por persona)
  - **HTTP:** Axios (instâncias pública e autenticada com Bearer token)
  - **Formulários/validação:** Formik + Yup / Zod
  - **Internacionalização:** i18next + react-i18next
  - **UI complementar:** Phosphor Icons, editor Markdown (`@uiw/react-md-editor`, `react-markdown`)
  - **Testes e qualidade:** Vitest + Testing Library, ESLint, Prettier, Husky + lint-staged

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

| Item                                 | Link / Observação                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Repositório de código (backend)**  | [`github.com/dfsilvadev/fiap-hackathon`](https://github.com/dfsilvadev/fiap-hackathon)                                                     |
| **Repositório de código (frontend)** | [`github.com/dfsilvadev/fiap-hackathon-spa`](https://github.com/dfsilvadev/fiap-hackathon-spa)                                             |
| **Protótipos visuais (Figma)**       | [`Figma — FIAP Hackathon SPA`](https://www.figma.com/design/aQuxWCx4fiwvHBggasx9jo/Untitled?node-id=0-1&t=4dYWyvEvotc8zAl6-1)              |
| **Vídeo do Pitch**                   | _[Inserir link do drive com o vídeo de pitch, máx. 8 min]_                                                                                 |
| **Vídeo do MVP funcionando**         | _[Inserir link do drive com o vídeo da demo, máx. 8 min]_                                                                                  |
| **Documentação do projeto**          | `docs/pitch.md`, `docs/business-rules.md`, `docs/architecture.md`, `docs/api-tests.md`, `docs/mvp-developer-checklist.md` (no repositório) |

---

## 7. Aprendizados e Próximos Passos

### Aprendizados

Ao longo do hackathon, a equipe consolidou aprendizados em três frentes: técnica, pedagógica e de processo.

- **Técnico:** o uso do Prisma 7 reforçou a importância de um ORM moderno com tipagem forte e migrations organizadas, enquanto a aplicação consistente de Clean Architecture ajudou a manter o backend desacoplado e de fácil manutenção. No frontend, o time aprofundou o domínio do React Router v7 e de estratégias de navegação e permissões por persona, além de integrar a SPA com a API de forma mais madura.
- **Problema pedagógico:** as entrevistas com professores e professoras reforçaram a importância de **nivelar o conhecimento por matéria**, evitando que alunos avancem de ano com lacunas pontuais não tratadas. Também ficou claro que inclusão (alunos com deficiência, alunos neurodivergentes e diferentes contextos de acesso) é um tema muito discutido na escola pública, mas ainda pouco tratado na prática; a solução precisa apoiar o nivelamento real do conhecimento, independentemente da necessidade de cada aluno.
- **Processo:** o uso de mini-sprints, Kanban (GitHub Projects) e code reviews frequentes funcionou bem para organizar o trabalho em um período curto, oferecendo visibilidade das tarefas e qualidade no código entregue. Como melhoria futura, a equipe destaca que poderia organizar ainda mais as etapas desde o Design Thinking até o desenvolvimento, otimizando o tempo e permitindo dedicar mais foco ao frontend e à experiência das personas.

### Próximos passos

- **Turmas e matrículas:** evoluir o modelo de dados com `tb_class`, `tb_enrollment` e vínculo professor–turma–matéria; adaptar os dashboards para permitir filtro e acompanhamento por turma, aproximando ainda mais o sistema da realidade das escolas.
- **Dashboards avançados:** incluir gráficos de distribuição por nível, indicadores de “alunos em risco”, heatmaps de tópicos com maior dificuldade e comparativos por série/turma/matéria, combinando novas consultas no backend com visualizações mais ricas no frontend.
- **Múltiplas trilhas e personalização:** suportar múltiplas trilhas por matéria/série (ex.: trilha padrão, trilha de reforço, trilha avançada) e permitir trilhas personalizadas por turma ou perfil de aluno, com telas específicas para gestão dessas trilhas no frontend.
- **Questões dissertativas e avaliação qualitativa:** permitir questões dissertativas corrigidas pelo professor, registrando comentários e evidências qualitativas de aprendizagem, e integrar esses dados ao sistema de recomendações (por tags ou categorias de erro).
- **Ajuste manual de nível:** oferecer ao professor ferramentas para ajustar manualmente o nível do aluno por matéria, com histórico de alterações e justificativas, respeitando tanto os resultados das avaliações automáticas quanto o julgamento profissional do docente.
- **Acessibilidade e inclusão digital:** aprofundar recursos de acessibilidade na SPA (contraste, navegação por teclado, suporte a leitores de tela, opções de tamanho de fonte e foco), além de trabalhar variações de layout e linguagem para diferentes perfis de alunos.
- **IA para apoio pedagógico:** na Fase 2, evoluir do modelo determinístico de recomendações por tags para um modelo híbrido com IA generativa e modelos de classificação, capaz de sugerir conteúdos de reforço personalizados, resumir lacunas de aprendizagem por aluno/turma e apoiar o professor com rascunhos de planos de aula e materiais complementares baseados nas dificuldades identificadas.
- **Integrações externas:** quando houver APIs ou convenções de dados disponíveis, integrar com sistemas já utilizados na rede pública (ex.: diário de classe, secretaria escolar) para reduzir retrabalho e enriquecer os dados de acompanhamento.
