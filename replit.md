# AlvaCapital Trading Platform

## Overview

AlvaCapital is a comprehensive trading platform that provides portfolio management, referral tracking, and copy trading capabilities. The platform allows users to connect multiple trading accounts from different brokers (Exness, Bybit, Binance), track their performance, manage referrals, and participate in copy trading through master-copier relationships. Built as a full-stack web application with a modern React frontend and Express.js backend, it emphasizes real-time data management and user-friendly interfaces for financial trading operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **Design System**: Dark theme with custom CSS variables, Inter and Playfair Display fonts

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect and session management
- **API Design**: RESTful endpoints with centralized error handling and request logging
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

### Database Schema
- **Users Table**: Stores user profiles with referral codes and hierarchical referral relationships
- **Trading Accounts**: Multi-broker account connections with balance and P&L tracking
- **Referral System**: Earnings tracking and referral link management with click/conversion analytics
- **Master-Copier Connections**: Copy trading relationships with status management
- **Sessions Table**: Secure session storage for authentication persistence

### Authentication & Authorization
- **Provider**: Replit Auth with OIDC for secure authentication
- **Session Management**: Server-side sessions with PostgreSQL storage and configurable TTL
- **Route Protection**: Middleware-based authentication checks for protected endpoints
- **User Context**: Centralized user state management through React Query

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### Authentication Services
- **Replit Auth**: OIDC-based authentication service
- **OpenID Client**: Standards-compliant authentication flow implementation

### UI & Styling
- **Radix UI**: Headless component primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### External Integrations
- **Trading Brokers**: Support for Exness, Bybit, and Binance account connections
- **Real-time Data**: Portfolio balance and P&L tracking capabilities
- **Referral Analytics**: Click and conversion tracking for referral links

## Recent Changes (October 2025)

### Copy Trading Automation
- **Scheduler Service**: Automated copy trading scheduler running on server startup
  - Position monitoring every 30 seconds via `CopyTradingEngine`
  - Weekly profit splits on Sundays at 00:00 UTC via `ProfitSplitService`
  - Instant trade replication with ratio-based position sizing
  - Automatic profit transfers (50/50 split) with USDT via Bybit API

### API Endpoints
- **Copy Trading Control**:
  - `POST /api/copy-trading/sync/:accountId` - Manual position sync trigger
  - `POST /api/copy-trading/profit-split` - Manual profit split execution
  - `GET /api/action-logs` - Fetch user action logs
  - `GET /api/profit-transfers` - Fetch user profit transfer history
- **Dashboard Data**: GET `/api/dashboard` - Real-time balance, P&L, and performance metrics
- **Bybit Connection**: POST `/api/bybit/connect` - Auto-connects users as copiers to master account

### Bybit Integration Enhancements (October 3, 2025)
- **IP Whitelist Display**: Connection form now prominently displays required IP whitelist (0.0.0.0/0) with setup instructions
- **Auto-Copier Connection**: New Bybit accounts automatically connect as copiers to master account (sahabyoona@gmail.com)
  - Eliminates manual copier setup for users
  - Creates master-copier relationship with 1.0 copy ratio on connection
  - Master account determined by sahabyoona@gmail.com's first Bybit trading account
- **Simplified Connection Flow**: Removed accountId requirement - system generates it automatically
- **Real-time Balance Sync**: Dashboard fetches live Bybit balances via API for connected accounts
  - Portfolio Value shows aggregated real-time balance across all accounts
  - Today's P&L displays actual daily profit/loss from Bybit performance stats
  - Automatic fallback to stored values if API calls fail

### User Interface Improvements (October 3, 2025)
- **User Profile Dropdown**: Non-admin users now have profile dropdown menu replacing logout button
  - Displays user avatar/icon with name and chevron indicator
  - Menu includes "Profile Settings" and "Logout" options
  - Improved user experience and navigation consistency
- **Admin Access**: Admin button remains visible only for authorized users (sahabyoona@gmail.com, mihhaa2p@gmail.com)
- **Performance Metrics**: Copier Settings section now shows real calculated performance percentage
  - Formula: ((current_balance - initial_capital) / initial_capital) * 100
  - Color-coded: green for positive returns, red for negative
  - Averaged across all accounts with trading capital set

### Theme Redesign - Bybit-Inspired Design (October 3, 2025)
- **Complete Color Overhaul**: Changed from orange brand color to Bybit's signature blue
  - Primary color: `hsl(217, 91%, 60%)` (Bybit Blue)
  - Light theme: Clean white background with black text
  - Dark theme: Deep black background with white text
  - All accent colors updated to blue gradient schemes
- **Enhanced Landing Page**:
  - Added device showcase section with laptop browser mockup and mobile phone preview
  - Integrated live market prices section displaying 10 major instruments (Gold, Silver, BTC, ETH, XRP, EUR/USD, GBP/JPY, S&P 500, UK 100, Crude Oil)
  - Browser chrome with traffic lights and address bar for realistic device preview
  - Mini chart visualizations in dashboard preview
  - Floating animation effects for engaging user experience
- **Button Redesign**: Updated all CTAs with Bybit-style rounded buttons
  - Gradient blue buttons with shadow effects
  - Rounded corners (xl border radius)
  - Hover scale and shadow animations
  - Outline buttons with blue borders
- **Market Prices Component**: Real-time market data display
  - 10 instruments: Gold, Silver, Bitcoin, Ethereum, XRP, EUR/USD, GBP/JPY, S&P 500, UK 100, Crude Oil
  - Color-coded price changes (green for positive, red for negative)
  - Trending icons for visual direction indicators
  - Grid layout responsive across all screen sizes
- **CSS Variables**: Updated entire color system in `index.css`
  - Foreground colors: From navy blue to pure black/white
  - Border radius: Reduced from 0.75rem to 0.5rem for modern look
  - Premium card gradients updated to black/white/blue scheme
  - Shimmer effect now uses blue color

### Bug Fixes
- **Authentication**: Fixed email unique constraint handling in user authentication
  - Added graceful error handling for duplicate email scenarios
  - Prevents server crashes during OIDC login conflicts
  - Maintains email uniqueness while supporting account updates

### Testing Status
- ✅ End-to-end testing completed successfully (October 3, 2025)
- ✅ Admin interface verified (restricted to sahabyoona@gmail.com, mihhaa2p@gmail.com)
- ✅ Bybit integration tested (connection form with IP whitelist, API endpoints, auto-copier connection)
- ✅ User profile dropdown tested (non-admin users)
- ✅ Real-time balance and performance metrics verified
- ✅ Copy trading scheduler confirmed running
- ✅ Action logs and profit transfers endpoints validated