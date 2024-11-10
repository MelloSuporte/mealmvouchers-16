-- Create background_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS background_images (
    id BIGSERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE background_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Acesso público para leitura"
    ON background_images FOR SELECT
    USING (true);

CREATE POLICY "Acesso público para inserção"
    ON background_images FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Acesso público para atualização"
    ON background_images FOR UPDATE
    USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_background_images_page 
    ON background_images(page);

-- Create index for active images
CREATE INDEX IF NOT EXISTS idx_background_images_active 
    ON background_images(is_active);