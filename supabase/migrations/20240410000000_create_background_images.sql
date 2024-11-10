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
CREATE POLICY "Imagens são visíveis para todos"
    ON background_images FOR SELECT
    USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir imagens"
    ON background_images FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar imagens"
    ON background_images FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_background_images_page 
    ON background_images(page);

-- Create index for active images
CREATE INDEX IF NOT EXISTS idx_background_images_active 
    ON background_images(is_active);