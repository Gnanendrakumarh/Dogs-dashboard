# Dogs Web API - Breed Management System

## Overview

The Dogs Web API is a full-stack web application designed for managing dog breeds and sub-breeds with complete CRUD functionality. The system provides a clean, modern interface for viewing, creating, editing, and deleting breed information with persistent storage. Built as a demonstration of sound backend and frontend engineering practices, the application features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Component Structure**: Modular component architecture with reusable UI components

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with standard HTTP methods for CRUD operations
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware
- **Development Features**: Hot module replacement and runtime error overlay

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Two main tables (breeds and sub_breeds) with foreign key relationships
- **Migrations**: Drizzle Kit for database schema management
- **Data Integrity**: UUID primary keys, cascading deletes, and proper constraints

### Key Features
- **CRUD Operations**: Complete create, read, update, delete functionality for breeds and sub-breeds
- **Search & Pagination**: Debounced search with server-side pagination
- **Form Validation**: Client and server-side validation with error feedback
- **Responsive Design**: Mobile-first responsive design with modern UI patterns
- **Data Persistence**: All changes persist across sessions and server restarts

### Development Workflow
- **Build System**: Vite for frontend, esbuild for backend production builds
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Development Server**: Integrated development environment with HMR and error overlays
- **Code Organization**: Monorepo structure with shared schemas and clear separation of concerns

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Environment Configuration**: DATABASE_URL environment variable for database connection

### UI Framework Dependencies
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

### Development Tools
- **Replit Integration**: Development environment integration with error overlays and debugging tools
- **Vite Plugins**: Runtime error modal and cartographer for enhanced development experience

### Runtime Dependencies
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: TypeScript-first schema validation
- **Wouter**: Lightweight routing library
- **Date-fns**: Date utility library for time formatting