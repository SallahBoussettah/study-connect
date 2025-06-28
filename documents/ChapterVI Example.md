CHAPITRE VI :
Implémentation et intégration
 
1.	Introduction :
Ce chapitre présente l’intégration de notre modèle de détection de fake news dans une application web accessible aux utilisateurs finaux. Après le développement du modèle, il a été essentiel de créer une interface intuitive permettant une vérification rapide des informations.
Nous détaillons l’architecture de l’application, les technologies utilisées, ainsi que le parcours utilisateur, de la soumission de la requête à l’affichage des résultats, en insistant sur la communication entre les modules et l’intégration du modèle.
L’interaction avec l’utilisateur via l’interface et le système de feedback est également abordée, soulignant l’amélioration continue de la précision du système. Enfin, les mesures de sécurité pour la protection des données et les limites actuelles du projet sont discutées.
Ce chapitre illustre la transformation du prototype en un outil concret et fonctionnel, répondant aux enjeux de la lutte contre la désinformation en ligne.
2.	Architecture Technique de l’Application :

L’application web a été conçue selon une architecture modulaire, permettant une séparation claire des responsabilités et facilitant la maintenance ainsi que les futures évolutions. Elle se compose principalement de trois parties :

Figure 15: Architecture Technique



1.	Frontend (Interface Utilisateur) :

Cette couche est responsable de l’interface utilisateur. Elle permet la navigation fluide entre les pages, la saisie des textes à analyser, l’affichage des résultats et la collecte des retours. React.js a été choisi pour ses performances avec le DOM virtuel, ce qui rend l’application réactive et agréable à utiliser.
 
 

Figure 16:Page de destination


2.	Backend (API Serveur) :

Implémenté en Laravel, le backend joue un rôle central dans la gestion des requêtes, la communication avec le modèle de machine learning, ainsi que l’interaction avec la base
de données. Il reçoit les textes soumis, lance la vérification via le modèle ou l’API Google Fact Check, stocke les résultats et met à jour le statut des requêtes. Le backend assure
également la sécurité, notamment via l’authentification des utilisateurs.
3.	Base de Données :
Une base MySQL est utilisée pour stocker plusieurs types de données : les utilisateurs, les articles soumis, les résultats d’analyse, ainsi que les retours utilisateurs. Cette organisation permet de conserver un historique et d’enrichir progressivement la base de données pour améliorer les performances du modèle lors des réentraînements futurs.

Figure 17:Database MySQL
 
Ces composants interagissent via des API REST, garantissant une communication efficace et standardisée. Cette architecture a été choisie pour sa robustesse, sa flexibilité, et la possibilité d’intégrer aisément de nouveaux modules (par exemple, l’ajout futur d’autres modèles ou services de vérification).
3.	Flux Fonctionnel Utilisateur :
Le parcours utilisateur est structuré en plusieurs étapes clés :

•	Inscription et Authentification :
L’utilisateur commence par créer un compte via la page d’inscription ou se connecte s’il possède déjà un compte. Ces pages utilisent le système d’authentification Laravel, sécurisé et efficace.


Figure 18:Page de Login

•	Accès au Dashboard :
Après connexion, l’utilisateur est dirigé vers son Dashboard. Ce tableau de bord affiche un historique des analyses passées, incluant la date, le texte soumis, et le résultat obtenu. Si l’utilisateur n’a pas encore d’analyse, une page d’information expliquant l’utilisation de l’application est affichée.
 
 
Figure 19: Dashboard

•	Soumission d’Analyse (Page Analyse) :
L’utilisateur peut soumettre un texte ou un article à analyser via la page dédiée. La saisie se fait dans un formulaire simple. Lors de la validation, la requête est envoyée au backend.


Figure 20: Page d'analyse
 
•	Traitement côté backend :
Le backend enregistre la demande, lance la vérification via l’API Google Fact Check. Si aucune donnée n’est retournée, il applique le modèle ML pour classifier le texte.


Figure 21: Structure de fonctionnement

•	Affichage des résultats :
Les résultats sont affichés à l’utilisateur selon la méthode d’analyse utilisée : si l’API Google Fact Check fournit une réponse, celle-ci est présentée sous forme structurée. Sinon, le modèle de régression logistique prend le relais et affiche une classification (vrai, faux ou satirique) en fonction du contenu analysé.
 
 

Figure 22: Résultat obtenu par Google Fact Check


Figure 23: Résultat obtenu par le model

•	Feedback utilisateur :
L’utilisateur peut valider ou contester le résultat via une interface simple ; ce retour est enregistré dans la base de données et sera utilisé ultérieurement pour réentraîner le modèle lors d’une session d’apprentissage hors ligne, dans le but d’améliorer sa précision.
 
 

Figure 24: System de feedback
4.	Gestion des Données et Suivi des Statuts :



























Figure 25: Structure de la Base de Données de l'Application
 
4.1.	Organisation des données :

L’application s’appuie sur une base de données MySQL structurée autour de plusieurs tables principales. La table users contient les informations relatives à chaque utilisateur inscrit. La table articles soumis enregistre les textes ou liens d’articles que chaque utilisateur soumet pour analyse. Ces deux tables sont liées par une relation permettant d’assurer un historique personnalisé des demandes d’analyse.
Les résultats des analyses sont stockés dans une table dédiée model_feedback, qui associe chaque article à son verdict, obtenu soit via l’API Google Fact Check, soit par le modèle de machine learning. Enfin, une table retours utilisateurs conserve les feedbacks transmis par les utilisateurs pour signaler d’éventuelles erreurs ou désaccords avec les résultats fournis.
4.2.	Suivi des statuts :

Chaque article soumis pour analyse est enregistré dans la base de données avec un statut indiquant son état de traitement. Deux statuts principaux sont utilisés : « pending » et « verified ». Lorsqu’un article est soumis, il reçoit d’abord le statut « pending », signifiant qu’il est en attente d’analyse. Le système commence alors par interroger l’API Google Fact Check. Si aucune information pertinente n’est trouvée, l’article est ensuite analysé par le modèle de machine learning. Une fois le traitement terminé, quel que soit le chemin suivi (API ou modèle), le statut est mis à jour en « verified ». Ce mécanisme de suivi permet d’éviter les traitements redondants, d’assurer une traçabilité claire des analyses effectuées, et de simplifier la gestion et la maintenance du système.
4.3.	Traitement de feedback :

Les feedbacks utilisateurs jouent un rôle clé dans l’amélioration continue du système. Lorsqu’un utilisateur soumet un retour, celui-ci est enregistré et pris en compte dans les futures phases de réentraînement du modèle de machine learning. Cette boucle de rétroaction permet de corriger les erreurs détectées, d’affiner la précision du modèle, et d’enrichir la base de données avec des cas d’usage réels, renforçant ainsi la robustesse et la pertinence de l’application sur le long terme.
5.	Gestion des Données et Suivi des Statuts :

Dans le pipeline de vérification, le modèle de machine learning intervient comme solution de secours lorsque l’API Google Fact Check ne fournit aucun résultat pertinent. Une fois un article soumis, un processus de prétraitement automatique est lancé : le texte est nettoyé (suppression des caractères
spéciaux, mise en minuscules, tokenisation), puis vectorisé à l’aide de techniques de transformation textuelle adaptées (comme le TF-IDF), afin d’être compatible avec le modèle. Le système repose sur une régression logistique, un algorithme de classification supervisée reconnu pour sa simplicité, sa rapidité et son efficacité sur des données textuelles linéairement séparables. En se basant sur les caractéristiques
 statistiques du texte, le modèle prédit une probabilité associée à chaque classe (vrai ou faux), permettant	
 
ainsi de classer le contenu selon sa véracité présumée. Le résultat de cette analyse est ensuite renvoyé au backend, qui le transmet à l’interface utilisateur pour affichage. Par ailleurs, le backend est équipé de mécanismes de gestion des erreurs : en cas d’échec de l’appel à l’API ou de problème dans le pipeline, le
système bascule automatiquement vers le modèle ML afin de garantir la continuité du service et la fiabilité de l’expérience utilisateur.

6.	Interface Utilisateur et Navigation :

L’interface de l’application web a été conçue pour offrir une navigation fluide et intuitive, centrée sur l’utilisateur. Les autres rois pages principales qui sont accessibles via le menu sont :
	About Us:

Figure 26: Page 'About Us'
Cette page présente l’objectif de l’application, la démarche suivie, ainsi que les membres de l’équipe de développement. Elle permet à l’utilisateur de comprendre le fonctionnement global du système et de renforcer la transparence du projet.
 
	Contact Us:

Figure 27:Page 'Contact US'
Cette page contient un formulaire permettant aux utilisateurs de poser des questions, signaler des problèmes ou proposer des suggestions. Les messages soumis via ce formulaire sont automatiquement redirigés vers une adresse e-mail configurée à l'aide de MailTrap, facilitant ainsi la gestion et le suivi des retours utilisateurs.
	Profile:

Figure 28: Page 'Profile'
 
Chaque utilisateur dispose d’un espace personnel accessible via la page profil. Cet espace permet de consulter et gérer les informations liées au compte.


	La navigation entre les différentes pages est assurée par un système de routes Laravel, associé à des contrôleurs qui gèrent les droits d’accès et l’affichage dynamique du contenu. Cette architecture permet de garantir à la fois sécurité, performance et modularité.
Enfin, une attention particulière a été portée à la simplicité du design. L’interface est volontairement épurée, avec des éléments clairs et accessibles, dans le but d’être utilisable par tous les profils d’utilisateurs, y compris les moins techniques. Cette approche vise à réduire la charge cognitive, à améliorer la lisibilité du contenu, et à rendre l’expérience globale plus agréable et efficace.


7.	Limites Actuelles et Perspectives d’Amélioration :

Malgré le bon fonctionnement général de l’application, certaines limites techniques et fonctionnelles ont été identifiées au cours du développement et des phases de test. L’un des premiers axes d’amélioration concerne les temps de réponse, notamment ceux liés à l’appel à l’API Google Fact Check. Étant donné que cette API repose sur un service externe, elle peut parfois engendrer des délais ou des indisponibilités momentanées, ce qui affecte la fluidité de l’expérience utilisateur. Pour pallier cela, nous envisageons soit une optimisation de la gestion des appels, soit l’implémentation d’un mécanisme de cache ou de priorisation locale.
En parallèle, l’aspect expérience utilisateur (UX) constitue un autre domaine clé d’amélioration. À ce stade, l’interface reste volontairement simple, mais l’ajout de notifications dynamiques, de messages d’erreur clairs, ou encore d’un support multilingue figure parmi les priorités. En particulier, intégrer l’arabe standard ainsi que la langue marocaine (darija), aussi bien dans l’interface que dans le corpus d’entraînement du modèle, permettrait à l’application de mieux s’adapter à son contexte d’utilisation et de répondre aux besoins d’un public plus large et plus représentatif.
Concernant la composante machine learning, le modèle actuel — une régression logistique — a été efficace pour une première version, mais montre ses limites en termes de capacité d’apprentissage évolutif. C’est pourquoi une évolution vers un modèle de deep learning est envisagée. Contrairement aux approches classiques, un tel modèle pourrait tirer parti des retours utilisateurs pour affiner ses prédictions de manière autonome, sans nécessiter un réentraînement manuel complet. Cela ouvrirait la voie à un système plus intelligent, plus réactif et plus personnalisable à long terme.
 
Enfin, l’intégration d’un tableau de bord d’administration constitue une perspective concrète à court terme. Ce Dashboard permettrait aux administrateurs de suivre les activités des utilisateurs, de gérer les articles soumis, de consulter les statistiques globales et de surveiller les retours. Il s’agit d’un outil essentiel pour assurer le bon fonctionnement de la plateforme, en renforçant à la fois la transparence, la traçabilité et la gestion opérationnelle du système.
En somme, ces pistes d’amélioration visent à rendre l’application non seulement plus robuste et performante, mais également plus accessible, évolutive et adaptée aux besoins réels des utilisateurs dans un contexte local et multilingue.


8.	Conclusion :

Ce chapitre a présenté la concrétisation technique du projet Clarifyr, depuis l’architecture
générale jusqu’à l’intégration des différents composants : API externe, modèle d’apprentissage automatique, interface utilisateur et base de données. Grâce à l’usage combiné de technologies modernes telles que Laravel, React.js, MySQL et Google Colab, nous avons pu mettre en place une solution web complète, interactive et évolutive. L’approche hybride implémentée garantit une couverture optimale de la vérification, tout en offrant une expérience utilisateur fluide. Cette base solide ouvre la voie à de futures améliorations, notamment l’enrichissement des sources de données et l’intégration de modèles plus avancés.
