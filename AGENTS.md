# Project Notes

## Authentication (server-key gate)
- App access is gated by a server key stored in the connected Supabase project (`public.server_config`, single row, editable only via Supabase dashboard/SQL editor). The client validates through the `validate_server_key(entered_key)` RPC; the raw key is never readable by the client.
- Login flow: 10-digit phone + time-based PIN (HHMM, 12h clock) → `/server-validation` page → server-key match → then `isAuthenticated`.
- The key is stored on the device (`tummoc_server_key` in localStorage) and revalidated against the database: on every launch when the last check is older than 24h, and every 5 min while running once the 24h mark passes. A mismatch clears the key and logs the user out.
- Never reintroduce a plain localStorage `isAuthenticated` flag — auth state must derive from live database validation. Network errors keep the session; only a definitive key mismatch revokes it.
- SQL script lives at `sql/server_key_auth.sql` (user runs it in their Supabase; project has no Lovable-managed backend).
