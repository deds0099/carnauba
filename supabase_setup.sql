-- ============================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA DO SUPABASE
-- Agro Cow Compass System
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Acesse: https://app.supabase.com -> Seu Projeto -> SQL Editor

-- ============================================
-- 1. EXTENSÕES E TIPOS
-- ============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipos ENUM
CREATE TYPE animal_status AS ENUM ('lactante', 'seca', 'prenhe');
CREATE TYPE producao_periodo AS ENUM ('manha', 'tarde', 'noite');

-- ============================================
-- 2. TABELAS PRINCIPAIS
-- ============================================

-- Tabela users (perfil do usuário)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela animais
CREATE TABLE IF NOT EXISTS animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero TEXT NOT NULL,
    nome TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    raca TEXT NOT NULL,
    data_proximo_parto DATE,
    status animal_status NOT NULL DEFAULT 'lactante',
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Tabela producao
CREATE TABLE IF NOT EXISTS producao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data DATE NOT NULL,
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    periodo producao_periodo NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Tabela reproducao
CREATE TABLE IF NOT EXISTS reproducao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animais(id),
    data_inseminacao DATE NOT NULL,
    data_prevista_parto DATE,
    status TEXT NOT NULL,
    observacoes TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Tabela relatorios
CREATE TABLE IF NOT EXISTS relatorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    formato TEXT NOT NULL,
    arquivo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id)
);

-- Tabela alertas
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL,
    animal_id UUID REFERENCES animais(id),
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    resolvido BOOLEAN DEFAULT false,
    prioridade TEXT NOT NULL DEFAULT 'media',
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_animais_numero ON animais(numero);
CREATE INDEX IF NOT EXISTS idx_animais_status ON animais(status);
CREATE INDEX IF NOT EXISTS idx_animais_user_id ON animais(user_id);
CREATE INDEX IF NOT EXISTS idx_producao_data ON producao(data);
CREATE INDEX IF NOT EXISTS idx_producao_animal_id ON producao(animal_id);
CREATE INDEX IF NOT EXISTS idx_producao_user_id ON producao(user_id);
CREATE INDEX IF NOT EXISTS idx_reproducao_animal_id ON reproducao(animal_id);
CREATE INDEX IF NOT EXISTS idx_reproducao_user_id ON reproducao(user_id);
CREATE INDEX IF NOT EXISTS idx_reproducao_data_inseminacao ON reproducao(data_inseminacao);
CREATE INDEX IF NOT EXISTS idx_relatorios_tipo ON relatorios(tipo);
CREATE INDEX IF NOT EXISTS idx_relatorios_data_inicio ON relatorios(data_inicio);
CREATE INDEX IF NOT EXISTS idx_alertas_user_id ON alertas(user_id);
CREATE INDEX IF NOT EXISTS idx_alertas_resolvido ON alertas(resolvido);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproducao ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLÍTICAS DE SEGURANÇA (POLICIES)
-- ============================================

-- Políticas para tabela users
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para tabela animais
DROP POLICY IF EXISTS "Users can view their own data" ON animais;
DROP POLICY IF EXISTS "Users can insert their own data" ON animais;
DROP POLICY IF EXISTS "Users can update their own data" ON animais;
DROP POLICY IF EXISTS "Users can delete their own data" ON animais;

CREATE POLICY "Users can view their own data" ON animais
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON animais
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON animais
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON animais
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela producao
DROP POLICY IF EXISTS "Users can view their own data" ON producao;
DROP POLICY IF EXISTS "Users can insert their own data" ON producao;
DROP POLICY IF EXISTS "Users can update their own data" ON producao;
DROP POLICY IF EXISTS "Users can delete their own data" ON producao;

CREATE POLICY "Users can view their own data" ON producao
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON producao
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON producao
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON producao
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela reproducao
DROP POLICY IF EXISTS "Users can view their own data" ON reproducao;
DROP POLICY IF EXISTS "Users can insert their own data" ON reproducao;
DROP POLICY IF EXISTS "Users can update their own data" ON reproducao;
DROP POLICY IF EXISTS "Users can delete their own data" ON reproducao;

CREATE POLICY "Users can view their own data" ON reproducao
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON reproducao
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON reproducao
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON reproducao
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela relatorios
DROP POLICY IF EXISTS "Users can view their own data" ON relatorios;
DROP POLICY IF EXISTS "Users can insert their own data" ON relatorios;

CREATE POLICY "Users can view their own data" ON relatorios
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own data" ON relatorios
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Políticas para tabela alertas
DROP POLICY IF EXISTS "Users can view their own data" ON alertas;
DROP POLICY IF EXISTS "Users can insert their own data" ON alertas;
DROP POLICY IF EXISTS "Users can update their own data" ON alertas;
DROP POLICY IF EXISTS "Users can delete their own data" ON alertas;

CREATE POLICY "Users can view their own data" ON alertas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON alertas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON alertas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data" ON alertas
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. STORAGE BUCKET PARA RELATÓRIOS
-- ============================================

-- Criar bucket de storage para relatórios
INSERT INTO storage.buckets (id, name, public)
VALUES ('relatorios', 'relatorios', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para relatórios
DROP POLICY IF EXISTS "Users can upload their own reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own reports" ON storage.objects;

CREATE POLICY "Users can upload their own reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'relatorios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'relatorios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'relatorios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 7. CONFIGURAÇÃO DE AUTENTICAÇÃO
-- ============================================

-- Desabilitar confirmação de email (opcional - para desenvolvimento)
-- Descomente a linha abaixo se quiser desabilitar confirmação de email
-- UPDATE auth.config SET confirm_email = false WHERE id = 1;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar este script, todas as tabelas estarão criadas
-- e configuradas com as políticas de segurança adequadas.

