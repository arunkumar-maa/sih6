
CREATE TABLE IF NOT EXISTS public.ls_mps_master (
  sr_no INT PRIMARY KEY,
  state TEXT NOT NULL,
  mp_name TEXT NOT NULL,
  constituency TEXT NOT NULL,
  allocated_amount NUMERIC,
  slug TEXT NOT NULL,
  email TEXT NOT NULL,
  mp_id TEXT NOT NULL
);
