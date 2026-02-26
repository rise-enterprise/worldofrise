

## Update Member Name

The admin account `ibrahim@rise.qa` is linked to member record `f1d3caa7-2d69-4939-bbe4-02e255ee9576` which currently has `full_name = "Mr. Hamad / Alssada"`.

I need the user's real name to proceed. Once provided, I will run a single SQL update:

```sql
UPDATE members SET full_name = '<new name>' WHERE id = 'f1d3caa7-2d69-4939-bbe4-02e255ee9576';
```

No code changes required -- this is a data-only update.

### Waiting for input
Please reply with the name you'd like displayed (e.g. "Ibrahim Al-Rashid").

