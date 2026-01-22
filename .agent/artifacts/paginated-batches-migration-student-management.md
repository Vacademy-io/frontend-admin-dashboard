# Paginated Batches API Migration - Student Management

## Overview

This document describes the migration of the Student Management filters and list section to use the new Paginated Batches API, replacing the legacy `batches_for_sessions` dependency.

## Files Modified

| File                                                                                                                | Description                           |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `src/routes/manage-students/students-list/-constants/all-filters.tsx`                                               | Added `GetFilterDataOptimized` helper |
| `src/routes/manage-students/students-list/-components/students-list/student-list-section/student-filters.tsx`       | Updated to use `useBatchesSummary`    |
| `src/routes/manage-students/students-list/-components/students-list/student-list-section/students-list-section.tsx` | Main migration to paginated hooks     |

## Key Changes

### 1. Optimized Filter Generation

Created `GetFilterDataOptimized` which accepts pre-fetched batches from the paginated API instead of iterating over the massive `instituteDetails.batches_for_sessions` array.

```typescript
const filters = GetFilterDataOptimized({
    instituteDetails,
    currentSession: currentSession.id,
    sessionBatches: sessionBatches?.content, // Fetched via usePaginatedBatches
    hasOrgAssociatedBatches: batchesSummary?.has_org_associated, // From summary API
});
```

### 2. URL Batch Resolution

Previously, the code searched through all 4000+ batches to find details for batches in the URL query params. Now, it uses `useBatchesByIds` to fetch only the needed batch details.

```typescript
// Previous:
// batchIds.forEach(id => search through all batches...)

// New:
const { data: urlBatchesData } = useBatchesByIds(urlBatchIds);
```

### 3. "Add Session" Enablement

The "Add Session" button previously checked `instituteDetails.batches_for_sessions.length`. This forced loading of all batches. It now uses the lightweight `useBatchesSummary` hook.

```typescript
const { data: batchesSummary } = useBatchesSummary();
const hasBatches = (batchesSummary?.total_batches ?? 0) > 0;
```

## Performance Improvements

-   **Initial Load**: Student list no longer waits for `batches_for_sessions` (4MB+ JSON) to load.
-   **Filtering**: Dropdowns populate faster as they only process batches for the current session.
-   **Memory**: Drastically reduced memory usage by not storing thousands of unused batch objects.

## backward Compatibility

The `GetFilterData` legacy function is preserved but unused in the main flow, allowing for safe fallback if needed (though the main component now uses the optimized path).

## Testing Checklist

-   [ ] Verify student list loads correctly
-   [ ] Verify "Batch" filter dropdown shows batches for current session
-   [ ] Verify selecting a batch from dropdown filters the table
-   [ ] Verify URL with `?batch=...` correctly selects the batch on load
-   [ ] Verify "Add Session" button is enabled/disabled correctly
-   [ ] Verify "Role" filter appears if organization-associated batches exist

---

_Migration completed: 2026-01-22_
