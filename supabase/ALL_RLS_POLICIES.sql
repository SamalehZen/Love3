-- ============================================
-- ACTIVATION RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_swipes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES RLS POUR PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Tout le monde peut voir tous les profils (pour la recherche)
CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
USING (true);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- POLITIQUES RLS POUR CONNECTION_REQUESTS
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own requests" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they sent" ON connection_requests;
DROP POLICY IF EXISTS "Users can view requests they received" ON connection_requests;
DROP POLICY IF EXISTS "Users can update requests they received" ON connection_requests;

-- Les utilisateurs peuvent créer des demandes
CREATE POLICY "Users can insert their own requests"
ON connection_requests FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Les utilisateurs peuvent voir les demandes qu'ils ont envoyées
CREATE POLICY "Users can view requests they sent"
ON connection_requests FOR SELECT
USING (auth.uid() = from_user_id);

-- Les utilisateurs peuvent voir les demandes qu'ils ont reçues
CREATE POLICY "Users can view requests they received"
ON connection_requests FOR SELECT
USING (auth.uid() = to_user_id);

-- Les utilisateurs peuvent mettre à jour les demandes qu'ils ont reçues
CREATE POLICY "Users can update requests they received"
ON connection_requests FOR UPDATE
USING (auth.uid() = to_user_id);

-- ============================================
-- POLITIQUES RLS POUR CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can insert conversations they are part of" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Les utilisateurs peuvent créer des conversations
CREATE POLICY "Users can insert conversations they are part of"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Les utilisateurs peuvent voir leurs conversations
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Les utilisateurs peuvent mettre à jour leurs conversations
CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- POLITIQUES RLS POUR MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Les utilisateurs peuvent envoyer des messages
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

-- Les utilisateurs peuvent voir les messages
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Les utilisateurs peuvent marquer comme lu
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
-- POLITIQUES RLS POUR PLACE_SWIPES
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own swipes" ON place_swipes;
DROP POLICY IF EXISTS "Users can view swipes in their conversations" ON place_swipes;
DROP POLICY IF EXISTS "Users can update their own swipes" ON place_swipes;

-- Les utilisateurs peuvent créer leurs swipes
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

-- Les utilisateurs peuvent voir les swipes de leurs conversations
CREATE POLICY "Users can view swipes in their conversations"
ON place_swipes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Les utilisateurs peuvent modifier leurs propres swipes
CREATE POLICY "Users can update their own swipes"
ON place_swipes FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Vérifier que RLS est activé sur toutes les tables
SELECT 
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'connection_requests', 'conversations', 'messages', 'place_swipes')
ORDER BY tablename;

-- Lister toutes les politiques créées
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️ Lecture'
    WHEN cmd = 'INSERT' THEN '➕ Création'
    WHEN cmd = 'UPDATE' THEN '✏️ Modification'
    WHEN cmd = 'DELETE' THEN '🗑️ Suppression'
  END as action
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'connection_requests', 'conversations', 'messages', 'place_swipes')
ORDER BY tablename, cmd;
