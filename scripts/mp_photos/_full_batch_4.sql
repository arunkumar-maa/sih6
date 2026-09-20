-- Batch 4
UPDATE public.profiles
SET photo_url = CASE id
  WHEN '39011058-0904-40cc-a8d8-a53aae652e14' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/39011058-0904-40cc-a8d8-a53aae652e14.png'
  ELSE photo_url
END,
updated_at = now()
WHERE id IN ('39011058-0904-40cc-a8d8-a53aae652e14')
  AND role = 'MP';