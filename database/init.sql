CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL CHECK (char_length(trim(titulo)) >= 3),
  descricao TEXT NOT NULL CHECK (char_length(trim(descricao)) BETWEEN 5 AND 2000),
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('Rede','Hardware','Software','Impressora','Acesso','Outros')),
  prioridade VARCHAR(10) NOT NULL CHECK (prioridade IN ('Baixa','Média','Alta','Crítica')),
  status VARCHAR(20) NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto','Em atendimento','Resolvido')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
