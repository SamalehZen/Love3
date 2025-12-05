-- Ajouter une colonne pour stocker les réponses aux questions d'introduction
ALTER TABLE connection_requests 
ADD COLUMN introduction_answers JSONB;

-- Commentaire pour la colonne
COMMENT ON COLUMN connection_requests.introduction_answers IS 'Questions et réponses pour mieux se comprendre avant de se connecter. Format: [{"question": "...", "answer": "..."}]';
