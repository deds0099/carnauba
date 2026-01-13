-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

-- Adicionar novas políticas
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Garantir que a tabela users está com RLS habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 