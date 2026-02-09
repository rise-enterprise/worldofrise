

## Update Resend API Key

### What's Happening
You've provided a new Resend API key to replace the invalid one. I'll update the secret and verify it works.

### Steps

1. **Update Secret**
   - Replace the current `RESEND_API_KEY` with the new value: `re_ZQNUybEw_HQPSdNfPk8W12KPqP6d1mpCJ`

2. **Test the Integration**
   - Call the `notify-invitation-request` Edge Function with test data
   - Verify the email sends successfully to `marketing@rise.qa`

### Expected Result
After updating the key, invitation request notifications will be sent from `World of Rise <noreply@rise.qa>` to the marketing team when users submit the Request Invitation form.

