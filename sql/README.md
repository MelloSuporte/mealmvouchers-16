# Scripts SQL do Sistema de Voucher

Execute os scripts na seguinte ordem:

1. 01_create_database.sql - Cria o banco de dados
2. 02_security_tables.sql - Cria tabelas de segurança
3. 03_core_tables.sql - Cria tabelas principais
4. 04_voucher_tables.sql - Cria tabelas relacionadas a vouchers
5. 05_auxiliary_tables.sql - Cria tabelas auxiliares
6. 06_initial_data.sql - Insere dados iniciais

Para executar todos os scripts em sequência no MySQL:

```bash
mysql -u seu_usuario -p < 01_create_database.sql
mysql -u seu_usuario -p bd_voucher < 02_security_tables.sql
mysql -u seu_usuario -p bd_voucher < 03_core_tables.sql
mysql -u seu_usuario -p bd_voucher < 04_voucher_tables.sql
mysql -u seu_usuario -p bd_voucher < 05_auxiliary_tables.sql
mysql -u seu_usuario -p bd_voucher < 06_initial_data.sql
```