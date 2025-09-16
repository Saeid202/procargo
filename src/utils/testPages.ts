// Test utility to check if pages are loading correctly
import { ContentManagementService } from '../services/contentManagementService';

export const testPagesLoading = async () => {
  try {
    console.log('Testing pages loading...');
    const { pages, error } = await ContentManagementService.getPages();
    
    if (error) {
      console.error('Error loading pages:', error);
      return { success: false, error };
    }
    
    console.log('Pages loaded successfully:', pages);
    return { success: true, pages };
  } catch (error) {
    console.error('Exception loading pages:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Test function to manually create pages if they don't exist
export const createDefaultPages = async () => {
  try {
    console.log('Creating default pages...');
    
    const defaultPages = [
      {
        page_slug: 'about',
        page_title: 'About Us',
        page_content: '<h1>About ProCargo</h1><p>We are a leading logistics company specializing in cargo transportation and supply chain management.</p>',
        meta_title: 'About Us - ProCargo',
        meta_description: 'Learn about ProCargo and our logistics services.',
        is_published: true,
        created_by: 'current-user-id'
      },
      {
        page_slug: 'services',
        page_title: 'Our Services',
        page_content: '<h1>Our Services</h1><p>ProCargo offers comprehensive logistics solutions tailored to meet your business needs.</p>',
        meta_title: 'Services - ProCargo',
        meta_description: 'Discover our comprehensive logistics services.',
        is_published: true,
        created_by: 'current-user-id'
      },
      {
        page_slug: 'contact',
        page_title: 'Contact Us',
        page_content: '<h1>Contact ProCargo</h1><p>Get in touch with our team for all your logistics needs.</p>',
        meta_title: 'Contact Us - ProCargo',
        meta_description: 'Contact ProCargo for logistics quotes and support.',
        is_published: true,
        created_by: 'current-user-id'
      }
    ];

    const results = [];
    for (const pageData of defaultPages) {
      const { page, error } = await ContentManagementService.createPage(pageData);
      if (error) {
        console.error(`Error creating page ${pageData.page_slug}:`, error);
        results.push({ slug: pageData.page_slug, success: false, error });
      } else {
        console.log(`Page ${pageData.page_slug} created successfully:`, page);
        results.push({ slug: pageData.page_slug, success: true, page });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Exception creating pages:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
