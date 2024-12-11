# Políticas RLS para Vouchers Comuns

## Tabela: usuarios (campo voucher)
```sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política de SELECT para voucher comum
CREATE POLICY "usuarios_voucher_select_policy" ON usuarios
    FOR SELECT TO authenticated
    USING (
        -- Usuário pode ver seu próprio voucher
        id = auth.uid()
        OR 
        -- Admins e gestores podem ver todos
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'gestor')
            AND NOT au.suspenso
        )
    );

-- Política de UPDATE para voucher
CREATE POLICY "usuarios_voucher_update_policy" ON usuarios
    FOR UPDATE TO authenticated
    USING (
        -- Apenas sistema pode atualizar voucher
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role = 'system'
        )
    );
```

## Tabela: uso_voucher (registro de uso)
```sql
-- Política de INSERT para uso de voucher comum
CREATE POLICY "uso_voucher_comum_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Apenas sistema pode registrar uso
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role = 'system'
        )
        -- Validações exclusivas via triggers:
        -- - Limite diário de refeições
        -- - Intervalo entre refeições
        -- - Horário permitido para tipo de refeição
        -- - Turno do usuário
    );

-- Política de SELECT para histórico de uso
CREATE POLICY "uso_voucher_comum_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'gestor')
            AND NOT au.suspenso
        )
    );
```

## Notas de Implementação

1. O voucher comum é armazenado diretamente na tabela `usuarios` na coluna `voucher`
2. Apenas o sistema pode atualizar o voucher de um usuário
3. O registro de uso é feito na tabela `uso_voucher`
4. Validações adicionais são implementadas via triggers
5. O histórico de uso pode ser visualizado pelo próprio usuário ou por admins/gestores