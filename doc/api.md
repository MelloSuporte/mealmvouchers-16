# Documentação da API

## Visão Geral

A API do Sistema de Vouchers para Refeitório é construída sobre o Supabase, oferecendo endpoints RESTful para todas as operações necessárias. A autenticação é realizada via JWT tokens.

## Base URL

```
https://[seu-projeto].supabase.co/rest/v1/
```

## Autenticação

Todas as requisições devem incluir os seguintes headers:

```http
apikey: [sua-anon-key]
Authorization: Bearer [seu-jwt-token]
```

## Endpoints

### Autenticação

#### Login
```http
POST /auth/v1/token
Content-Type: application/json

{
    "email": "usuario@exemplo.com",
    "password": "senha123"
}
```

Resposta:
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### Vouchers

#### Listar Vouchers
```http
GET /rest/v1/vouchers?select=*
```

#### Criar Voucher
```http
POST /rest/v1/vouchers
Content-Type: application/json

{
    "codigo": "1234",
    "tipo": "comum",
    "usuario_id": "uuid-do-usuario",
    "data_validade": null,
    "observacao": "Voucher padrão"
}
```

#### Validar Voucher
```http
GET /rest/v1/rpc/validar_voucher
Content-Type: application/json

{
    "codigo_voucher": "1234"
}
```

#### Usar Voucher
```http
POST /rest/v1/uso_voucher
Content-Type: application/json

{
    "voucher_id": "uuid-do-voucher",
    "tipo_refeicao_id": "uuid-da-refeicao",
    "valor": 15.90
}
```

### Usuários

#### Listar Usuários
```http
GET /rest/v1/usuarios?select=*,empresa:empresas(*)
```

#### Criar Usuário
```http
POST /rest/v1/usuarios
Content-Type: application/json

{
    "nome": "João Silva",
    "cpf": "12345678900",
    "email": "joao@exemplo.com",
    "empresa_id": "uuid-da-empresa",
    "turno_id": "uuid-do-turno"
}
```

#### Atualizar Usuário
```http
PATCH /rest/v1/usuarios?id=eq.uuid-do-usuario
Content-Type: application/json

{
    "nome": "João Silva Atualizado",
    "ativo": true
}
```

### Empresas

#### Listar Empresas
```http
GET /rest/v1/empresas?select=*
```

#### Criar Empresa
```http
POST /rest/v1/empresas
Content-Type: application/json

{
    "nome": "Empresa XYZ",
    "cnpj": "12345678000100"
}
```

### Relatórios

#### Relatório de Uso
```http
POST /rest/v1/rpc/relatorio_uso
Content-Type: application/json

{
    "data_inicio": "2024-01-01",
    "data_fim": "2024-12-31",
    "empresa_id": "uuid-da-empresa"
}
```

## Códigos de Status

- 200: Sucesso
- 201: Criado com sucesso
- 400: Requisição inválida
- 401: Não autorizado
- 403: Proibido
- 404: Não encontrado
- 409: Conflito
- 500: Erro interno do servidor

## Paginação

A paginação é suportada através dos headers:

```http
Range: 0-9
```

Resposta incluirá:
```http
Content-Range: 0-9/100
```

## Filtros

### Operadores Suportados

- eq: igual
- neq: diferente
- gt: maior que
- gte: maior ou igual
- lt: menor que
- lte: menor ou igual
- like: contém
- ilike: contém (case insensitive)
- is: é nulo ou não nulo

Exemplo:
```http
GET /rest/v1/usuarios?select=*&nome=ilike.*Silva*
```

## Ordenação

Usar o parâmetro `order`:

```http
GET /rest/v1/usuarios?order=nome.asc,created_at.desc
```

## Rate Limiting

- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

## Erros

### Formato de Erro
```json
{
    "code": "23505",
    "details": "Key (email)=(usuario@exemplo.com) already exists.",
    "hint": null,
    "message": "duplicate key value violates unique constraint"
}
```

### Códigos de Erro Comuns

- PGRST204: Sem conteúdo
- PGRST400: Requisição inválida
- PGRST401: Não autorizado
- PGRST403: Proibido
- PGRST404: Não encontrado
- PGRST409: Conflito
- PGRST500: Erro interno

## Exemplos de Uso

### Curl

```bash
# Login
curl -X POST 'https://[seu-projeto].supabase.co/auth/v1/token' \
-H 'apikey: sua-anon-key' \
-H 'Content-Type: application/json' \
-d '{"email":"usuario@exemplo.com","password":"senha123"}'

# Listar Vouchers
curl 'https://[seu-projeto].supabase.co/rest/v1/vouchers?select=*' \
-H 'apikey: sua-anon-key' \
-H 'Authorization: Bearer seu-jwt-token'
```

### JavaScript

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://[seu-projeto].supabase.co',
  'sua-anon-key'
)

// Login
const { data, error } = await supabase.auth.signIn({
  email: 'usuario@exemplo.com',
  password: 'senha123'
})

// Listar Vouchers
const { data, error } = await supabase
  .from('vouchers')
  .select('*')
```

## Webhooks

### Configuração
```json
{
    "event": "INSERT",
    "table": "uso_voucher",
    "url": "https://seu-endpoint.com/webhook",
    "headers": {
        "Authorization": "Bearer seu-token-secreto"
    }
}
```

### Formato do Payload
```json
{
    "type": "INSERT",
    "table": "uso_voucher",
    "record": {
        "id": "uuid-do-registro",
        "voucher_id": "uuid-do-voucher",
        "tipo_refeicao_id": "uuid-da-refeicao",
        "data_uso": "2024-01-01T12:00:00Z",
        "valor": 15.90
    },
    "old_record": null
}
```
