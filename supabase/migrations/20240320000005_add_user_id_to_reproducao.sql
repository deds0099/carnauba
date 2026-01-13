-- Adicionar coluna user_id na tabela reproducao
ALTER TABLE reproducao ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Remover políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view reproducao" ON reproducao;
DROP POLICY IF EXISTS "Authenticated users can insert reproducao" ON reproducao;
DROP POLICY IF EXISTS "Authenticated users can update reproducao" ON reproducao;
DROP POLICY IF EXISTS "Authenticated users can delete reproducao" ON reproducao;

-- Adicionar novas políticas para reproducao
CREATE POLICY "Users can view their own data" ON reproducao
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON reproducao
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON reproducao
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON reproducao
    FOR DELETE USING (auth.uid() = user_id);

-- Garantir que a tabela está com RLS habilitado
ALTER TABLE reproducao ENABLE ROW LEVEL SECURITY; 