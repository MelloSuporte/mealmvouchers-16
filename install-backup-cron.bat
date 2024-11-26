@echo off
schtasks /create /tn "PostgreSQLBackup" /tr "%~dp0backup.bat" /sc daily /st %BACKUP_TIME% /f

echo Backup automático instalado com sucesso!
echo Será executado todos os dias às 04:00 (GMT-3)
echo Backup FULL aos domingos, INCREMENTAL nos demais dias
echo Os backups serão mantidos por 90 dias
echo Para verificar a programação, use: schtasks /query /tn "PostgreSQLBackup"