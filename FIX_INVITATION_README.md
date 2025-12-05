# 🔧 Correction : Impossible d'envoyer une invitation

## 🎯 Problème

L'erreur "Impossible d'envoyer une invitation" est causée par les **politiques RLS (Row Level Security)** manquantes dans Supabase.

## ✅ Solution

### Étape 1 : Appliquer les politiques RLS

Connectez-vous à votre **Supabase Dashboard** et allez dans **SQL Editor**, puis exécutez ce code :

```sql
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can insert their own requests" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they sent" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they received" ON connection_requests;
DROP POLICY IF EXISTS "Users can update requests they received" ON connection_requests;

-- Politique: Les utilisateurs peuvent créer des demandes (envoyer des invitations)
CREATE POLICY "Users can insert their own requests"
ON connection_requests FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Politique: Les utilisateurs peuvent voir les demandes qu'ils ont envoyées
CREATE POLICY "Users can view requests they sent"
ON connection_requests FOR SELECT
USING (auth.uid() = from_user_id);

-- Politique: Les utilisateurs peuvent voir les demandes qu'ils ont reçues
CREATE POLICY "Users can view requests they received"
ON connection_requests FOR SELECT
USING (auth.uid() = to_user_id);

-- Politique: Les utilisateurs peuvent mettre à jour les demandes qu'ils ont reçues (accepter/refuser)
CREATE POLICY "Users can update requests they received"
ON connection_requests FOR UPDATE
USING (auth.uid() = to_user_id);
```

### Étape 2 : Vérifier que RLS est activé

Exécutez cette commande pour vérifier :

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'connection_requests';
```

Si `rowsecurity` est `false`, activez-le :

```sql
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
```

### Étape 3 : Tester l'application

1. Rechargez votre application
2. Ouvrez la console du navigateur (F12)
3. Essayez d'envoyer une invitation
4. Vous devriez voir dans la console :
   - `[RequestsContext] Envoi de la demande:` avec les détails
   - `[RequestsContext] Résultat:` avec `data` contenant l'invitation et `error` = null

## 🐛 Debug : Si le problème persiste

### Vérifier les politiques actuelles

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'connection_requests';
```

### Vérifier l'utilisateur authentifié

Dans la console du navigateur :

```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
```

### Logs détaillés

Les logs dans la console vous donneront l'erreur exacte :
- `[RequestsContext] Envoi de la demande:` - Données envoyées
- `[RequestsContext] Résultat:` - Réponse de Supabase
- `[RequestsContext] Erreur complète:` - Détails de l'erreur

## 📚 Explications

**Row Level Security (RLS)** est un système de sécurité dans Supabase qui contrôle qui peut lire/écrire chaque ligne d'une table.

Sans les bonnes politiques, même si vous êtes authentifié, vous ne pouvez pas insérer de données dans `connection_requests`.

Les politiques créées permettent :
- ✅ **INSERT** : L'utilisateur peut créer une demande si `from_user_id` = son ID
- ✅ **SELECT** : L'utilisateur peut voir les demandes qu'il a envoyées ou reçues
- ✅ **UPDATE** : L'utilisateur peut modifier (accepter/refuser) les demandes qu'il a reçues

## 🔗 Documentation Supabase

[Row Level Security - Supabase Docs](https://supabase.com/docs/guides/auth/row-level-security)
