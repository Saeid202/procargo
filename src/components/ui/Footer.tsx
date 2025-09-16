import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();
  return (
    <>
       <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-cargo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="ms-2 text-xl font-bold">CargoBridge</span>
              </div>
              <p className="text-gray-400">{t("hero_subtitle")}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer_services")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/services">{t("sea_freight")}</a></li>
                <li><a href="/services">{t("air_freight")}</a></li>
                <li><a href="/services">{t("customs_compliance")}</a></li>
                <li><a href="/services">{t("warehousing")}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer_company")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about">{t("footer_about_us")}</a></li>
                <li><a href="/careers">{t("footer_careers")}</a></li>
                <li><a href="/news">{t("footer_news")}</a></li>
                <li><a href="/contact">{t("footer_contact_page")}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer_contact")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="tel:+1 (555) 123-4567">+1 (555) 123-4567</a></li>
                <li><a href="mailto:info@cargobridge.com">info@cargobridge.com</a></li>
                <li>123 Shipping St, Toronto, ON</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CargoBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
