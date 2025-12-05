# Migration SQL - Système de questions d'introduction

## 📝 Description

Cette migration ajoute une colonne `introduction_answers` à la table `connection_requests` pour stocker les réponses aux questions d'introduction que les utilisateurs remplissent avant d'envoyer une invitation.

## 🚀 Comment appliquer la migration

### Option 1 : Via Supabase Dashboard (Recommandé)

1. Connectez-vous à votre projet Supabase
2. Allez dans l'éditeur SQL (SQL Editor)
3. Copiez et exécutez le contenu du fichier `supabase/add_introduction_answers.sql`

### Option 2 : Via CLI Supabase

```bash
supabase db push
```

## 📋 Contenu de la migration

```sql
-- Ajouter une colonne pour stocker les réponses aux questions d'introduction
ALTER TABLE connection_requests 
ADD COLUMN introduction_answers JSONB;

-- Commentaire pour la colonne
COMMENT ON COLUMN connection_requests.introduction_answers IS 'Questions et réponses pour mieux se comprendre avant de se connecter. Format: [{"question": "...", "answer": "..."}]';
```

## 🔍 Détails techniques

### Format des données

La colonne `introduction_answers` stocke un tableau JSON avec ce format :

```json
[
  {
    "question": "Qu'est-ce qui vous passionne le plus dans la vie ?",
    "answer": "La programmation et l'innovation technologique"
  },
  {
    "question": "Comment aimez-vous passer votre temps libre ?",
    "answer": "J'aime lire, faire du sport et passer du temps avec mes amis"
  }
]
```

### Questions posées

1. Qu'est-ce qui vous passionne le plus dans la vie ?
2. Comment aimez-vous passer votre temps libre ?
3. Quel est votre endroit préféré pour un rendez-vous ?
4. Qu'est-ce qui vous fait rire ?
5. Quelle est votre vision d'une relation idéale ?
6. Quel est votre style de communication ?
7. Qu'est-ce qui est important pour vous dans une relation ?

## ✅ Vérification

Après avoir appliqué la migration, vérifiez que tout fonctionne :

1. Allez sur la page "Connexions"
2. Cliquez sur "Se connecter" sur un profil
3. Répondez aux 7 questions
4. Envoyez l'invitation
5. Vérifiez dans la page "Demandes" (onglet "Envoyées") que vos réponses sont affichées
6. Le destinataire devrait voir vos réponses dans l'onglet "Reçues"

## 🔄 Rollback

Si vous devez annuler cette migration :

```sql
ALTER TABLE connection_requests DROP COLUMN introduction_answers;
```

⚠️ **Attention** : Cela supprimera définitivement toutes les réponses aux questions existantes.
