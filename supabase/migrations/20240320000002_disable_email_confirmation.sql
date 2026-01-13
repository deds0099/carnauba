-- Desabilitar confirmação de email
UPDATE auth.config
SET confirm_email = false
WHERE id = 1; 