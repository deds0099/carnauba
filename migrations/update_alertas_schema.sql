-- Migração: Adicionar coluna data_resolucao na tabela alertas
-- Execute este script no SQL Editor do Supabase

ALTER TABLE public.alertas 
ADD COLUMN IF NOT EXISTS data_resolucao TIMESTAMP WITH TIME ZONE;

-- Garantir que a tabela alertas existe (caso não exista, cria uma básica para evitar erros futuros)
CREATE TABLE IF NOT EXISTS public.alertas (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    resolvido BOOLEAN DEFAULT FALSE,
    data_resolucao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de segurança (RLS) para alertas
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios alertas" 
ON public.alertas FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios alertas" 
ON public.alertas FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios alertas" 
ON public.alertas FOR UPDATE USING (auth.uid() = user_id);
