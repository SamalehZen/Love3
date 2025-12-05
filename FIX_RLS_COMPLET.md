# 🚨 SOLUTION COMPLÈTE : Impossible d'envoyer une invitation

## ⚠️ PROBLÈME

L'erreur "Impossible d'envoyer une invitation" est causée par les **politiques RLS (Row Level Security)** manquantes dans Supabase.

---

## ✅ SOLUTION EN 3 ÉTAPES

### 📌 ÉTAPE 1 : Ouvrez Supabase Dashboard

1. Connectez-vous à [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **Love3**
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**

---

### 📌 ÉTAPE 2 : Exécutez ce code SQL complet

**Copiez TOUT le code ci-dessous** et cliquez sur **"Run"** :

```sql
-- ============================================
-- ACTIVATION RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_swipes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- CONNECTION_REQUESTS (INVITATIONS)
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own requests" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they sent" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they received" ON connection_requests;
DROP POLICY IF EXISTS "Users can update requests they received" ON connection_requests;

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

-- ============================================
-- CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can insert conversations they are part of" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

CREATE POLICY "Users can insert conversations they are part of"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

CREATE POLICY "Users can insert messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update messages they received"
ON messages FOR UPDATE
USING (
  sender_id != auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- ============================================
-- PLACE_SWIPES
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own swipes" ON place_swipes;
DROP POLICY IF EXISTS "Users can view swipes in their conversations" ON place_swipes;
DROP POLICY IF EXISTS "Users can update their own swipes" ON place_swipes;

CREATE POLICY "Users can insert their own swipes"
ON place_swipes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can view swipes in their conversations"
ON place_swipes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own swipes"
ON place_swipes FOR UPDATE
USING (auth.uid() = user_id);
```

✅ **Vous devriez voir** : "Success. No rows returned"

---

### 📌 ÉTAPE 3 : Vérifiez que tout fonctionne

**Exécutez cette requête de vérification** :

```sql
SELECT 
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ Activé' ELSE '❌ Désactivé' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'connection_requests', 'conversations', 'messages', 'place_swipes')
ORDER BY tablename;
```

**Résultat attendu** : Toutes les tables doivent avoir `✅ Activé`

---

## 🧪 TESTS APRÈS APPLICATION DU SQL

### ✅ Test 1 : Envoyer une invitation

1. **Rechargez** l'application (F5)
2. **Ouvrez** la console (F12)
3. Allez sur **"Connexions"**
4. Cliquez sur **"Se connecter"** sur un profil
5. Répondez aux 7 questions
6. Cliquez **"Envoyer invitation"**

**Dans la console, vous devriez voir** :
```
[RequestsContext] Envoi de la demande: {
  from_user_id: "xxx",
  to_user_id: "yyy",
  introduction_answers: [{...}, {...}, ...]
}
[RequestsContext] Résultat: {
  data: [{...}],
  error: null
}
```

✅ **Message de succès** : "Demande envoyée ✅"

---

### ✅ Test 2 : Voir les demandes

1. Allez sur **"Demandes"**
2. **Onglet "Envoyées"** → Vous voyez votre invitation avec vos réponses
3. **Onglet "Reçues"** (pour l'autre utilisateur) → Il voit l'invitation

---

### ✅ Test 3 : Accepter et envoyer des messages

1. L'autre utilisateur clique **"Accepter"**
2. Redirection automatique vers le chat
3. Les deux peuvent envoyer des messages
4. Messages en temps réel

---

## 🐛 SI ÇA NE FONCTIONNE TOUJOURS PAS

### Option A : Vérifier les politiques existantes

```sql
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'connection_requests', 'conversations', 'messages')
ORDER BY tablename, cmd;
```

**Vous devriez voir** :
- **profiles** : 3 politiques (SELECT, INSERT, UPDATE)
- **connection_requests** : 4 politiques (SELECT x2, INSERT, UPDATE)
- **conversations** : 3 politiques (SELECT, INSERT, UPDATE)
- **messages** : 3 politiques (SELECT, INSERT, UPDATE)

---

### Option B : Test manuel dans Supabase

**Testez l'insertion manuelle** :

```sql
-- Remplacez XXX et YYY par vos vrais user IDs
INSERT INTO connection_requests (from_user_id, to_user_id, introduction_answers)
VALUES (
  'XXX-votre-user-id',
  'YYY-autre-user-id',
  '[{"question": "test", "answer": "test"}]'::jsonb
);
```

**Si ça marche** → Le problème est dans le frontend  
**Si erreur RLS** → Les politiques ne sont pas appliquées correctement

---

### Option C : Désactiver temporairement RLS (DANGER)

⚠️ **À UTILISER SEULEMENT POUR TESTER** :

```sql
ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;
```

Si ça fonctionne après, c'est 100% un problème de politiques RLS.

**N'OUBLIEZ PAS DE RÉACTIVER** :
```sql
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
```

---

## 📋 CHECKLIST COMPLÈTE

- [ ] SQL exécuté dans Supabase SQL Editor
- [ ] Requête de vérification montre "✅ Activé" pour toutes les tables
- [ ] Application rechargée (F5)
- [ ] Console ouverte (F12)
- [ ] Test d'envoi d'invitation
- [ ] Logs dans la console vérifiés
- [ ] Message de succès affiché

---

## 💡 POURQUOI CE PROBLÈME ?

**Row Level Security (RLS)** est un système de sécurité de Supabase qui contrôle **qui peut faire quoi** sur chaque ligne d'une table.

Sans les bonnes politiques :
- ❌ Vous ne pouvez pas créer de `connection_requests`
- ❌ Vous ne pouvez pas créer de `conversations`
- ❌ Vous ne pouvez pas envoyer de `messages`
- ❌ Même si vous êtes authentifié !

Avec les politiques :
- ✅ Vous pouvez créer des invitations
- ✅ Vous pouvez voir vos invitations envoyées/reçues
- ✅ Vous pouvez créer des conversations
- ✅ Vous pouvez envoyer des messages
- ✅ Tout fonctionne normalement !

---

## 📖 Documentation Supabase

[Row Level Security - Supabase Docs](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 BESOIN D'AIDE ?

Si après avoir exécuté le SQL ça ne fonctionne toujours pas :

1. **Partagez** la capture d'écran de la console (F12)
2. **Partagez** le résultat de la requête de vérification
3. **Dites-moi** exactement quel message d'erreur vous voyez

Je pourrai alors diagnostiquer le problème exact ! 🚀

---

**Fichier SQL complet** : `supabase/ALL_RLS_POLICIES.sql`
