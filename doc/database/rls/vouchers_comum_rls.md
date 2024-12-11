# Políticas RLS para Vouchers Comuns

## Tabela: uso_voucher
```sql
-- Habilitar RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Política de INSERT para uso de voucher comum
CREATE POLICY "uso_voucher_comum_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
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
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );
```

## Notas de Implementação

1. O registro de uso é feito na tabela `uso_voucher`
2. Apenas usuários com permissão 'sistema' podem registrar uso
3. Validações adicionais são implementadas via triggers:
   - Limite diário de refeições
   - Intervalo entre refeições
   - Horário permitido para tipo de refeição
   - Turno do usuário
4. O histórico de uso pode ser visualizado pelo próprio usuário ou por admins/gestores
5. As permissões são verificadas através do campo JSONB 'permissoes' da tabela admin_users