@echo off
echo Downloading Supabase CLI...
curl -o supabase.exe -L https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe

echo Moving Supabase CLI to system PATH...
move supabase.exe "%USERPROFILE%\AppData\Local\Microsoft\WindowsApps"

echo Testing Supabase CLI installation...
supabase --version

if %ERRORLEVEL% EQU 0 (
    echo Supabase CLI installed successfully!
) else (
    echo Failed to install Supabase CLI
    echo Please try running this script as administrator
)

pause
