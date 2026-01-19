# Google OAuth Implementation Guide

This document describes how Google OAuth authentication is implemented in Prompt Vault and provides step-by-step instructions to replicate this implementation in another React + Supabase project.

## Table of Contents

1. [Implementation Overview](#implementation-overview)
2. [Architecture](#architecture)
3. [Files Involved](#files-involved)
4. [Commit History](#commit-history)
5. [Replication Guide](#replication-guide)
6. [Supabase Dashboard Configuration](#supabase-dashboard-configuration)

---

## Implementation Overview

Prompt Vault uses **Supabase Auth** with **Google OAuth** for user authentication. The implementation includes:

- Google OAuth social sign-in (primary method)
- Email magic links (secondary/fallback method)
- Session persistence with auto-refresh tokens
- Protected routes using an authentication guard component

**Key Characteristics:**
- OAuth credentials are stored in Supabase Dashboard (not in code)
- No client-side secrets required
- Automatic session restoration on page reload
- Token refresh handled automatically by Supabase client

---

## Architecture

### Authentication Flow

```text
User clicks "Continue with Google"
        |
        v
handleGoogleSignIn() -> signInWithProvider('google')
        |
        v
supabase.auth.signInWithOAuth({ provider: 'google', ... })
        |
        v
Browser redirects to Google OAuth consent screen
        |
        v
User approves & grants permissions
        |
        v
Google redirects to: /auth?code=<AUTH_CODE>
        |
        v
Auth.tsx detects code param in URL
        |
        v
exchangeCodeForSession(code) -> Supabase exchanges code for JWT
        |
        v
Session persisted to localStorage by Supabase client
        |
        v
AuthContext listeners trigger, updating state
        |
        v
useEffect redirects to /dashboard
```

### Provider Hierarchy

```tsx
<QueryClientProvider>
  <TooltipProvider>           {/* UI tooltip support */}
    <AuthProvider>              {/* Authentication state */}
      <StorageAdapterProvider>  {/* Depends on auth state */}
        <PromptsProvider>
          <CopyHistoryProvider>
            <RouterProvider />  {/* Routes with RequireAuth guards */}
          </CopyHistoryProvider>
        </PromptsProvider>
      </StorageAdapterProvider>
    </AuthProvider>
  </TooltipProvider>
</QueryClientProvider>
```

---

## Files Involved

### 1. `src/contexts/AuthContext.tsx`

**Purpose:** Centralized authentication state management

**Key Functions:**
- `signInWithProvider(provider, redirectTo)` - Initiates OAuth flow
- `signInWithEmail(email, redirectTo)` - Sends magic link email
- `exchangeCodeForSession(code)` - Exchanges OAuth code for session
- `signOut()` - Signs out user

**Key State:**
- `user` - Current authenticated user object
- `session` - Active session with JWT tokens
- `loading` - Auth initialization status

```tsx
// Key implementation details:
import { User, Session, AuthError, Provider } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, redirectTo?: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: Provider, redirectTo?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  exchangeCodeForSession: (code: string) => Promise<{ error: AuthError | null }>;
}

// OAuth sign-in implementation:
const signInWithProvider = async (provider: Provider, redirectTo?: string) => {
  const fallbackRedirect = typeof window !== 'undefined'
    ? `${window.location.origin}/auth`
    : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || fallbackRedirect,
    },
  });
  return { error };
};
```

### 2. `src/pages/Auth.tsx`

**Purpose:** Authentication UI with Google button and magic link form

**Key Components:**
- Google OAuth button with official brand colors
- Email input form for magic links
- OAuth callback handler (detects `?code=` param)
- Loading states and error handling
- Popup blocker detection (5-second timeout)

```tsx
// Google OAuth button handler:
const handleGoogleSignIn = async () => {
  setLoading(true);
  setLoadingText('Redirecting to Google...');

  const { error } = await signInWithProvider('google', AUTH_REDIRECT_URL);

  if (error) {
    setError(error.message || 'Failed to sign in with Google.');
    setLoading(false);
    return;
  }

  // Detect popup blockers - OAuth redirect should unmount component before this fires
  setTimeout(() => {
    setError('Sign in window may have been blocked. Please check your popup blocker settings.');
    setLoading(false);
  }, 5000);
};

// Auth callback handling (unified for both OAuth and magic links):
useEffect(() => {
  if (!codeParam) return;
  // Exchanges the code (from OAuth redirect or magic link) for a Supabase session
  handleMagicLinkAuth(codeParam);
}, [codeParam, handleMagicLinkAuth]);
```

### 3. `src/components/auth/RequireAuth.tsx`

**Purpose:** Protected route wrapper component

**Behavior:**
- Shows loading spinner while auth state initializes
- Redirects to `/auth` if user is not authenticated
- Renders children only when authenticated

```tsx
export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### 4. `src/lib/supabaseClient.ts`

**Purpose:** Supabase client configuration

**Key Settings:**
```tsx
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Save session to localStorage
    autoRefreshToken: true,    // Auto-refresh expired tokens
    detectSessionInUrl: true,  // Detect OAuth callbacks in URL
  },
});
```

### 5. `src/App.tsx`

**Purpose:** Application root with provider hierarchy and route definitions

**Key Configuration:**
- AuthProvider wraps all other providers
- RequireAuth guards protected routes

```tsx
// Route configuration example:
<Route path="/auth" element={<Auth />} />

<Route
  path="/dashboard"
  element={
    <RequireAuth>
      <Index />
    </RequireAuth>
  }
/>
```

### 6. `supabase/config.toml`

**Purpose:** Supabase project configuration

**Relevant Settings:**
```toml
[auth]
enabled = true
site_url = "http://127.0.0.1:5173"  # Use your dev server port (Vite default: 5173)
additional_redirect_urls = ["http://localhost:5173/auth", "https://yourdomain.com/auth"]
jwt_expiry = 3600
enable_refresh_token_rotation = true
enable_signup = true
```

> **Note:** The port and URLs above are examples using Vite's default port (5173). Adjust these values to match your development environment. For example, if your dev server runs on port 3000, use `http://127.0.0.1:3000` instead.

---

## Commit History

**Note:** The repository uses a shallow clone with 100 commits. The Google OAuth implementation was added before the current git history begins. The auth files (`AuthContext.tsx`, `Auth.tsx`, `RequireAuth.tsx`) exist in all tracked commits, indicating the feature was part of the initial architecture.

The implementation follows Supabase's recommended patterns for OAuth integration:
- Uses `@supabase/supabase-js` v2.x
- Leverages built-in OAuth flow with code exchange
- No client-side secrets required

---

## Replication Guide

Follow these steps to add Google OAuth to a similar React + Supabase project:

### Prerequisites

- Existing React project with Vite
- Supabase project created
- `@supabase/supabase-js` installed
- React Router configured

### Step 1: Configure Supabase Client

Create or update `src/lib/supabaseClient.ts`:

```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

### Step 2: Create AuthContext

Create `src/contexts/AuthContext.tsx`:

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, redirectTo?: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: Provider, redirectTo?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  exchangeCodeForSession: (code: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires immediately with current session, then on any auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, redirectTo?: string) => {
    try {
      const fallbackRedirect = typeof window !== 'undefined'
        ? `${window.location.origin}/auth`
        : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo || fallbackRedirect },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signInWithProvider = async (provider: Provider, redirectTo?: string) => {
    try {
      const fallbackRedirect = typeof window !== 'undefined'
        ? `${window.location.origin}/auth`
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectTo || fallbackRedirect },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const exchangeCodeForSession = async (code: string) => {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithEmail,
      signInWithProvider,
      signOut,
      exchangeCodeForSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Step 3: Create RequireAuth Component

Create `src/components/auth/RequireAuth.tsx`:

```tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### Step 4: Create Auth Page

Create `src/pages/Auth.tsx` with:

1. Google OAuth button
2. Email magic link form
3. OAuth callback handler (reads `?code=` from URL)
4. Loading states and error handling
5. Redirect to dashboard when authenticated

Key code patterns:

```tsx
// Google icon with official brand colors (paths truncated for brevity)
// See src/pages/Auth.tsx for complete SVG paths
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M22.56 12.25c0-.78..." fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46..." fill="#34A853" />
      <path d="M5.84 14.09c-.22..." fill="#FBBC05" />
      <path d="M12 5.38c1.62 0..." fill="#EA4335" />
    </svg>
  );
}

// OAuth callback handling
const [searchParams] = useSearchParams();
const codeParam = searchParams.get('code');

useEffect(() => {
  if (!codeParam) return;

  const handleAuth = async () => {
    const { error } = await exchangeCodeForSession(codeParam);
    if (error) {
      setError('Failed to sign in. Please try again.');
    }
  };

  handleAuth();
}, [codeParam, exchangeCodeForSession]);

// Auto-redirect authenticated users
useEffect(() => {
  if (user) {
    navigate('/dashboard', { replace: true });
  }
}, [user, navigate]);
```

### Step 5: Update App.tsx

Wrap your app with AuthProvider and add route guards:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';

const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

// In your route configuration:
<Route path="/auth" element={<Auth />} />
<Route
  path="/dashboard"
  element={
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  }
/>
```

### Step 6: Set Environment Variables

Create `.env`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Supabase Dashboard Configuration

OAuth credentials are configured entirely through the Supabase Dashboard - no application code changes needed.

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
8. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Google** and click to expand
5. Enable the provider
6. Enter your **Client ID** and **Client Secret**
7. Save

### Step 3: Configure Redirect URLs

In Supabase Dashboard:

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your production domain
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth` (development)
   - `https://yourdomain.com/auth` (production)

---

## Security Considerations

1. **No client-side secrets** - OAuth credentials stay in Supabase Dashboard
2. **RLS policies** - Database tables should have Row Level Security enabled
3. **HTTPS in production** - OAuth callbacks must use HTTPS
4. **Token refresh** - Supabase client handles this automatically
5. **Session persistence** - Uses localStorage; consider security implications

---

## Troubleshooting

### "Popup blocked" error
- User's browser is blocking the OAuth popup
- Solution: User needs to allow popups for your domain

### Code exchange fails
- Redirect URL mismatch between Google Console and Supabase
- Solution: Ensure URLs match exactly (including trailing slashes)

### User not redirected after sign-in
- Missing `detectSessionInUrl: true` in Supabase client config
- Solution: Verify client configuration

### "Provider not enabled" error
- Google OAuth not configured in Supabase Dashboard
- Solution: Enable Google provider in Authentication > Providers

---

## File Summary

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth state management, OAuth/email sign-in methods |
| `src/pages/Auth.tsx` | Sign-in UI, OAuth callback handler |
| `src/components/auth/RequireAuth.tsx` | Protected route wrapper |
| `src/lib/supabaseClient.ts` | Supabase client with session persistence |
| `src/App.tsx` | Provider hierarchy, route configuration |
| `supabase/config.toml` | Auth settings (redirect URLs, JWT expiry) |

---

*Documentation created: 2026-01-17*
*Based on Prompt Vault implementation*
