# Love³ – Couples Rendez-vous

Application React/Vite transformée pour aider les couples existants à trouver des lieux de rendez-vous, discuter en temps réel et gérer leurs demandes via Supabase.

## Démarrer le projet

1. **Installer les dépendances**
   ```bash
   npm install
   ```
2. **Configurer les variables d’environnement** (voir ci-dessous) dans un fichier `.env` ou `.env.local` à la racine.
3. **Initialiser la base Supabase**
   - Créez un projet Supabase.
   - Dans le SQL Editor, exécutez le contenu de `supabase/schema.sql` pour créer les tables, contraintes et activer la RLS.
   - Exécutez également `supabase/nearby_profiles_function.sql` afin de créer la fonction RPC utilisée par la carte.
   - Activez Realtime sur `profiles`, `connection_requests`, `conversations` et `messages`.
4. **Lancer l’application**
   ```bash
   npm run dev
   ```

## Variables d’environnement requises

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé Anon publique Supabase |
| `VITE_SERPAPI_KEY` | Clé SerpApi utilisée pour Google Maps (search, photos, place) |

## Fonctionnalités principales

- **Auth & Profil** : email/password + Google OAuth, création de profil enrichi, persistance via Supabase.
- **Géolocalisation** : hook dédié pour suivre la présence, mettre à jour `profiles.location` et l’état en ligne.
- **Carte temps réel** : Leaflet + Supabase/PostGIS + SerpApi pour afficher les couples dans un rayon de 50 km avec filtres avancés.
- **Demandes** : contexte dédié avec subscriptions Realtime, onglets “Reçues / Envoyées”, toasts et redirection automatique vers le chat.
- **Chat** : conversations Supabase, messages live, indicateur “vu”, bouton ❤️ Match et transition automatique vers le swipe de lieux.
- **Match de lieux** : intégration SerpApi (Google Maps search/photos/place), stockage de la liste partagée dans `conversations.places_list`, enregistrement des swipes et animation quand un lieu est validé par les deux.

## Structure Supabase

Le schéma complet (tables `profiles`, `connection_requests`, `conversations`, `messages`, `place_swipes`, fonction `nearby_profiles`) se trouve dans `supabase/schema.sql` et `supabase/nearby_profiles_function.sql`. Pensez à ajouter vos politiques RLS personnalisées selon vos règles métier.

## Scripts utiles

| Commande | Description |
| --- | --- |
| `npm run dev` | Lancer Vite en mode dev |
| `npm run build` | Build production (inclut la génération du SW PWA) |
| `npm run preview` | Prévisualiser le build |

Bon build ✨
