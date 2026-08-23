# Assumptions and Data Quality Decisions

## Data Quality Issues Found

### 1. Duplicate HCP IDs

**Issue**: The data generator creates duplicate IDs at periodic intervals (every 9973 records).

**Decision**: Added internal `rowKey` when records enter the app. This stable identity is used for:
- Edit tracking
- Selection (future bulk edit)
- Undo/redo operations
- Any operation that needs to identify rows across view changes

**Rationale**: Using the provided HCP ID as the sole identifier would cause conflicts when the same ID appears multiple times.

### 2. Calls as Number or String

**Issue**: The `calls` field can be either a number or a numeric string (e.g., `5` or `"5"`).

**Decision**: Normalize to number for calculations and sorting using a helper function `normalizeCalls()`.

**Rationale**: Need consistent numeric types for CPI calculation and sorting. The string representation is kept for display if normalization fails.

### 3. Calls Value of 99999

**Issue**: Every 12007 records, calls is set to 99999 (exceeds the 60-call validation cap).

**Decision**: Display as-is, but validation will reject any attempt to edit this value.

**Rationale**: This is intentional test data that should fail validation. The user can see the value but cannot keep it if they try to edit.

### 4. Specialty Can Be Null

**Issue**: Every 97 records, specialty is null instead of a string.

**Decision**: Display as "-" in the table, exclude from specialty-based filtering (if added later).

**Rationale**: Null is a valid "unknown" state in the data. Displaying "-" makes it clear rather than showing empty text.

### 5. TRx Can Be Zero

**Issue**: Every 577 records, TRx is 0.

**Decision**: CPI calculation returns null when TRx is 0, displays as "—" in the UI.

**Rationale**: Division by zero is undefined. Mathematically, CPI is meaningless when there are no prescriptions. Displaying "—" is clear and avoids NaN/Infinity.

### 6. TRx as Integer

**Issue**: TRx is always an integer in the generated data.

**Decision**: Kept as integer. CPI calculation uses integer division which can result in decimals.

**Rationale**: No change needed. The provided data type is appropriate.

## Ambiguities Resolved

### 1. CPI Calculation for Groups

**Ambiguity**: Should group CPI be the average of row-level CPIs, or calculated from total calls/total TRx?

**Decision**: Calculate from totals: `group CPI = total Calls / total TRx × 100`

**Rationale**: Averaging averages would give different results mathematically. Calculating from totals is more accurate and matches the definition.

### 2. Sort Direction for None State

**Ambiguity**: When going from desc → none, should the order revert to original input order or stay in desc order?

**Decision**: Return to original data order (no sorting applied).

**Rationale**: "None" means no sort is active, so it should revert to the natural order of the data after filtering.

### 3. Auto-expand Behavior

**Ambiguity**: Should auto-expand expand everything or only groups containing matches?

**Decision**: Expand all groups when filters are active, no auto-expand otherwise.

**Rationale**: When filtering, users need to see all results. Without filters, letting users control expansion is better UX.

### 4. Edit Validation Scope

**Ambiguity**: Should validation apply to TRx/NRx edits if they were editable?

**Decision**: Only Calls uses the provided `validateCalls()` function. Other fields would need their own validation rules.

**Rationale**: The problem statement only specifies validation for Calls. TRx/NRx validation wasn't defined, so they remain read-only.

### 5. Concurrent Edits

**Ambiguity**: What happens if user tries to edit a cell while another edit is validating?

**Decision**: Lock the row during validation. Show pending state. Reject new edit attempts until previous completes.

**Rationale**: Prevents race conditions and confusing state. The cell lifecycle (editing → pending → saved/rejected) should be strict.

### 6. Invalid Tenant Configs

**Ambiguity**: How to handle customer-provided configs with invalid colors or malformed values?

**Decision**: Validate each field individually. Invalid fields fall back to DEFAULT_THEME values. App never crashes on bad config.

**Rationale**: Customer configs can't be trusted. The app must be defensive and always work, even with bad input.

### 7. Theme Switching During Editing

**Ambiguity**: What happens to an in-progress edit if user switches tenants?

**Decision**: The edit modal stays open. Validation completes normally. Theme changes apply to the UI around it.

**Rationale**: Theme switching is cosmetic and shouldn't interrupt data operations. The modal should remain visible regardless of theme changes.

### 8. Stable Identity After Sort

**Ambiguity**: Does sorting change row identity?

**Decision**: No. Row identity (`rowKey`) remains stable through all operations (sort, filter, group, collapse).

**Rationale**: Identity must be stable for undo/redo to work correctly. Sorting only changes display order, not the underlying data identity.