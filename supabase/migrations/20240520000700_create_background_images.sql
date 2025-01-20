-- Create background_images table
CREATE TABLE IF NOT EXISTS background_images (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE background_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access"
    ON background_images FOR SELECT
    USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Allow authenticated insert"
    ON background_images FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update"
    ON background_images FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_background_images_page ON background_images(page);
CREATE INDEX idx_background_images_active ON background_images(is_active);