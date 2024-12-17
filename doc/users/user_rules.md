# Regras para Usuários

## 1. Cadastro

### Dados Obrigatórios
- Nome completo
- CPF
- Email
- Empresa
- Turno

### Validações
- CPF único no sistema
- Email único no sistema
- Vinculação com empresa ativa

## 2. Permissões

### Níveis
- Administrador
- Gestor
- Usuário comum
- Operador

### Capacidades por Nível

#### Administrador (role = 'admin')
- Gerenciar Vouchers Extra
- Gerenciar Vouchers Descartáveis
- Gerenciar Usuários
- Gerenciar Relatórios
- Acesso total ao sistema
- Configuração de parâmetros do sistema
- Gestão de empresas

#### Gestor
- Gestão de equipe
- Gestão de vouchers
- Visualização de relatórios da sua equipe

#### Usuário
- Uso básico do sistema
- Visualização dos próprios vouchers
- Atualização de dados pessoais

#### Operador
- Validação de vouchers
- Registro de uso de vouchers

### Validações de Permissões
- Verificação de role = 'admin' para acesso administrativo
- Verificação de status de suspensão
- Verificação de vínculo com empresa ativa
- Registro de logs de ações administrativas