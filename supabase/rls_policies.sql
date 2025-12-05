-- Politiques RLS pour connection_requests
-- Ces politiques permettent aux utilisateurs d'envoyer et de voir leurs demandes

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
