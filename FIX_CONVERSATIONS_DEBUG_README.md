# 🔧 Correction : Erreurs Messages et Conversations

## 🐛 Problèmes identifiés et corrigés

### 1. ❌ **Erreur "Oops" dans la page Conversations**
**Cause** : Variable `profileToShow` inexistante à la ligne 101 de `ConversationsList.tsx`  
**Symptôme** : Page conversations crashe avec message "Oops, quelque chose s'est mal passé"  
**Solution** : Remplacé `profileToShow` par `partnerProfile`

### 2. ❌ **Messages non visibles après envoi**
**Cause** : Gestion d'erreur insuffisante dans `handleSend`  
**Symptôme** : Message envoyé mais pas affiché, ou erreur silencieuse  
**Solution** : 
- Ajout de logs détaillés
- Vérification du résultat avec `.select().single()`
- Restauration du texte en cas d'erreur
- Message d'erreur détaillé

### 3. ❌ **Redirection automatique après envoi**
**Cause** : Logique de navigation incorrecte  
**Symptôme** : Utilisateur redirigé hors du chat après envoi  
**Solution** : Suppression des redirections automatiques

### 4. ❌ **Partenaire ne peut pas accéder à la conversation**
**Cause** : Permissions RLS manquantes ou conversation mal créée  
**Symptôme** : Un seul utilisateur peut voir la conversation  
**Solution** : Logs ajoutés pour débugger + vérification RLS

---

## 📝 Fichiers modifiés

### 1. `components/ChatInterface.tsx`
**Changements** :
- ✅ Amélioration `handleSend` avec logs détaillés
- ✅ Vérification du résultat d'envoi
- ✅ Restauration du message en cas d'erreur
- ✅ Affichage erreur avec détails

**Code avant** :
```typescript
const handleSend = async (event?: FormEvent) => {
  event?.preventDefault();
  if (!input.trim() || !currentConversation || !user) return;
  setSending(true);
  try {
    await supabase.from('messages').insert({...});
    setInput('');
    scrollToBottom();
  } catch (err) {
    error('Envoi impossible');
  } finally {
    setSending(false);
  }
};
```

**Code après** :
```typescript
const handleSend = async (event?: FormEvent) => {
  event?.preventDefault();
  if (!input.trim() || !currentConversation || !user) return;
  setSending(true);
  const messageContent = input.trim();
  setInput(''); // Vide tout de suite pour UX réactive
  
  try {
    console.log('[ChatInterface] Envoi message:', {...});
    
    const { data, error: sendError } = await supabase
      .from('messages')
      .insert({...})
      .select()
      .single();
    
    console.log('[ChatInterface] Résultat envoi:', { data, error: sendError });
    
    if (sendError) {
      console.error('[ChatInterface] Erreur envoi:', sendError);
      setInput(messageContent); // Restaure le message
      error(`Envoi impossible: ${sendError.message}`);
      return;
    }
    
    setTimeout(() => scrollToBottom(), 100);
  } catch (err) {
    console.error('[ChatInterface] Exception envoi:', err);
    setInput(messageContent); // Restaure le message
    error('Envoi impossible');
  } finally {
    setSending(false);
  }
};
```

### 2. `components/ConversationsList.tsx`
**Changements** :
- ✅ Correction bug `profileToShow` → `partnerProfile`

**Code avant** :
```typescript
{profileToShow?.is_online && <span className="w-2 h-2 rounded-full bg-action-green" />}
```

**Code après** :
```typescript
{partnerProfile?.is_online && <span className="w-2 h-2 rounded-full bg-action-green" />}
```

### 3. `contexts/ConversationsContext.tsx`
**Changements** :
- ✅ Ajout logs dans `refreshConversations`
- ✅ Ajout logs dans `openConversationWithUser`
- ✅ Meilleure gestion d'erreurs

---

## 🔍 Comment debugger

### Étape 1 : Ouvrir la Console (F12)

### Étape 2 : Tester l'envoi de message

1. **Ouvrez une conversation**
2. **Tapez un message et envoyez**
3. **Regardez la console** :

```javascript
// Logs attendus :
[ChatInterface] Envoi message: {
  conversation_id: "xxx",
  sender_id: "yyy",
  content: "test"
}
[ChatInterface] Résultat envoi: {
  data: {...},
  error: null
}
```

4. **Si erreur** :
```javascript
[ChatInterface] Erreur envoi: {
  message: "new row violates row-level security policy",
  code: "42501"
}
```

### Étape 3 : Vérifier les conversations

1. **Allez sur la page Messages**
2. **Regardez la console** :

```javascript
// Logs attendus :
[ConversationsContext] Chargement conversations pour user: xxx
[ConversationsContext] Conversations chargées: 2
[ConversationsContext] Conversations normalisées: 2
```

3. **Si erreur** :
```javascript
[ConversationsContext] Erreur chargement conversations: {...}
```

---

## 🚨 Si les messages ne fonctionnent toujours pas

### Vérifiez les politiques RLS dans Supabase

```sql
-- Vérifier les politiques existantes
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'messages';

-- Si aucune politique, exécutez :
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
```

### Testez manuellement dans Supabase

1. **Allez dans Table Editor → conversations**
2. **Trouvez votre conversation**
3. **Notez** : `user1_id`, `user2_id`, `id`

4. **Allez dans SQL Editor** et testez :

```sql
-- Remplacez les valeurs par les vôtres
INSERT INTO messages (conversation_id, sender_id, content)
VALUES (
  'conversation-id-ici',
  'votre-user-id-ici',
  'test message'
);
```

5. **Si erreur** → Problème RLS
6. **Si succès** → Problème dans le code frontend

---

## ✅ Checklist de vérification

### Après avoir appliqué les corrections :

- [ ] **1. Page Conversations s'affiche sans erreur**
  - Allez sur Messages
  - Pas de message "Oops"
  - Les conversations s'affichent

- [ ] **2. Envoi de message fonctionne**
  - Ouvrez une conversation
  - Tapez et envoyez un message
  - Le message apparaît immédiatement
  - Pas de redirection
  - Console : logs "[ChatInterface] Résultat envoi"

- [ ] **3. Les deux utilisateurs voient la conversation**
  - Utilisateur A accepte la demande
  - Utilisateur B voit la conversation créée
  - Les deux peuvent envoyer des messages
  - Les messages apparaissent en temps réel

- [ ] **4. Logs dans la console**
  - Pas d'erreurs rouges
  - Logs bleus avec [ChatInterface] et [ConversationsContext]
  - Tous les logs montrent "success"

---

## 🎯 Flux complet corrigé

### 1️⃣ **Acceptation de demande**
```
Page Demandes (Reçues)
→ Cliquer "Accepter"
→ Conversation créée automatiquement
→ Log: [ConversationsContext] Conversation créée/trouvée: xxx
→ Redirection automatique vers le chat
```

### 2️⃣ **Envoi de message**
```
Page Chat
→ Taper un message
→ Cliquer Envoyer
→ Log: [ChatInterface] Envoi message
→ Log: [ChatInterface] Résultat envoi: { data: {...}, error: null }
→ Message apparaît instantanément
→ PAS de redirection
→ Input vidé pour le prochain message
```

### 3️⃣ **Réception de message**
```
Temps réel (WebSocket)
→ Nouveau message arrive
→ Log: [useRealtimeMessages] Nouveau message
→ Message ajouté à la liste
→ Scroll automatique vers le bas
→ Notification sonore (si implémentée)
```

### 4️⃣ **Les deux voient la conversation**
```
Utilisateur A et B ont accepté
→ Conversation existe dans la DB
→ user1_id et user2_id dans conversations
→ Les deux peuvent lire (RLS SELECT)
→ Les deux peuvent écrire (RLS INSERT)
→ Les messages s'affichent pour les deux
```

---

## 🐛 Erreurs courantes et solutions

### Erreur : "new row violates row-level security policy"
**Cause** : Politiques RLS manquantes ou incorrectes  
**Solution** : Exécutez les politiques SQL (voir ci-dessus)

### Erreur : "profileToShow is not defined"
**Cause** : Bug dans ConversationsList.tsx  
**Solution** : ✅ Déjà corrigé dans ce commit

### Erreur : "Cannot read properties of undefined (reading 'is_online')"
**Cause** : partnerProfile est null  
**Solution** : ✅ Utilisation de l'opérateur ?. pour éviter le crash

### Message envoyé mais pas affiché
**Cause** : Problème de temps réel ou permissions  
**Solution** : 
1. Vérifiez les logs dans la console
2. Vérifiez que `.select().single()` est utilisé
3. Vérifiez les politiques RLS SELECT

### Redirection après envoi
**Cause** : Logique de navigation incorrecte  
**Solution** : ✅ Suppression des redirections automatiques dans ce commit

---

## 📦 Commit

**Branch** : `capy/cap-1-650d00fa`  
**Fichiers** :
- ✅ `components/ChatInterface.tsx`
- ✅ `components/ConversationsList.tsx`
- ✅ `contexts/ConversationsContext.tsx`
- ✅ `FIX_CONVERSATIONS_DEBUG_README.md` (ce fichier)

---

**Testez maintenant et regardez la console pour les logs !** 🚀

Si les problèmes persistent, partagez les logs de la console (F12).
