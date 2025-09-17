# Legal Chat Database Setup Guide

This guide explains how to set up the database tables required for the Legal AI Assistant functionality.

## 🚨 **IMPORTANT: Run This First!**

The Legal AI Assistant requires specific database tables to function properly. If you're getting errors like:
- "Could not find the 'last_message_at' column of 'legal_chat_sessions' in the schema cache"
- "relation 'legal_chat_sessions' does not exist"

You need to run the database migration first.

## 📋 Required Tables

The Legal Chat system uses these tables:

1. **`legal_chat_sessions`** - Stores chat sessions for users
2. **`legal_chat_messages`** - Stores individual messages and AI responses
3. **`legal_chat_context`** - Stores context for AI memory across conversations

## 🛠️ Database Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the sidebar
4. Click **"New Query"**

### Step 2: Run the Migration

1. Copy the entire contents of `database_migrations/legal_chat_schema.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the migration

### Step 3: Verify Tables Created

After running the migration, verify the tables exist:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'legal_chat%';
```

You should see:
- `legal_chat_sessions`
- `legal_chat_messages`
- `legal_chat_context`

## 📊 Table Structure

### legal_chat_sessions
- `id` - Primary key (UUID)
- `user_id` - Reference to auth.users
- `title` - Session title
- `summary` - Optional session summary
- `message_count` - Number of messages in session
- `last_message_at` - Timestamp of last message
- `created_at` - Session creation time
- `updated_at` - Last update time

### legal_chat_messages
- `id` - Primary key (UUID)
- `session_id` - Reference to legal_chat_sessions
- `user_id` - Reference to auth.users
- `message` - User's message
- `response` - AI's response
- `message_type` - 'user' or 'assistant'
- `ai_confidence` - AI confidence score (0.0 to 1.0)
- `suggestions` - JSON array of suggestions
- `related_topics` - JSON array of related topics
- `context_data` - JSON object with context information
- `timestamp` - Message timestamp

### legal_chat_context
- `id` - Primary key (UUID)
- `session_id` - Reference to legal_chat_sessions
- `user_id` - Reference to auth.users
- `context_key` - Context identifier
- `context_value` - Context value
- `context_type` - Type of context (general, legal_topic, etc.)
- `importance` - Importance level (1-5)
- `created_at` - Creation time
- `updated_at` - Last update time

## 🔒 Security Features

The migration includes:

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - Users can only access their own data
- **Proper foreign key constraints**
- **Automatic timestamp updates**
- **Session statistics tracking**

## 🔧 Automatic Features

The migration includes triggers that automatically:

1. **Update session statistics** when messages are added
2. **Update timestamps** when records are modified
3. **Maintain data integrity** with foreign key constraints

## ⚡ Performance Optimizations

The migration creates indexes for:

- User ID lookups
- Session-based queries
- Timestamp-based sorting
- Message type filtering
- Context importance ranking

## 🚀 After Setup

Once the database is set up:

1. **Restart your application** to clear any cached schema information
2. **Test the Legal Assistant** by visiting the Legal Assistance page
3. **Create a new chat** to verify everything works

## 🐛 Troubleshooting

### Common Issues:

**"Permission denied" errors:**
- Ensure your Supabase user has the necessary permissions
- Check if RLS policies are working correctly

**"Function does not exist" errors:**
- Make sure the entire migration script ran successfully
- Check the Supabase logs for any errors during execution

**"Column does not exist" errors:**
- Clear your browser cache and restart the application
- The schema cache might need to refresh

### Verification Queries:

```sql
-- Check table structure
\d legal_chat_sessions
\d legal_chat_messages
\d legal_chat_context

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename LIKE 'legal_chat%';

-- Check triggers
SELECT * FROM information_schema.triggers WHERE event_object_table LIKE 'legal_chat%';
```

## 📞 Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify all migration steps were completed
3. Ensure your Supabase project is properly configured
4. Check that authentication is working correctly

The Legal AI Assistant should work perfectly after running this migration!
