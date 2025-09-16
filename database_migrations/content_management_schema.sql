-- Content Management System Database Schema
-- This file contains all the necessary tables for the WordPress-like admin dashboard

-- Page Contents Table
CREATE TABLE IF NOT EXISTS page_contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug VARCHAR(255) UNIQUE NOT NULL,
    page_title VARCHAR(255) NOT NULL,
    page_content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image_url TEXT,
    featured_image_path TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Media Files Table
CREATE TABLE IF NOT EXISTS media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL DEFAULT 'My Website',
    site_description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    social_facebook TEXT,
    social_twitter TEXT,
    social_linkedin TEXT,
    social_instagram TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    analytics_code TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    featured_image_url TEXT,
    featured_image_path TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recent Activity Table (for dashboard activity feed)
CREATE TABLE IF NOT EXISTS recent_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'page', 'media', 'blog', 'user', etc.
    description TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB, -- Additional data like page_id, file_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_contents_slug ON page_contents(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_contents_published ON page_contents(is_published);
CREATE INDEX IF NOT EXISTS idx_page_contents_created_at ON page_contents(created_at);

CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_recent_activity_type ON recent_activity(type);
CREATE INDEX IF NOT EXISTS idx_recent_activity_user ON recent_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activity_created_at ON recent_activity(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_page_contents_updated_at 
    BEFORE UPDATE ON page_contents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings
INSERT INTO site_settings (site_name, site_description, contact_email) 
VALUES ('ProCargo', 'Professional Cargo and Logistics Services', 'contact@procargo.com')
ON CONFLICT DO NOTHING;

-- Insert existing pages (Services, About, Contact)
INSERT INTO page_contents (page_slug, page_title, page_content, meta_title, meta_description, is_published, created_by) 
VALUES 
    ('about', 'About Us', 
     '<h1>About ProCargo</h1><p>We are a leading logistics company specializing in cargo transportation and supply chain management.</p><h2>Our Mission</h2><p>To provide reliable, efficient, and cost-effective logistics solutions that connect businesses worldwide.</p><h2>Our Vision</h2><p>To be the most trusted logistics partner for businesses of all sizes.</p><h2>Why Choose Us?</h2><ul><li>15+ years of experience in logistics</li><li>Global network of partners</li><li>24/7 customer support</li><li>Advanced tracking systems</li><li>Competitive pricing</li></ul>', 
     'About Us - ProCargo', 
     'Learn about ProCargo, our mission, vision, and why we are the trusted choice for logistics solutions.', 
     true, 
     (SELECT id FROM users LIMIT 1)),
     
    ('services', 'Our Services', 
     '<h1>Our Services</h1><p>ProCargo offers comprehensive logistics solutions tailored to meet your business needs.</p><h2>Freight Forwarding</h2><p>We handle the complex process of moving goods from origin to destination, managing all documentation and customs procedures.</p><h2>Warehousing & Distribution</h2><p>Secure storage facilities with advanced inventory management systems.</p><h2>Supply Chain Management</h2><p>End-to-end supply chain optimization to reduce costs and improve efficiency.</p><h2>Customs Clearance</h2><p>Expert customs brokerage services to ensure smooth international trade.</p><h2>Tracking & Monitoring</h2><p>Real-time shipment tracking and monitoring systems.</p>', 
     'Services - ProCargo', 
     'Discover our comprehensive logistics services including freight forwarding, warehousing, supply chain management, and more.', 
     true, 
     (SELECT id FROM users LIMIT 1)),
     
    ('contact', 'Contact Us', 
     '<h1>Contact ProCargo</h1><p>Get in touch with our team for all your logistics needs.</p><h2>Get a Quote</h2><p>Ready to ship? Contact us for a personalized quote tailored to your requirements.</p><h2>Customer Support</h2><p>Our dedicated support team is available 24/7 to assist you with any questions or concerns.</p><h2>Business Hours</h2><p>Monday - Friday: 8:00 AM - 6:00 PM<br>Saturday: 9:00 AM - 2:00 PM<br>Sunday: Closed</p><h2>Emergency Support</h2><p>For urgent shipments and emergency support, call our 24/7 hotline.</p>', 
     'Contact Us - ProCargo', 
     'Contact ProCargo for logistics quotes, customer support, and emergency assistance. Available 24/7.', 
     true, 
     (SELECT id FROM users LIMIT 1))
ON CONFLICT (page_slug) DO NOTHING;

-- Create storage buckets for media files
-- Note: These need to be created in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', true);

-- Grant necessary permissions (adjust based on your RLS policies)
-- ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example - adjust based on your needs)
-- CREATE POLICY "Users can view published pages" ON page_contents FOR SELECT USING (is_published = true);
-- CREATE POLICY "Admins can manage pages" ON page_contents FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Users can view media files" ON media_files FOR SELECT USING (true);
-- CREATE POLICY "Admins can manage media files" ON media_files FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Users can view site settings" ON site_settings FOR SELECT USING (true);
-- CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Users can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true);
-- CREATE POLICY "Admins can manage blog posts" ON blog_posts FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Admins can view recent activity" ON recent_activity FOR SELECT USING (auth.role() = 'admin');
-- CREATE POLICY "Admins can create recent activity" ON recent_activity FOR INSERT WITH CHECK (auth.role() = 'admin');
