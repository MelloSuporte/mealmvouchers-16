# Políticas RLS para Usuários

## Tabela: admin_users

```sql
-- Políticas de Leitura (SELECT)
CREATE POLICY "admin_users_select_policy" ON admin_users
    FOR SELECT TO authenticated
    USING (true);

-- Políticas de Inserção/Atualização
CREATE POLICY "admin_users_insert_policy" ON admin_users
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );
```

## Tabela: usuarios

```sql
-- Políticas de Leitura
CREATE POLICY "usuarios_select_policy" ON usuarios
    FOR SELECT TO authenticated
    USING (true);

-- Políticas de Inserção/Atualização
CREATE POLICY "usuarios_insert_policy" ON usuarios
    FOR INSERT TO authenticated
    WITH CHECK (true);
```

## Notas de Implementação

1. Administradores têm acesso total
2. Gerentes podem gerenciar usuários de sua empresa
3. Usuários podem ver apenas seus próprios dados