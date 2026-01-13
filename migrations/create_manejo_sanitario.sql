-- Tabela para registro de manejo sanitário (vacinas, vermífugos, medicamentos)
CREATE TABLE IF NOT EXISTS public.manejo_sanitario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
    data_aplicacao DATE NOT NULL,
    nome_vacina TEXT NOT NULL,
    lote TEXT,
    dose TEXT,
    responsavel TEXT,
    observacoes TEXT,
    proxima_dose DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_manejo_sanitario_user_id ON public.manejo_sanitario(user_id);
CREATE INDEX IF NOT EXISTS idx_manejo_sanitario_animal_id ON public.manejo_sanitario(animal_id);
CREATE INDEX IF NOT EXISTS idx_manejo_sanitario_data ON public.manejo_sanitario(data_aplicacao);

-- Políticas de segurança (RLS)
ALTER TABLE public.manejo_sanitario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios registros sanitários"
    ON public.manejo_sanitario
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar registros sanitários"
    ON public.manejo_sanitario
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros sanitários"
    ON public.manejo_sanitario
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros sanitários"
    ON public.manejo_sanitario
    FOR DELETE
    USING (auth.uid() = user_id);
