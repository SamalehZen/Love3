-- Politiques RLS pour conversations
-- Ces politiques permettent aux utilisateurs de créer et voir leurs conversations

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can insert conversations they are part of" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Politique: Les utilisateurs peuvent créer des conversations où ils sont participant
CREATE POLICY "Users can insert conversations they are part of"
ON conversations FOR INSERT
WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Politique: Les utilisateurs peuvent voir les conversations où ils sont participant
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Politique: Les utilisateurs peuvent mettre à jour leurs conversations (match status, place selection, etc.)
CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Politiques RLS pour messages
-- Ces politiques permettent aux utilisateurs d'envoyer et voir les messages de leurs conversations

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Politique: Les utilisateurs peuvent envoyer des messages dans leurs conversations
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

-- Politique: Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Politique: Les utilisateurs peuvent mettre à jour les messages qu'ils ont reçus (marquer comme lu)
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
