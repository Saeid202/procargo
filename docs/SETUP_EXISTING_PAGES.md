# Setup Existing Pages in Admin Dashboard

## Quick Setup Guide

To see your existing pages (Services, About, Contact) in the Page Management section of the admin dashboard, follow these steps:

## 1. Run Database Migration

### Option A: Run the complete migration
```sql
-- In your Supabase SQL Editor, run:
\i database_migrations/content_management_schema.sql
```

### Option B: Run just the pages insertion
```sql
-- In your Supabase SQL Editor, run:
\i database_migrations/insert_existing_pages.sql
```

## 2. What You'll See

After running the migration, you'll see these pages in your **Page Management** section:

### 📄 About Page
- **Slug**: `/about`
- **Title**: "About Us"
- **Content**: Complete about page with mission, vision, and company info
- **Status**: Published ✅

### 🚚 Services Page  
- **Slug**: `/services`
- **Title**: "Our Services"
- **Content**: Detailed services including freight forwarding, warehousing, etc.
- **Status**: Published ✅

### 📞 Contact Page
- **Slug**: `/contact`
- **Title**: "Contact Us"
- **Content**: Contact information, business hours, support details
- **Status**: Published ✅

## 3. How to Edit Pages

1. **Go to Admin Dashboard**
2. **Click "Pages" in the sidebar**
3. **You'll see all 3 pages listed**
4. **Click the edit icon (pencil) next to any page**
5. **Modify the content, title, or SEO settings**
6. **Click "Update Page" to save**

## 4. WordPress-like Features

Just like WordPress, you can now:

- ✅ **Edit page content** without touching code
- ✅ **Change page titles** and slugs
- ✅ **Update SEO meta titles** and descriptions
- ✅ **Add featured images** to pages
- ✅ **Publish/unpublish** pages
- ✅ **Preview pages** before publishing
- ✅ **Search and filter** pages

## 5. Dashboard Overview

Your dashboard will now show:
- **Pages Count**: 3 (instead of 0)
- **All 3 pages** listed in the Page Management section
- **Recent Activity** showing page updates

## 6. Next Steps

After setting up the pages:

1. **Upload media files** in the Media Library
2. **Create blog posts** for fresh content
3. **Configure site settings** for global changes
4. **Customize page content** to match your brand

## 7. Troubleshooting

### If pages don't appear:
1. Check that the `page_contents` table exists
2. Verify the migration ran successfully
3. Refresh the admin dashboard
4. Check browser console for errors

### If you get permission errors:
1. Ensure you're logged in as an admin user
2. Check RLS policies are set correctly
3. Verify database permissions

---

**That's it!** You now have a WordPress-like page management system where you can easily edit your Services, About, and Contact pages without touching any code! 🎉
