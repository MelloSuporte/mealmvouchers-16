-- Criar bucket para logos se não existir
DO $$
BEGIN
    -- Criar bucket logos
    PERFORM storage.create_bucket('logos', {'public': true});
EXCEPTION
    WHEN others THEN
        NULL;
END $$;

-- Permitir acesso público ao bucket logos
CREATE POLICY "Permitir acesso público aos logos" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'logos');

-- Permitir upload de logos para usuários autenticados
CREATE POLICY "Permitir upload de logos" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'logos');