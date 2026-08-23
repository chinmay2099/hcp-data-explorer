# HCP Data Explorer

A React + TypeScript application for exploring 50,000 healthcare provider records with interactive features like grouping, filtering, sorting, editing, and multi-tenant theming.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Material UI** for UI components
- **TanStack Virtual** for virtualized rendering
- No external state management (React hooks only)

## Architecture

### Data Flow

The app follows a simple pipeline:

```
50,000 HCP Records → Search → Filters → Sorting → Grouping → Virtualization → UI
```

Each transformation is independent and passes its output to the next step. This keeps the logic clean and easy to debug.

### State Management

I used React hooks instead of a state management library because:

- The app's state isn't complex enough to need Redux/Zustand
- Local state is easier to reason about
- No prop drilling issues thanks to composition

**Key state pieces:**

- `useHcpData` - Data generation and loading
- `useFiltering` - Search and region/territory filters
- `useSorting` - Column sorting with three-state cycle
- `useGrouping` - Region → Territory grouping with expand/collapse
- `useTenantTheme` - Runtime theme switching

### Virtualization

Used TanStack Virtual instead of building from scratch because:

- It's well-tested and performant
- Handles edge cases I'd miss (scrolling, resize, etc.)
- Small bundle size (~5KB)

The virtualizer only renders ~15 visible rows instead of all 50,000, keeping the UI smooth at 60fps.

### Row Identity

The data generator intentionally has duplicate HCP IDs. I added an internal `rowKey` when records enter the app to:

- Track edits/selections reliably
- Maintain identity across sorting/filtering/grouping
- Avoid issues when the same ID appears multiple times

## FR-5 Design: Bulk Edit with Partial Failure

### Problem Statement

Users need to apply bulk operations (like "+10% calls") to multiple HCPs. Since validation is async and can fail independently per row, some operations will succeed while others fail. The challenge is:

- How to handle concurrent validations
- How to represent partial success/failure to the user
- How to undo a partially-failed bulk operation as one step
- How to handle conflicts with single-cell edits

### State Shape

```typescript
interface BulkEditState {
  selectedRows: Set<string>; // rowKeys of selected HCPs
  bulkOperation: {
    operation: string; // e.g., "+10% calls"
    status: "idle" | "running" | "complete";
    results: Map<string, BulkEditResult>; // rowKey → result
    startTime: number;
  };
}

interface BulkEditResult {
  status: "success" | "error";
  oldValue: number | string;
  newValue: number | string;
  error?: string; // validation error message
}
```

### Implementation Approach

**Selection UI:**

- Add checkbox column to each row
- Add "Select All" checkbox in table header
- Add "Select All in Territory" button in territory header
- Selection persists across filtering/sorting (uses rowKey)

**Bulk Operation Trigger:**

- Show "+10% calls" button when rows are selected
- Button disabled during operation
- Show progress indicator: "Validating 5/20 rows..."

**Concurrent Validation:**

```typescript
const promises = selectedRows.map((rowKey) =>
  validateAndApply(rowKey, operation),
);
const results = await Promise.allSettled(promises);
```

- Use `Promise.allSettled` instead of `Promise.all` to handle individual failures
- Each validation runs independently
- No row waits for another to complete

**Result Display:**

- Show modal/overlay with results: "8 applied, 2 rejected"
- List rejected rows with reasons: "HCP-000456: exceeds 60-call cap"
- Provide "Retry Failed" button for individual retry

**Undo Command Structure:**

```typescript
interface BulkEditCommand {
  type: "bulk";
  operation: string;
  successfulChanges: Map<string, { oldValue; newValue }>; // only successful edits
  timestamp: number;
}
```

- Only successful edits go into undo history
- Failed rows are excluded (nothing to undo)

### Event Flow (End-to-End)

1. **Selection Phase:**
   - User clicks checkboxes → add/remove rowKeys from Set
   - User clicks "Select All in Territory" → add all rowKeys in that territory
   - Selection visible across all view states (uses rowKey)

2. **Operation Trigger:**
   - User clicks "+10% calls"
   - Set status to "running", show loading UI
   - Lock all selected rows (disable inline editing)

3. **Validation Phase:**
   - For each selected row:
     - Calculate new value (currentCalls \* 1.1)
     - Call `validateCalls(newValue)`
     - Wait 300-900ms per row
     - Collect result (success/error)

4. **Completion Phase:**
   - Set status to "complete"
   - Unlock rows
   - Show results modal
   - Create undo command with only successful changes
   - Add to command history

5. **User Response:**
   - If happy → close modal, data persisted
   - If wants to retry failed → click "Retry Failed" button
   - If wants to undo → click Undo button

### Partial Failure Handling

**Success Case:**

- All 10 rows validate successfully
- Undo command contains all 10 changes
- User can undo all at once

**Partial Failure Case:**

- 8 rows succeed, 2 fail (exceeds cap or 503 error)
- Undo command contains only 8 successful changes
- Failed rows are excluded from undo history
- UI shows which rows failed and why
- User can manually retry failed rows one by one

**Total Failure Case:**

- All rows fail (e.g., all exceed cap)
- No undo command created (nothing to undo)
- User can retry with different values

### Edge Cases

**1. User edits a row while bulk operation is running:**

- Lock the row during bulk operation
- Show "Editing disabled during bulk operation" tooltip
- Queue the edit request or reject immediately (prefer reject)

**2. User changes selection during operation:**

- Disable selection controls during operation
- Keep the original selection locked until operation completes

**3. User switches tenant during operation:**

- Theme changes normally
- Operation continues unaffected
- Results modal appears in new theme

**4. Validation timeout:**

- Add timeout to each validation promise (e.g., 10 seconds)
- If timeout, mark as error with "Validation timeout"
- User can retry

**5. User navigates away during operation:**

- Operation continues in background
- Results shown when user returns
- Or cancel operation and warn user

### Why This Approach

**Command History vs Snapshots:**

- Command history is more memory-efficient for 50k rows
- Snapshots would duplicate the entire dataset for each bulk operation
- Commands are easier to reason about for partial failures

**Concurrent Validation:**

- Faster than sequential (300ms \* 100 rows = 30s vs ~3s concurrent)
- Matches real-world API patterns
- Individual failures don't block others

**Selection Persistence:**

- Using rowKey means selection survives sorting/filtering
- User can filter, select, then clear filter and selection still visible
- Better UX than selection clearing on view change

## FR-6 Design: Undo at Scale

### Problem Statement

Single-cell undo (FR-4) works well, but bulk operations introduce complexity:

- Undo must work across collapsed groups
- Undo must work when rows are filtered out
- Partially-failed bulk ops should undo as one step
- Redo behavior needs clear semantics

### Extending FR-4 Command Model

Current single-cell command:

```typescript
interface EditCommand {
  rowKey: string;
  field: keyof HcpRow;
  oldValue: number | string;
  newValue: number | string;
}
```

Extended for bulk:

```typescript
interface BulkEditCommand {
  type: "bulk";
  operation: string;
  successfulChanges: Map<
    string,
    {
      field: keyof HcpRow;
      oldValue: number | string;
      newValue: number | string;
    }
  >;
  timestamp: number;
}
```

**Key differences:**

- `type` field distinguishes single vs bulk
- `successfulChanges` Map contains only edits that succeeded
- `operation` describes what was done (e.g., "+10% calls")
- `timestamp` helps with debugging and potential time-based undo

### Partial Failure Undo

**Scenario:** User applies "+10% calls" to 10 rows, 8 succeed, 2 fail.

**Undo Command Creation:**

```typescript
const command: BulkEditCommand = {
  type: "bulk",
  operation: "+10% calls",
  successfulChanges: new Map([
    ["rowKey-1", { field: "calls", oldValue: 10, newValue: 11 }],
    ["rowKey-2", { field: "calls", oldValue: 15, newValue: 16.5 }],
    // ... 6 more successful changes
  ]),
  timestamp: Date.now(),
};
```

**Undo Execution:**

```typescript
function undoBulk(data: HcpRow[], command: BulkEditCommand): HcpRow[] {
  return data.map((row) => {
    const change = command.successfulChanges.get(row.rowKey);
    if (change) {
      return { ...row, [change.field]: change.oldValue };
    }
    return row;
  });
}
```

**Why This Works:**

- Only successful changes are in the command
- Failed rows are untouched (nothing to undo)
- One undo click reverts all successful changes at once
- User can manually retry failed rows individually

### Collapsed Group Undo

**Scenario:** User applies bulk edit, then collapses the group containing edited rows. User clicks Undo.

**Challenge:** Row is not visible in the DOM (virtualization + collapsed group).

**Solution:**

1. Use `rowKey` to find the row in the data model (not DOM)
2. Expand the parent groups containing the row
3. Calculate the scroll position of the row
4. Scroll the virtual container to that position
5. Apply the undo (data model updates, UI reflects automatically)

**Implementation:**

```typescript
function undoAndNavigate(
  data: HcpRow[],
  command: BulkEditCommand,
  rowKey: string,
) {
  // 1. Apply undo to data model
  const updatedData = undoBulk(data, command);

  // 2. Find which group contains the row
  const row = updatedData.find((r) => r.rowKey === rowKey);
  const { region, territory } = row;

  // 3. Expand groups
  expandedRegions.add(region);
  expandedTerritories.add(`${region}::${territory}`);

  // 4. Scroll to row position
  const rowIndex = getRenderItemIndex(rowKey);
  virtualizer.scrollToIndex(rowIndex);

  return updatedData;
}
```

**Why This Works:**

- Data model is source of truth, not DOM
- Virtualization handles scrolling to off-screen rows
- User sees visual feedback that undo happened

### Filtered Out Rows

**Scenario:** User applies bulk edit, then filters to a different region. Edited rows are now hidden. User clicks Undo.

**Challenge:** Should undo apply even if rows are not visible?

**Decision:** Yes, undo applies to data model regardless of visibility.

**Implementation:**

```typescript
function undo(data: HcpRow[], command: BulkEditCommand): HcpRow[] {
  const updatedData = applyUndo(data, command);

  // Check if any affected rows are hidden by current filter
  const hiddenChanges = command.successfulChanges
    .keys()
    .filter((rowKey) => !isRowVisible(rowKey, currentFilter));

  if (hiddenChanges.length > 0) {
    showNotification(
      `${hiddenChanges.length} changes hidden by current filter`,
    );
  }

  return updatedData;
}
```

**User Experience:**

- Undo applies immediately to data model
- Notification: "5 changes hidden by current filter"
- When user clears filter, they see the reverted values
- Data integrity maintained across view changes

### Redo Re-validation

**Question:** Should redo re-validate, or just re-apply the saved value?

**Decision:** Yes, redo should re-validate.

**Reasoning:**

- Business rules might have changed (call cap lowered from 60 to 50)
- Data might have changed externally
- Validation logic might have been updated
- Safety first: re-validate to prevent invalid state

**Implementation:**

```typescript
async function redoBulk(
  data: HcpRow[],
  command: BulkEditCommand,
): Promise<HcpRow[]> {
  const results = new Map<string, "success" | "error">();

  for (const [rowKey, change] of command.successfulChanges) {
    try {
      if (change.field === "calls") {
        await validateCalls(change.newValue as number);
      }
      results.set(rowKey, "success");
    } catch (error) {
      results.set(rowKey, "error");
    }
  }

  // If any re-validation fails, stop entirely
  if (Array.from(results.values()).some((r) => r === "error")) {
    const failedRows = Array.from(results.entries())
      .filter(([_, r]) => r === "error")
      .map(([rowKey, _]) => rowKey);

    throw new Error(`Redo failed for rows: ${failedRows.join(", ")}`);
  }

  // All validations passed, apply changes
  return applyChanges(data, command.successfulChanges);
}
```

**User Experience:**

- Redo shows loading state during re-validation
- If all pass: changes applied, user sees success
- If any fail: error shown, no changes applied, state unchanged
- User can fix the issue and try again

### Multi-Tenant Undo

**Question:** Should undo history persist across tenant switches?

**Decision:** Yes, undo history is independent of theme.

**Reasoning:**

- Theme is cosmetic, data is data
- User might switch themes during editing session
- Undo should continue to work regardless of current tenant
- Maintains user mental model of their action history

### Performance Considerations

**Memory:**

- Command history stores minimal data (rowKey, field, old/new values)
- Not storing full data snapshots
- For 100 bulk edits with 100 rows each: ~100KB memory (acceptable)

**Speed:**

- Undo is O(n) where n = affected rows
- For bulk edit of 1000 rows: ~1-2ms (negligible)
- Virtualization handles DOM updates efficiently

**Undo History Size:**

- Limit to last 100 commands (configurable)
- Auto-prune oldest commands
- Prevents memory bloat in long sessions

## What I'd Do Differently With More Time

1. **Better error boundaries**: Add error boundaries around components to prevent crashes from bubbling up
2. **Unit tests**: Currently missing, would add tests for sorting, filtering, and validation logic
3. **Performance monitoring**: Add React Profiler integration to track re-renders
4. **Accessibility**: Add keyboard navigation (arrows, Enter to edit, Escape to cancel)
5. **Persistence**: Save user preferences (expanded groups, filters) to localStorage
6. **Export**: Add CSV export of current view with applied filters
7. **Loading skeletons**: Better loading states during initial data load
8. **Column resizing**: Allow users to resize columns to their preference

## Running the App

```bash
npm install
npm run dev
```

Open http://localhost:5173

## this app is desigbed featrue wise sp below finf pr and attaced screenshots

PR 1
**PR Title - Initialize HCP Data Explorer with Material UI and Data Display**

**FE PR** - https://github.com/chinmay2099/hcp-data-explorer/pull/1

**PR Description -**

- Set up React 18+ with TypeScript, Material UI and Vite project foundation
- Added provided starter files (data-generator, mock-validator, theme-config) in lib folder
- Generated 50,000 mock HCP records using deterministic seed
- Displayed HCP data in table format (ID, Name, Specialty, Region, Territory, Calls, TRx, NRx)

**Screenshots** -

1. HCP table with generated records
   <img width="1917" height="988" alt="image" src="https://github.com/user-attachments/assets/91df0307-f746-4ec7-8938-067cbcf8568f" />

pr2

**PR Title - Add Virtualized Rendering for 50,000 HCP Records**

**FE PR** - https://github.com/chinmay2099/hcp-data-explorer/pull/2

**PR Description -**

- Implemented TanStack Virtual for row virtualization to handle 50,000 records efficiently
- Only visible rows (~13-20) are rendered in DOM instead of all 50,000 rows
- Added performance footer showing rows currently in DOM and last operation timing
- - Used virtual row index as the React key to safely handle duplicate HCP IDs in the provided dataset
- Enhanced Table UI

**Screenshots** -

1. Virtualized table with professional styling and performance metrics
   <img width="1910" height="868" alt="image" src="https://github.com/user-attachments/assets/48af6548-8302-4757-b4bf-eb5923201574" />

pr 3

**PR Title - Add Region and Territory Grouping with Aggregates and CPI**

**FE PR** - [https://github.com/chinmay2099/hcp-data-explorer/pull/3](https://github.com/chinmay2099/hcp-data-explorer/pull/3)

**PR Description -**

- Added Region → Territory grouping with expand/collapse support
- Added group-level Calls, TRx, NRx, HCP count and CPI aggregates
- Added individual HCP CPI calculation with zero-TRx handling
- Added stable internal row keys to handle duplicate HCP IDs
- Added handling for numeric and string Calls values
- Preserved virtualization across grouped and expanded rows
- Added reusable grouping and aggregation utilities

**Screenshots** -

1. Collapsed view showing Region-level groups and aggregate metrics
   <img width="1902" height="853" alt="image" src="https://github.com/user-attachments/assets/009dfd9b-3609-44d9-abc3-dad23cc626e8" />

2. Expanded Region view showing Territory-level groups and their aggregates
   <img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/d6fb627c-9058-4b18-8465-ccdffb244024" />

3. Expanded Territory view showing individual HCP records with CPI
   <img width="1919" height="932" alt="image" src="https://github.com/user-attachments/assets/68a61114-3314-4baa-bf3c-f75a0b730a17" />

pr 4
**PR Title - Add Search and Region/Territory Filters to HCP Data Explorer**

**FE PR** - https://github.com/chinmay2099/hcp-data-explorer/pull/4

**PR Description -**

- Added search functionality by HCP name and ID
- Added Region and Territory filters with cascading selection
- Auto-expanded Region and Territory groups when filters are applied
- Updated record counts to show total records and filtered records
- Maintained existing grouping, aggregates and virtualized rendering

**Screenshots** -

1. Search by HCP name
   <img width="1903" height="863" alt="image" src="https://github.com/user-attachments/assets/fd3b4d0e-cf4e-4674-9886-a9fbc05e45cf" />

2. Region filter applied
   <img width="1914" height="803" alt="image" src="https://github.com/user-attachments/assets/795b4867-bec1-4d0e-83dc-3ab0a76dbb06" />

3. Territory filter applied
   <img width="1912" height="861" alt="image" src="https://github.com/user-attachments/assets/053d6a08-7697-43d3-97d9-9326b0c488f5" />

pr 5

**PR Title - Add Sorting for HCP Data Explorer**

**FE PR** - https://github.com/chinmay2099/hcp-data-explorer/pull/5
**PR Description -**

- Added sorting for Name, Calls, TRx, NRx and CPI columns
- Added ascending and descending sort indicators

**Screenshots** -

1. Default table view with sortable column indicators
   <img width="1907" height="802" alt="image" src="https://github.com/user-attachments/assets/e57a5e17-3f21-429a-bd58-6b5d72490ca8" />

2. Name sorting applied
   <img width="1894" height="794" alt="image" src="https://github.com/user-attachments/assets/7328f6e3-0625-41f4-8715-0d3b23271b8f" />

3. Calls/TRx sorting applied
   <img width="1917" height="798" alt="image" src="https://github.com/user-attachments/assets/cf80fd46-63f4-422c-aaa2-f9e975da0843" />

pr 6
**PR Title - Add Async-Validated Inline Editing with Undo/Redo**

**FE PR** - https://github.com/chinmay2099/hcp-data-explorer/pull/6

**PR Description -**

- Added inline editing for Calls column with modal popup interface
- Added cell lifecycle: editing → pending → saved/rejected
- Added Undo/Redo buttons in the UI
- Ensured edits work correctly with filtering, sorting, and grouping states

**Screenshots** -

1. Calls cell in edit mode

<img width="1917" height="734" alt="image" src="https://github.com/user-attachments/assets/2ddebaee-2694-4d5a-89a6-70c8970ed73f" />
<img width="1895" height="794" alt="image" src="https://github.com/user-attachments/assets/99b6e5d5-1837-43fc-b7b6-bafcc5e36890" />

2. Calls validation
   <img width="1887" height="785" alt="image" src="https://github.com/user-attachments/assets/430a7d39-9656-4f88-b54c-9a130bd3df47" />

3. Undo/Redo after successful edit
   <img width="1892" height="833" alt="image" src="https://github.com/user-attachments/assets/c964dcc1-240e-4023-8de6-6eff6f2569d4" />

**PR Title - Add Runtime Tenant Theming**

**FE PR** - https://github.com/chinmay2099/hcp-data-explorer/pull/7

**PR Description -**

- Added tenant selector dropdown for runtime theme switching
- Implemented theme management hook with config validation
- Added safe fallback to DEFAULT_THEME for invalid configs
- Applied tenant themes to MUI components (colors, surfaces, radius)
- Dynamic app name changes based on tenant
- Theme switching works without rebuild/reload
- Tested with provided tenant themes including intentionally invalid configs

**Screenshots -**

1. Default tenant (blue theme)
   <img width="1905" height="860" alt="image" src="https://github.com/user-attachments/assets/6bf7c219-5144-480d-a93a-8721c661ff62" />

2. Aurelia tenant (green theme)
   <img width="1906" height="808" alt="image" src="https://github.com/user-attachments/assets/b873c069-0165-4d25-822e-3ff210ed78e8" />

3. Meridian tenant (red theme)
   <img width="1899" height="809" alt="image" src="https://github.com/user-attachments/assets/6481e943-277b-4f41-b752-740fd652866f" />
