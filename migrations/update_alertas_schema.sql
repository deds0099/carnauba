-- Migração: Corrigir tipo da coluna ID e adicionar data_resolucao
-- Execute este script no SQL Editor do Supabase

-- Deletamos a tabela antiga para recriar com o tipo correto (TEXT em vez de UUID)
DROP TABLE IF EXISTS public.alertas;

CREATE TABLE public.alertas (
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
