# Políticas RLS para Sistema

## Tabela: tipos_refeicao

```sql
-- Políticas de Leitura
CREATE POLICY "Enable read access for all users" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);
```

## Tabela: turnos

```sql
-- Políticas de Leitura
CREATE POLICY "Enable read access for all users" ON turnos
    FOR SELECT TO public
    USING (true);
```

## Permissões Gerais

```sql
-- Permissões para usuários autenticados
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permissões para usuários anônimos
GRANT SELECT ON tipos_refeicao TO anon;
GRANT SELECT ON turnos TO anon;
```

## Notas de Implementação

1. Configurações básicas visíveis para todos
2. Modificações restritas a administradores
3. Logs de sistema protegidos