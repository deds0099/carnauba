-- FIX: Tornar a coluna data_inseminacao opcional
-- Execute este script no SQL Editor do Supabase para corrigir o erro "violates not-null constraint"

ALTER TABLE reproducao ALTER COLUMN data_inseminacao DROP NOT NULL;

-- Também garantir que data_prevista_parto seja opcional (caso não seja)
ALTER TABLE reproducao ALTER COLUMN data_prevista_parto DROP NOT NULL;

-- Atualizar comentário para refletir a mudança
COMMENT ON COLUMN reproducao.data_inseminacao IS 'Data da IA (obrigatório apenas para eventos tipo inseminacao)';
