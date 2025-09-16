-- Insert existing pages (Services, About, Contact) into the page_contents table
-- Run this after creating the page_contents table

-- Insert About page
INSERT INTO page_contents (page_slug, page_title, page_content, meta_title, meta_description, is_published, created_by) 
VALUES 
    ('about', 'About Us', 
     '<h1>About ProCargo</h1><p>We are a leading logistics company specializing in cargo transportation and supply chain management.</p><h2>Our Mission</h2><p>To provide reliable, efficient, and cost-effective logistics solutions that connect businesses worldwide.</p><h2>Our Vision</h2><p>To be the most trusted logistics partner for businesses of all sizes.</p><h2>Why Choose Us?</h2><ul><li>15+ years of experience in logistics</li><li>Global network of partners</li><li>24/7 customer support</li><li>Advanced tracking systems</li><li>Competitive pricing</li></ul>', 
     'About Us - ProCargo', 
     'Learn about ProCargo, our mission, vision, and why we are the trusted choice for logistics solutions.', 
     true, 
     (SELECT id FROM users LIMIT 1))
ON CONFLICT (page_slug) DO NOTHING;

-- Insert Services page
INSERT INTO page_contents (page_slug, page_title, page_content, meta_title, meta_description, is_published, created_by) 
VALUES 
    ('services', 'Our Services', 
     '<h1>Our Services</h1><p>ProCargo offers comprehensive logistics solutions tailored to meet your business needs.</p><h2>Freight Forwarding</h2><p>We handle the complex process of moving goods from origin to destination, managing all documentation and customs procedures.</p><h2>Warehousing & Distribution</h2><p>Secure storage facilities with advanced inventory management systems.</p><h2>Supply Chain Management</h2><p>End-to-end supply chain optimization to reduce costs and improve efficiency.</p><h2>Customs Clearance</h2><p>Expert customs brokerage services to ensure smooth international trade.</p><h2>Tracking & Monitoring</h2><p>Real-time shipment tracking and monitoring systems.</p>', 
     'Services - ProCargo', 
     'Discover our comprehensive logistics services including freight forwarding, warehousing, supply chain management, and more.', 
     true, 
     (SELECT id FROM users LIMIT 1))
ON CONFLICT (page_slug) DO NOTHING;

-- Insert Contact page
INSERT INTO page_contents (page_slug, page_title, page_content, meta_title, meta_description, is_published, created_by) 
VALUES 
    ('contact', 'Contact Us', 
     '<h1>Contact ProCargo</h1><p>Get in touch with our team for all your logistics needs.</p><h2>Get a Quote</h2><p>Ready to ship? Contact us for a personalized quote tailored to your requirements.</p><h2>Customer Support</h2><p>Our dedicated support team is available 24/7 to assist you with any questions or concerns.</p><h2>Business Hours</h2><p>Monday - Friday: 8:00 AM - 6:00 PM<br>Saturday: 9:00 AM - 2:00 PM<br>Sunday: Closed</p><h2>Emergency Support</h2><p>For urgent shipments and emergency support, call our 24/7 hotline.</p>', 
     'Contact Us - ProCargo', 
     'Contact ProCargo for logistics quotes, customer support, and emergency assistance. Available 24/7.', 
     true, 
     (SELECT id FROM users LIMIT 1))
ON CONFLICT (page_slug) DO NOTHING;

-- Verify the pages were inserted
SELECT page_slug, page_title, is_published, created_at FROM page_contents ORDER BY created_at;
