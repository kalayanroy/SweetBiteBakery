# SweetBite Bakery Application

## Overview

SweetBite Bakery is a full-stack e-commerce application for a bakery business. The application follows a modern web architecture with a React frontend and Node.js/Express backend, using Drizzle ORM for database operations. The application allows customers to browse products, add items to a cart, and place orders, while providing an admin interface for managing products, categories, and orders.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **New Pages Added (October 29, 2025)**: Created dedicated About Us and Contact pages with full navigation integration. About Us page includes company story, mission, values, and history. Contact page features contact form with validation, contact information, business hours, and FAQ section.
- **Currency Display Fix (October 29, 2025)**: Updated formatCurrency function to use English digits (0-9) instead of Bangla digits for all price displays. Changed locale from 'bn-BD' to 'en-US' while maintaining BDT currency format
- **Cart Calculation Fix (June 18, 2025)**: Resolved cart calculation errors by updating product prices from USD to proper BDT amounts in database and clearing corrupted localStorage cache data
- **React Warning Fix (June 18, 2025)**: Fixed React setState warning in CartProvider by moving localStorage operations to useEffect hook instead of during component initialization

## System Architecture

The application follows a client-server architecture with the following key components:

1. **Frontend**: React-based SPA built with TypeScript, Vite, and Tailwind CSS using the shadcn/ui component library
2. **Backend**: Node.js with Express framework, serving both the API and static assets
3. **Database**: PostgreSQL (via Drizzle ORM)
4. **Authentication**: Session-based authentication for admin users

The frontend and backend are tightly coupled in a monorepo structure, with shared types and schemas defined in a common directory.

### Development Architecture

During development, the application uses:
- Vite's development server with HMR for the frontend
- Express middleware mode to handle API requests
- In-memory storage as a fallback when database connection isn't available

### Production Architecture

In production:
- Frontend is built as static assets using Vite
- Backend serves these static assets and API endpoints
- Database persistence through PostgreSQL

## Key Components

### Backend Components

1. **Express Server** (`server/index.ts`):
   - Main server entry point
   - Configures middleware and routes
   - Logs API requests with relevant information

2. **Routes** (`server/routes.ts`):
   - Defines API endpoints for products, categories, orders, and authentication
   - Implements RESTful conventions
   - Loads initial data if the database is empty

3. **Storage** (`server/storage.ts`):
   - Provides a unified interface for data operations
   - Implements CRUD operations for products, categories, users, and orders
   - Includes an in-memory implementation for development

4. **Authentication** (`server/auth.ts`):
   - Manages user authentication and authorization
   - Implements middleware for protected routes
   - Handles password hashing and verification

5. **Schema** (`shared/schema.ts`):
   - Defines database schema using Drizzle ORM
   - Implements Zod validation schemas for input data
   - Exports TypeScript types for application-wide use

### Frontend Components

1. **Application Shell** (`client/src/App.tsx`):
   - Sets up routing with Wouter
   - Configures global providers for theming, queries, and cart state

2. **Pages**:
   - `Home.tsx`: Landing page with featured products and categories
   - `Products.tsx`: Product catalog with filtering capabilities
   - `ProductDetails.tsx`: Detailed view of individual products
   - `Cart.tsx`: Shopping cart management
   - `Checkout.tsx`: Order placement and payment processing
   - `AboutUs.tsx`: Company story, mission, values, and history
   - `Contact.tsx`: Contact form, information, and FAQ
   - Admin pages for dashboard, product management, and authentication

3. **Components**:
   - UI components from shadcn/ui library
   - Custom components for layout, product listings, and checkout process
   - Reusable UI elements following a consistent design language

4. **Hooks**:
   - `use-cart.tsx`: Cart state management with localStorage persistence
   - `use-query-state.tsx`: URL query parameter management
   - `use-toast.ts`: Toast notification system
   - `use-mobile.tsx`: Responsive design utility

## Data Flow

1. **Product Browsing Flow**:
   - User accesses the application
   - Frontend loads categories and featured products from the API
   - User browses products by category or search
   - Product details are loaded on demand

2. **Cart Management Flow**:
   - User adds products to cart
   - Cart state is managed in the browser and persisted in localStorage
   - User can adjust quantities or remove items
   - Cart totals are calculated on the client

3. **Checkout Flow**:
   - User fills out shipping and payment information
   - Order is submitted to the API
   - Confirmation is displayed to the user
   - Order is stored in the database

4. **Admin Flow**:
   - Admin logs in with credentials
   - Session is established on the server
   - Admin can view dashboard statistics
   - Admin can manage products and categories

## External Dependencies

### Frontend Dependencies
- **React**: Core UI library
- **Wouter**: Lightweight routing library
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library based on Radix UI
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Recharts**: Chart visualization for admin dashboard

### Backend Dependencies
- **Express**: Web server framework
- **Drizzle ORM**: Database ORM
- **bcrypt**: Password hashing
- **connect-pg-simple**: Session storage
- **@neondatabase/serverless**: Database connectivity (for serverless environments)

## Deployment Strategy

The application is configured for deployment on Replit with the following features:

1. **Build Process**:
   - Frontend: Vite builds static assets
   - Backend: esbuild bundles the server code
   - Combined into a single deployable package

2. **Runtime Configuration**:
   - Environment variables for database connection
   - Production mode optimizations

3. **Database Provisioning**:
   - PostgreSQL database via Replit's built-in database service
   - Schema migrations with Drizzle Kit

4. **Scaling**:
   - Configured for auto-scaling deployment

5. **Development Experience**:
   - Hot Module Replacement for frontend
   - Automatic restart for backend changes
   - Error overlay for runtime errors

## Data Schema

### Key Entities

1. **Categories**: Product categories (e.g., Cakes, Pastries)
   - Fields: id, name, slug

2. **Products**: Bakery items for sale
   - Fields: id, name, slug, description, price, image, categoryId, featured, dietary options

3. **Users**: Admin users for the system
   - Fields: id, username, password, isAdmin

4. **Orders**: Customer orders
   - Fields: id, customerName, customerEmail, address, status, etc.

5. **OrderItems**: Items within an order
   - Fields: id, orderId, productId, quantity, price