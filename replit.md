# AlvaCapital Trading Platform

## Overview
AlvaCapital is a comprehensive trading platform designed for portfolio management, referral tracking, and copy trading. It allows users to connect multiple trading accounts from various brokers (Bybit for crypto, TradeF for forex/CFDs/indices/stocks), monitor performance, manage referrals, and engage in master-copier copy trading relationships. The platform is a full-stack web application focusing on real-time data and a user-friendly interface for financial operations, aiming for a strong market presence in financial technology.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Futuristic cyber theme with pure black background and cyan/blue gradient colors, optimized for OLED displays, featuring animated grid backgrounds, glitch effects, and neon-style borders.
- **Theming**: Theme-aware imagery and dynamic switching for UI elements.
- **Components**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS.
- **Fonts**: System mono fonts for a cyber aesthetic.
- **Imagery**: Authentic Bybit trading interface screenshots integrated across multiple device mockups.
- **Layout**: Responsive grid and flexbox layouts for consistent horizontal alignment.
- **Button Redesign**: Gradient cyan-to-blue buttons with hover effects and shadow animations.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for state management, React Hook Form with Zod for form validation.
- **Backend**: Express.js with TypeScript on Node.js.
- **Database ORM**: Drizzle ORM for type-safe database operations.
- **Authentication**: Replit Auth with OpenID Connect, supporting Google, Apple, X (Twitter), GitHub, and Email/Password.
- **API Design**: RESTful endpoints with centralized error handling.
- **Multi-Broker Integration**: Connectors for Bybit (cryptocurrency) and TradeF (forex, CFDs, indices, stocks).
- **Copy Trading Engine V2**: Real-time trade replication via Bybit WebSocket, async task queue, API key validation, risk management (slippage, position limits, ratio sizing), and automated profit splits.
- **Admin Portal**: Cyber-themed interface for system statistics, client management, withdrawal requests, broker configurations, and copy trading oversight.
- **Real-time Data**: Alpha Vantage API integration for live market prices.
- **Security**: Encrypted API key storage, comprehensive logout mechanism clearing all session data and caches. Users configure Bybit API keys with "No IP restriction" option for easier onboarding.
- **Bybit Connection Guide**: Interactive step-by-step guide with 7 screenshots showing users how to create Bybit API keys with proper permissions (Read-Write, No IP restriction, Unified Trading).

### Feature Specifications
- **Portfolio Management**: Multi-broker account connection, real-time balance and P&L tracking.
- **Referral System**: Tracking, earnings management, click/conversion analytics.
- **Copy Trading**: Master-copier relationships, automated trade replication, profit splitting.
- **Trading Algorithms**: Support for algorithm configurations, signals, and risk management parameters.
- **User Management**: User profiles, referral codes, hierarchical referral relationships.
- **Withdrawal Management**: Workflow for client withdrawal requests with admin approval.

### System Design Choices
- **Database Schema**: Comprehensive schema covering users, trading accounts, referral system, master-copier connections, copy trading specific tables, algorithms, signals, trades, positions, and admin configurations.
- **Modularity**: Consistent interface design for all broker connectors.
- **Scalability**: Utilizes serverless PostgreSQL (Neon Database) with connection pooling.

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL.
- **Drizzle Kit**: Database migration and schema management.

### Authentication Services
- **Replit Auth**: OIDC-based authentication.
- **OpenID Client**: OIDC protocol implementation.

### UI & Styling Libraries
- **Radix UI**: Headless UI components.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

### External Integrations
- **Trading Brokers**: Bybit (cryptocurrency), TradeF (forex, CFDs, indices, stocks).
- **Broker APIs**: Bybit API.
- **Market Data**: Alpha Vantage API.
- **Technical Analysis**: `technicalindicators` library.
- **Authentication Providers**: Google, Apple, X (Twitter), GitHub (via Replit Auth).