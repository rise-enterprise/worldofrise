

## Contacts / CRM Module for RISE Holding

A complete CRM contacts module with full-overwrite CSV/XLSX import, a 45-column data table with search/filter/sort/export, and a contact details drawer -- all integrated into the Master Control Panel.

---

### Overview

This feature adds three major pieces:

1. **New `contacts` database table** with 45+ columns matching the specified schema
2. **Import/Replace edge function** that handles transactional full-overwrite with validation, dedup, and audit logging
3. **Two new admin views**: Contacts Table (browse/search/filter/export) and Import page (upload + replace flow)

---

### Part 1: Database -- New `contacts` Table

Create a `contacts` table with columns mapping 1:1 to the specified fields:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto-generated |
| salutation | text | nullable |
| last_name | text | nullable |
| first_name | text | nullable |
| title | text | nullable |
| company | text | nullable |
| gender | text | nullable |
| vip | boolean | default false |
| visits | integer | default 0 |
| cancels | integer | default 0 |
| no_show | integer | default 0 |
| orders | integer | default 0 |
| spend_per_cover | numeric | nullable |
| total_spend | numeric | nullable |
| spend_per_visit | numeric | nullable |
| avg_rating | numeric | nullable (decimal) |
| birthday | date | nullable |
| anniversary | date | nullable |
| phone | text | nullable |
| work_phone | text | nullable |
| email | text | nullable |
| alt_email | text | nullable |
| address | text | nullable |
| city | text | nullable |
| state | text | nullable |
| postal_code | text | nullable |
| country | text | nullable |
| notes | text | nullable |
| tags | text | nullable (comma-separated) |
| loyalty_id | text | nullable |
| loyalty_tier | text | nullable |
| loyalty_rank | text | nullable |
| created_date | timestamptz | nullable |
| last_location | text | nullable |
| last_visit | timestamptz | nullable |
| venue_group_marketing_opt_in | boolean | default false |
| cafe_noir_london_opt_in | boolean | default false |
| noir_cafe_abu_dhabi_opt_in | boolean | default false |
| noir_cafe_al_hazm_opt_in | boolean | default false |
| noir_cafe_old_doha_port_opt_in | boolean | default false |
| noir_cafe_riyadh_opt_in | boolean | default false |
| noir_cafe_tennis_opt_in | boolean | default false |
| noir_cafe_west_walk_opt_in | boolean | default false |
| sasso_al_hazm_opt_in | boolean | default false |
| sasso_london_opt_in | boolean | default false |
| sasso_riyadh_opt_in | boolean | default false |
| sasso_west_walk_opt_in | boolean | default false |
| imported_at | timestamptz | auto-set on insert |
| imported_by | uuid | admin who imported |

**RLS Policies:**
- Super Admin + Admin: full read access (SELECT)
- Super Admin only: ALL (for import/delete operations)
- Public read policies follow existing open-access pattern

---

### Part 2: Edge Function -- `import-contacts`

A backend function that receives the parsed contact rows and performs a transactional replace:

1. Validate the authenticated user is a super admin
2. Receive the array of contact objects (parsed client-side from CSV/XLSX)
3. Delete all existing rows from `contacts` table
4. Batch insert new rows
5. Log the import action to `audit_logs` table (action_type: "import", entity_type: "contacts", after_json with counts)
6. Return summary: total read, inserted, deduped, rejected + rejected row details

The edge function handles the delete-then-insert as a single logical operation. Client-side parsing handles CSV/XLSX reading, column mapping, validation, normalization, and deduplication before sending clean data to the function.

---

### Part 3: Client-Side File Processing

All parsing happens in the browser before sending to the edge function:

1. **File reading**: Use `SheetJS (xlsx)` library to parse both CSV and XLSX files
2. **Header detection**: Compare uploaded headers against expected column names (case-insensitive, trimmed)
3. **Column mapping screen**: Only shown if headers do not match exactly; otherwise auto-mapped
4. **Validation**: Check required columns exist, trim whitespace, normalize phones (strip spaces/dashes), lowercase emails, parse dates with multi-format support, convert boolean strings
5. **Deduplication**: By loyalty_id first, then email, then phone. Keep row with latest last_visit or created_date
6. **Confirmation dialog**: "This will replace all X existing records with Y new records. Continue?"

---

### Part 4: Navigation Integration

Add a new "CRM" section to `adminNavConfig.ts`:

```text
CRM (icon: Users)
  - Contacts Database (browse, search, filter, export)
  - Import / Replace (upload + overwrite flow)
```

---

### Part 5: UI Components

#### A. ContactsView (table view)
- Horizontal scrolling table with sticky header
- Exactly 45 columns in the specified left-to-right order
- Search bar: filters by name, phone, email, loyalty ID, company
- Filter dropdowns: VIP, loyalty tier, loyalty rank, city, country, last location, each marketing opt-in
- Column sorting (click header to sort, default shows import order)
- Row click opens Contact Details drawer with all fields displayed
- Export button: generates CSV from current filtered view

#### B. ContactsImportView (import page)
- File upload zone (drag-and-drop + click) for CSV/XLSX
- Column mapping screen (shown only when headers mismatch)
- Validation results display (errors listed with row numbers)
- Confirmation dialog with record counts
- Import progress indicator
- Post-import summary: rows read, inserted, deduped, rejected with details

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/contacts/ContactsView.tsx` | Main table view with search, filters, sort, export |
| `src/components/admin/contacts/ContactsImportView.tsx` | Import/replace page with upload + mapping + confirmation |
| `src/components/admin/contacts/ContactDetailsDrawer.tsx` | Drawer showing all fields for a clicked row |
| `src/components/admin/contacts/contactColumns.ts` | Column definitions and header-to-db mapping constants |
| `src/components/admin/contacts/contactUtils.ts` | Parsing, validation, normalization, dedup utilities |
| `src/hooks/useContacts.ts` | React Query hooks for fetching/searching contacts |
| `supabase/functions/import-contacts/index.ts` | Edge function for transactional replace |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/adminNavConfig.ts` | Add "CRM" nav section with two items |
| `src/pages/AdminPanel.tsx` | Add lazy imports and view mappings for contacts views |

---

### Dependencies

- **xlsx** (SheetJS) -- needed for XLSX file parsing in the browser. Will be added as a project dependency.

---

### Security

- Import/Replace is restricted to super admins only (checked both in UI via `currentAdmin?.role` and in the edge function via `admin_has_role`)
- Admin and above can view, filter, and export
- All import actions are logged to `audit_logs` with admin_id, file name, and row counts
- RLS policies enforce access at the database level

