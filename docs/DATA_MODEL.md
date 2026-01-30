# Modelo de Dados - Sistema de Acompanhamento Pedagógico

## 1. EXPANSÃO DE ENTIDADES EXISTENTES

### 1.1. tb_user (Expandida)

```sql
-- Campos existentes mantidos
-- Novos campos para suportar aluno:
ALTER TABLE tb_user ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE tb_user ADD COLUMN IF NOT EXISTS current_grade VARCHAR(10); -- Ex: "7º ano", "8º ano"
ALTER TABLE tb_user ADD COLUMN IF NOT EXISTS guardians JSONB; -- Array de responsáveis
-- Exemplo de guardians:
-- [{"name": "Maria Silva", "phone": "+5511999999999", "email": "maria@email.com", "relationship": "mãe"}]

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_tb_user_current_grade ON tb_user(current_grade);
CREATE INDEX IF NOT EXISTS idx_tb_user_role_id_grade ON tb_user(role_id, current_grade);
```

### 1.2. tb_category (Mantida)

- Já existe e representa as matérias/disciplinas
- Usada como FK em várias novas entidades

---

## 2. NOVAS ENTIDADES

### 2.1. tb_content (Conteúdo)

> **MVP (REGRAS_NEGOCIO_MODULO_PEDAGOGICO):** A ordem de aprendizado é definida na **trilha**, em `tb_learning_path_content.order_number`. O campo `order_number` em `tb_content` pode ser removido ou ignorado no MVP.

```sql
CREATE TABLE IF NOT EXISTS tb_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content_text TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES tb_category(id),
    grade VARCHAR(10) NOT NULL, -- Série/ano: "7º ano", "8º ano"
    level VARCHAR(20) NOT NULL CHECK (level IN ('1', '2', '3', 'reforco')), -- Nível de aprendizagem
    order_number INTEGER NOT NULL, -- Ordem de aprendizado dentro do nível (MVP: ver nota acima; ordem efetiva na trilha)
    user_id UUID NOT NULL REFERENCES tb_user(id), -- Professor criador
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Campos de acessibilidade
    topics JSONB, -- Array de tópicos/seções: [{"title": "Tópico 1", "content": "..."}]
    glossary JSONB, -- Legendas para palavras difíceis: [{"word": "fração", "definition": "..."}]
    accessibility_metadata JSONB, -- Metadados: {"suitable_for": ["TDAH", "TEA", "dislexia"], "reading_time_minutes": 10, "complexity": "low"}

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint (MVP): ordem única por (série, matéria, nível)
    CONSTRAINT unique_content_order UNIQUE (category_id, grade, level, order_number)
);

CREATE INDEX idx_tb_content_category_grade ON tb_content(category_id, grade);
CREATE INDEX idx_tb_content_level ON tb_content(level);
CREATE INDEX idx_tb_content_user_id ON tb_content(user_id);
CREATE INDEX idx_tb_content_is_active ON tb_content(is_active);
```

### 2.2. tb_class (Turma)

```sql
CREATE TABLE IF NOT EXISTS tb_class (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- Ex: "7A", "8B"
    grade VARCHAR(10) NOT NULL, -- Série/ano
    shift VARCHAR(20) NOT NULL CHECK (shift IN ('manha', 'tarde', 'noite', 'integral')),
    school_year VARCHAR(9) NOT NULL, -- Ex: "2024-2025"
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tb_class_grade ON tb_class(grade);
CREATE INDEX idx_tb_class_school_year ON tb_class(school_year);
CREATE INDEX idx_tb_class_is_active ON tb_class(is_active);
```

### 2.3. tb_enrollment (Matrícula - Aluno em Turma)

```sql
CREATE TABLE IF NOT EXISTS tb_enrollment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES tb_user(id),
    class_id UUID NOT NULL REFERENCES tb_class(id),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'transferido')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_student_class UNIQUE (student_id, class_id)
);

CREATE INDEX idx_tb_enrollment_student_id ON tb_enrollment(student_id);
CREATE INDEX idx_tb_enrollment_class_id ON tb_enrollment(class_id);
CREATE INDEX idx_tb_enrollment_status ON tb_enrollment(status);
```

### 2.4. tb_class_teacher_subject (Professor leciona Matéria em Turma)

```sql
CREATE TABLE IF NOT EXISTS tb_class_teacher_subject (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES tb_class(id),
    teacher_id UUID NOT NULL REFERENCES tb_user(id),
    category_id UUID NOT NULL REFERENCES tb_category(id), -- Matéria
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_class_teacher_subject UNIQUE (class_id, teacher_id, category_id)
);

CREATE INDEX idx_tb_class_teacher_subject_class ON tb_class_teacher_subject(class_id);
CREATE INDEX idx_tb_class_teacher_subject_teacher ON tb_class_teacher_subject(teacher_id);
CREATE INDEX idx_tb_class_teacher_subject_category ON tb_class_teacher_subject(category_id);
```

### 2.5. tb_student_learning_level (Nível de Aprendizagem do Aluno por Matéria)

```sql
CREATE TABLE IF NOT EXISTS tb_student_learning_level (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES tb_user(id),
    category_id UUID NOT NULL REFERENCES tb_category(id), -- Matéria
    level VARCHAR(20) NOT NULL CHECK (level IN ('1', '2', '3')), -- Nível atual (1, 2 ou 3)
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_student_category_level UNIQUE (student_id, category_id)
);

CREATE INDEX idx_tb_student_learning_level_student ON tb_student_learning_level(student_id);
CREATE INDEX idx_tb_student_learning_level_category ON tb_student_learning_level(category_id);
CREATE INDEX idx_tb_student_learning_level_level ON tb_student_learning_level(level);
```

### 2.6. tb_assessment (Avaliação)

```sql
CREATE TABLE IF NOT EXISTS tb_assessment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES tb_category(id), -- Matéria
    level VARCHAR(20) NOT NULL CHECK (level IN ('1', '2', '3')), -- Nível avaliado
    content_id UUID REFERENCES tb_content(id), -- Opcional: avaliação específica de conteúdo
    teacher_id UUID NOT NULL REFERENCES tb_user(id),
    min_score DECIMAL(5,2) NOT NULL DEFAULT 70.00, -- Pontuação mínima para aprovação (%)
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP, -- Opcional: prazo de entrega
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tb_assessment_category_level ON tb_assessment(category_id, level);
CREATE INDEX idx_tb_assessment_teacher_id ON tb_assessment(teacher_id);
CREATE INDEX idx_tb_assessment_content_id ON tb_assessment(content_id);
CREATE INDEX idx_tb_assessment_is_active ON tb_assessment(is_active);
```

### 2.7. tb_question (Questão da Avaliação)

```sql
CREATE TABLE IF NOT EXISTS tb_question (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES tb_assessment(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'text')),
    options JSONB, -- Para multiple_choice: ["Opção A", "Opção B", "Opção C", "Opção D"]
    correct_answer TEXT NOT NULL, -- Resposta correta
    points DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    tags JSONB, -- Tópicos relacionados: ["frações", "operações básicas"]
    order_number INTEGER NOT NULL, -- Ordem da questão na avaliação
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tb_question_assessment_id ON tb_question(assessment_id);
CREATE INDEX idx_tb_question_order ON tb_question(assessment_id, order_number);
```

### 2.8. tb_student_answer (Resposta do Aluno)

```sql
CREATE TABLE IF NOT EXISTS tb_student_answer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES tb_user(id),
    assessment_id UUID NOT NULL REFERENCES tb_assessment(id),
    question_id UUID NOT NULL REFERENCES tb_question(id),
    answer_text TEXT NOT NULL, -- Resposta do aluno
    is_correct BOOLEAN NOT NULL,
    points_earned DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_student_question_answer UNIQUE (student_id, question_id)
);

CREATE INDEX idx_tb_student_answer_student_assessment ON tb_student_answer(student_id, assessment_id);
CREATE INDEX idx_tb_student_answer_question ON tb_student_answer(question_id);
CREATE INDEX idx_tb_student_answer_is_correct ON tb_student_answer(is_correct);
```

### 2.9. tb_assessment_result (Resultado da Avaliação)

```sql
CREATE TABLE IF NOT EXISTS tb_assessment_result (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES tb_user(id),
    assessment_id UUID NOT NULL REFERENCES tb_assessment(id),
    total_score DECIMAL(10,2) NOT NULL, -- Pontos obtidos
    max_score DECIMAL(10,2) NOT NULL, -- Pontos totais possíveis
    percentage DECIMAL(5,2) NOT NULL, -- Porcentagem
    level_updated BOOLEAN NOT NULL DEFAULT false, -- Nível foi atualizado após esta avaliação?
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_student_assessment_result UNIQUE (student_id, assessment_id)
);

CREATE INDEX idx_tb_assessment_result_student ON tb_assessment_result(student_id);
CREATE INDEX idx_tb_assessment_result_assessment ON tb_assessment_result(assessment_id);
CREATE INDEX idx_tb_assessment_result_percentage ON tb_assessment_result(percentage);
```

### 2.10. tb_recommendation (Recomendação de Conteúdo)

```sql
CREATE TABLE IF NOT EXISTS tb_recommendation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES tb_user(id),
    content_id UUID NOT NULL REFERENCES tb_content(id),
    reason TEXT NOT NULL, -- Explicação: "Você teve dificuldade em frações"
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('assessment', 'manual', 'system')),
    source_id UUID, -- ID da avaliação que gerou (se source_type = 'assessment')
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tb_recommendation_student ON tb_recommendation(student_id);
CREATE INDEX idx_tb_recommendation_content ON tb_recommendation(content_id);
CREATE INDEX idx_tb_recommendation_status ON tb_recommendation(status);
```

### 2.11. tb_student_progress (Progresso do Aluno em Conteúdo)

```sql
CREATE TABLE IF NOT EXISTS tb_student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES tb_user(id),
    content_id UUID NOT NULL REFERENCES tb_content(id),
    status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER, -- Tempo em minutos (opcional)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_student_content_progress UNIQUE (student_id, content_id)
);

CREATE INDEX idx_tb_student_progress_student ON tb_student_progress(student_id);
CREATE INDEX idx_tb_student_progress_content ON tb_student_progress(content_id);
CREATE INDEX idx_tb_student_progress_status ON tb_student_progress(status);
```

---

## 3. TRIGGERS E FUNÇÕES

### 3.1. Trigger para atualizar updated_at

```sql
-- Aplicar trigger set_updated_at() existente em todas as novas tabelas
CREATE TRIGGER trg_tb_content_updated_at BEFORE UPDATE ON tb_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_class_updated_at BEFORE UPDATE ON tb_class FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_enrollment_updated_at BEFORE UPDATE ON tb_enrollment FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_class_teacher_subject_updated_at BEFORE UPDATE ON tb_class_teacher_subject FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_student_learning_level_updated_at BEFORE UPDATE ON tb_student_learning_level FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_assessment_updated_at BEFORE UPDATE ON tb_assessment FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_question_updated_at BEFORE UPDATE ON tb_question FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_recommendation_updated_at BEFORE UPDATE ON tb_recommendation FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tb_student_progress_updated_at BEFORE UPDATE ON tb_student_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 3.2. Função para atualizar nível de aprendizagem após avaliação

```sql
CREATE OR REPLACE FUNCTION update_student_learning_level()
RETURNS TRIGGER AS $$
DECLARE
    assessment_level VARCHAR(20);
    assessment_category_id UUID;
    current_level VARCHAR(20);
    new_level VARCHAR(20);
BEGIN
    -- Buscar nível e matéria da avaliação
    SELECT a.level, a.category_id INTO assessment_level, assessment_category_id
    FROM tb_assessment a
    WHERE a.id = NEW.assessment_id;

    -- Buscar nível atual do aluno naquela matéria
    SELECT level INTO current_level
    FROM tb_student_learning_level
    WHERE student_id = NEW.student_id AND category_id = assessment_category_id;

    -- Se não existe nível, criar com nível 1
    IF current_level IS NULL THEN
        INSERT INTO tb_student_learning_level (student_id, category_id, level)
        VALUES (NEW.student_id, assessment_category_id, '1')
        ON CONFLICT (student_id, category_id) DO NOTHING;
        current_level := '1';
    END IF;

    -- Regra: Se aluno atingiu >= 70% e nível da avaliação >= nível atual, atualizar
    IF NEW.percentage >= 70.00 THEN
        IF assessment_level::INTEGER >= current_level::INTEGER THEN
            new_level := assessment_level;
        ELSE
            new_level := current_level;
        END IF;
    ELSE
        -- Se não atingiu 70%, manter nível atual ou reduzir se necessário
        new_level := current_level;
    END IF;

    -- Atualizar nível do aluno
    UPDATE tb_student_learning_level
    SET level = new_level, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = NEW.student_id AND category_id = assessment_category_id;

    -- Marcar que nível foi atualizado
    NEW.level_updated := (new_level != current_level);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_learning_level
AFTER INSERT ON tb_assessment_result
FOR EACH ROW
EXECUTE FUNCTION update_student_learning_level();
```

---

## 4. RELACIONAMENTOS (Diagrama Conceitual)

```
tb_user (aluno)
    ├── tb_enrollment ──> tb_class (turma)
    ├── tb_student_learning_level ──> tb_category (matéria)
    ├── tb_student_progress ──> tb_content
    ├── tb_student_answer ──> tb_question ──> tb_assessment
    └── tb_assessment_result ──> tb_assessment
    └── tb_recommendation ──> tb_content

tb_user (professor)
    ├── tb_content (criador)
    ├── tb_assessment (criador)
    └── tb_class_teacher_subject ──> tb_class + tb_category

tb_content
    ├── tb_category (matéria)
    └── tb_user (professor criador)

tb_assessment
    ├── tb_category (matéria)
    ├── tb_content (opcional - avaliação específica)
    └── tb_user (professor criador)

tb_class
    ├── tb_enrollment ──> tb_user (alunos)
    └── tb_class_teacher_subject ──> tb_user (professores) + tb_category (matérias)
```

---

## 5. QUERIES ÚTEIS

### 5.1. Buscar conteúdos ordenados para aluno

```sql
SELECT
    c.*,
    cat.name as category_name,
    u.name as teacher_name
FROM tb_content c
INNER JOIN tb_category cat ON c.category_id = cat.id
INNER JOIN tb_user u ON c.user_id = u.id
WHERE c.grade = :student_grade
  AND c.category_id = :category_id
  AND c.is_active = true
ORDER BY c.level ASC, c.order_number ASC;
```

### 5.2. Buscar recomendações para aluno

```sql
SELECT
    r.*,
    c.title as content_title,
    c.level as content_level,
    cat.name as category_name
FROM tb_recommendation r
INNER JOIN tb_content c ON r.content_id = c.id
INNER JOIN tb_category cat ON c.category_id = cat.id
WHERE r.student_id = :student_id
  AND r.status = 'pending'
ORDER BY r.created_at DESC;
```

### 5.3. Dashboard do professor - alunos em risco

```sql
SELECT
    u.id,
    u.name,
    u.email,
    sll.category_id,
    cat.name as category_name,
    sll.level,
    COUNT(DISTINCT ar.id) as failed_assessments_count
FROM tb_user u
INNER JOIN tb_student_learning_level sll ON u.id = sll.student_id
INNER JOIN tb_category cat ON sll.category_id = cat.id
INNER JOIN tb_class_teacher_subject cts ON cts.category_id = cat.id
LEFT JOIN tb_assessment_result ar ON ar.student_id = u.id AND ar.percentage < 70
WHERE cts.teacher_id = :teacher_id
  AND sll.level = '1'
GROUP BY u.id, u.name, u.email, sll.category_id, cat.name, sll.level
ORDER BY failed_assessments_count DESC;
```

---

**Documento em constante evolução - Atualizado em: 2025-01-XX**
