-- Drop existing policies
DROP POLICY IF EXISTS "logs_sistema_insert_policy" ON logs_sistema;
DROP POLICY IF EXISTS "logs_sistema_select_policy" ON logs_sistema;
DROP POLICY IF EXISTS "logs_sistema_delete_policy" ON logs_sistema;
DROP POLICY IF EXISTS "logs_sistema_update_policy" ON logs_sistema;

-- Disable RLS temporarily
ALTER TABLE logs_sistema DISABLE ROW LEVEL SECURITY;

-- Create function to handle log insertion
CREATE OR REPLACE FUNCTION public.insert_system_log(
    p_tipo text,
    p_mensagem text,
    p_detalhes jsonb DEFAULT '{}'::jsonb,
    p_nivel text DEFAULT 'info'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO logs_sistema (
        tipo,
        mensagem,
        detalhes,
        nivel,
        criado_em
    ) VALUES (
        p_tipo,
        p_mensagem,
        p_detalhes,
        p_nivel,
        CURRENT_TIMESTAMP
    );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.insert_system_log TO authenticated, anon;

-- Enable RLS
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Create policies that allow the function to work
CREATE POLICY "allow_insert_through_function" ON logs_sistema
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON logs_sistema TO authenticated, anon;