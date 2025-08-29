# CargoBridge - Cargo Services Platform

A comprehensive React-based platform for managing cargo services between China and Canada, featuring a modern dashboard, order management, and user profile management.

## 🚀 Features

- **Landing Page**: Beautiful, responsive landing page with hero section, services, and CTA
- **Authentication**: User signup and login system
- **Dashboard**: Comprehensive dashboard with left sidebar navigation
- **Order Management**: Complete order tracking with automatic numbering and status management
- **Profile Management**: Comprehensive user profile settings with business information
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Modern UI**: Clean, professional interface with consistent design system

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Sidebar, DashboardLayout)
│   ├── forms/           # Form components
│   ├── ui/              # Basic UI components
│   ├── Dashboard.tsx    # Main dashboard container
│   ├── OrderForm.tsx    # Order creation form
│   ├── LoginPage.tsx    # User login page
│   ├── SignUpPage.tsx   # User registration page
│   ├── LandingPage.tsx  # Landing page
│   └── Navigation.tsx   # Navigation component
├── pages/               # Page components organized by feature
│   ├── dashboard/       # Dashboard-specific pages
│   │   ├── OverviewPage.tsx    # Dashboard overview
│   │   └── OrdersPage.tsx      # Orders management
│   ├── account/         # Account-related pages
│   │   └── SettingsPage.tsx    # User profile settings
│   └── business/        # Business-related pages
├── services/            # API services and external integrations
├── stores/              # State management (Zustand/Redux)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
└── constants/           # Application constants
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
- **State Management**: React Hooks (with room for Zustand/Redux)
- **Build Tool**: Create React App
- **Package Manager**: npm
- **Database**: Mock data (ready for future database integration)

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

4. **Open your browser**
   Navigate to `nhttp://localhost:3000`

## 📱 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

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

- **Database**: Mock data (ready for future database integration)
- **Authentication**: JWT-based authentication system
- **Real-time Updates**: WebSocket integration for live data
- **Mobile App**: React Native companion app
- **Analytics**: Dashboard analytics and reporting
- **Multi-language**: Internationalization support
- **API Integration**: Real shipping API integrations

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

## 📄 License

This project is licensed under the MIT License.
