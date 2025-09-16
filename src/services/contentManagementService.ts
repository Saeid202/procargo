import { supabase } from '../lib/supabase';

export interface PageContent {
  id: string;
  page_slug: string;
  page_title: string;
  page_content: string;
  meta_title?: string;
  meta_description?: string;
  featured_image_url?: string;
  featured_image_path?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  caption?: string;
  uploaded_by: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_instagram?: string;
  logo_url?: string;
  favicon_url?: string;
  analytics_code?: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  featured_image_path?: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export class ContentManagementService {
  // Page Management
  static async getPages(): Promise<{ pages: PageContent[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { pages: data || [] };
    } catch (error) {
      return { 
        pages: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch pages' 
      };
    }
  }

  static async getPageBySlug(slug: string): Promise<{ page: PageContent | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page_slug', slug)
        .single();

      if (error) throw error;
      return { page: data };
    } catch (error) {
      return { 
        page: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch page' 
      };
    }
  }

  static async createPage(pageData: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>): Promise<{ page: PageContent | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('page_contents')
        .insert(pageData)
        .select()
        .single();

      if (error) throw error;
      return { page: data };
    } catch (error) {
      return { 
        page: null, 
        error: error instanceof Error ? error.message : 'Failed to create page' 
      };
    }
  }

  static async updatePage(id: string, pageData: Partial<PageContent>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('page_contents')
        .update({ ...pageData, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update page' 
      };
    }
  }

  static async deletePage(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('page_contents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete page' 
      };
    }
  }

  // Media Management
  static async getMediaFiles(): Promise<{ files: MediaFile[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { files: data || [] };
    } catch (error) {
      return { 
        files: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch media files' 
      };
    }
  }

  static async uploadMediaFile(file: File, userId: string, altText?: string, caption?: string): Promise<{ file: MediaFile | null; error?: string }> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `media/${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);

      // Save metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('media_files')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          alt_text: altText,
          caption: caption,
          uploaded_by: userId
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return { file: fileRecord };
    } catch (error) {
      return { 
        file: null, 
        error: error instanceof Error ? error.message : 'Failed to upload file' 
      };
    }
  }

  static async deleteMediaFile(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get file info first
      const { data: fileData, error: fetchError } = await supabase
        .from('media_files')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media-files')
        .remove([fileData.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete file' 
      };
    }
  }

  // Site Settings
  static async getSiteSettings(): Promise<{ settings: SiteSettings | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { settings: data };
    } catch (error) {
      return { 
        settings: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch site settings' 
      };
    }
  }

  static async updateSiteSettings(settingsData: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ ...settingsData, updated_at: new Date().toISOString() });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update site settings' 
      };
    }
  }

  // Blog Management
  static async getBlogPosts(): Promise<{ posts: BlogPost[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { posts: data || [] };
    } catch (error) {
      return { 
        posts: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts' 
      };
    }
  }

  static async createBlogPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<{ post: BlogPost | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return { post: data };
    } catch (error) {
      return { 
        post: null, 
        error: error instanceof Error ? error.message : 'Failed to create blog post' 
      };
    }
  }

  static async updateBlogPost(id: string, postData: Partial<BlogPost>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ ...postData, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update blog post' 
      };
    }
  }

  static async deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete blog post' 
      };
    }
  }
}
