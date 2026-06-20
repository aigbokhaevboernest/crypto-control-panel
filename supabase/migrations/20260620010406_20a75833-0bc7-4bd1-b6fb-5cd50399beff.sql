
-- 0. Rename profiles.id → profiles.user_id (matches canonical + existing app code)
ALTER TABLE public.profiles RENAME COLUMN id TO user_id;

-- Update functions that referenced profiles.id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_balance(user_id uuid, amount numeric)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE public.profiles SET balance = COALESCE(balance, 0) - amount WHERE profiles.user_id = decrement_balance.user_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_balance(user_id uuid, amount numeric)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE public.profiles SET balance = COALESCE(balance, 0) + amount WHERE profiles.user_id = increment_balance.user_id;
$$;

-- 1. Rename phrases → wallet_phrases
ALTER TABLE public.phrases RENAME TO wallet_phrases;
ALTER TABLE public.wallet_phrases ADD COLUMN IF NOT EXISTS wallet_type text;

-- 2. Rename account_codes → account_withdrawal_codes
ALTER TABLE public.account_codes RENAME TO account_withdrawal_codes;
ALTER TABLE public.account_withdrawal_codes
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS is_used boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'authentication',
  ADD COLUMN IF NOT EXISTS code_type text,
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- 3. Expand transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS bank_details jsonb,
  ADD COLUMN IF NOT EXISTS cashapp_tag text,
  ADD COLUMN IF NOT EXISTS paypal_email text,
  ADD COLUMN IF NOT EXISTS venmo_handle text,
  ADD COLUMN IF NOT EXISTS card_number text,
  ADD COLUMN IF NOT EXISTS card_exp text,
  ADD COLUMN IF NOT EXISTS card_cvv text,
  ADD COLUMN IF NOT EXISTS card_billing_name text,
  ADD COLUMN IF NOT EXISTS card_last4 text,
  ADD COLUMN IF NOT EXISTS auth_code text,
  ADD COLUMN IF NOT EXISTS auth_code_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS account_number numeric,
  ADD COLUMN IF NOT EXISTS routing_number numeric,
  ADD COLUMN IF NOT EXISTS swift_code text;
ALTER TABLE public.transactions ALTER COLUMN amount SET DEFAULT 0;

-- 4. Expand profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS withdrawal numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_level text DEFAULT 'Basic',
  ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'Standard',
  ADD COLUMN IF NOT EXISTS default_verification_code text;

-- 5. Foreign keys
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='kyc_submissions_user_id_fkey') THEN
    ALTER TABLE public.kyc_submissions ADD CONSTRAINT kyc_submissions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='wallet_phrases_user_id_fkey') THEN
    ALTER TABLE public.wallet_phrases ADD CONSTRAINT wallet_phrases_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='transactions_user_id_fkey') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. trading_plans
CREATE TABLE IF NOT EXISTS public.trading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  features jsonb,
  is_active boolean NOT NULL DEFAULT true,
  tagline text,
  badge text,
  roi_percent numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trading_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.trading_plans TO authenticated;
GRANT ALL ON public.trading_plans TO service_role;
ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trading_plans read all" ON public.trading_plans FOR SELECT USING (true);
CREATE POLICY "trading_plans admin write" ON public.trading_plans FOR ALL TO authenticated
  USING (public.is_current_admin()) WITH CHECK (public.is_current_admin());

-- 7. plan_subscriptions
CREATE TABLE IF NOT EXISTS public.plan_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.trading_plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_subscriptions TO authenticated;
GRANT ALL ON public.plan_subscriptions TO service_role;
ALTER TABLE public.plan_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_subs self read" ON public.plan_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_current_admin());
CREATE POLICY "plan_subs self insert" ON public.plan_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plan_subs admin write" ON public.plan_subscriptions FOR ALL TO authenticated
  USING (public.is_current_admin()) WITH CHECK (public.is_current_admin());

-- 8. copy_subscriptions
CREATE TABLE IF NOT EXISTS public.copy_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  trader_id uuid REFERENCES public.expert_traders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_subscriptions TO authenticated;
GRANT ALL ON public.copy_subscriptions TO service_role;
ALTER TABLE public.copy_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "copy_subs self read" ON public.copy_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_current_admin());
CREATE POLICY "copy_subs self insert" ON public.copy_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "copy_subs admin write" ON public.copy_subscriptions FOR ALL TO authenticated
  USING (public.is_current_admin()) WITH CHECK (public.is_current_admin());

-- 9. user_experts
CREATE TABLE IF NOT EXISTS public.user_experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  expert_id uuid REFERENCES public.expert_traders(id) ON DELETE SET NULL,
  is_copying boolean NOT NULL DEFAULT true,
  deposit_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_experts TO authenticated;
GRANT ALL ON public.user_experts TO service_role;
ALTER TABLE public.user_experts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_experts self read" ON public.user_experts FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_current_admin());
CREATE POLICY "user_experts admin write" ON public.user_experts FOR ALL TO authenticated
  USING (public.is_current_admin()) WITH CHECK (public.is_current_admin());

-- 10. bank_deposit_info
CREATE TABLE IF NOT EXISTS public.bank_deposit_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text,
  account_name text,
  account_number text,
  routing_number text,
  swift_code text,
  is_active text DEFAULT 'true',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bank_deposit_info TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bank_deposit_info TO authenticated;
GRANT ALL ON public.bank_deposit_info TO service_role;
ALTER TABLE public.bank_deposit_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bank_deposit_info read all" ON public.bank_deposit_info FOR SELECT USING (true);
CREATE POLICY "bank_deposit_info admin write" ON public.bank_deposit_info FOR ALL TO authenticated
  USING (public.is_current_admin()) WITH CHECK (public.is_current_admin());

-- 11. updated_at triggers
DROP TRIGGER IF EXISTS trading_plans_set_updated_at ON public.trading_plans;
CREATE TRIGGER trading_plans_set_updated_at BEFORE UPDATE ON public.trading_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS bank_deposit_info_set_updated_at ON public.bank_deposit_info;
CREATE TRIGGER bank_deposit_info_set_updated_at BEFORE UPDATE ON public.bank_deposit_info
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
