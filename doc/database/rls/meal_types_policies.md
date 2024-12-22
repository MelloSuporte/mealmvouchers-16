# Políticas RLS para Tipos de Refeição

## Tabela: tipos_refeicao

### Políticas de Acesso

```sql
-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (SELECT)
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);

-- Políticas de Inserção (INSERT)
CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_refeicoes' = 'true'
            AND NOT au.suspenso
        )
    );

-- Políticas de Atualização (UPDATE)
CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_refeicoes' = 'true'
            AND NOT au.suspenso
        )
    );

-- Políticas de Deleção (DELETE)
CREATE POLICY "tipos_refeicao_delete_policy" ON tipos_refeicao
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_refeicoes' = 'true'
            AND NOT au.suspenso
        )
    );
```

### Regras de Negócio

1. **Acesso à Leitura**
   - Qualquer usuário (autenticado ou anônimo) pode visualizar os tipos de refeição

2. **Inserção de Dados**
   - Apenas administradores podem inserir novos tipos de refeição
   - Gestores com permissões específicas também podem inserir

3. **Atualização de Dados**
   - Apenas administradores podem atualizar tipos de refeição
   - Gestores com permissões específicas também podem atualizar

4. **Exclusão de Dados**
   - Apenas administradores podem excluir tipos de refeição
   - Gestores com permissões específicas também podem excluir

5. **Regras de Uso de Vouchers**
   - As faixas de horários devem ser respeitadas durante o uso dos vouchers
   - Cada usuário pode usar somente um voucher por tipo de refeição
   - Limite de dois vouchers por tipos de refeição diferentes por turno
   - Vouchers extras podem ser usados independentemente dos outros vouchers

### Permissões

```sql
-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;
```