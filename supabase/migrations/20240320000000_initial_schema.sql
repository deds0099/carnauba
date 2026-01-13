-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE animal_status AS ENUM ('lactante', 'seca', 'prenhe');
CREATE TYPE producao_periodo AS ENUM ('manha', 'tarde', 'noite');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create animais table
CREATE TABLE animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero TEXT NOT NULL,
    nome TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    raca TEXT NOT NULL,
    data_proximo_parto DATE,
    status animal_status NOT NULL DEFAULT 'lactante',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create producao table
CREATE TABLE producao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data DATE NOT NULL,
    animal_id UUID NOT NULL REFERENCES animais(id),
    periodo producao_periodo NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create reproducao table
CREATE TABLE reproducao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animais(id),
    data_inseminacao DATE NOT NULL,
    data_prevista_parto DATE,
    status TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create relatorios table
CREATE TABLE relatorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    formato TEXT NOT NULL,
    arquivo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES users(id)
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproducao ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view animais" ON animais
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert animais" ON animais
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update animais" ON animais
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete animais" ON animais
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view producao" ON producao
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert producao" ON producao
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update producao" ON producao
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete producao" ON producao
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view reproducao" ON reproducao
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert reproducao" ON reproducao
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update reproducao" ON reproducao
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete reproducao" ON reproducao
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view relatorios" ON relatorios
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert relatorios" ON relatorios
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_animais_numero ON animais(numero);
CREATE INDEX idx_animais_status ON animais(status);
CREATE INDEX idx_producao_data ON producao(data);
CREATE INDEX idx_producao_animal_id ON producao(animal_id);
CREATE INDEX idx_reproducao_animal_id ON reproducao(animal_id);
CREATE INDEX idx_reproducao_data_inseminacao ON reproducao(data_inseminacao);
CREATE INDEX idx_relatorios_tipo ON relatorios(tipo);
CREATE INDEX idx_relatorios_data_inicio ON relatorios(data_inicio); 