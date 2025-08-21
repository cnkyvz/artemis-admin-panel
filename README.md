# Artemis Admin Panel

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Material-UI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)

Enterprise admin panel built with React and TypeScript for comprehensive system management, analytics, and administrative control.

## Features

### System Administration
- User management and role assignment
- Service request oversight
- Real-time system monitoring
- Configuration management
- Data export and reporting

### Analytics Dashboard
- Performance metrics visualization
- User activity tracking
- Service completion statistics
- Revenue and cost analysis
- Custom report generation

### Data Management
- Employee performance tracking
- Service history management
- Customer relationship management
- Inventory and asset tracking
- Document management system

## 🌐 Live Production System

**[Access Admin Panel](https://admin.artemisaritim.com)**

Production admin interface for system management:
- Real-time business analytics
- User and employee management
- System administration tools
- Live operational data

*Active production environment*

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Professional component library
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### State Management
- **React Context** - Global state management
- **React Hooks** - Component state management
- **Custom Hooks** - Reusable logic

### Development Tools
- **Create React App** - Build toolchain
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Development Setup

```bash
# Clone the repository
git clone https://github.com/cnkyvz/artemis-admin-panel.git

# Navigate to project directory
cd artemis-admin-panel

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:3000
Build for Production
bash# Create production build
npm run build

# Serve production build locally
npm run serve
Project Structure
artemis-admin-panel/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service functions
│   ├── utils/            # Helper utilities
│   ├── context/          # React context providers
│   ├── styles/           # Global styles
│   └── App.tsx           # Main application component
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
Key Features
Dashboard Overview

Real-time system metrics
Quick action buttons
Recent activity feed
Performance indicators
Alert notifications

User Management

Create and edit user accounts
Role-based access control
Permission management
Activity monitoring
Bulk user operations

Service Management

Service request tracking
Status updates
Assignment management
Performance analytics
Quality control

Analytics & Reporting

Interactive charts and graphs
Customizable date ranges
Export functionality
Automated report generation
Key performance indicators

Component Architecture
Reusable Components

DataTable - Sortable, filterable tables
Charts - Various chart types
Forms - Dynamic form generation
Modals - Popup dialogs
Navigation - Sidebar and topbar

Page Components

Dashboard - Main overview page
Users - User management interface
Services - Service oversight
Analytics - Data visualization
Settings - System configuration

API Integration
The admin panel connects to the backend API for:
typescript// Example API service
interface ApiService {
  getUsers(): Promise<User[]>;
  createUser(user: CreateUserRequest): Promise<User>;
  updateUser(id: string, user: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAnalytics(dateRange: DateRange): Promise<Analytics>;
}
Authentication & Security

JWT token-based authentication
Role-based access control
Protected routes
Session management
Secure API communication

Responsive Design

Mobile-friendly interface
Tablet optimization
Desktop-first approach
Flexible grid system
Adaptive navigation

Performance Optimizations

React.memo for component optimization
Lazy loading for pages
Efficient re-rendering
Bundle size optimization
Code splitting

Development Scripts
bash# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
Browser Support

Chrome 80+
Firefox 75+
Safari 13+
Edge 80+

Contributing
This is a portfolio project demonstrating enterprise admin panel development capabilities with React and TypeScript.
License
This project is for portfolio demonstration purposes.
Contact
Cenk Yavuz - Full Stack Developer

Email: cnkyvzz@gmail.com
LinkedIn: linkedin.com/in/yavuzcenk
GitHub: @cnkyvz
