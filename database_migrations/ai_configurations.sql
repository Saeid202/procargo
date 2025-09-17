-- Simple AI Configurations Table
-- Run this SQL script in your Supabase SQL Editor

-- Create AI configurations table
CREATE TABLE IF NOT EXISTS ai_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    system_role TEXT NOT NULL,
    analysis_depth VARCHAR(20) DEFAULT 'detailed',
    temperature DECIMAL(3,2) DEFAULT 0.3,
    max_tokens INTEGER DEFAULT 2000,
    category_instructions JSONB DEFAULT '{}'::jsonb,
    focus_areas JSONB DEFAULT '[]'::jsonb,
    custom_instructions TEXT,
    response_format VARCHAR(20) DEFAULT 'json',
    validation_rules JSONB DEFAULT '[]'::jsonb,
    fallback_behavior VARCHAR(20) DEFAULT 'retry',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);
