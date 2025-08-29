import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cargo-50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Bridge Your Cargo
              <span className="text-cargo-600 block">China to Canada</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Reliable, fast, and secure cargo services connecting the world's largest manufacturing hub 
              with North America's fastest-growing market. Experience seamless logistics with CargoBridge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-cargo-600 hover:bg-cargo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started Today
              </Link>
              <Link
                to="#services"
                className="border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cargo-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cargo-300 rounded-full opacity-20 animate-bounce"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cargo-600">10,000+</div>
              <div className="text-gray-600">Successful Shipments</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cargo-600">99.8%</div>
              <div className="text-gray-600">On-Time Delivery</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cargo-600">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-cargo-600">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Cargo Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive logistics solutions tailored for China-Canada trade routes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                <TruckIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sea Freight</h3>
              <p className="text-gray-600 mb-4">
                Cost-effective ocean shipping with FCL and LCL options, perfect for large shipments.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• FCL & LCL Services</li>
                <li>• Global Port Coverage</li>
                <li>• Customs Clearance</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                <GlobeAltIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Air Freight</h3>
              <p className="text-gray-600 mb-4">
                Express air freight services for time-sensitive shipments and urgent deliveries.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Express & Standard</li>
                <li>• Door-to-Door Service</li>
                <li>• Real-time Tracking</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customs & Compliance</h3>
              <p className="text-gray-600 mb-4">
                Expert customs clearance and compliance services for smooth border crossings.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Documentation Support</li>
                <li>• Regulatory Compliance</li>
                <li>• Risk Management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CargoBridge?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make international shipping simple, reliable, and cost-effective
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-6 h-6 text-cargo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Transit Times</h3>
                  <p className="text-gray-600">
                    Optimized routes and partnerships ensure your cargo reaches its destination in the shortest possible time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-6 h-6 text-cargo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Network</h3>
                  <p className="text-gray-600">
                    Extensive network of partners and facilities across China and Canada for seamless operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CurrencyDollarIcon className="w-6 h-6 text-cargo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
                  <p className="text-gray-600">
                    Transparent pricing with no hidden fees. Get the best value for your shipping needs.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-cargo-100 to-blue-100 rounded-2xl p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Get a Free Quote</h3>
                  <p className="text-gray-600 mb-6">
                    Calculate shipping costs and transit times for your cargo
                  </p>
                  <Link
                    to="/signup"
                    className="bg-cargo-600 hover:bg-cargo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                  >
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cargo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ship Your Cargo?
          </h2>
          <p className="text-xl text-cargo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust CargoBridge for their international shipping needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-cargo-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Start Shipping Today
            </Link>
            <Link
              to="#contact"
              className="border-2 border-white text-white hover:bg-white hover:text-cargo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-cargo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="ml-2 text-xl font-bold">CargoBridge</span>
              </div>
              <p className="text-gray-400">
                Connecting China and Canada through reliable cargo services.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Sea Freight</li>
                <li>Air Freight</li>
                <li>Customs Clearance</li>
                <li>Warehousing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>News</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+1 (555) 123-4567</li>
                <li>info@cargobridge.com</li>
                <li>123 Shipping St, Toronto, ON</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CargoBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
