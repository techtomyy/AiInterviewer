# AI Interview Coach Platform

## Overview

This is a full-stack AI-powered interview coaching platform built with React and Express. The application helps candidates practice job interviews with AI-generated feedback on speech clarity, body language, eye contact, and content structure. It includes both candidate and recruiter interfaces, with features for video recording, AI analysis using OpenAI's GPT-4 and Whisper, and progress tracking with visual analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and caching
- **Charts**: Recharts for data visualization and progress tracking
- **Authentication**: Replit Auth integration for OAuth-based login

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **File Processing**: Multer for video upload handling
- **AI Integration**: OpenAI API for speech transcription (Whisper) and content analysis (GPT-4)

### Database Schema
- **Users**: Stores user profiles with role-based access (candidate/recruiter/admin)
- **Questions**: Interview questions organized by categories and difficulty levels
- **Interview Sessions**: Records of practice sessions with status tracking
- **Session Feedback**: AI-generated feedback scores and recommendations
- **Candidate Evaluations**: Recruiter assessments for hiring workflows

### Key Features
- **Video Recording**: Browser-based video capture with real-time audio level monitoring
- **AI Analysis**: Automated transcription and multi-dimensional scoring (clarity, confidence, eye contact, content structure, pacing)
- **Progress Tracking**: Historical performance charts and improvement recommendations
- **Recruiter Tools**: Candidate evaluation and status management interface
- **Subscription System**: Stripe integration for premium features

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Auth**: OAuth authentication service for user management
- **OpenAI API**: GPT-4 for content analysis and Whisper for speech-to-text
- **Stripe**: Payment processing and subscription management

### Key Libraries
- **Database**: Drizzle ORM with PostgreSQL driver
- **UI**: Radix UI primitives, Shadcn/ui components, Lucide React icons
- **Development**: Vite bundler, TypeScript compiler, Tailwind CSS
- **Data Visualization**: Recharts for analytics dashboards
- **Form Handling**: React Hook Form with Zod validation
- **Media**: Browser MediaRecorder API for video capture

### Development Tools
- **Linting**: ESLint with TypeScript rules
- **Styling**: PostCSS with Tailwind CSS and Autoprefixer
- **Build**: Vite for frontend, esbuild for backend bundling
- **Database Migration**: Drizzle Kit for schema management