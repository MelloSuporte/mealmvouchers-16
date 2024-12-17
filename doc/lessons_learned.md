# Lições Aprendidas

## 1. Problemas com Consultas de Turno

### Problema Encontrado
- Erros 406 ao tentar consultar a tabela `turnos` usando UUID no campo `tipo_turno`
- Consultas retornando 0 linhas quando deveriam encontrar registros
- Múltiplas consultas desnecessárias ao banco de dados

```sql
-- Consulta problemática
SELECT id FROM turnos WHERE tipo_turno = 'uuid-aqui'
```

### Causa Raiz
1. Campo `tipo_turno` era VARCHAR mas estava recebendo UUID
2. Consulta adicional desnecessária quando já tínhamos o ID do turno
3. Confusão entre ID do turno e tipo do turno

### Solução Implementada
1. Usar diretamente o ID do turno armazenado em `location.state.userTurno`
2. Remover consulta desnecessária ao banco
3. Manter consistência nos tipos de dados

```typescript
// Código correto
navigate('/bom-apetite', { 
  state: { 
    userName: location.state.userName,
    turno: location.state.userTurno // Usando o ID diretamente
  } 
});
```

## 2. Boas Práticas para Novas Implementações

### Estrutura de Dados
1. Sempre documentar tipos esperados em cada campo
2. Manter consistência entre front-end e back-end
3. Validar tipos de dados antes de enviar ao banco

### Consultas ao Banco
1. Evitar consultas desnecessárias
2. Verificar tipos de dados corretos nas queries
3. Usar tipagem forte no TypeScript para prevenir erros

### Navegação entre Páginas
1. Passar apenas dados necessários no state
2. Validar dados antes da navegação
3. Manter consistência nos nomes das propriedades

## 3. Checklist para Novas Features

### Antes da Implementação
- [ ] Verificar tipos de dados no banco
- [ ] Documentar interfaces/tipos
- [ ] Planejar fluxo de dados

### Durante o Desenvolvimento
- [ ] Validar tipos de dados
- [ ] Evitar consultas redundantes
- [ ] Adicionar logs estratégicos

### Após Implementação
- [ ] Testar casos de erro
- [ ] Verificar performance
- [ ] Documentar decisões importantes

## 4. Padrões de Código Recomendados

### TypeScript
```typescript
// Definir interfaces claras
interface Turno {
  id: string;  // UUID
  tipo_turno: string;  // VARCHAR
  // ... outros campos
}

// Usar tipos explícitos
const getTurno = async (turnoId: string): Promise<Turno> => {
  // implementação
};
```

### Supabase
```typescript
// Consultas corretas
const { data, error } = await supabase
  .from('turnos')
  .select('*')
  .eq('id', turnoId)  // Usar campo correto
  .single();
```

## 5. Monitoramento e Debugging

### Logs Importantes
1. Erros de consulta ao banco
2. Problemas de tipo de dados
3. Falhas na navegação

### Métricas a Observar
1. Tempo de resposta das consultas
2. Taxa de erro nas validações
3. Uso de recursos do banco

## 6. Próximos Passos

### Melhorias Sugeridas
1. Implementar validação de tipos mais rigorosa
2. Adicionar testes automatizados
3. Melhorar documentação de APIs

### Prevenção de Problemas
1. Code review focado em tipos de dados
2. Testes de integração
3. Documentação atualizada