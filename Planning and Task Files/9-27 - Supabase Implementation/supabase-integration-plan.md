# Prompt Vault - Supabase Integration Plan
*Complete conversion from localStorage to Supabase with authentication*

## 🚨 **IMPORTANT: SUPABASE CLI ONLY**
**This plan exclusively uses the Supabase CLI for all database operations. We do NOT use:**
- `supabase start` (local Docker instance)
- Local Supabase development server
- Any Docker containers

**All work targets the hosted Supabase project directly via CLI.**

## Manual vs Automated Tasks

### 🙋‍♂️ **YOU MUST DO MANUALLY** (Claude can't handle terminal interactions):
- Supabase CLI login (`npx supabase login`)
- Project linking (`npx supabase link --project-ref <ref>`)
- Creating your Supabase project in the web dashboard
- Setting up environment variables in your `.env`
- Running migration commands (`npx supabase db push`)
- Any CLI prompts that require interactive responses

### 🤖 **CLAUDE CAN HELP WITH**:
- Installing dependencies
- Writing all code files
- Creating migration files
- Generating TypeScript types
- Building components and contexts
- Implementation and coding

---

## Phase 1: Supabase Project Setup 🔧
*YOU HANDLE: CLI setup | CLAUDE HANDLES: Code and config*

### 🙋‍♂️ Manual Steps (Follow These Exact Steps):

#### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```
**What you'll see**: npm installation output, then command completes

#### Step 2: Create Supabase Project
1. **Open browser** → https://supabase.com/dashboard
2. **Click green "New project" button**
3. **Select your organization** (or create one if first time)
4. **Fill out project form**:
   - Name: `Prompt Vault`
   - Database Password: Generate a strong password (SAVE THIS!)
   - Region: Choose closest to your location
5. **Click "Create new project"**
6. **WAIT 2-3 minutes** for project creation (you'll see a loading screen)
7. **Copy your project reference ID** from the URL:
   - URL will be: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
   - Copy the `YOUR_PROJECT_REF` part (looks like: `abcdefghijklmnop`)

#### Step 3: Initialize Supabase Locally
**In your Prompt Vault terminal, run**:
```bash
npx supabase init
```
**What you'll see**:
- "Generate VS Code settings for Deno? [y/N]" → **Type `N` and press Enter**
- Creates `supabase/` folder with config files

#### Step 4: Login to Supabase CLI
```bash
npx supabase login
```
**What happens**:
1. **Browser opens automatically** to Supabase login
2. **Click "Authorize"** in the browser
3. **Return to terminal** - you'll see "Logged in."

#### Step 5: Link Local Project to Remote
```bash
npx supabase link --project-ref YOUR_PROJECT_REF_FROM_STEP_2
```
**Replace `YOUR_PROJECT_REF_FROM_STEP_2`** with the ID you copied in Step 2
**What you'll see**:
- "Enter your database password:" → **Enter the password from Step 2**
- "Linked to project YOUR_PROJECT_REF"

#### Step 6: Get Environment Variables
1. **Go back to your Supabase dashboard** (browser should still be open)
2. **Click "Settings"** in the left sidebar
3. **Click "API"** in the settings menu
4. **Copy these two values**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: Long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Step 7: Create Environment File
**In your Prompt Vault root folder, create `.env`**:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Replace with your actual values from Step 6**

#### ✅ Verification
**Run this to verify everything worked**:
```bash
npx supabase status
```
**You should see**:
- "Local config: supabase/config.toml"
- "Linked project: YOUR_PROJECT_REF"

### 🤖 Claude Will Handle:

- Installing npm dependencies
- Creating configuration files
- Writing the Supabase client setup
- Creating `.env.example` documentation
- Setting up TypeScript types

**Tell me when you've completed the manual steps above, and I'll handle all the code setup!**

---

## Phase 2: Database Schema Design 📊
*YOU HANDLE: Running migrations | CLAUDE HANDLES: Writing migrations*

### 🤖 Claude Will Create:
- Migration files with SQL schema
- TypeScript type definitions
- RLS policies and triggers

### 🙋‍♂️ You Will Run (When Claude Tells You):

#### When Claude creates migration files, you run:
```bash
npx supabase db push
```
**What you'll see**:
- "Do you want to push these migrations to the remote database? [Y/n]" → **Type `Y` and press Enter**
- "Applying migration..." messages
- "Finished supabase db push."

#### After migrations are applied, generate types:
```bash
npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts
```
**What you'll see**:
- Command runs silently
- Creates/updates `src/lib/database.types.ts` file

**Claude creates the migration files, you run these two commands to apply them and generate TypeScript types.**

---

## Phase 3: Authentication Integration 🔐
*CLAUDE HANDLES: All auth code | YOU HANDLE: Testing*

### 🤖 Claude Will Create:
- `src/lib/supabaseClient.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/Auth.tsx`
- `src/components/auth/RequireAuth.tsx`
- Updated routing in `App.tsx`

### 🙋‍♂️ You Will Test (Detailed Testing Steps):

#### Test Magic-Link Authentication:
1. **Start the dev server**: `npm run dev`
2. **Open browser**: http://localhost:5173
3. **You should be redirected to `/auth`** (since you're not logged in)
4. **Enter your email** in the auth form
5. **Click "Send Magic Link"**
6. **Check your email** (including spam folder)
7. **Click the magic link** in the email
8. **Should redirect back to app** and you should be logged in
9. **Refresh the page** - you should stay logged in

#### Test Session Persistence:
1. **Close browser completely**
2. **Reopen browser** and go to http://localhost:5173
3. **Should still be logged in** (no redirect to auth page)

#### Test Logout:
1. **Find the logout button** (Claude will show you where)
2. **Click logout**
3. **Should redirect to `/auth`** page

**If any of these steps fail, tell Claude what happened and we'll debug together.**

---

## Phase 4-8: Full Implementation
*CLAUDE HANDLES: All code | YOU HANDLE: Testing & feedback*

### 🤖 Claude Will:
- Remove all localStorage usage
- Ensure app requires authentication
- Clean up unused sample data code
- Add proper offline error handling

## Phase 8: Production Readiness ✅
*CLAUDE HANDLES: Final polish | YOU HANDLE: Deployment prep*

### 🤖 Claude Will:
- Add environment variable validation
- Implement proper error logging
- Optimize performance and bundle size
- Add security headers and validation

---

## Quick Start Workflow

1. **You**: Complete Phase 1 manual setup (Supabase project + CLI)
2. **Claude**: Installs dependencies and writes database migrations
3. **You**: Run `npx supabase db push` when Claude provides migration files
4. **Claude**: Creates all implementation code
5. **You**: Verify functionality and provide feedback
6. **Claude**: Continues with next phase until complete

## 🔧 **CLI-Only Development Workflow**
```bash
# The ONLY Supabase commands you'll use:
npx supabase login                    # Login to Supabase
npx supabase link --project-ref <id>  # Link to remote project
npx supabase db push                  # Apply migrations to remote
npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts
npx supabase status                   # Check connection status

# We do NOT use:
# supabase start (starts local Docker - NOT USED)
# supabase stop (stops local Docker - NOT USED)
```

## Current Dependencies to Add

**Claude will run these for you:**
```bash
npm install @supabase/supabase-js
npm install --save-dev supabase
```

---

**The plan is designed so you handle the interactive CLI stuff (login, linking, project creation) and Claude handles all the actual coding. After your initial Supabase setup, most of the work is automated code generation that Claude can do!**

Ready to start with Phase 1 manual setup?