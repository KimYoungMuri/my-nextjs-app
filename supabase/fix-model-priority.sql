-- New AQ.* Gemini keys only work with 3.x / flash-latest (2.5 returns 404).
-- Run in Supabase → SQL Editor (optional; app also prefers these in code).

update public.llm_models
set is_active = false
where model_id like 'gemini-2%'
  and provider_id in (select id from public.llm_providers where slug = 'google');

insert into public.llm_models (provider_id, model_id, display_name, temperature, max_output_tokens, priority, is_active)
select p.id, m.model_id, m.display_name, 0.95, 512, m.priority, true
from public.llm_providers p
cross join (values
  ('gemini-flash-latest', 'Gemini Flash (latest)', 10),
  ('gemini-3.8-flash', 'Gemini 3.8 Flash', 20),
  ('gemini-3.5-flash', 'Gemini 3.5 Flash', 30),
  ('gemini-3.5-flash-lite', 'Gemini 3.5 Flash-Lite', 40)
) as m(model_id, display_name, priority)
where p.slug = 'google'
on conflict (provider_id, model_id) do update
set priority = excluded.priority,
    is_active = true,
    display_name = excluded.display_name;
