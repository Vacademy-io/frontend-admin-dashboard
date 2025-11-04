# Auth Transfer Flow Fix

## Problem
The `/auth-transfer` route was not properly loading institute settings and display settings before navigation, causing the display to be inaccurate for the institute during the initial load.

## Root Cause
1. The `__root.tsx` was prematurely redirecting authenticated users from `/auth-transfer` to `/study-library/courses` without loading settings
2. The `auth-transfer/index.tsx` component was immediately navigating after setting tokens, without waiting for settings to load
3. Display settings were being triggered later, after the user had already been redirected

## Solution

### 1. Updated `/auth-transfer/index.tsx`
The component now follows the same flow as the proper login handler (`loginFlowHandler.ts`):

**Key Changes:**
- After tokens are set (from URL params or existing cookies), the flow now:
  1. Determines the user's institute (handles single institute or shows selection if multiple)
  2. Sets the selected institute in localStorage
  3. **Loads course settings** (non-blocking, in background)
  4. **Loads display settings with retry logic** (blocking, with exponential backoff)
  5. Determines the correct redirect URL from display settings
  6. Only then navigates to the target route

- The `DashboardLoader` remains active during the entire settings loading process
- Console logs with `🔍 AUTH-TRANSFER:` prefix help track the flow
- Retry logic (3 attempts with exponential backoff: 500ms, 1s, 2s) ensures display settings are properly loaded
- Falls back to cached display settings if all retries fail

**Flow:**
```
URL with tokens → Set tokens in cookies → Get institute → Set institute →
Load course settings (async) → Load display settings (with retry) →
Determine redirect URL → Navigate
```

### 2. Updated `/routes/__root.tsx`

**Key Changes:**
- Added `/auth-transfer` to the `publicRoutes` array to allow access without authentication
- Modified `handleAuthTransferRoute()` to no longer prematurely redirect
  - Previous: Immediately redirected to `/study-library/courses` if authenticated
  - Now: Allows the component to handle the full flow including settings loading
- Fixed React Hook compliance by extracting the component to a proper named function (`RootComponent`)
- Fixed TypeScript type issues in helper functions

**Comments added to explain the decision:**
```typescript
// Let the auth-transfer component handle the full flow including:
// - Setting tokens from URL params
// - Loading institute settings
// - Loading display settings with retry logic
// - Determining the correct redirect URL
// Don't redirect prematurely here
```

## Benefits

1. **Consistent Display:** Display settings are loaded before navigation, ensuring accurate UI from the start
2. **Better UX:** Loader stays active during settings load, providing clear feedback
3. **Reliable:** Retry logic with exponential backoff handles temporary network issues
4. **Debuggable:** Detailed console logs track the entire flow
5. **Follows Best Practices:** Matches the pattern used in the main login flow

## Testing Checklist

- [ ] Navigate to `/auth-transfer` with `accessToken` and `refreshToken` URL params
- [ ] Verify loader is displayed during settings load
- [ ] Verify console shows `🔍 AUTH-TRANSFER:` logs for each step
- [ ] Verify display settings are loaded before navigation
- [ ] Verify correct redirect based on role (admin vs teacher display settings)
- [ ] Test with single institute user
- [ ] Test with multiple institute user (should show institute selection)
- [ ] Test with existing valid tokens in cookies
- [ ] Test with expired tokens
- [ ] Test with no tokens (should redirect to login)
- [ ] Verify institute-specific branding loads correctly

## Files Changed

1. `/src/routes/auth-transfer/index.tsx` - Complete rewrite to add settings loading
2. `/src/routes/__root.tsx` - Modified to allow auth-transfer component to handle flow

## Related Code

This fix mirrors the logic from:
- `/src/lib/auth/loginFlowHandler.ts` (lines 162-232) - Institute and settings loading flow
- `/src/routes/login/-components/LoginPages/sections/login-form.tsx` (lines 340-399) - Institute selection handler

