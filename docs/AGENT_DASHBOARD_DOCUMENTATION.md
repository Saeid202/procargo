# Agent Dashboard Documentation

## Overview

The Agent Dashboard is a comprehensive interface designed for logistics agents within the ProCargo platform. It provides tools for managing orders, coordinating logistics, communicating with partners, and tracking business metrics. The dashboard is built using React with TypeScript and follows a modular component architecture optimized for logistics operations.

## Architecture & Structure

### Core Components

#### 1. Main Dashboard Component
- **File**: `src/components/AgentDashboard.tsx`
- **Purpose**: Main container that orchestrates the entire agent interface
- **Key Features**:
  - Four-tab navigation system
  - Collapsible sidebar functionality
  - Internationalization support (i18n)
  - State management for active tabs and sidebar state

#### 2. Dashboard Layout
- **File**: `src/components/layout/DashboardLayout.tsx`
- **Purpose**: Shared layout component used across all dashboard types
- **Features**:
  - Responsive design with sidebar and main content area
  - Header with active tab display
  - Flexible sidebar configuration
  - User profile integration (configurable)

#### 3. Page Components

##### Overview Page
- **File**: `src/pages/agent-dashboard/AgentOverviewPage.tsx`
- **Purpose**: Business metrics and performance dashboard
- **Key Features**:
  - Total orders counter
  - Pending orders tracking
  - Completed orders summary
  - Revenue calculation and display
  - Real-time data loading from Supabase

##### Orders Management Page
- **File**: `src/pages/agent-dashboard/AgentOrdersPage.tsx`
- **Purpose**: Comprehensive order management system
- **Key Features**:
  - Order listing with detailed information
  - Expandable order details
  - Supplier information management
  - Product and logistics tracking
  - Order status management
  - Response system for order communication

##### Logistics Page
- **File**: `src/pages/agent-dashboard/AgentLogisticsPage.tsx`
- **Purpose**: Partner management and logistics coordination
- **Key Features**:
  - Partner directory with ratings
  - Service type filtering
  - Communication tools
  - Quote request system
  - Recent communications tracking

##### Settings Page
- **File**: `src/pages/agent-dashboard/AgentSettingPage.tsx`
- **Purpose**: Profile and account management
- **Features**:
  - Profile information editing
  - First name, last name, and email management
  - Integration with Supabase for data persistence

## Navigation Structure

The agent dashboard uses a four-tab navigation system:

1. **Overview** (`agent-overview`)
   - Icon: HomeIcon
   - Color: text-cargo-600
   - Purpose: Business metrics and performance dashboard

2. **Orders** (`agent-orders`)
   - Icon: CalculatorIcon
   - Color: text-green-600
   - Purpose: Order management and tracking

3. **Logistics** (`agent-logistics`)
   - Icon: TruckIcon
   - Color: text-blue-600
   - Purpose: Partner management and logistics coordination

4. **Settings** (`agent-settings`)
   - Icon: ClipboardDocumentListIcon
   - Color: text-orange-600
   - Purpose: Account and profile management

## Data Models

### Order Data Structure
```typescript
interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: string;
  origin_country: string;
  destination_country: string;
  total_value: number;
  currency: string;
  estimated_delivery: string;
  created_at: string;
  suppliers?: Supplier[];
}
```

### Supplier Data Structure
```typescript
interface Supplier {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_type: string;
  unit_price: number;
  logistics_type: string;
  special_instructions: string;
  notes: string;
  supplier_links?: SupplierLink[];
  supplier_files?: SupplierFile[];
}
```

### Supplier Link Structure
```typescript
interface SupplierLink {
  id: string;
  supplier_id: string;
  url: string;
  description: string;
  quantity: number;
}
```

### Supplier File Structure
```typescript
interface SupplierFile {
  id: string;
  supplier_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
}
```

## Key Features

### 1. Business Overview Dashboard

#### Metrics Display
- **Total Orders**: Count of all orders managed
- **Pending Orders**: Orders awaiting processing
- **Completed Orders**: Successfully delivered orders
- **Revenue**: Total value of completed orders

#### Data Loading
- Real-time data fetching from Supabase
- Automatic calculation of metrics
- Error handling for data loading failures

### 2. Order Management System

#### Order Listing
- Comprehensive table view of all orders
- Key information display: Order ID, Buyer, Product, Quantity, Status, Date
- Color-coded status indicators:
  - **Pending**: Red background
  - **In Progress**: Yellow background
  - **Completed**: Green background

#### Order Details View
- Expandable details for each order
- Product information section
- Supplier links and documentation
- Attachment management
- Order summary for completed orders

#### Order Information Sections
1. **Product Information**:
   - Product names and quantities
   - Category classification
   - Priority level indication

2. **Supplier Links**:
   - Direct links to supplier websites
   - Link descriptions and quantities
   - Easy access to supplier resources

3. **Attachments**:
   - File downloads for supplier documents
   - Document categorization
   - Secure file access via Supabase Storage

4. **Order Summary** (Completed Orders):
   - Final price display
   - Delivery date tracking
   - Delivery status confirmation

### 3. Logistics Partner Management

#### Partner Directory
- **Global Freight Solutions**: Air and sea freight services
- **Ocean Cargo Express**: Sea freight specialist
- **Customs Clear Pro**: Customs brokerage services

#### Partner Information
- Company name and service description
- Contact information (phone, email)
- Average response time
- Star ratings and reviews

#### Partner Interaction
- **Message**: Direct communication with partners
- **Get Quote**: Request pricing information
- **Search and Filter**: Find partners by service type

#### Service Categories
- Air Freight
- Sea Freight
- Land Transport
- Customs Services

### 4. Communication System

#### Order Response Interface
- Text area for agent responses
- Price quotation input
- Delivery date specification
- Status update functionality
- Form validation and submission

#### Partner Communication
- Direct messaging with logistics partners
- Quote request system
- Communication history tracking
- Real-time status updates

### 5. Status Management

#### Order Statuses
- **Pending**: Initial order submission
- **In Progress**: Order being processed
- **Completed**: Order successfully delivered

#### Status Updates
- Visual status indicators with color coding
- Status change functionality
- Progress tracking system
- Automated status notifications

## Technical Implementation

### State Management
- React hooks for local state management
- Context API for authentication
- Supabase integration for data persistence

### Data Flow
1. **Authentication**: User authentication via Supabase Auth
2. **Data Fetching**: Orders loaded via `SupabaseService.getAgentOrders()`
3. **State Updates**: Local state updates trigger UI re-renders
4. **Data Persistence**: Changes saved to Supabase database

### API Integration

#### SupabaseService Methods Used
- `getAgentOrders()`: Fetch all orders with suppliers and files
- `updateProfile()`: Update agent profile information
- `createOrder()`: Create new orders
- `createSupplier()`: Add suppliers to orders
- `createSupplierLinks()`: Add supplier links
- `uploadSupplierFiles()`: Upload supplier documents

### Internationalization
- Full i18n support using react-i18next
- Translation keys for all user-facing text
- Support for multiple languages (English, Farsi)

## User Workflow

### 1. Login and Access
1. Agent logs in with credentials
2. System validates role and redirects to agent dashboard
3. Dashboard loads with overview tab showing business metrics

### 2. Order Management
1. Navigate to Orders tab
2. View list of all assigned orders
3. Click expand button to view order details
4. Review product information and supplier details
5. Manage order status and provide responses

### 3. Logistics Coordination
1. Navigate to Logistics tab
2. Browse available logistics partners
3. Search and filter partners by service type
4. Communicate with partners via messaging
5. Request quotes for specific services

### 4. Order Response Process
1. Select order requiring response
2. Fill out response form with:
   - Text response
   - Price quotation
   - Delivery date
3. Submit response or update order status
4. System saves changes and notifies relevant parties

### 5. Partner Management
1. View partner directory
2. Contact partners for quotes
3. Track communication history
4. Manage ongoing partnerships

## Business Intelligence Features

### Performance Metrics
- **Order Volume**: Track total orders processed
- **Completion Rate**: Monitor order success rate
- **Revenue Tracking**: Calculate total business value
- **Efficiency Metrics**: Measure processing times

### Partner Performance
- **Response Times**: Track partner responsiveness
- **Service Ratings**: Monitor partner quality
- **Communication History**: Maintain interaction records

## Security Features

### Authentication
- Supabase Auth integration
- Role-based access control (AGENT role)
- Session management

### Data Protection
- Secure file storage via Supabase Storage
- Public URL generation for document access
- User-specific data isolation
- Encrypted data transmission

### Input Validation
- Form validation on client side
- Server-side validation via Supabase
- File type and size restrictions
- SQL injection prevention

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Detailed performance dashboards
2. **Real-time Notifications**: Live updates for order changes
3. **Advanced Search**: Filter and search orders by multiple criteria
4. **Calendar Integration**: Delivery schedules and deadlines
5. **Mobile App**: Native mobile application
6. **API Integration**: Third-party logistics APIs
7. **Automated Workflows**: Rule-based order processing

### Technical Improvements
1. **Performance Optimization**: Lazy loading and caching
2. **Mobile Responsiveness**: Enhanced mobile experience
3. **Offline Support**: Basic offline functionality
4. **Real-time Updates**: WebSocket integration
5. **Advanced Filtering**: Complex search and filter options

## Troubleshooting

### Common Issues
1. **Order Loading Failures**: Check Supabase connection and permissions
2. **File Upload Issues**: Verify file size and type restrictions
3. **Authentication Problems**: Ensure proper role assignment
4. **Translation Missing**: Check i18n configuration
5. **Partner Communication**: Verify partner contact information

### Debug Information
- Console logging for API calls
- Error handling with user-friendly messages
- Loading states for better UX
- Network request monitoring

## Dependencies

### Core Dependencies
- React 18+
- TypeScript
- Supabase Client
- React i18next
- Heroicons (for icons)
- Tailwind CSS (for styling)

### Development Dependencies
- React Hot Toast (notifications)
- React Testing Library (testing)

## Configuration

### Environment Variables
- Supabase URL
- Supabase Anon Key
- Authentication redirect URLs

### Database Schema
- Orders table with supplier relationships
- Suppliers table with links and files
- Supplier links table for external resources
- Supplier files table for document metadata
- Profiles table for user information
- Storage buckets for file storage

## Performance Considerations

### Data Loading
- Efficient database queries with proper joins
- Pagination for large datasets
- Caching strategies for frequently accessed data

### User Experience
- Loading states during data fetching
- Error handling with fallback UI
- Responsive design for all screen sizes
- Optimized bundle size

This documentation provides a comprehensive overview of the Agent Dashboard system, its architecture, features, and implementation details. It serves as a guide for developers, administrators, and users working with the logistics and order management functionality of the ProCargo platform.
