# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Vite
- `npm run build` - Production build 
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview production build locally

### Setup
```bash
npm i           # Install dependencies
npm run dev     # Start development server
```

## Architecture Overview

This is a React-based prompt management application built with Vite, TypeScript, and shadcn/ui components.

### Core Architecture
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: React Router (single page app with Index and NotFound routes)
- **State Management**: React Context API via PromptsContext
- **Data Persistence**: localStorage for prompts and usage statistics
- **UI Components**: Extensive shadcn/ui component library

### Key Application Structure

**Main App Flow**:
- `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx` → `src/components/Dashboard.tsx`
- Single-page application with PromptsProvider wrapping the entire app

**Data Flow**:
- `PromptsContext` (`src/contexts/PromptsContext.tsx`) manages all prompt data and statistics
- Uses localStorage with keys: `prompts` and `promptStats`
- Provides CRUD operations and statistics tracking for prompts

**Core Components**:
- `Dashboard.tsx` - Main interface with search, sort, and grid layout
- `PromptCard.tsx` - Individual prompt display cards
- `EditorModal.tsx` - Prompt creation/editing modal
- `StatsCounter.tsx` - Usage statistics display

### Text Highlighting System

The application features a custom text highlighting system for variable detection:

**Core Files**:
- `src/components/ui/highlighted-textarea.tsx` - Custom textarea with overlay highlighting
- `src/utils/promptUtils.ts` - Variable processing and prompt building logic

**How It Works**:
- Variables are defined using `{variableName}` syntax in prompt text
- HighlightedTextarea creates a transparent overlay that highlights variables in real-time
- Known variables (defined in prompt.variables array) show in primary color
- Unknown variables show in red to indicate errors
- Supports both exact and normalized matching (ignoring spaces)

**Variable Processing**:
- `buildPromptPayload()` replaces variables with values using intelligent XML wrapping
- Uses proximity detection: variables get XML tags unless they're within 3 characters of other text
- Character limit protection: duplicates payload if over 50,000 characters

### Data Models

**Prompt Interface** (`src/types/prompt.ts`):
```typescript
interface Prompt {
  id: string;
  title: string;
  body: string;
  variables: string[];
  updatedAt: string;
  isPinned?: boolean;
  timesUsed?: number;
  timeSavedMinutes?: number;
}
```

### UI Component Library

Uses shadcn/ui extensively - all components are in `src/components/ui/`. Key customizations:
- `highlighted-textarea.tsx` - Custom component for variable highlighting
- Standard shadcn/ui components for consistent design system

### State Management Patterns

- PromptsContext provides centralized state management
- localStorage persistence with error handling and fallbacks
- Sample data initialization if no stored data exists
- Real-time statistics calculation and tracking

## Development Notes

- Uses Vite for fast development and building
- ESLint configured for code quality
- TypeScript strict mode enabled
- Lovable platform integration for collaborative development
- No test framework currently configured
- Uses crypto.randomUUID() for ID generation