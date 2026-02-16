

## Fix NOT NULL Constraints on Remaining Integer Columns

The same issue that affected `visits` now occurs on `cancels` (and likely `no_show` and `orders` too). When importing contacts with missing values for these columns, the database rejects the rows.

### Changes

**Database migration** -- Drop the NOT NULL constraint on `cancels`, `no_show`, and `orders` columns in the `contacts` table, all at once:

```sql
ALTER TABLE public.contacts ALTER COLUMN cancels DROP NOT NULL;
ALTER TABLE public.contacts ALTER COLUMN no_show DROP NOT NULL;
ALTER TABLE public.contacts ALTER COLUMN orders DROP NOT NULL;
```

This allows imports with missing numeric fields to succeed. Existing default values of `0` will still apply when no value is provided, but explicit `null` values will no longer cause failures.

The generated types file will be updated automatically to reflect these columns as `number | null`.

