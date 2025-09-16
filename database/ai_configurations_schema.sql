-- AI Configurations Database Schema
-- Run this SQL script in your Supabase SQL Editor

-- Create AI configurations table
CREATE TABLE ai_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    
    -- AI Settings
    system_role TEXT NOT NULL,
    analysis_depth VARCHAR(20) DEFAULT 'detailed' CHECK (analysis_depth IN ('basic', 'detailed', 'expert')),
    temperature DECIMAL(3,2) DEFAULT 0.3 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens >= 100 AND max_tokens <= 4000),
    
    -- Instructions and Configuration
    category_instructions JSONB DEFAULT '{}'::jsonb,
    focus_areas JSONB DEFAULT '[]'::jsonb,
    custom_instructions TEXT,
    response_format VARCHAR(20) DEFAULT 'json' CHECK (response_format IN ('json', 'text', 'structured')),
    validation_rules JSONB DEFAULT '[]'::jsonb,
    fallback_behavior VARCHAR(20) DEFAULT 'retry' CHECK (fallback_behavior IN ('retry', 'simplify', 'error')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for active configuration lookup
CREATE INDEX idx_ai_configurations_active ON ai_configurations(is_active) WHERE is_active = true;

-- Create index for created_by for admin queries
CREATE INDEX idx_ai_configurations_created_by ON ai_configurations(created_by);

-- RLS policies
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;

-- Only admins can view AI configurations
CREATE POLICY "Only admins can view AI configurations" 
ON ai_configurations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Only admins can insert AI configurations
CREATE POLICY "Only admins can insert AI configurations" 
ON ai_configurations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Only admins can update AI configurations
CREATE POLICY "Only admins can update AI configurations" 
ON ai_configurations FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Only admins can delete AI configurations
CREATE POLICY "Only admins can delete AI configurations" 
ON ai_configurations FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Insert default AI configuration
INSERT INTO ai_configurations (
    name,
    description,
    is_active,
    system_role,
    analysis_depth,
    temperature,
    max_tokens,
    category_instructions,
    focus_areas,
    custom_instructions,
    response_format,
    validation_rules,
    fallback_behavior,
    created_by
) VALUES (
    'Default Compliance AI',
    'Default AI configuration for Canadian customs compliance analysis',
    true,
    'You are an expert Canadian customs compliance analyst with 15+ years of experience in international trade, customs regulations, and HS code classification.',
    'detailed',
    0.3,
    2000,
    '{
        "Electronics": "Focus on electronic components, safety certifications (CSA, FCC), and potential ITAR restrictions.",
        "Textiles & Apparel": "Consider textile quotas, labeling requirements, and country of origin marking.",
        "Machinery & Equipment": "Check for safety standards, electrical certifications, and potential dual-use restrictions.",
        "Chemicals": "Emphasize chemical safety data sheets, environmental regulations, and controlled substances.",
        "Food & Beverages": "Focus on food safety regulations, labeling requirements, and import permits.",
        "Automotive": "Consider automotive safety standards, emissions requirements, and recall information.",
        "Pharmaceuticals": "Emphasize Health Canada approvals, controlled substances, and prescription requirements.",
        "Construction Materials": "Check building codes, safety standards, and environmental impact.",
        "Agricultural Products": "Consider plant health certificates, organic certifications, and seasonal restrictions.",
        "Other": "Apply general customs principles and recommend specific research areas."
    }'::jsonb,
    '[
        "Canadian customs regulations and procedures",
        "HS code classification accuracy",
        "Tariff optimization opportunities",
        "Documentation requirements",
        "Potential compliance risks",
        "Cost-saving recommendations"
    ]'::jsonb,
    'Provide comprehensive analysis with specific focus on Canadian customs requirements, HS code classification, and regulatory compliance.',
    'json',
    '[
        "HS code must be 6-10 digits",
        "Tariff rate must be between 0-100%",
        "Confidence must be between 0-1",
        "All required fields must be present"
    ]'::jsonb,
    'retry',
    (SELECT id FROM auth.users WHERE email = 'admin@procargo.com' LIMIT 1)
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_ai_configurations_updated_at
    BEFORE UPDATE ON ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_configurations_updated_at();

-- Grant necessary permissions
GRANT ALL ON ai_configurations TO authenticated;
GRANT ALL ON ai_configurations TO service_role;
