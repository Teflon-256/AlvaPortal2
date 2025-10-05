# AlvaCapital Trading Platform

## Overview
AlvaCapital is a comprehensive trading platform designed for portfolio management, referral tracking, and copy trading. It enables users to connect multiple trading accounts from various brokers (Exness, Bybit, Binance), monitor performance, manage referrals, and engage in master-copier copy trading relationships. The platform is a full-stack web application with a React frontend and an Express.js backend, focusing on real-time data and a user-friendly interface for financial operations.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Default dark theme with pure black background and vivid, 100% saturated colors, optimized for OLED displays. Light mode uses pure white background with black text.
- **Theming**: Theme-aware imagery and dynamic switching for UI elements based on light/dark mode.
- **Components**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS.
- **Fonts**: Inter and Playfair Display.
- **Imagery**: Authentic Bybit trading interface screenshots integrated across multiple device mockups for credibility.
- **Layout**: Responsive grid and flexbox layouts for consistent horizontal alignment and adaptability across screen sizes.
- **Button Redesign**: Bybit-style rounded buttons with gradient blue colors, hover effects, and shadow animations.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for state management, React Hook Form with Zod for form validation.
- **Backend**: Express.js with TypeScript on Node.js.
- **Database ORM**: Drizzle ORM for type-safe database operations.
- **Authentication**: Replit Auth with OpenID Connect and PostgreSQL-based session management (`connect-pg-simple`).
- **API Design**: RESTful endpoints with centralized error handling and request logging.
- **Multi-Broker Integration**: Connectors for Bybit (wallet, positions, orders, profit split), MT5 (Exness via Expert Advisor for real-time monitoring and orders), and Interactive Brokers (TWS API for portfolio, positions, orders across asset classes).
- **Copy Trading Engine**: Automated scheduler for position monitoring (every 30s), weekly profit splits, instant trade replication with ratio-based sizing, and automatic profit transfers (50/50 USDT).
- **Admin Portal**: Comprehensive interface for system statistics, client management (balance, P&L, account count, CSV export), withdrawal request management, broker requests, master account configuration, and copier management.
- **Real-time Data**: Integration with Alpha Vantage API for live market prices (10 instruments, 5-minute auto-refresh).
- **Security**: AWS EC2 proxy (static IP: 13.61.122.170:8888) for Bybit API calls to bypass geo-restrictions and enable secure features like withdrawals.

### Feature Specifications
- **Portfolio Management**: Multi-broker account connection, real-time balance and P&L tracking.
- **Referral System**: Tracking, earnings management, click/conversion analytics.
- **Copy Trading**: Master-copier relationships, automated trade replication, profit splitting.
- **Trading Algorithms**: Support for algorithm configurations, signals, and risk management parameters.
- **User Management**: User profiles, referral codes, hierarchical referral relationships.
- **Withdrawal Management**: Workflow for client withdrawal requests with admin approval/rejection.

### System Design Choices
- **Database Schema**: Comprehensive schema including users, trading accounts, referral system, master-copier connections, sessions, algorithms, signals, trades, positions, risk parameters, broker configurations, withdrawal requests, and performance analytics.
- **Modularity**: Consistent interface design for all broker connectors.
- **Scalability**: Utilizes serverless PostgreSQL (Neon Database) with connection pooling.

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
- **Trading Brokers**: Exness, Bybit, Binance.
- **Broker APIs**: @stoqey/ib (Interactive Brokers), MetaTrader 5, Bybit API.
- **Market Data**: Alpha Vantage API.
- **Technical Analysis**: `technicalindicators` library.