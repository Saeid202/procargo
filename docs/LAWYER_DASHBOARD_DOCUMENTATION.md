# Lawyer Dashboard Documentation

## Overview

The Lawyer Dashboard is a specialized interface designed for legal professionals within the ProCargo platform. It provides tools for managing legal cases, reviewing client submissions, and maintaining case documentation. The dashboard is built using React with TypeScript and follows a modular component architecture.

## Architecture & Structure

### Core Components

#### 1. Main Dashboard Component
- **File**: `src/components/LawyerDashboard.tsx`
- **Purpose**: Main container that orchestrates the entire lawyer interface
- **Key Features**:
  - Tab-based navigation system
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
- **File**: `src/pages/lawyer-dashboard/LawyerOverviewPage.tsx`
- **Status**: Currently empty (placeholder for future implementation)
- **Intended Purpose**: Dashboard summary with key metrics and recent activity

##### Cases Management Page
- **File**: `src/pages/lawyer-dashboard/LawyerCasesPage.tsx`
- **Purpose**: Core functionality for managing legal cases
- **Key Features**:
  - Case listing with detailed information
  - Expandable case details
  - Document attachment management
  - Status tracking and updates
  - Response system for case communication

##### Settings Page
- **File**: `src/pages/lawyer-dashboard/LawyerSettingPage.tsx`
- **Purpose**: Profile and account management
- **Features**:
  - Profile information editing
  - First name, last name, and email management
  - Integration with Supabase for data persistence

## Navigation Structure

The lawyer dashboard uses a three-tab navigation system:

1. **Overview** (`lawyer-overview`)
   - Icon: HomeIcon
   - Color: text-cargo-600
   - Purpose: Dashboard summary and analytics

2. **Cases** (`lawyer-cases`)
   - Icon: CalculatorIcon
   - Color: text-green-600
   - Purpose: Case management and review

3. **Settings** (`lawyer-settings`)
   - Icon: ClipboardDocumentListIcon
   - Color: text-orange-600
   - Purpose: Account and profile management

## Data Models

### Case Data Structure
```typescript
interface CaseData {
  user_id: string;
  assigned_to: string | null;
  plaintiff_type: string;
  headquarter: string;
  defendant_name: string;
  subject: string;
  description: string;
  status?: 'SUBMITTED' | 'IN_REVIEW' | 'NEED_MORE_INFO' | 'RESOLVED' | 'CLOSED' | 'REJECTED' | 'COMPLETED';
  created_at?: string;
  case_documents?: CaseDocument[];
}
```

### Case Document Structure
```typescript
interface CaseDocument {
  case_id: string;
  doc_type: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
}
```

## Key Features

### 1. Case Management System

#### Case Listing
- Displays all cases in a tabular format
- Shows key information: subject, plaintiff, defendant, status, creation date
- Color-coded status indicators:
  - **SUBMITTED**: Red background
  - **IN_REVIEW**: Yellow background
  - **COMPLETED**: Green background

#### Case Details View
- Expandable details for each case
- Comprehensive case information display
- Document attachment viewer
- Status management interface
- Response system for lawyer-client communication

#### Document Management
- File upload and storage via Supabase Storage
- Document categorization by type
- Public URL generation for document access
- File metadata tracking (name, type, size)

### 2. Status Management

#### Case Statuses
- **SUBMITTED**: Initial case submission
- **IN_REVIEW**: Under lawyer review
- **NEED_MORE_INFO**: Requires additional information
- **RESOLVED**: Case resolved
- **CLOSED**: Case closed
- **REJECTED**: Case rejected
- **COMPLETED**: Case completed successfully

#### Status Updates
- Visual status indicators with color coding
- Status change functionality
- Progress tracking system

### 3. Communication System

#### Response Interface
- Text area for lawyer responses
- Price quotation input
- Delivery date specification
- Status update buttons
- Form validation and submission

#### Document Sharing
- Secure file upload system
- Document categorization
- Public URL generation for sharing
- File type validation

## Technical Implementation

### State Management
- React hooks for local state management
- Context API for authentication
- Supabase integration for data persistence

### Data Flow
1. **Authentication**: User authentication via Supabase Auth
2. **Data Fetching**: Cases loaded via `SupabaseService.getCases()`
3. **State Updates**: Local state updates trigger UI re-renders
4. **Data Persistence**: Changes saved to Supabase database

### API Integration

#### SupabaseService Methods Used
- `getCases()`: Fetch all cases with documents
- `updateProfile()`: Update lawyer profile information
- `uploadCaseDocuments()`: Upload case-related documents
- `createCaseDocuments()`: Create document metadata

### Internationalization
- Full i18n support using react-i18next
- Translation keys for all user-facing text
- Support for multiple languages (English, Farsi)

## User Workflow

### 1. Login and Access
1. Lawyer logs in with credentials
2. System validates role and redirects to lawyer dashboard
3. Dashboard loads with overview tab active

### 2. Case Management
1. Navigate to Cases tab
2. View list of all assigned cases
3. Click expand button to view case details
4. Review case information and documents
5. Provide response or update case status

### 3. Case Response Process
1. Select case requiring response
2. Fill out response form with:
   - Text response
   - Price quotation
   - Delivery date
3. Submit response or update status
4. System saves changes and notifies relevant parties

### 4. Document Management
1. View attached documents in case details
2. Download documents via provided links
3. Upload new documents if needed
4. Organize documents by type

## Security Features

### Authentication
- Supabase Auth integration
- Role-based access control
- Session management

### Data Protection
- Secure file storage via Supabase Storage
- Public URL generation for document access
- User-specific data isolation

### Input Validation
- Form validation on client side
- Server-side validation via Supabase
- File type and size restrictions

## Future Enhancements

### Planned Features
1. **Overview Dashboard**: Analytics and metrics display
2. **Real-time Notifications**: Live updates for case changes
3. **Advanced Search**: Filter and search cases
4. **Calendar Integration**: Case deadlines and appointments
5. **Client Communication**: Direct messaging system
6. **Document Templates**: Pre-built legal document templates

### Technical Improvements
1. **Performance Optimization**: Lazy loading and caching
2. **Mobile Responsiveness**: Enhanced mobile experience
3. **Offline Support**: Basic offline functionality
4. **Advanced Analytics**: Case performance metrics

## Troubleshooting

### Common Issues
1. **Case Loading Failures**: Check Supabase connection and permissions
2. **Document Upload Issues**: Verify file size and type restrictions
3. **Authentication Problems**: Ensure proper role assignment
4. **Translation Missing**: Check i18n configuration

### Debug Information
- Console logging for API calls
- Error handling with user-friendly messages
- Loading states for better UX

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
- Cases table with proper relationships
- Case documents table for file metadata
- Profiles table for user information
- Storage buckets for file storage

This documentation provides a comprehensive overview of the Lawyer Dashboard system, its architecture, features, and implementation details. It serves as a guide for developers, administrators, and users working with the legal case management functionality of the ProCargo platform.
