# 🔍 DEBUG : Impossible d'envoyer une invitation

## 🎯 Utilisez le panneau de debug intégré

J'ai ajouté un **panneau de debug** dans l'application pour diagnostiquer le problème.

### 📌 ÉTAPE 1 : Rechargez l'application

Appuyez sur **F5** pour recharger l'application.

### 📌 ÉTAPE 2 : Allez sur la page "Connexions"

Vous devriez voir un **panneau orange en bas à droite** qui affiche :
- Votre User ID
- Votre Profile
- Votre Email

### 📌 ÉTAPE 3 : Cliquez sur "Tester Invitation"

Ce bouton va tester si vous pouvez créer une invitation dans Supabase.

**Résultats possibles** :

#### ✅ **Si ça fonctionne**
Vous verrez un message vert : **"Insertion réussie !"**

→ Le problème n'est PAS les permissions RLS  
→ Le problème est ailleurs dans le code

#### ❌ **Si ça échoue**
Vous verrez un message rouge avec :
- Le **message d'erreur** exact
- Le **code d'erreur** (ex: 42501)
- Les **détails**

**Exemples d'erreurs** :

##### Erreur 42501
```
Message: new row violates row-level security policy for table "connection_requests"
Code: 42501
```
→ **Les politiques RLS ne sont pas appliquées**  
→ **Solution** : Exécutez le SQL dans Supabase (voir ci-dessous)

##### Erreur 23505
```
Message: duplicate key value violates unique constraint
Code: 23505
```
→ **Vous avez déjà envoyé une invitation à cette personne**  
→ **Normal** : C'est une protection contre les doublons

##### Erreur 23503
```
Message: insert or update on table violates foreign key constraint
Code: 23503
```
→ **Le profil cible n'existe pas**  
→ **Vérifiez** que le profil existe dans Supabase

---

## 🔧 ÉTAPE 4 : Cliquez sur "Tester RLS"

Ce bouton teste si vous pouvez **lire** toutes les tables.

**Résultat attendu** :
```
✅ Profiles: X rows
✅ Connection Requests: X rows
✅ Conversations: X rows
✅ Messages: X rows
```

**Si vous voyez des ❌** :
→ Les politiques RLS de lecture manquent aussi

---

## 🚨 SI LE PANNEAU MONTRE UNE ERREUR RLS

### Exécutez ce SQL dans Supabase Dashboard

1. **Allez sur** https://supabase.com/dashboard
2. **Cliquez** sur "SQL Editor"
3. **Copiez-collez** ce code :

```sql
-- Activer RLS
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Users can insert their own requests" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they sent" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they received" ON connection_requests;
DROP POLICY IF EXISTS "Users can update requests they received" ON connection_requests;

-- Créer nouvelles politiques
CREATE POLICY "Users can insert their own requests"
ON connection_requests FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view requests they sent"
ON connection_requests FOR SELECT
USING (auth.uid() = from_user_id);

CREATE POLICY "Users can view requests they received"
ON connection_requests FOR SELECT
USING (auth.uid() = to_user_id);

CREATE POLICY "Users can update requests they received"
ON connection_requests FOR UPDATE
USING (auth.uid() = to_user_id);
```

4. **Cliquez** sur "Run"
5. **Rechargez** l'application (F5)
6. **Cliquez** à nouveau sur "Tester Invitation"
7. ✅ Devrait afficher "Insertion réussie !"

---

## 📸 PARTAGEZ LE RÉSULTAT

Après avoir cliqué sur "Tester Invitation", **faites une capture d'écran** du panneau de debug et partagez-la avec moi.

Cela me permettra de voir :
- ✅ L'erreur exacte
- ✅ Le code d'erreur
- ✅ Les détails Supabase
- ✅ Si c'est bien un problème RLS ou autre chose

---

## 🔍 VÉRIFICATION ALTERNATIVE

Si le panneau de debug ne s'affiche pas, ouvrez la **console du navigateur (F12)** et tapez :

```javascript
// Vérifier l'utilisateur connecté
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.id, user?.email);

// Tester l'insertion
const { data, error } = await supabase
  .from('connection_requests')
  .insert({
    from_user_id: user.id,
    to_user_id: user.id,
    introduction_answers: [{ question: 'test', answer: 'test' }]
  })
  .select();

console.log('Résultat:', { data, error });
```

Partagez le résultat dans la console ! 📋

---

**Le panneau de debug est maintenant actif dans votre application !** 🚀

Rechargez l'app et utilisez-le pour voir l'erreur exacte.
