# AlvaCapital Trading Platform

## Overview
AlvaCapital is a comprehensive trading platform designed for portfolio management, referral tracking, and copy trading. It enables users to connect multiple trading accounts from various brokers (Bybit for crypto, TradeF for forex/CFDs/indices/stocks), monitor performance, manage referrals, and engage in master-copier copy trading relationships. The platform is a full-stack web application with a React frontend and an Express.js backend, focusing on real-time data and a user-friendly interface for financial operations.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 12, 2025)
- **Data Sanitization Audit**: Removed all hardcoded/mock data from production code:
  - Eliminated fake statistics from landing page (replaced with trust messaging)
  - Removed hardcoded badges showing fake earnings (+$234.50) and referral increments (+3 this week)
  - Replaced mock copier data with real backend API integration
  - Verified no test emails, usernames, or credentials in codebase
  - All data fields now bound to live backend or gracefully hidden when unavailable
- **Fixed Login/Logout Flow**: Complete authentication cycle improvements:
  - **Client-side logout**: Selective storage clearing (only auth-related data, preserves user preferences like theme)
  - **Server-side logout**: Proper session destruction with targeted cookie clearing (connect.sid only)
  - **Cache headers**: Applied to logout/login/callback routes to prevent caching issues
  - **Session activity fix**: Activity timestamp updated before checking timeout to prevent immediate expiration on fresh login
  - **OAuth preservation**: Removed aggressive IndexedDB/cache clearing that interfered with OAuth flow
  - **Re-login enabled**: Users can now successfully log back in immediately after logout
- **Enhanced 2FA Setup UI**: Added comprehensive authenticator app support list (Google Authenticator, Microsoft Authenticator, Authy, 1Password, any TOTP app) with improved setup dialog flow
- **Balance Hiding Feature**: Implemented privacy toggle in Security Settings allowing users to hide all balance amounts (displays **** when enabled) with persistent storage in userPreferences
- **Security Page Enhancements**: Added Privacy Settings card with balance visibility toggle, improved 2FA dialog with supported apps information
- **TypeScript Fixes**: Resolved all LSP type errors in security page with proper type casting for API responses and user data
- **Mobile Responsiveness**: Enhanced mobile UI across all pages with responsive text sizes (text-xs sm:text-sm), scrollable tabs on mobile, proper padding adjustments, and horizontal table scrolling for better mobile experience
- **Reusable Loading Component**: Created LoadingSpinner component using landing page animation for API connection states across the platform
- **Admin Portal Mobile**: Optimized admin dashboard tabs and headers for mobile devices with icon-only display on small screens and responsive text
- **Landing Page Footer Links**: Added functional navigation links - Terms (/terms), Privacy (/privacy), and Support (WhatsApp redirect to https://wa.me/256726151699)
- **Profile Settings Enhancement**: Added username and email change functionality to profile setup page with backend support

## System Architecture

### UI/UX Decisions
- **Design System**: Futuristic cyber theme with pure black background and cyan/blue gradient colors, optimized for OLED displays. Features animated grid backgrounds, glitch effects, and neon-style borders.
- **Theming**: Theme-aware imagery and dynamic switching for UI elements based on light/dark mode.
- **Components**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS.
- **Fonts**: Mono fonts for cyber aesthetic (system mono).
- **Imagery**: Authentic Bybit trading interface screenshots integrated across multiple device mockups for credibility.
- **Layout**: Responsive grid and flexbox layouts for consistent horizontal alignment and adaptability across screen sizes.
- **Button Redesign**: Gradient cyan-to-blue buttons with hover effects and shadow animations matching the cyber theme.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for state management, React Hook Form with Zod for form validation.
- **Backend**: Express.js with TypeScript on Node.js.
- **Database ORM**: Drizzle ORM for type-safe database operations.
- **Authentication**: Replit Auth with OpenID Connect and PostgreSQL-based session management. Supports multiple login methods:
  - **Google Login**: OAuth integration via Replit Auth
  - **Apple ID**: Sign in with Apple via Replit Auth
  - **X (Twitter)**: Twitter OAuth integration
  - **GitHub**: GitHub OAuth integration
  - **Email/Password**: Traditional email and password authentication
  - Note: Username and phone authentication are currently managed through email/password flow
- **API Design**: RESTful endpoints with centralized error handling and request logging.
- **Multi-Broker Integration**: 
  - **Bybit**: Primary connector for cryptocurrency trading (spot, futures, wallet management, positions, orders, profit split)
  - **TradeF**: Multi-asset trading platform for forex, CFDs, indices, and stocks
- **Copy Trading Engine V2**: 
  - **WebSocket Trade Detection**: Real-time monitoring of master account trades via Bybit WebSocket
  - **Async Task Queue**: Non-blocking trade replication with priority queue and retry logic
  - **API Key Validation**: Secure validation via Bybit `/v5/account/info` endpoint
  - **Risk Management**: Per-user slippage tolerance, position limits, and ratio-based position sizing
  - **Trade Mirroring**: Automatic replication of master trades to all active copiers with configurable settings
  - **Comprehensive Logging**: Trade mirroring log, sync status tracking, and task queue monitoring
  - **Scheduler**: Automated position sync (every 30s) and weekly profit splits (50/50 USDT)
- **Admin Portal**: Comprehensive futuristic cyber-themed interface for system statistics, client management (balance, P&L, account count, CSV export), withdrawal request management, broker requests, master account configuration, and copier management.
- **Real-time Data**: Integration with Alpha Vantage API for live market prices (10 instruments, 5-minute auto-refresh).
- **Security**: 
  - **AWS EC2 Proxy**: Static IP (13.61.122.170:8888) for Bybit API calls to bypass geo-restrictions and enable secure features like withdrawals
  - **Two-Factor Authentication (2FA)**: TOTP-based authentication using Speakeasy library with QR code generation via QRCode library. Users can enable/disable 2FA through the Security settings page with encrypted secret storage
  - **Comprehensive Logout**: Complete session termination clearing all server-side sessions, client-side storage (localStorage, sessionStorage, IndexedDB, service worker caches), cookies (connect.sid, session, token, refresh_token, remember_me), and cache-control headers to prevent back button session restoration. Implements TanStack Query cache invalidation and OAuth provider logout redirect

### Feature Specifications
- **Portfolio Management**: Multi-broker account connection, real-time balance and P&L tracking.
- **Referral System**: Tracking, earnings management, click/conversion analytics.
- **Copy Trading**: Master-copier relationships, automated trade replication, profit splitting.
- **Trading Algorithms**: Support for algorithm configurations, signals, and risk management parameters.
- **User Management**: User profiles, referral codes, hierarchical referral relationships.
- **Withdrawal Management**: Workflow for client withdrawal requests with admin approval/rejection.

### System Design Choices
- **Database Schema**: Comprehensive schema including:
  - Core: users, trading accounts, referral system, master-copier connections, sessions
  - Copy Trading V2: copierSettings, syncStatus, tradeMirroringLog, copyTradingTasks
  - Trading: algorithms, signals, trades, positions, risk parameters
  - Admin: broker configurations, withdrawal requests, performance analytics, action logs
- **Modularity**: Consistent interface design for all broker connectors.
- **Scalability**: Utilizes serverless PostgreSQL (Neon Database) with connection pooling.

### Copy Trading REST API Endpoints
- `POST /api/copy-trading/validate-key` - Validate Bybit API key via account info endpoint
- `POST /api/copy-trading/register-copier` - Submit copier API keys and settings with validation
- `GET /api/copy-trading/sync-status/:accountId` - Get WebSocket sync status for account
- `GET /api/copy-trading/mirror-history/:accountId` - Retrieve trade mirroring history
- `GET /api/copy-trading/tasks/:accountId` - Get pending/completed task queue items
- `PATCH /api/copy-trading/settings/:accountId` - Update copier risk settings
- `GET /api/copy-trading/settings/:accountId` - Get current copier settings
- `GET /api/admin/copy-trading/tasks` - Admin endpoint for all copy trading tasks

### Copy Trading Frontend UI
- **Page Route**: `/copy-trading` (protected, requires authentication)
- **Navigation**: "COPY TRADING" button in main dashboard header (visible to all authenticated users)
- **5 Main Tabs**:
  1. **Setup Tab**: API key submission form with:
     - Trading account selector
     - Bybit API key/secret inputs (password fields, encrypted storage)
     - Risk settings: slippage tolerance, max position size, copy ratio
     - "Validate API Key" button (calls `/v5/account/info`)
     - "Register as Copier" button (submits to backend)
  2. **Status Tab**: Real-time sync monitoring:
     - Account selector dropdown
     - WebSocket connection status (Connected/Disconnected badge)
     - Sync method, status, last sync time, last error display
     - Refresh button for manual status update
  3. **Settings Tab**: Risk management controls:
     - Slippage tolerance slider (0-10%)
     - Max position size input (USDT)
     - Copy ratio slider (0-100%)
     - Update settings button
  4. **History Tab**: Trade mirroring log viewer:
     - Account selector
     - Sortable table: Time, Symbol, Side, Size, Price, Status
     - Success/Failed badges with icons
     - Last 50 trades (configurable)
  5. **Tasks Tab**: Task queue dashboard:
     - Account selector
     - Task table: Time, Type, Symbol, Status, Priority, Retries
     - Status badges: Completed/Failed/Pending

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL.
- **Drizzle Kit**: Database migration and schema management.
- **AWS EC2**: For static IP proxy (TinyProxy).

### Authentication Services
- **Replit Auth**: OIDC-based authentication.
- **OpenID Client**: OIDC protocol implementation.

### UI & Styling Libraries
- **Radix UI**: Headless UI components.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

### Development Tools
- **Vite**: Fast build tool.
- **TypeScript**: For type safety.
- **ESBuild**: JavaScript bundler.
- **PostCSS**: CSS processing.

### External Integrations
- **Trading Brokers**: 
  - **Bybit**: Primary crypto trading platform
  - **TradeF**: Forex, CFDs, indices, and stocks platform
- **Broker APIs**: Bybit API for cryptocurrency trading
- **Market Data**: Alpha Vantage API for live market prices
- **Technical Analysis**: `technicalindicators` library
- **Authentication Providers**: Google, Apple, X (Twitter), GitHub via Replit Auth