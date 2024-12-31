# Políticas RLS para Vouchers

## Tabela: vouchers_descartaveis

```sql
-- Políticas de Leitura
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (
        NOT usado OR 
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' IN ('admin', 'manager')
        )
    );
```

## Tabela: vouchers_extras

```sql
-- Políticas de Leitura
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' IN ('admin', 'manager')
        )
    );
```

## Notas de Implementação

1. Vouchers não usados são visíveis para todos
2. Histórico de uso visível apenas para proprietário
3. Admins e gerentes podem ver todos os vouchers
4. PDF de vouchers ativos pode ser baixado por usuários autenticados
5. Geração de novos vouchers restrita a admins/gestores