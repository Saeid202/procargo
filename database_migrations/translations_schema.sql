-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(key, language)
);

-- Create translation_groups table for organizing translations
CREATE TABLE IF NOT EXISTS translation_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add group_id to translations table
ALTER TABLE translations ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES translation_groups(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language);
CREATE INDEX IF NOT EXISTS idx_translations_group_id ON translations(group_id);

-- Enable Row Level Security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for translations table
-- Only authenticated users can read translations
CREATE POLICY "Allow read access to translations" ON translations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only users with admin role can modify translations
CREATE POLICY "Allow admin to modify translations" ON translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Create policies for translation_groups table
CREATE POLICY "Allow read access to translation groups" ON translation_groups
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to modify translation groups" ON translation_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_translations_updated_at 
  BEFORE UPDATE ON translations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_groups_updated_at 
  BEFORE UPDATE ON translation_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default translation groups
INSERT INTO translation_groups (id, name, description) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'General', 'General application translations'),
  ('00000000-0000-0000-0000-000000000002', 'Navigation', 'Navigation and menu translations'),
  ('00000000-0000-0000-0000-000000000003', 'Forms', 'Form labels and validation messages'),
  ('00000000-0000-0000-0000-000000000004', 'Dashboard', 'Dashboard specific translations'),
  ('00000000-0000-0000-0000-000000000005', 'Legal', 'Legal assistance and case management'),
  ('00000000-0000-0000-0000-000000000006', 'Orders', 'Order management and logistics')
ON CONFLICT (id) DO NOTHING;

-- Add ADMIN role to roles enum if it doesn't exist
-- This should be done in your existing roles enum file, but adding here for reference
-- You'll need to update your roles.enum.ts file to include ADMIN role
