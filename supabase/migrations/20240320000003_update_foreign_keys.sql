-- Remover a restrição existente
ALTER TABLE producao
DROP CONSTRAINT IF EXISTS producao_animal_id_fkey;

-- Adicionar a nova restrição com ON DELETE CASCADE
ALTER TABLE producao
ADD CONSTRAINT producao_animal_id_fkey
FOREIGN KEY (animal_id)
REFERENCES animais(id)
ON DELETE CASCADE; 