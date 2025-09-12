# ProCargo - Cargo Services Platform

A comprehensive React-based platform for managing cargo services between China and Canada, featuring role-based dashboards, order management, legal case management, and multi-language support.

## 🚀 Features

- **Role-Based Dashboards**: Specialized interfaces for different user types
  - **User Dashboard**: Order management and tracking
  - **Agent Dashboard**: Logistics coordination and partner management
  - **Lawyer Dashboard**: Legal case management and document handling
  - **Admin Dashboard**: Translation management and system administration
- **Multi-Language Support**: Full internationalization with English and Farsi
- **Authentication**: Secure user signup and login system with role-based access
- **Order Management**: Complete order tracking with supplier management
- **Legal Case Management**: Comprehensive case tracking and document management
- **Partner Network**: Logistics partner directory with communication tools
- **Translation Management**: Admin interface for managing multi-language content
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Modern UI**: Clean, professional interface with consistent design system

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Sidebar, DashboardLayout)
│   ├── admin/           # Admin-specific components
│   │   ├── TranslationEditor.tsx
│   │   ├── TranslationList.tsx
│   │   ├── TranslationFilters.tsx
│   │   └── TranslationImportExport.tsx
│   ├── ui/              # Basic UI components
│   ├── Dashboard.tsx    # Main user dashboard container
│   ├── AgentDashboard.tsx    # Agent dashboard container
│   ├── LawyerDashboard.tsx   # Lawyer dashboard container
│   ├── AdminDashboard.tsx    # Admin dashboard container
│   ├── OrderForm.tsx    # Order creation form
│   ├── LoginPage.tsx    # User login page
│   ├── SignUpPage.tsx   # User registration page
│   ├── LandingPage.tsx  # Landing page
│   └── Navigation.tsx   # Navigation component
├── pages/               # Page components organized by feature
│   ├── dashboard/       # User dashboard pages
│   │   ├── OverviewPage.tsx    # Dashboard overview
│   │   ├── OrdersPage.tsx      # Orders management
│   │   ├── ShipmentsPage.tsx   # Shipments tracking
│   │   ├── CompliancePage.tsx  # Compliance management
│   │   ├── LegalAssistancePage.tsx
│   │   ├── LegalIssuePage.tsx
│   │   └── SupportPage.tsx
│   ├── agent-dashboard/ # Agent-specific pages
│   │   ├── AgentOverviewPage.tsx
│   │   ├── AgentOrdersPage.tsx
│   │   ├── AgentLogisticsPage.tsx
│   │   └── AgentSettingPage.tsx
│   ├── lawyer-dashboard/ # Lawyer-specific pages
│   │   ├── LawyerOverviewPage.tsx
│   │   ├── LawyerCasesPage.tsx
│   │   └── LawyerSettingPage.tsx
│   ├── admin/           # Admin-specific pages
│   │   ├── TranslationManagementPage.tsx
│   │   └── MigrationPage.tsx
│   ├── account/         # Account-related pages
│   │   └── SettingsPage.tsx    # User profile settings
│   └── auth/            # Authentication pages
│       ├── LoginPage.tsx
│       └── SignUpPage.tsx
├── services/            # API services and external integrations
│   ├── supabaseService.ts
│   └── translationService.ts
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── lib/                 # Library configurations
│   ├── supabase.ts
│   └── i18n/            # Internationalization
├── locales/             # Translation files
│   ├── en/
│   └── fa/
├── abstractions/        # Type definitions and enums
│   └── enums/
├── utils/               # Utility functions and helpers
└── config/              # Configuration files
```

## 🎯 Architecture Benefits

### **Option 2: Grouped Structure (Recommended)**
- **Organized by Feature**: Components grouped by their purpose and functionality
- **Scalable**: Easy to add new features without cluttering existing components
- **Maintainable**: Clear separation of concerns and responsibilities
- **Team-Friendly**: Multiple developers can work on different features simultaneously
- **Reusable**: Layout components can be shared across different pages

### **Key Components**

#### **Layout Components**
- `DashboardLayout.tsx`: Main layout wrapper with sidebar and header
- `Sidebar.tsx`: Collapsible left navigation with user profile
- `Header.tsx`: Top header with dynamic content and notifications

#### **Page Components**
- `OverviewPage.tsx`: Dashboard overview with statistics and recent shipments
- `OrdersPage.tsx`: Complete order management with table and form integration
- `SettingsPage.tsx`: Comprehensive user profile management

#### **Form Components**
- `OrderForm.tsx`: Dynamic order creation form with supplier management

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **Icons**: Heroicons
- **Routing**: React Router
- **State Management**: React Hooks with Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with role-based access
- **File Storage**: Supabase Storage
- **Internationalization**: React i18next
- **Build Tool**: Create React App
- **Package Manager**: npm
- **Notifications**: React Hot Toast

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cargo-services
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Configure Environment Variables**
   Create a `.env` file with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 👥 User Roles & Dashboards

### **User Dashboard**
- Order creation and management
- Shipment tracking
- Compliance management
- Legal assistance requests
- Profile settings

### **Agent Dashboard**
- Order processing and logistics coordination
- Partner network management
- Business metrics and analytics
- Communication with logistics partners
- Quote management

### **Lawyer Dashboard**
- Legal case management
- Document handling and review
- Case status tracking
- Client communication
- Legal response system

### **Admin Dashboard**
- Translation management
- System administration
- User management
- Content management

## 📚 Documentation

### **Dashboard Documentation**
- [Lawyer Dashboard Documentation](docs/LAWYER_DASHBOARD_DOCUMENTATION.md) - Comprehensive guide for legal case management
- [Agent Dashboard Documentation](docs/AGENT_DASHBOARD_DOCUMENTATION.md) - Complete guide for logistics coordination
- [Translation Admin Setup](docs/TRANSLATION_ADMIN_SETUP.md) - Multi-language content management

### **Key Features by Role**
- **Role-Based Access Control**: Secure access based on user permissions
- **Multi-Language Support**: Full i18n with English and Farsi
- **Real-Time Updates**: Live data synchronization
- **File Management**: Secure document upload and storage
- **Communication Tools**: Built-in messaging and response systems

## 🎨 Design System

### **Color Palette**
- **Primary**: Custom cargo colors (`cargo-50` to `cargo-900`)
- **Accent**: Standard Tailwind colors for different states
- **Neutral**: Gray scale for text and borders

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### **Components**
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Consistent styling with hover states
- **Forms**: Clean inputs with focus rings
- **Tables**: Responsive tables with hover effects

## 🔮 Future Enhancements

- **Mobile App**: React Native companion app
- **Advanced Analytics**: Enhanced dashboard analytics and reporting
- **Real-time Notifications**: WebSocket integration for live updates
- **API Integration**: Third-party shipping and logistics APIs
- **Advanced Search**: Enhanced filtering and search capabilities
- **Workflow Automation**: Automated order processing workflows
- **Calendar Integration**: Schedule management and deadline tracking
- **Advanced Security**: Enhanced security features and audit logs

## 📁 File Organization Principles

1. **Feature-Based**: Group related functionality together
2. **Separation of Concerns**: Layout, business logic, and UI components are separate
3. **Reusability**: Common components are placed in shared directories
4. **Scalability**: Structure supports growth and new features
5. **Maintainability**: Clear organization makes code easier to maintain

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new components
3. Maintain consistent styling with Tailwind CSS
4. Add proper TypeScript interfaces for props
5. Follow React best practices and hooks
6. Ensure proper role-based access control
7. Add appropriate translations for new features
8. Test with different user roles and permissions

## 📄 License

This project is licensed under the MIT License.