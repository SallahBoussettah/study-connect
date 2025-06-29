# Annexes

## Annexe A: Spécifications détaillées

Cette annexe présente les spécifications détaillées du projet StudyConnect, incluant les exigences fonctionnelles et non fonctionnelles qui n'ont pas été développées en profondeur dans le corps principal du document.

### A.1. Exigences fonctionnelles détaillées

#### A.1.1. Gestion des utilisateurs

| ID | Exigence | Priorité | Description |
|----|----------|----------|-------------|
| F1.1 | Inscription | Haute | L'utilisateur doit pouvoir créer un compte en fournissant email, mot de passe, prénom et nom |
| F1.2 | Authentification | Haute | L'utilisateur doit pouvoir se connecter avec son email et mot de passe |
| F1.3 | Profil utilisateur | Moyenne | L'utilisateur doit pouvoir consulter et modifier son profil (photo, bio, informations académiques) |
| F1.4 | Gestion des rôles | Moyenne | Le système doit distinguer les rôles (étudiant, enseignant, administrateur) avec des permissions différentes |
| F1.5 | Récupération de mot de passe | Basse | L'utilisateur doit pouvoir réinitialiser son mot de passe via email |

#### A.1.2. Salles d'étude virtuelles

| ID | Exigence | Priorité | Description |
|----|----------|----------|-------------|
| F2.1 | Création de salle | Haute | L'utilisateur doit pouvoir créer une salle d'étude avec nom, description et paramètres de visibilité |
| F2.2 | Invitation de membres | Haute | L'utilisateur doit pouvoir inviter d'autres utilisateurs à rejoindre une salle |
| F2.3 | Gestion des membres | Moyenne | Le créateur doit pouvoir gérer les membres (ajouter, supprimer, modifier les rôles) |
| F2.4 | Recherche de salles | Moyenne | L'utilisateur doit pouvoir rechercher des salles publiques par nom ou sujet |
| F2.5 | Statistiques de salle | Basse | Le système doit afficher des statistiques sur l'activité dans chaque salle |

#### A.1.3. Communication en temps réel

| ID | Exigence | Priorité | Description |
|----|----------|----------|-------------|
| F3.1 | Messagerie instantanée | Haute | Les utilisateurs doivent pouvoir échanger des messages textuels en temps réel |
| F3.2 | Indicateurs de présence | Moyenne | Le système doit afficher qui est actuellement connecté dans une salle |
| F3.3 | Messages directs | Moyenne | Les utilisateurs doivent pouvoir s'envoyer des messages privés |
| F3.4 | Notifications | Moyenne | Les utilisateurs doivent recevoir des notifications pour les nouveaux messages et invitations |
| F3.5 | Historique des messages | Basse | Le système doit conserver l'historique des conversations |

#### A.1.4. Partage de ressources

| ID | Exigence | Priorité | Description |
|----|----------|----------|-------------|
| F4.1 | Upload de fichiers | Haute | Les utilisateurs doivent pouvoir téléverser des documents dans une salle d'étude |
| F4.2 | Organisation des ressources | Moyenne | Le système doit permettre de classer les ressources par catégories et tags |
| F4.3 | Prévisualisation | Moyenne | Les utilisateurs doivent pouvoir prévisualiser les documents sans les télécharger |
| F4.4 | Recherche de ressources | Moyenne | Le système doit permettre de rechercher des ressources par nom, type ou contenu |
| F4.5 | Versionnement | Basse | Le système doit gérer les versions des documents modifiés |

#### A.1.5. Outils d'apprentissage

| ID | Exigence | Priorité | Description |
|----|----------|----------|-------------|
| F5.1 | Flashcards | Moyenne | Les utilisateurs doivent pouvoir créer et utiliser des cartes mémoire |
| F5.2 | Timer d'étude | Moyenne | Le système doit fournir un chronomètre configurable pour les sessions d'étude |
| F5.3 | Listes de tâches | Moyenne | Les utilisateurs doivent pouvoir créer et partager des listes de tâches |
| F5.4 | Statistiques d'apprentissage | Basse | Le système doit afficher des statistiques sur le temps d'étude et la progression |
| F5.5 | Quiz | Basse | Les utilisateurs doivent pouvoir créer et partager des quiz simples |

### A.2. Exigences non fonctionnelles détaillées

#### A.2.1. Performance

| ID | Exigence | Description | Métrique |
|----|----------|-------------|----------|
| NF1.1 | Temps de réponse | Le système doit répondre rapidement aux interactions utilisateur | < 200ms pour 95% des requêtes API |
| NF1.2 | Charge utilisateurs | Le système doit supporter un nombre significatif d'utilisateurs simultanés | Minimum 500 utilisateurs concurrents |
| NF1.3 | Temps de chargement | Les pages doivent se charger rapidement | < 2s pour le chargement initial |
| NF1.4 | Performance mobile | L'application doit être performante sur appareils mobiles | Temps de réponse < 300ms sur mobile |
| NF1.5 | Scalabilité | Le système doit pouvoir évoluer avec l'augmentation du nombre d'utilisateurs | Architecture permettant le scaling horizontal |

#### A.2.2. Sécurité

| ID | Exigence | Description | Implémentation |
|----|----------|-------------|----------------|
| NF2.1 | Authentification | Protection des accès aux ressources | JWT avec expiration et refresh tokens |
| NF2.2 | Protection des données | Sécurisation des données sensibles | Chiffrement des mots de passe avec bcrypt |
| NF2.3 | Validation des entrées | Prévention des injections | Sanitization de toutes les entrées utilisateur |
| NF2.4 | HTTPS | Communication sécurisée | TLS/SSL pour toutes les communications |
| NF2.5 | Audit | Traçabilité des actions sensibles | Journalisation des opérations critiques |

#### A.2.3. Utilisabilité

| ID | Exigence | Description | Critère |
|----|----------|-------------|---------|
| NF3.1 | Interface intuitive | L'interface doit être facile à comprendre | < 5 min pour comprendre les fonctionnalités principales |
| NF3.2 | Responsive design | L'interface doit s'adapter à tous les appareils | Fonctionnement optimal sur desktop, tablette et mobile |
| NF3.3 | Accessibilité | L'application doit être accessible | Conformité WCAG 2.1 niveau AA |
| NF3.4 | Internationalisation | Support de plusieurs langues | Structure permettant l'ajout facile de nouvelles langues |
| NF3.5 | Aide contextuelle | Assistance à l'utilisateur | Tooltips et guides intégrés |

## Annexe B: Diagrammes UML complets

Cette annexe présente les diagrammes UML détaillés qui n'ont pas été inclus dans le corps principal du document.

### B.1. Diagramme de cas d'utilisation complet

![Diagramme de cas d'utilisation complet](../diagrams/uml_use_case_full.png)

Le diagramme de cas d'utilisation complet illustre toutes les interactions possibles entre les différents acteurs (Étudiant, Enseignant, Administrateur) et le système StudyConnect. Il détaille les fonctionnalités accessibles à chaque type d'utilisateur et les relations entre ces fonctionnalités.

### B.2. Diagramme de classes détaillé

![Diagramme de classes détaillé](../diagrams/uml_class_diagram_full.png)

Le diagramme de classes détaillé présente l'ensemble des classes du système, leurs attributs, leurs méthodes et les relations entre elles. Ce diagramme est essentiel pour comprendre la structure statique de l'application et les interactions entre les différents objets.

### B.3. Diagrammes de séquence

#### B.3.1. Séquence d'authentification

![Diagramme de séquence - Authentification](../diagrams/uml_sequence_auth.png)

Ce diagramme illustre les interactions entre l'utilisateur, l'interface, le contrôleur d'authentification et la base de données lors du processus de connexion.

#### B.3.2. Séquence de création d'une salle d'étude

![Diagramme de séquence - Création de salle](../diagrams/uml_sequence_room_creation.png)

Ce diagramme détaille les étapes de création d'une nouvelle salle d'étude, depuis la saisie des informations par l'utilisateur jusqu'à la confirmation de création.

#### B.3.3. Séquence de partage de ressource

![Diagramme de séquence - Partage de ressource](../diagrams/uml_sequence_resource_sharing.png)

Ce diagramme montre le processus complet de partage d'une ressource, incluant l'upload, le traitement, l'enregistrement en base de données et la notification aux autres utilisateurs.

#### B.3.4. Séquence de communication en temps réel

![Diagramme de séquence - Communication temps réel](../diagrams/uml_sequence_realtime_comm.png)

Ce diagramme illustre les interactions entre les clients, le serveur Socket.IO et la base de données lors de l'envoi et la réception de messages en temps réel.

### B.4. Diagramme d'états

![Diagramme d'états - Cycle de vie d'un message](../diagrams/uml_state_message.png)

Ce diagramme présente les différents états possibles d'un message dans le système (envoyé, livré, lu) et les transitions entre ces états.

### B.5. Diagramme de déploiement détaillé

![Diagramme de déploiement détaillé](../diagrams/uml_deployment_full.png)

Ce diagramme illustre l'architecture physique complète du système déployé, incluant tous les serveurs, services et leurs interactions.

## Annexe C: Schéma de base de données

Cette annexe présente le schéma complet de la base de données de StudyConnect, avec toutes les tables, colonnes et relations.

### C.1. Modèle conceptuel de données

![Modèle conceptuel de données](../diagrams/db_conceptual_model.png)

Ce modèle présente une vue abstraite des entités principales du système et leurs relations, indépendamment de l'implémentation technique.

### C.2. Modèle logique de données

![Modèle logique de données](../diagrams/db_logical_model.png)

Ce modèle détaille la structure logique de la base de données, avec toutes les tables, leurs attributs et les relations entre elles.

### C.3. Description détaillée des tables

#### C.3.1. Table `users`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Identifiant unique de l'utilisateur |
| firstName | VARCHAR(100) | NOT NULL | Prénom de l'utilisateur |
| lastName | VARCHAR(100) | NOT NULL | Nom de l'utilisateur |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Adresse email de l'utilisateur |
| password | VARCHAR(255) | NOT NULL | Mot de passe hashé |
| role | ENUM | NOT NULL, DEFAULT 'student' | Rôle de l'utilisateur (student, teacher, admin) |
| avatar | VARCHAR(255) | | Chemin vers l'avatar de l'utilisateur |
| bio | TEXT | | Biographie de l'utilisateur |
| institution | VARCHAR(255) | | Institution académique de l'utilisateur |
| major | VARCHAR(100) | | Domaine d'étude principal |
| yearOfStudy | VARCHAR(50) | | Année d'étude |
| emailVerified | BOOLEAN | DEFAULT false | Indique si l'email a été vérifié |
| isActive | BOOLEAN | DEFAULT true | Indique si le compte est actif |
| lastLogin | TIMESTAMP | | Date et heure de la dernière connexion |
| createdAt | TIMESTAMP | NOT NULL | Date et heure de création |
| updatedAt | TIMESTAMP | NOT NULL | Date et heure de dernière modification |

#### C.3.2. Table `study_rooms`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Identifiant unique de la salle d'étude |
| name | VARCHAR(100) | NOT NULL | Nom de la salle d'étude |
| description | TEXT | | Description de la salle |
| image | VARCHAR(255) | | Chemin vers l'image de la salle |
| totalMembers | INTEGER | DEFAULT 1 | Nombre total de membres |
| activeMembers | INTEGER | DEFAULT 0 | Nombre de membres actuellement actifs |
| lastActive | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date et heure de dernière activité |
| isActive | BOOLEAN | DEFAULT true | Indique si la salle est active |
| createdBy | UUID | FK, NOT NULL | Identifiant du créateur de la salle |
| subjectId | UUID | FK | Identifiant du sujet associé |
| createdAt | TIMESTAMP | NOT NULL | Date et heure de création |
| updatedAt | TIMESTAMP | NOT NULL | Date et heure de dernière modification |

[Tables supplémentaires omises pour brièveté]

### C.4. Index et optimisations

| Table | Index | Colonnes | Type | Description |
|-------|-------|----------|------|-------------|
| users | users_email_idx | email | BTREE | Optimise la recherche par email |
| study_rooms | rooms_name_idx | name | BTREE | Optimise la recherche par nom |
| study_rooms | rooms_subject_idx | subjectId | BTREE | Optimise la recherche par sujet |
| resources | resources_room_idx | roomId | BTREE | Optimise la recherche par salle |
| messages | messages_room_idx | roomId | BTREE | Optimise la recherche par salle |
| messages | messages_timestamp_idx | timestamp | BTREE | Optimise la recherche chronologique |

## Annexe D: Guide d'installation

Cette annexe fournit les instructions détaillées pour installer et configurer StudyConnect dans un environnement de développement.

### D.1. Prérequis

Avant de commencer l'installation, assurez-vous que votre système dispose des éléments suivants :

- Node.js (v14.x ou supérieur)
- NPM (v6.x ou supérieur)
- PostgreSQL (v12.x ou supérieur)
- Git

### D.2. Installation de l'environnement de développement

#### D.2.1. Clonage du dépôt

```bash
git clone https://github.com/SallahBoussettah/study-connect.git studyconnect
cd studyconnect
```

#### D.2.2. Installation des dépendances

```bash
# Installation des dépendances du backend
cd backend
npm install

# Installation des dépendances du frontend
cd ../
npm install
```

#### D.2.3. Configuration de la base de données

1. Créez une base de données PostgreSQL pour StudyConnect :

```bash
psql -U postgres
CREATE DATABASE studyconnect;
CREATE USER studyconnect_user WITH ENCRYPTED PASSWORD '';
GRANT ALL PRIVILEGES ON DATABASE studyconnect TO studyconnect_user;
\q
```

2. Configurez les variables d'environnement :

Créez un fichier `.env` dans le dossier `backend` avec le contenu suivant :

```
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studyconnect
DB_USER=studyconnect_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRES_IN=1

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### D.2.4. Migrations de base de données

```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

#### D.2.5. Lancement de l'application en développement

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd ../
npm run dev
```

L'application sera accessible à l'adresse http://localhost:3000.

## Annexe E: Manuel utilisateur

Cette annexe fournit un guide complet pour les utilisateurs de StudyConnect, expliquant comment utiliser toutes les fonctionnalités de la plateforme.

### E.1. Premiers pas avec StudyConnect

#### E.1.1. Création d'un compte

1. Accédez à la page d'accueil de StudyConnect
2. Cliquez sur le bouton "S'inscrire"
3. Remplissez le formulaire avec vos informations personnelles
4. Validez votre adresse email en cliquant sur le lien reçu par email
5. Connectez-vous avec vos identifiants

#### E.1.2. Navigation dans l'interface

1. Le tableau de bord principal
2. La barre de navigation latérale
3. Les notifications et alertes
4. Le profil utilisateur
5. Les paramètres du compte

### E.2. Utilisation des salles d'étude

#### E.2.1. Créer une salle d'étude

1. Dans le tableau de bord, cliquez sur "Créer une salle"
2. Remplissez le formulaire avec le nom, la description et les paramètres de la salle
3. Choisissez la visibilité (publique ou privée)
4. Associez un sujet d'étude à la salle
5. Cliquez sur "Créer" pour finaliser

#### E.2.2. Rejoindre une salle existante

1. Recherchez une salle par nom ou sujet
2. Demandez à rejoindre une salle privée ou rejoignez directement une salle publique
3. Naviguez dans la liste des salles dont vous êtes membre

#### E.2.3. Interagir dans une salle d'étude

1. Utiliser le chat en temps réel
2. Partager des ressources
3. Voir les membres actifs
4. Gérer les membres (pour les administrateurs)

### E.3. Gestion des ressources

#### E.3.1. Partager une ressource

1. Dans une salle d'étude, accédez à l'onglet "Ressources"
2. Cliquez sur "Ajouter une ressource"
3. Téléversez un fichier depuis votre ordinateur
4. Ajoutez un titre, une description et des tags
5. Choisissez les permissions d'accès
6. Cliquez sur "Partager"

#### E.3.2. Accéder aux ressources partagées

1. Naviguer dans les ressources d'une salle
2. Rechercher des ressources par nom ou tag
3. Filtrer par type de fichier ou date
4. Prévisualiser et télécharger des ressources

### E.4. Utilisation des outils d'apprentissage

#### E.4.1. Timer d'étude

1. Accédez à l'outil Timer depuis le tableau de bord
2. Configurez la durée des sessions de travail et des pauses
3. Démarrez le timer et suivez votre progression
4. Consultez vos statistiques d'étude

#### E.4.2. Flashcards

1. Créez un nouveau jeu de flashcards
2. Ajoutez des cartes avec question/réponse
3. Étudiez avec différents modes (apprentissage, révision, test)
4. Partagez vos jeux de flashcards avec d'autres utilisateurs

#### E.4.3. Listes de tâches

1. Créez une nouvelle liste de tâches
2. Ajoutez des tâches avec description et date d'échéance
3. Organisez les tâches par priorité
4. Suivez votre progression et marquez les tâches comme terminées

### E.5. Communication et collaboration

#### E.5.1. Messagerie instantanée

1. Utiliser le chat dans une salle d'étude
2. Envoyer des messages directs à d'autres utilisateurs
3. Partager des liens et des fichiers dans les conversations
4. Voir qui est en ligne et qui est en train d'écrire

#### E.5.2. Gestion des contacts

1. Ajouter des amis à votre réseau
2. Gérer les demandes d'amitié
3. Voir les statuts de connexion de vos contacts
4. Créer des groupes de discussion

### E.6. Résolution des problèmes courants

1. Problèmes de connexion
2. Difficultés avec le partage de fichiers
3. Problèmes de performance
4. Questions fréquemment posées 