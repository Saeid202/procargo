-- Simple Legal Chat Tables
-- Run this SQL script in your Supabase SQL Editor

-- Legal Chat Sessions Table
CREATE TABLE IF NOT EXISTS legal_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal Chat Messages Table
CREATE TABLE IF NOT EXISTS legal_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    ai_confidence DECIMAL(3,2) DEFAULT 0.0,
    suggestions JSONB DEFAULT '[]'::jsonb,
    related_topics JSONB DEFAULT '[]'::jsonb,
    context_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal Chat Context Table (for AI memory)
CREATE TABLE IF NOT EXISTS legal_chat_context (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    context_key VARCHAR(255) NOT NULL,
    context_value TEXT NOT NULL,
    context_type VARCHAR(50) DEFAULT 'general',
    importance INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
ALTER TABLE legal_chat_messages 
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2) DEFAULT 0.0;

ALTER TABLE legal_chat_messages 
ADD COLUMN IF NOT EXISTS suggestions JSONB DEFAULT '[]'::jsonb;

ALTER TABLE legal_chat_messages 
ADD COLUMN IF NOT EXISTS related_topics JSONB DEFAULT '[]'::jsonb;

ALTER TABLE legal_chat_messages 
ADD COLUMN IF NOT EXISTS context_data JSONB DEFAULT '{}'::jsonb;
