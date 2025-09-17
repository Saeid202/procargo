import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  NewspaperIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Footer from '../../components/ui/Footer';

const NewsPage = () => {
  const { t } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);
  const [likedArticles, setLikedArticles] = useState<number[]>([]);


  const newsArticles = [
    {
      id: 1,
      title: "New Customs Regulations Impact China-Canada Trade Routes",
      excerpt: "Recent updates to customs procedures are expected to streamline cargo processing times by up to 30% for shipments between China and Canada.",
      content: "The new customs regulations introduced by both Chinese and Canadian authorities aim to simplify documentation requirements and reduce processing times. These changes are particularly beneficial for regular shippers who can now take advantage of expedited clearance procedures...",
      category: 'regulatory',
      author: "Sarah Chen",
      publishDate: "2024-01-15",
      readTime: 5,
      views: 1247,
      likes: 89,
      tags: ["customs", "regulations", "china-canada", "trade"],
      featured: true
    },
    {
      id: 2,
      title: "CargoBridge Expands Operations to Three New Canadian Cities",
      excerpt: "We're excited to announce the opening of new logistics centers in Montreal, Calgary, and Halifax to better serve our growing customer base.",
      content: "This expansion represents a significant milestone in our mission to provide comprehensive logistics solutions across Canada. The new facilities will reduce transit times and improve service quality for customers in Eastern and Western Canada...",
      category: 'company',
      author: "Michael Rodriguez",
      publishDate: "2024-01-12",
      readTime: 3,
      views: 892,
      likes: 67,
      tags: ["expansion", "canada", "logistics", "growth"],
      featured: false
    },
    {
      id: 3,
      title: "AI-Powered Route Optimization Reduces Shipping Costs by 15%",
      excerpt: "Our latest AI technology implementation has successfully reduced average shipping costs while improving delivery reliability across all routes.",
      content: "The new AI system analyzes historical shipping data, weather patterns, and traffic conditions to determine the most efficient routes. This technology has already saved our customers over $2 million in shipping costs...",
      category: 'technology',
      author: "Dr. Lisa Wang",
      publishDate: "2024-01-10",
      readTime: 7,
      views: 1563,
      likes: 124,
      tags: ["ai", "optimization", "cost-reduction", "technology"],
      featured: true
    },
    {
      id: 4,
      title: "Market Analysis: E-commerce Growth Drives Demand for Express Shipping",
      excerpt: "The rapid growth of e-commerce in North America is creating new opportunities and challenges for logistics providers.",
      content: "E-commerce sales have increased by 45% year-over-year, with cross-border purchases from China growing even faster. This trend is driving demand for faster, more reliable shipping services...",
      category: 'market',
      author: "James Thompson",
      publishDate: "2024-01-08",
      readTime: 4,
      views: 743,
      likes: 45,
      tags: ["ecommerce", "market-trends", "shipping", "growth"],
      featured: false
    },
    {
      id: 5,
      title: "Sustainable Shipping: Our Commitment to Carbon Neutral Operations",
      excerpt: "CargoBridge announces ambitious plans to achieve carbon neutrality across all operations by 2025.",
      content: "We're investing in electric vehicles, renewable energy, and carbon offset programs to minimize our environmental impact. This initiative aligns with our values and customer expectations for sustainable business practices...",
      category: 'company',
      author: "Emma Green",
      publishDate: "2024-01-05",
      readTime: 6,
      views: 1089,
      likes: 156,
      tags: ["sustainability", "carbon-neutral", "environment", "commitment"],
      featured: false
    },
    {
      id: 6,
      title: "New Sea Freight Service Connects Shanghai to Vancouver in 12 Days",
      excerpt: "Our enhanced sea freight service offers the fastest direct route between Shanghai and Vancouver with guaranteed 12-day transit times.",
      content: "The new service utilizes our most advanced container ships and optimized port operations to deliver industry-leading transit times. This service is particularly beneficial for time-sensitive cargo...",
      category: 'shipping',
      author: "Captain David Liu",
      publishDate: "2024-01-03",
      readTime: 4,
      views: 634,
      likes: 78,
      tags: ["sea-freight", "shanghai", "vancouver", "transit-time"],
      featured: false
    }
  ];

  const featuredArticle = newsArticles.find(article => article.featured);
  const regularArticles = newsArticles.filter(article => !article.featured);

  const handleBookmark = (articleId: number) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleLike = (articleId: number) => {
    setLikedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setNewsletterEmail('');
      alert(t("newsletter_success"));
    }, 1000);
  };


  return (
    <div className="min-h-screen">
      {/* Featured Article Section */}
      {featuredArticle && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("featured_article")}
              </h2>
            </div>

            <div className="bg-gradient-to-r from-cargo-600 to-cargo-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-8 lg:p-12 text-white">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                  {featuredArticle.title}
                </h3>
                <p className="text-lg opacity-90 mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm opacity-80 mb-6">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{featuredArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{featuredArticle.publishDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{featuredArticle.readTime} {t("article_reading_time")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="bg-white text-cargo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    {t("read_full_article")}
                  </button>
                  <button
                    onClick={() => handleBookmark(featuredArticle.id)}
                    className="p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                  >
                    <BookmarkIcon className={`w-5 h-5 ${bookmarkedArticles.includes(featuredArticle.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleLike(featuredArticle.id)}
                    className="p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                  >
                    <HeartIcon className={`w-5 h-5 ${likedArticles.includes(featuredArticle.id) ? 'fill-current text-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest News Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("latest_news")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest developments in logistics and international trade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{article.publishDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{article.readTime} {t("article_reading_time")}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBookmark(article.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <BookmarkIcon className={`w-4 h-4 ${bookmarkedArticles.includes(article.id) ? 'fill-current text-cargo-600' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleLike(article.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <HeartIcon className={`w-4 h-4 ${likedArticles.includes(article.id) ? 'fill-current text-red-500' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-cargo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("newsletter_title")}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("newsletter_subtitle")}
          </p>
          <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder={t("newsletter_email_placeholder")}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-white text-cargo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isSubscribing ? t("subscribing") : t("subscribe")}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Contact News Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t("news_contact")}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Have a news tip or press inquiry? Get in touch with our news team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:news@cargobridge.com"
              className="bg-cargo-600 hover:bg-cargo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              news@cargobridge.com
            </a>
            <a
              href="tel:+1-416-555-0126"
              className="border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              +1 (416) 555-0126
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;