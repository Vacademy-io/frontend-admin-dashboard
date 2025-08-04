# Institute Selection Feature

This feature handles institute selection for users who are enrolled in multiple institutes with different roles.

## Overview

The institute selection system ensures that:
1. **Students only** are blocked from logging in (not allowed to access admin portal)
2. **Users with multiple institutes** see an institute selection page
3. **Users with single institute** are automatically directed to the dashboard
4. **Role priority** is enforced: ADMIN > TEACHER > STUDENT

## Key Components

### 1. Institute Selection Logic (`src/lib/auth/instituteUtils.ts`)

Core utility functions for handling institute selection:

- `getInstitutesFromToken()` - Extracts institutes from JWT token
- `getValidInstitutes()` - Filters institutes based on role requirements
- `getPrimaryRole()` - Determines primary role (ADMIN > TEACHER > STUDENT)
- `shouldBlockStudentLogin()` - Checks if user should be blocked from logging in
- `getInstituteSelectionResult()` - Determines if selection is needed

### 2. Institute Service (`src/lib/auth/instituteService.ts`)

API service functions for fetching institute details:

- `fetchInstituteDetailsById()` - Fetches details for a single institute
- `fetchMultipleInstituteDetails()` - Fetches details for multiple institutes in parallel
- `getInstituteName()` - Gets display name from institute details or falls back to ID

### 3. Institute Selection Component (`src/routes/login/-components/LoginPages/sections/InstituteSelection.tsx`)

UI component that displays available institutes with real names and handles selection. Fetches institute details from API to show proper institute names, location, and type.

### 4. Institute Guard (`src/components/common/auth/InstituteGuard.tsx`)

Protects routes by ensuring users have selected an institute before accessing the dashboard.

### 5. Institute Switcher (`src/components/common/auth/InstituteSwitcher.tsx`)

Allows users to switch between institutes from the dashboard. Displays real institute names and location information.

## Role Logic

### Priority Order
1. **ADMIN** - Highest priority, can access admin dashboard
2. **TEACHER** - Can access admin dashboard
3. **STUDENT** - Should be redirected to learner platform

### Institute Filtering Rules
- ✅ Include if user has **ADMIN** role
- ✅ Include if user has **TEACHER** role
- ❌ Exclude if user has **only STUDENT** role
- ✅ Include if user has **STUDENT + other roles** (will use primary role)

## User Flow

### Single Institute
1. User logs in
2. System detects single valid institute
3. Auto-selects institute
4. Redirects to dashboard

### Multiple Institutes
1. User logs in
2. System detects multiple valid institutes
3. Shows institute selection page
4. User selects institute
5. Redirects to dashboard

### Student Only
1. User logs in
2. System detects only STUDENT role
3. Blocks login and shows access denied message

## Integration Points

### Login Form (`src/routes/login/-components/LoginPages/sections/login-form.tsx`)
- Updated to handle institute selection after successful login
- Integrates with OAuth and SSO flows

### OAuth Login (`src/hooks/login/oauth-login.ts`)
- Updated to handle institute selection for OAuth users
- Redirects to institute selection if needed

### Dashboard Access
- Protected by `InstituteGuard` component
- Ensures institute is selected before access

## Usage Examples

### Setting Selected Institute
```typescript
import { setSelectedInstitute } from '@/lib/auth/instituteUtils';

setSelectedInstitute('institute-id');
```

### Getting Current Institute Role
```typescript
import { getUserRoleForInstitute } from '@/lib/auth/instituteUtils';

const role = getUserRoleForInstitute('institute-id');
// Returns: 'ADMIN', 'TEACHER', 'STUDENT', or null
```

### Using Institute Hook
```typescript
import { useInstitute } from '@/hooks/auth/useInstitute';

const { currentInstituteId, selectInstitute, getCurrentInstituteRole } = useInstitute();
```

## Testing

Use the `InstituteTest` component to verify the logic works correctly:

```typescript
import { InstituteTest } from '@/components/common/auth/InstituteTest';

// Add to any route for testing
<InstituteTest />
```

## Token Structure

The system expects JWT tokens with this structure:

```json
{
  "authorities": {
    "institute-id-1": {
      "roles": ["ADMIN"],
      "permissions": ["READ", "WRITE"]
    },
    "institute-id-2": {
      "roles": ["TEACHER", "STUDENT"],
      "permissions": ["CREATE_NEW_EBOOK"]
    }
  }
}
```

## Configuration

The system uses environment variables for SSO configuration:

- `VITE_ADMIN_DOMAIN` - Admin platform domain
- `VITE_LEARNER_DOMAIN` - Learner platform domain
- `VITE_SHARED_DOMAIN` - Shared cookie domain

## Error Handling

- Invalid tokens redirect to login
- No valid institutes show error message
- Network errors show appropriate toast notifications
- Missing institute selection prevents dashboard access
