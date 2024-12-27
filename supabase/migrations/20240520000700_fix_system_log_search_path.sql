-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.insert_system_log;

-- Recreate the function with proper search_path
CREATE OR REPLACE FUNCTION public.insert_system_log(
    p_tipo text,
    p_mensagem text,
    p_dados jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO logs_sistema (tipo, mensagem, dados)
    VALUES (p_tipo, p_mensagem, p_dados);
END;
$$;

-- Set proper permissions
REVOKE ALL ON FUNCTION public.insert_system_log FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_system_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_system_log TO anon;

-- Add function documentation
COMMENT ON FUNCTION public.insert_system_log IS 'Insere um registro de log no sistema com search_path seguro';