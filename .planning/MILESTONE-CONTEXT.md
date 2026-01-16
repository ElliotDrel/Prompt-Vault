# Milestone Context

**Generated:** 2026-01-16
**Status:** Ready for /gsd:new-milestone

<features>
## Features to Build

### Core Visibility System
- **Visibility toggle**: Prompts have `visibility` status (private/public)
- **Default from app setting**: Supabase setting controls default for new prompts (only affects creation)
- **Column naming**: Use `visibility` enum (not "public") to support future values like `'private'`, `'public'`, `'unlisted'`, `'team'`

### Public Library Page
- **New route**: `/library` page showing all public prompts from all users
- **Same layout as dashboard**: Reuse existing UI patterns, same search functionality
- **Author attribution**: Each card shows "by [Author Name]" underneath
- **Author name display**: Full name from DB, fallback to first segment of user ID (never email)
- **Clickable author**: Clicking author name filters to show all their public prompts

### Add to Vault (Live-Linked)
- **Action**: "Add to Vault" button on public prompts
- **Behavior**: Adds prompt to user's vault as read-only, live-synced reference
- **Card indicator**: Shows "Linked from @username" to indicate it's not theirs and stays synced
- **Version history**: Shows the original owner's version history
- **When unavailable**: If original goes private/deleted, auto-convert to fork (seamless for user)

### Fork (Remix)
- **Action**: "Fork" button on public prompts
- **Behavior**: Creates editable copy in user's vault with user as owner
- **Source tracking**: New column `forked_from_prompt_id` to track original source
- **Card indicator**: Shows "Forked from @username"
- **Version history**: Inherits original version history + creates new version entry marking the fork point
- **Post-fork**: All subsequent changes are user's own version history
- **If not added**: Forking a prompt that isn't in vault yet should also add it (fork implies save)

### Cross-Platform Metrics (Public Prompts)
- **Total uses**: How many times copied by all users across platform
- **Time saved**: Calculated total (uses × multiplier)
- **Saves count**: How many users added it to their vault
- **Remix count**: How many users forked it (note: fork also counts as save)

### Copy History Attribution
- **Indicator**: Cards show when a copied prompt belongs to someone else
- **View details**: Same attribution visible in detail view
- **Behavior**: Otherwise identical to current copy history flow

### URL-Based Search & Filter
- **Search syncs to URL**: `?q=keyword` on dashboard, library, history pages
- **Author filter syncs to URL**: `?author=user-id`
- **Shareable links**: Users can share filtered views
- **Navigation**: Author click navigates to `?author=xyz` on current page
- **Works everywhere**: Dashboard, library, and copy history pages

### Shared Component Architecture
- **Reusable template**: Build prompt list/card component that works across pages
- **Configurable per-page**: Data source, what to show (author, metrics, actions)
- **Avoid duplication**: Library page heavily based on dashboard, don't recreate from scratch

### Dashboard Author Attribution
- **Your prompts**: Show "by you" or similar indicator
- **Linked prompts**: Show "Linked from @author"
- **Forked prompts**: Show "Forked from @author"
- **Author filter**: Clicking author name filters dashboard too

</features>

<scope>
## Scope

**Suggested name:** v2.0 Public Prompt Library
**Estimated phases:** 8-10
**Focus:** Enable users to share prompts publicly and discover prompts from others, with live-linking and forking capabilities

</scope>

<phase_mapping>
## Phase Mapping (Suggested)

- Phase 11: Database schema - visibility enum, saved_prompts table, forked_from tracking, app settings
- Phase 12: Shared component architecture - refactor prompt list/cards for reuse
- Phase 13: URL-based search/filter - query params on dashboard, sync to URL
- Phase 14: Visibility toggle - UI to mark prompts public/private, RLS policies
- Phase 15: Public Library page - new route, fetch public prompts, author display
- Phase 16: Add to Vault - live-link functionality, linked indicator, version history access
- Phase 17: Fork - create copies with source tracking, version history integration
- Phase 18: Cross-platform metrics - aggregate views, display on public prompts
- Phase 19: Copy history attribution - indicate external prompts, author filter
- Phase 20: Auto-fork on unavailable - handle private/deleted source prompts

</phase_mapping>

<constraints>
## Constraints

- Column named `visibility` (not "public") for future extensibility
- Author display: full name preferred, truncated user ID fallback, never email
- When public prompt becomes unavailable: auto-fork for all linked users (seamless)
- Fork always implies save (if not already added)
- Same search functionality as dashboard (no categories yet - future feature)
- Reuse existing components - don't rebuild pages from scratch

</constraints>

<notes>
## Additional Context

### Git-like Mental Model
- **Add to Vault** = Like watching/starring (live reference, read-only)
- **Fork** = Like forking (your own copy to modify)
- **Unavailable handling** = Fork survives independently (like GitHub)

### Version History Integration
- Linked prompts: See original owner's full version history
- Forked prompts: Inherit version history + new "Forked from @username" version entry
- Post-fork: User's own version history continues independently

### Author Click Behavior
- Works on all pages (dashboard, library, history)
- Navigates to `?author=user-id` filter on current page
- Shows all prompts/history from that author

### Database Changes Summary
- `visibility` enum column on `prompts` table
- `forked_from_prompt_id` column on `prompts` table (nullable, self-reference)
- `saved_prompts` junction table (user_id, prompt_id, created_at)
- `app_settings` table or row for default visibility setting
- Aggregated metrics view for public prompt stats (uses, saves, forks)
- RLS policies for public prompt access

</notes>

---

*This file is temporary. It will be deleted after /gsd:new-milestone creates the milestone.*
