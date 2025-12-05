-- Script de vérification pour diagnostiquer pourquoi nearby_profiles ne retourne rien
-- À exécuter dans le SQL Editor de Supabase pour debug

-- 1. Vérifier que la fonction existe
select 
  routine_name,
  routine_type,
  security_type
from information_schema.routines
where routine_name = 'nearby_profiles';

-- 2. Tester la fonction manuellement avec un utilisateur spécifique
-- Remplacez les valeurs ci-dessous par vos coordonnées et votre user_id

-- Exemple: appel de test (ajustez lat/lng selon vos coordonnées)
select * from nearby_profiles(
  user_lat := 11.585::float,
  user_lng := 43.148::float,
  radius_meters := 50000::float,
  min_age := 18,
  max_age := 99,
  filter_gender := null,
  online_only := false,
  current_user_id := null  -- mettez votre UUID ici pour vous exclure
);

-- 3. Vérifier que les profils ont bien une localisation
select 
  id,
  name,
  age,
  is_online,
  ST_AsText(location::geometry) as location_wkt,
  location is not null as has_location
from profiles
order by created_at desc;

-- 4. Calculer la distance entre deux profils spécifiques
-- Remplacez UUID1 et UUID2 par vos IDs de profils
select 
  p1.name as user1,
  p2.name as user2,
  ST_Distance(p1.location::geography, p2.location::geography) as distance_meters,
  ST_Distance(p1.location::geography, p2.location::geography) / 1000 as distance_km
from profiles p1
cross join profiles p2
where p1.id != p2.id
  and p1.location is not null
  and p2.location is not null
limit 10;

-- 5. Vérifier les permissions de la fonction
select 
  grantee, 
  privilege_type 
from information_schema.routine_privileges 
where routine_name = 'nearby_profiles';
