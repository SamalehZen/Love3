-- Fonction RPC pour récupérer les profils à proximité avec ST_DWithin
-- À exécuter une fois dans le SQL Editor de Supabase

create or replace function nearby_profiles(
  user_lat float,
  user_lng float,
  radius_meters float default 50000,
  min_age int default 18,
  max_age int default 99,
  filter_gender text default null,
  online_only boolean default false,
  current_user_id uuid default null
)
returns setof profiles
language plpgsql
security definer
as $$
begin
  return query
  select p.*
  from profiles p
  where 
    p.id != coalesce(current_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and p.location is not null
    and ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
    and p.age >= min_age
    and p.age <= max_age
    and (filter_gender is null or p.gender = filter_gender)
    and (not online_only or p.is_online = true);
end;
$$;

-- Autoriser l'appel de cette fonction par les utilisateurs authentifiés
grant execute on function nearby_profiles to authenticated;
