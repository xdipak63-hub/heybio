
-- HEYBIO ↗
-- Theme preset validation
-- By DIPO LABS
--
-- Important:
-- Existing schema has profile_themes.
-- It does NOT have a templates table.
--
-- Therefore this seed does not fabricate
-- a new table or insert fake template data.

begin;

do $$
declare
  v_constraint text;
  v_preset text;

  v_presets text[] := array[
    'classic',
    'midnight',
    'ice',
    'peach',
    'lavender',
    'minimal'
  ];

begin
  if to_regclass(
    'public.profile_themes'
  ) is null then
    raise exception
      'profile_themes table is missing';
  end if;

  select pg_get_constraintdef(c.oid)
  into v_constraint
  from pg_constraint c
  where c.conrelid =
    'public.profile_themes'::regclass
    and c.conname = 'valid_theme_preset';

  if v_constraint is null then
    raise exception
      'Theme preset constraint missing';
  end if;

  foreach v_preset in array v_presets
  loop
    if position(
      quote_literal(v_preset)
      in v_constraint
    ) = 0 then
      raise exception
        'Unsupported theme preset: %',
        v_preset;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_constraint
    where conrelid =
      'public.profile_themes'::regclass
      and conname = 'valid_theme_accent'
  ) then
    raise exception
      'Theme accent constraint missing';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid =
      'public.profile_themes'::regclass
      and conname = 'valid_button_style'
  ) then
    raise exception
      'Button style constraint missing';
  end if;

  raise notice
    'HEYBIO theme presets verified successfully';
end;
$$;

commit;