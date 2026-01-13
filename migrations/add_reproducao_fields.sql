-- Migração: Adicionar campos para sistema completo de manejo reprodutivo
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar novas colunas
ALTER TABLE reproducao
ADD COLUMN IF NOT EXISTS tipo_evento VARCHAR DEFAULT 'inseminacao',
ADD COLUMN IF NOT EXISTS touro VARCHAR,
ADD COLUMN IF NOT EXISTS tecnico VARCHAR,
ADD COLUMN IF NOT EXISTS protocolo VARCHAR,
ADD COLUMN IF NOT EXISTS data_diagnostico DATE,
ADD COLUMN IF NOT EXISTS resultado_diagnostico VARCHAR,
ADD COLUMN IF NOT EXISTS data_parto_real DATE,
ADD COLUMN IF NOT EXISTS data_secagem DATE,
ADD COLUMN IF NOT EXISTS dias_gestacao INTEGER,
ADD COLUMN IF NOT EXISTS observacoes_parto TEXT;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_reproducao_animal_id ON reproducao(animal_id);
CREATE INDEX IF NOT EXISTS idx_reproducao_user_id ON reproducao(user_id);
CREATE INDEX IF NOT EXISTS idx_reproducao_data_inseminacao ON reproducao(data_inseminacao);
CREATE INDEX IF NOT EXISTS idx_reproducao_status ON reproducao(status);

-- 3. Comentários para documentação
COMMENT ON COLUMN reproducao.tipo_evento IS 'Tipo: inseminacao, diagnostico, parto, secagem';
COMMENT ON COLUMN reproducao.status IS 'Status: pendente, prenhe, vazia, parto, seca';
COMMENT ON COLUMN reproducao.resultado_diagnostico IS 'Resultado: prenhe, vazia';

-- 4. Verificar se a migração foi bem-sucedida
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'reproducao'
ORDER BY ordinal_position;
