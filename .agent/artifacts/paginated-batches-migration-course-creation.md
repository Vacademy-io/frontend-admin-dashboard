# Paginated Batches API Migration - Course Creation

## Overview

This document describes the migration of course creation flows from the legacy `batches_for_sessions` approach to the new Paginated Batches API.

## Files Modified

### 1. New Service Layer Created

| File                                                          | Description                          |
| ------------------------------------------------------------- | ------------------------------------ |
| `src/services/paginated-batches/paginated-batches-service.ts` | Core service functions for API calls |
| `src/services/paginated-batches/usePaginatedBatches.ts`       | React Query hooks for data fetching  |
| `src/services/paginated-batches/index.ts`                     | Barrel exports                       |

### 2. Course Creation Files Updated

| File                                                                                              | Changes                                                                         |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/routes/study-library/ai-copilot/course-outline/generating/services/courseCreationService.ts` | Updated to use `findPackageSessionIdsWithRetry` instead of fetching all batches |
| `src/components/common/study-library/add-course/add-course-form.tsx`                              | Updated to use paginated API with fallback to legacy approach                   |

## Key Changes

### Before (Legacy Approach)

```typescript
// Fetch ALL batches at once
const instituteDetails = await fetchInstituteDetails();
const batchesForSessions = instituteDetails.batches_for_sessions;

// Search through all batches to find matching package
const packageSessionIds = findIdByPackageId(batchesForSessions, courseId);
```

### After (Paginated Approach)

```typescript
// Use targeted API call with packageId filter
const packageSessionIdArray = await findPackageSessionIdsWithRetry(courseId, {
    maxRetries: 3,
    retryDelayMs: 2000,
    onRetry: (attempt) => setProgress(`Waiting for course... (attempt ${attempt})`),
});
const packageSessionIds = packageSessionIdArray.join(',');
```

## Benefits

1. **Performance**: Only fetches batches for the specific course, not all batches
2. **Reliability**: Built-in retry logic handles race conditions
3. **Scalability**: Works efficiently for institutes with thousands of courses
4. **Backward Compatibility**: Falls back to legacy approach if paginated API fails

## Retry Logic

The `findPackageSessionIdsWithRetry` function handles the race condition where a newly created course may not immediately appear in the database:

```
Attempt 1: Query packageId=<courseId>
  ├── Found → Return IDs
  └── Not Found → Wait 2s

Attempt 2: Query packageId=<courseId>
  ├── Found → Return IDs
  └── Not Found → Wait 2s

Attempt 3: Query packageId=<courseId>
  ├── Found → Return IDs
  └── Not Found → Throw Error
```

## API Endpoints Used

| Endpoint                                                    | Purpose                   |
| ----------------------------------------------------------- | ------------------------- |
| `GET /paginated-batches/{instituteId}?packageId={courseId}` | Find batches for a course |

## Testing Checklist

-   [ ] Create new course via AI Copilot (study-library/ai-copilot)
-   [ ] Create new course via manual form (add-course-form)
-   [ ] Verify subject/module/chapter are created correctly
-   [ ] Test with slow network conditions
-   [ ] Test course creation when backend has delay

## Rollback Plan

If issues are found, the fallback logic in both files will automatically use the legacy `fetchInstituteDetails` approach. To fully rollback:

1. Remove the import for `findPackageSessionIdsWithRetry`
2. Restore the original logic that fetches all `batches_for_sessions`

## Next Steps

The following features still need migration:

-   [ ] Manage Payments (filter dropdowns)
-   [ ] Manage Inventory (filter dropdowns)
-   [ ] Live Sessions (batch selection)
-   [ ] Student Management (batch filters)
-   [ ] Announcements (recipient targeting)
-   [ ] useInstituteDetailsStore methods

---

_Migration completed: 2026-01-22_
