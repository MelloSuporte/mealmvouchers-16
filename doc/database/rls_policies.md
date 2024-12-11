# Row Level Security (RLS) Policies

## Overview
Este documento detalha todas as políticas de Row Level Security (RLS) implementadas no sistema.

## Tabelas com RLS Habilitado

### 1. admin_users
```sql
-- Políticas de Leitura (SELECT)
CREATE POLICY "admin_users_select_policy" ON admin_users
    FOR SELECT TO authenticated
    USING (true);

-- Políticas de Inserção (INSERT)
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

-- Políticas de Atualização (UPDATE)
CREATE POLICY "admin_users_update_policy" ON admin_users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );
```

### 2. usuarios
```sql
-- Políticas de Leitura (SELECT)
CREATE POLICY "usuarios_select_policy" ON usuarios
    FOR SELECT TO authenticated
    USING (true);

-- Políticas de Inserção/Atualização
CREATE POLICY "usuarios_insert_policy" ON usuarios
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "usuarios_update_policy" ON usuarios
    FOR UPDATE TO authenticated
    USING (true);
```

### 3. vouchers_descartaveis
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

-- Políticas de Inserção
CREATE POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' IN ('admin', 'manager')
        )
    );

-- Políticas de Atualização
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' IN ('admin', 'manager')
        )
    );
```

### 4. vouchers_extras
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

-- Políticas de Inserção/Atualização
CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras
    FOR UPDATE TO authenticated
    USING (true);
```

### 5. uso_voucher
```sql
-- Políticas de Leitura
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM vouchers_extras ve
            WHERE ve.id = voucher_id
            AND ve.usuario_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' IN ('admin', 'manager')
        )
    );

-- Políticas de Inserção
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' IN ('admin', 'system')
        )
    );
```

### 6. empresas
```sql
-- Políticas de Leitura
CREATE POLICY "Enable read access for all users" ON empresas
    FOR SELECT TO authenticated
    USING (true);

-- Políticas de Inserção/Atualização/Deleção
CREATE POLICY "Enable insert for authenticated users only" ON empresas
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON empresas
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON empresas
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');
```

### 7. tipos_refeicao
```sql
-- Políticas de Leitura
CREATE POLICY "Enable read access for all users" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);

-- Políticas de Inserção/Atualização/Deleção
CREATE POLICY "Enable insert for authenticated users only" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON tipos_refeicao
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON tipos_refeicao
    FOR DELETE TO authenticated
    USING (true);
```

### 8. turnos
```sql
-- Políticas de Leitura
CREATE POLICY "Enable read access for all users" ON turnos
    FOR SELECT TO public
    USING (true);

-- Políticas de Inserção/Atualização/Deleção
CREATE POLICY "Enable insert for authenticated users only" ON turnos
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON turnos
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON turnos
    FOR DELETE TO authenticated
    USING (true);
```

## Permissões Gerais
```sql
-- Permissões para usuários autenticados
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permissões para usuários anônimos (quando aplicável)
GRANT SELECT ON tipos_refeicao TO anon;
GRANT SELECT ON turnos TO anon;
```

## Notas Importantes

1. **Hierarquia de Permissões**:
   - Administradores têm acesso total ao sistema
   - Gerentes têm acesso limitado a funcionalidades específicas
   - Usuários regulares têm acesso apenas aos seus próprios dados

2. **Segurança**:
   - Todas as tabelas têm RLS habilitado
   - Políticas específicas controlam o acesso baseado em roles e relacionamentos
   - Funções security definer são usadas para operações críticas

3. **Manutenção**:
   - Alterações nas políticas RLS devem ser feitas com cautela
   - Testes de acesso devem ser realizados após modificações
   - Documentação deve ser atualizada quando houver mudanças