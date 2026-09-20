-- Batch 5/5
UPDATE public.profiles
SET photo_url = CASE id
  WHEN '29e5a499-a096-4f4e-a0cb-8dc810291315' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/29e5a499-a096-4f4e-a0cb-8dc810291315.png'
  WHEN '2c6d2052-9611-440a-92b4-fefc1c442ac8' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/2c6d2052-9611-440a-92b4-fefc1c442ac8.png'
  WHEN 'fdb74c2e-4e53-4a6d-8978-91046e49d5f5' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/fdb74c2e-4e53-4a6d-8978-91046e49d5f5.png'
  WHEN 'ecb72148-5b1c-42d1-9131-3440ec386f5b' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/ecb72148-5b1c-42d1-9131-3440ec386f5b.png'
  WHEN '692b314c-5850-4ace-866c-cbb6d7d61575' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/692b314c-5850-4ace-866c-cbb6d7d61575.png'
  WHEN '97cda2c2-eb68-4586-bb9c-0ebc4c5b8a39' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/97cda2c2-eb68-4586-bb9c-0ebc4c5b8a39.png'
  WHEN 'c96e7a16-8bee-4e51-a491-d0344fd311c3' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/c96e7a16-8bee-4e51-a491-d0344fd311c3.png'
  WHEN '6949d086-2321-4802-b8bc-f387dcfa34c1' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/6949d086-2321-4802-b8bc-f387dcfa34c1.png'
  WHEN '583d990c-dd19-4e1e-9674-4031c0644009' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/583d990c-dd19-4e1e-9674-4031c0644009.png'
  WHEN '40bda610-92a9-405b-a6fb-6070bccea8b3' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/40bda610-92a9-405b-a6fb-6070bccea8b3.png'
  WHEN 'b28adce2-84bf-444e-8bbe-27178c63670f' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/b28adce2-84bf-444e-8bbe-27178c63670f.png'
  WHEN 'e4839738-f7bd-4f61-9220-d1163055974b' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/e4839738-f7bd-4f61-9220-d1163055974b.png'
  WHEN '3d71b154-7ec2-457f-ae36-7e28663e6fa1' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/3d71b154-7ec2-457f-ae36-7e28663e6fa1.png'
  WHEN '6098c79a-fa30-4e10-82d4-4b74f07c452e' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/6098c79a-fa30-4e10-82d4-4b74f07c452e.png'
  WHEN 'bdbd8f05-2ba8-4852-82ab-b0d3a7fb3132' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/bdbd8f05-2ba8-4852-82ab-b0d3a7fb3132.png'
  WHEN 'b83ce919-8206-48ba-b519-f21f0e75e77a' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/b83ce919-8206-48ba-b519-f21f0e75e77a.png'
  WHEN '94ad4368-e46d-41e2-946c-ff8db9995bfe' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/94ad4368-e46d-41e2-946c-ff8db9995bfe.png'
  WHEN '0067079e-2770-49c1-a648-334efc5703cf' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/0067079e-2770-49c1-a648-334efc5703cf.png'
  WHEN '3c700216-32b3-4776-a832-5c6add5e109c' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/3c700216-32b3-4776-a832-5c6add5e109c.png'
  WHEN '439e206d-93f6-46d7-8f88-48cd9115a4ee' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/439e206d-93f6-46d7-8f88-48cd9115a4ee.png'
  WHEN '4ce56e04-ff0c-4541-9b66-1829033b9322' THEN 'https://thwixsmvuydalebgkbqj.supabase.co/storage/v1/object/public/mp-photos/4ce56e04-ff0c-4541-9b66-1829033b9322.png'
  ELSE photo_url
END,
updated_at = now()
WHERE id IN ('29e5a499-a096-4f4e-a0cb-8dc810291315', '2c6d2052-9611-440a-92b4-fefc1c442ac8', 'fdb74c2e-4e53-4a6d-8978-91046e49d5f5', 'ecb72148-5b1c-42d1-9131-3440ec386f5b', '692b314c-5850-4ace-866c-cbb6d7d61575', '97cda2c2-eb68-4586-bb9c-0ebc4c5b8a39', 'c96e7a16-8bee-4e51-a491-d0344fd311c3', '6949d086-2321-4802-b8bc-f387dcfa34c1', '583d990c-dd19-4e1e-9674-4031c0644009', '40bda610-92a9-405b-a6fb-6070bccea8b3', 'b28adce2-84bf-444e-8bbe-27178c63670f', 'e4839738-f7bd-4f61-9220-d1163055974b', '3d71b154-7ec2-457f-ae36-7e28663e6fa1', '6098c79a-fa30-4e10-82d4-4b74f07c452e', 'bdbd8f05-2ba8-4852-82ab-b0d3a7fb3132', 'b83ce919-8206-48ba-b519-f21f0e75e77a', '94ad4368-e46d-41e2-946c-ff8db9995bfe', '0067079e-2770-49c1-a648-334efc5703cf', '3c700216-32b3-4776-a832-5c6add5e109c', '439e206d-93f6-46d7-8f88-48cd9115a4ee', '4ce56e04-ff0c-4541-9b66-1829033b9322')
  AND role = 'MP';