-- ═══════════════════════════════════
-- ADD MERCADO PAGO COLUMNS TO PROFILES
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_preapproval_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_subscription_status text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_since timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_plan_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_payer_email text;

-- Index for MP subscription lookup
CREATE INDEX IF NOT EXISTS idx_profiles_mp_preapproval ON profiles (mp_preapproval_id);
