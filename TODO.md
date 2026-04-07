# Ecommerce RLS Update TODO

## Steps:
1. [✅] Create new migration: supabase/migrations/20251224_comprehensive_rls.sql (DROP all old policies/functions, CREATE pro functions, all table policies)
2. [✅] Delete conflicting migrations (manual optional, superseded by new file): 
   - supabase/migrations/20251207074859_9bf5f511-d755-44ba-abae-0b1db424fa47.sql (buggy storage)
   - supabase/migrations/20251223120000_add_order_items_insert_policy.sql (integrated)
3. [ ] Execute `supabase migration up` (backup DB first)
4. [ ] Run `supabase gen types typescript --local > src/integrations/supabase/types.ts`
5. [ ] Test RLS policies in Supabase dashboard/SQL editor
6. [ ] Mark complete and remove TODO.md

**Current: Steps 1-2 ✅ Ready for Step 3**

If Supabase CLI not installed (`supabase --version` fails):
- Install: `winget install Supabase.SupabaseCLI` or download from https://supabase.com/docs/guides/cli/local-development#download-the-cli

