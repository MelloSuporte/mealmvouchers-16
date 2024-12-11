# Políticas RLS para Tabela Turnos

## Políticas Atuais

### Leitura (SELECT)
```sql
CREATE POLICY "Permitir leitura de turnos para todos usuários autenticados"
ON turnos FOR SELECT
TO authenticated
USING (true);
```

### Inserção (INSERT)
```sql
CREATE POLICY "Permitir inserção de turnos apenas para administradores"
ON turnos FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT id 
        FROM usuarios 
        WHERE role = 'admin'
    )
);
```

### Atualização (UPDATE)
```sql
CREATE POLICY "Permitir atualização de turnos apenas para administradores"
ON turnos FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id 
        FROM usuarios 
        WHERE role = 'admin'
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT id 
        FROM usuarios 
        WHERE role = 'admin'
    )
);
```

### Deleção (DELETE)
```sql
CREATE POLICY "Permitir deleção de turnos apenas para administradores"
ON turnos FOR DELETE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id 
        FROM usuarios 
        WHERE role = 'admin'
    )
);
```

## Políticas Futuras Sugeridas

1. **Política de Auditoria**
   - Implementar registro de alterações (log) para todas as operações em turnos
   - Criar tabela `turnos_audit_log` para rastrear mudanças

2. **Política de Restrição por Empresa**
   - Limitar visualização de turnos baseado na empresa do usuário
   - Útil para sistemas multi-empresa

3. **Política de Horários Sobrepostos**
   - Implementar validação para evitar sobreposição de horários
   - Garantir que turnos não se sobreponham no mesmo período

4. **Política de Inativação**
   - Implementar soft delete ao invés de deleção física
   - Manter histórico de turnos inativos

## Observações Importantes

1. A tabela `turnos` possui os seguintes campos:
   - `id`: Identificador único (UUID)
   - `tipo_turno`: Nome/tipo do turno (VARCHAR)
   - `horario_inicio`: Hora de início (TIME)
   - `horario_fim`: Hora de fim (TIME)
   - `ativo`: Status do turno (BOOLEAN)
   - `created_at`: Data de criação (TIMESTAMP)
   - `updated_at`: Data de atualização (TIMESTAMP)

2. Todas as operações são registradas com timestamps automáticos
3. A coluna `ativo` permite desativação lógica sem remoção física
4. As políticas RLS garantem que apenas administradores podem modificar os turnos