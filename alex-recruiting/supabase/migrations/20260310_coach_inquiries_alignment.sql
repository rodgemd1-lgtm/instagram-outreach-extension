-- Align coach_inquiries with the live production schema used by the recruit contact form.

CREATE TABLE IF NOT EXISTS coach_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id UUID,
  coach_name TEXT NOT NULL,
  school TEXT NOT NULL,
  coaching_position TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  ncaa_compliant BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  coach_title TEXT
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'coach_inquiries'
      AND column_name = 'school_name'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'coach_inquiries'
      AND column_name = 'school'
  ) THEN
    ALTER TABLE public.coach_inquiries RENAME COLUMN school_name TO school;
  END IF;
END $$;

ALTER TABLE public.coach_inquiries
  ADD COLUMN IF NOT EXISTS coach_user_id UUID,
  ADD COLUMN IF NOT EXISTS coach_title TEXT,
  ADD COLUMN IF NOT EXISTS coaching_position TEXT,
  ADD COLUMN IF NOT EXISTS ncaa_compliant BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'coach_inquiries'
      AND column_name = 'school_name'
  ) THEN
    EXECUTE '
      UPDATE public.coach_inquiries
      SET school = school_name
      WHERE school IS NULL
    ';
  END IF;
END $$;

UPDATE public.coach_inquiries
SET coach_title = COALESCE(coach_title, coaching_position)
WHERE coach_title IS NULL;

UPDATE public.coach_inquiries
SET coaching_position = COALESCE(coaching_position, coach_title, 'Unknown')
WHERE coaching_position IS NULL;

UPDATE public.coach_inquiries
SET ncaa_compliant = FALSE
WHERE ncaa_compliant IS NULL;

ALTER TABLE public.coach_inquiries
  ALTER COLUMN school SET NOT NULL,
  ALTER COLUMN coaching_position SET NOT NULL,
  ALTER COLUMN ncaa_compliant SET NOT NULL,
  ALTER COLUMN ncaa_compliant SET DEFAULT FALSE,
  ALTER COLUMN status SET DEFAULT 'pending';
