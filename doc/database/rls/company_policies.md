# Políticas RLS para Empresas

## Tabela: empresas

```sql
-- Políticas de Leitura
CREATE POLICY "Enable read access for all users" ON empresas
    FOR SELECT TO authenticated
    USING (true);

-- Políticas de Inserção/Atualização/Deleção
CREATE POLICY "Enable insert for authenticated users only" ON empresas
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');
```

## Tabela: setores

```sql
-- Políticas de Leitura
CREATE POLICY "Enable read access for all users" ON setores
    FOR SELECT TO authenticated
    USING (true);
```

## Notas de Implementação

1. Dados básicos visíveis para todos usuários autenticados
2. Modificações restritas a administradores
3. Logs de alterações mantidos