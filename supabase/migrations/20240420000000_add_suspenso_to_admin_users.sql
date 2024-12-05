-- Add suspenso column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS suspenso BOOLEAN DEFAULT FALSE;

-- Update existing rows to have suspenso = FALSE
UPDATE admin_users SET suspenso = FALSE WHERE suspenso IS NULL;