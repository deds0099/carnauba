-- Adicionar coluna user_id nas tabelas
ALTER TABLE animais ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE producao ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE alertas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Atualizar registros existentes (opcional, se necessário)
-- UPDATE animais SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE producao SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE alertas SET user_id = auth.uid() WHERE user_id IS NULL;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own data" ON animais;
DROP POLICY IF EXISTS "Users can insert their own data" ON animais;
DROP POLICY IF EXISTS "Users can update their own data" ON animais;
DROP POLICY IF EXISTS "Users can delete their own data" ON animais;

DROP POLICY IF EXISTS "Users can view their own data" ON producao;
DROP POLICY IF EXISTS "Users can insert their own data" ON producao;
DROP POLICY IF EXISTS "Users can update their own data" ON producao;
DROP POLICY IF EXISTS "Users can delete their own data" ON producao;

DROP POLICY IF EXISTS "Users can view their own data" ON alertas;
DROP POLICY IF EXISTS "Users can insert their own data" ON alertas;
DROP POLICY IF EXISTS "Users can update their own data" ON alertas;
DROP POLICY IF EXISTS "Users can delete their own data" ON alertas;

-- Adicionar novas políticas para animais
CREATE POLICY "Users can view their own data" ON animais
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON animais
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON animais
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON animais
    FOR DELETE USING (auth.uid() = user_id);

-- Adicionar novas políticas para produção
CREATE POLICY "Users can view their own data" ON producao
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON producao
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON producao
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON producao
    FOR DELETE USING (auth.uid() = user_id);

-- Adicionar novas políticas para alertas
CREATE POLICY "Users can view their own data" ON alertas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON alertas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON alertas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON alertas
    FOR DELETE USING (auth.uid() = user_id);

-- Garantir que as tabelas estão com RLS habilitado
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY; 