## Reset Imported Data + Add Reset Control

### What will happen

1. **Wipe imported data now**: Delete all rows from the `contacts` table (335k+ records) and related staging/import tracking tables so you start with a clean slate.
2. **Add a "Reset Imported Data" button** in the admin Contacts Import view, visible only to Super Admins, with a confirmation dialog to prevent accidents.

### Scope of the reset

The following tables will be cleared:
- `contacts` — all imported guest records
- `staging_contacts` — any in-flight import staging rows
- `import_runs` — history of past imports

The following will NOT be touched:
- `members`, `member_auth`, `admins`, `tiers`, `rewards`, `visits`, `points_ledger`, `locations`, `settings` — these are separate from the CRM contact import.

### Implementation details

1. **Initial wipe**: Run `DELETE` statements via the data tool against `contacts`, `staging_contacts`, `import_runs`.
2. **New edge function** `reset-contacts`:
   - Verifies caller is `super_admin` (using existing `admin_has_role` RPC pattern from `import-contacts`).
   - Deletes all rows from `contacts`, `staging_contacts`, `import_runs`.
   - Writes an entry to `audit_logs` (`action_type: 'delete'`, `entity_type: 'contacts'`) with the row counts removed.
3. **UI button** in `src/components/admin/contacts/ContactsImportView.tsx`:
   - Red "Reset All Imported Data" button (Super Admin only).
   - `AlertDialog` requiring the user to type `RESET` to confirm.
   - On success: toast notification + refresh contact queries.

### Why an edge function

Bulk deletes need the service-role key to bypass RLS reliably for 335k+ rows, and we want a single audited entry point — the same pattern already used by `import-contacts`.
