# Translation Management Admin Panel Setup

This guide will help you set up the translation management system that allows operators to manage application content without code changes.

## Overview

The translation management system provides:
- **Dynamic Translation Loading**: Translations are loaded from Supabase database instead of static JSON files
- **Admin Panel**: Web interface for managing translations
- **Role-based Access**: Only users with ADMIN role can access the management interface
- **Import/Export**: Bulk import/export of translations
- **Real-time Updates**: Changes are reflected immediately in the application

## Setup Instructions

### 1. Database Setup

First, you need to create the necessary database tables in Supabase. Run the SQL migration script:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the contents of `database_migrations/translations_schema.sql`

This will create:
- `translations` table for storing translation key-value pairs
- `translation_groups` table for organizing translations
- Row Level Security policies
- Default translation groups

### 2. Create Admin User

You need to create a user with ADMIN role to access the translation management panel:

1. Sign up a new user through your application
2. In Supabase dashboard, go to the `profiles` table
3. Find the user you just created
4. Update their `role` field to `'ADMIN'`

Alternatively, you can create an admin user directly in the database:

```sql
-- First, create the user in auth.users (this is usually done through your app's signup)
-- Then update their profile role
UPDATE profiles 
SET role = 'ADMIN' 
WHERE email = 'admin@yourcompany.com';
```

### 3. Migrate Existing Translations

To migrate your existing translations from JSON files to the database:

1. Start your application
2. Navigate to `/admin/migration`
3. Click "Start Migration"
4. This will import all translations from your JSON files into the database

### 4. Access the Admin Panel

Once setup is complete:

1. Log in with an admin user
2. Navigate to `/admin/translations`
3. You can now manage all translations through the web interface

## Features

### Translation Management
- **View All Translations**: See all translations in a searchable, filterable table
- **Edit Translations**: Click "Edit" to modify any translation
- **Create New Translations**: Add new translation keys and values
- **Delete Translations**: Remove translations you no longer need
- **Group Organization**: Organize translations into logical groups

### Import/Export
- **Import JSON Files**: Bulk import translations from JSON files
- **Export Translations**: Download all translations for a language as JSON
- **Template Download**: Get a template file for creating import files

### Real-time Updates
- Changes made in the admin panel are immediately reflected in the application
- No need to restart the application or rebuild
- Translations are loaded dynamically from the database

## Usage

### For Operators

1. **Accessing the Panel**: Log in and go to `/admin/translations`
2. **Finding Translations**: Use the search and filter options to find specific translations
3. **Editing**: Click "Edit" on any translation to modify it
4. **Adding New**: Click "Add New Translation" to create new content
5. **Bulk Operations**: Use Import/Export tab for bulk changes

### For Developers

The system automatically:
- Loads translations from the database on application start
- Updates translations when language changes
- Falls back to JSON files if database is unavailable
- Maintains the same i18n API you're already using

## File Structure

```
src/
├── pages/admin/
│   ├── TranslationManagementPage.tsx    # Main admin interface
│   └── MigrationPage.tsx                # Migration tool
├── components/admin/
│   ├── TranslationEditor.tsx            # Translation edit form
│   ├── TranslationList.tsx              # Translation table
│   ├── TranslationFilters.tsx           # Search and filters
│   └── TranslationImportExport.tsx      # Import/export interface
├── services/
│   └── translationService.ts            # Database operations
├── lib/i18n/
│   ├── index.ts                         # Updated i18n config
│   └── dynamicLoader.ts                 # Dynamic translation loader
└── utils/
    └── migrateTranslations.ts           # Migration utilities
```

## Security

- Only users with `ADMIN` role can access the translation management panel
- Row Level Security (RLS) is enabled on all translation tables
- All operations are logged with user information
- Input validation prevents malicious content

## Troubleshooting

### Common Issues

1. **"Access Denied" Error**
   - Ensure your user has `ADMIN` role in the profiles table
   - Check that RLS policies are properly set up

2. **Translations Not Loading**
   - Verify database connection
   - Check that migration was completed successfully
   - Ensure translations exist in the database

3. **Import/Export Issues**
   - Verify JSON file format is correct
   - Check file permissions
   - Ensure all required fields are present

### Database Queries

Check if translations exist:
```sql
SELECT language, COUNT(*) as count 
FROM translations 
GROUP BY language;
```

Check user roles:
```sql
SELECT email, role 
FROM profiles 
WHERE role = 'ADMIN';
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify database permissions
3. Ensure all migration steps were completed
4. Check that the user has proper admin privileges

The system is designed to be robust and fallback to JSON files if the database is unavailable, ensuring your application continues to work even if there are database issues.
