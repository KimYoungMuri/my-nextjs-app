-- Prefer stabler Flash models (Gemini 3.x has been 503/timing out).
-- Run in Supabase → SQL Editor.

update public.llm_models
set priority = case model_id
  when 'gemini-flash-latest' then 10
  when 'gemini-2.5-flash' then 20
  when 'gemini-2.5-flash-lite' then 30
  when 'gemini-2.0-flash' then 40
  else 200
end
where provider_id in (
  select id from public.llm_providers where slug = 'google'
);

-- Ensure the reliable models exist
insert into public.llm_models (provider_id, model_id, display_name, temperature, max_output_tokens, priority)
select p.id, m.model_id, m.display_name, 0.95, 512, m.priority
from public.llm_providers p
cross join (values
  ('gemini-flash-latest', 'Gemini Flash (latest)', 10),
  ('gemini-2.5-flash', 'Gemini 2.5 Flash', 20),
  ('gemini-2.5-flash-lite', 'Gemini 2.5 Flash-Lite', 30),
  ('gemini-2.0-flash', 'Gemini 2.0 Flash', 40)
) as m(model_id, display_name, priority)
where p.slug = 'google'
on conflict (provider_id, model_id) do update
set priority = excluded.priority,
    is_active = true;
