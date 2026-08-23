## Pull Requests and Screenshots

This app was built feature-wise through the following pull requests:

---

### PR #1

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

---

### PR #2

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

---

### PR #3

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

---

### PR #4

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

---

### PR #5

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

---

### PR #6

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

---

### PR #7

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

---

### PR #8

**PR Title - Add Documentation (README and ASSUMPTIONS)**

**FE PR** - https://github.com/chinmay2099/hcp-data-explorer/pull/9

**PR Description -**

- Added comprehensive README.md with architecture overview
- Added FR-5 design document for bulk edit with partial failure
- Added FR-6 design document for undo at scale
- Added ASSUMPTIONS.md documenting all data quality issues
