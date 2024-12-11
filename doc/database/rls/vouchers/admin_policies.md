# Políticas RLS para Administradores

## Políticas de Consulta
```sql
-- Política para consulta de histórico por admins
CREATE POLICY "admin_historico_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'gestor')
            AND NOT au.suspenso
        )
    );

-- Política para gestão de vouchers por admins
CREATE POLICY "admin_voucher_management_policy" ON vouchers_comuns
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role IN ('admin', 'gestor')
            AND NOT au.suspenso
        )
    );
```

## Notas de Implementação

1. Acesso Administrativo:
   - Admins e gestores precisam estar autenticados
   - Podem visualizar todo o histórico de uso
   - Podem gerenciar vouchers (criar, atualizar, desativar)

2. Restrições:
   - Apenas usuários com perfil adequado
   - Usuário não pode estar suspenso
   - Validação de empresa/setor quando aplicável