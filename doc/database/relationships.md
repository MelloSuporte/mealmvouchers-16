# Database Relationships

## Entity Relationships
```
empresas 1 ----* usuarios
usuarios 1 ----* vouchers
turnos 1 ----* usuarios
setores 1 ----* usuarios
vouchers 1 ----* uso_voucher
tipos_refeicao 1 ----* uso_voucher
```

## Indexes
```sql
-- usuarios
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_turno ON usuarios(turno_id);
CREATE INDEX idx_usuarios_setor ON usuarios(setor_id);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);

-- vouchers
CREATE INDEX idx_vouchers_codigo ON vouchers(codigo);
CREATE INDEX idx_vouchers_usuario ON vouchers(usuario_id);
CREATE INDEX idx_vouchers_tipo ON vouchers(tipo);

-- uso_voucher
CREATE INDEX idx_uso_voucher_data ON uso_voucher(data_uso);
CREATE INDEX idx_uso_voucher_voucher ON uso_voucher(voucher_id);
```