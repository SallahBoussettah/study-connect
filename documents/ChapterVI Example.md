CHAPITRE V :
Conception et méthodologie
 
1.	Introduction :
Ce chapitre présente la conception et l’entraînement du modèle d’apprentissage automatique de Clarifyr, développé pour réduire les limites de l’API Google Fact Check. Après avoir collecté, nettoyé et vectorisé les données, nous avons traité le déséquilibre des classes avant de tester plusieurs modèles. Le choix final s’est porté sur la régression logistique, offrant un bon compromis entre simplicité, rapidité et précision.
Cette solution complémentaire permet à Clarifyr de vérifier efficacement les informations même en l’absence de données externes, améliorant ainsi la fiabilité et l’expérience utilisateur.
2.	Présentation générale de l’approche:

Figure 9: Fonctionnement de Clarifyr
L’approche développée dans cette deuxième phase du projet Clarifyr repose sur un système hybride combinant une vérification externe via l’API Google Fact Check et une classification interne à l’aide d’un modèle d’apprentissage automatique. Cette dualité vise à pallier les limites rencontrées avec la seule API externe, dont la couverture ne permet pas toujours d’obtenir une réponse pertinente pour tous les articles soumis par les utilisateurs.
Le fonctionnement de cette approche s’articule autour d’un suivi rigoureux des données via un champ de statut dans la base de données :
 
2.1.	Soumission et enregistrement de l’information

Lorsqu’un utilisateur soumet un article ou une information via l’interface de Clarifyr, cette entrée est immédiatement enregistrée dans la base de données avec un statut initial
«pending» (en attente). Ce statut indique que l’information est en cours de traitement.
2.2.	Première étape — Vérification par l’API Google Fact Check

Le système récupère régulièrement les entrées avec le statut « pending » pour les envoyer à l’API Google Fact Check.
Si l’API retourne des résultats pertinents, ceux-ci sont sauvegardés dans la base de données, et le statut de l’entrée est mis à jour pour refléter l’achèvement du traitement.
Ces résultats sont ensuite transmis aux contrôleurs de l’application pour être affichés à l’utilisateur.
2.3.	Deuxième étape — Classification via modèle d’apprentissage automatique

Si l’API Google Fact Check ne fournit aucun résultat (l’article ou l’information n’est pas référencé), l’entrée est alors prétraitée (nettoyage, vectorisation) en utilisant la même logique qu’on a suivi pour préparer les données d’entrainement, puis l’envoyée au modèle interne de classification. Ce modèle, entraîné sur un corpus de données étiquetées, prédit si l’article est vrai, faux ou sarcastique.
Les résultats de cette classification sont aussi sauvegardés dans la base de données, avec mise à jour du statut.
2.4.	Affichage des résultats

Enfin, les résultats — qu’ils proviennent de l’API externe ou du modèle interne — sont récupérés par les contrôleurs de l’application et présentés à l’utilisateur via l’interface Clarifyr.
Cette approche en plusieurs étapes garantit un suivi complet et transparent des données, optimise la couverture de vérification en combinant plusieurs sources et méthodes, et offre à l’utilisateur une expérience fluide et fiable. Elle illustre l’importance d’un système orchestré, capable de gérer à la fois les réponses automatiques issues d’API tierces et les prédictions générées en interne.
 
2.	Technologies et outils utilisées :

a)	Google Fact Check API :





L'API de fact-checking de Google offre un accès à des résultats de vérification issus d'entités fiables. Cette API a été utilisée comme premier instrument de vérification dans le contexte de ce projet. Lorsque qu'un article est soumis, l'application consulte cette API pour déterminer si le contenu a déjà été validé. En l'absence de réponse, l'article est ensuite évalué par le modèle d'intelligence artificielle créé.
b)	Logistic Regression :



L'algorithme de régression logistique est une technique de classification supervisée employée pour estimer la probabilité d'appartenance à une catégorie spécifique. Elle excelle particulièrement dans les problématiques binaires, comme la distinction entre les articles Fake et Real dans notre exemple.
Dans le cadre de notre projet, nous avons formé un modèle de régression logistique en utilisant un ensemble de données étiqueté, qui inclut des articles provenant de médias tels qu'Al Jazeera (authentiques), The Onion (ironiques) et divers sites de fausses nouvelles. Ce modèle est utilisé lorsque l'API Google Fact Check ne fournit pas de résultats.
 
c)	Google Colab :




Google Colab, ou Google Colaboratory en entier, est une plateforme cloud sans frais basée sur Jupyter Notebook, donnant la possibilité aux utilisateurs de rédiger et d'exécuter du code Python directement depuis leur navigateur, sans besoin de configuration ou d'installation locale. Colab simplifie l'entraînement de modèles à grande échelle grâce à un accès aisé aux ressources GPU/TPU de Google. Pour ce projet, Google Colab a servi à prétraiter les données, à effectuer la vectorisation du texte et également pour l'entraînement et la validation du modèle destiné à détecter les fausses informations.
d)	Laravel :


Dans ce projet, Laravel, un framework PHP open source basé sur le modèle MVC, a été utilisé pour la partie backend. Cela a facilité la gestion des utilisateurs, des articles soumis, des analyses, des retours utilisateurs et des interactions avec la base de données. Laravel a aussi joué le rôle d'intermédiaire entre le frontend React et les modules d'analyse IA.
 
e)	MySQL :






MySQL est un système de gestion de base de données relationnelle qui permet de sécuriser le stockage des informations des utilisateurs, des données des articles examinés et des retours d'expérience soumis. Il a été intégré à l'aide de Laravel afin d'assurer la cohérence et la pérennité des données.
f)	React.js :








React.js est une bibliothèque JavaScript qui simplifie la création d'interfaces utilisateur dynamiques. Dans ce projet, elle a été utilisée pour concevoir toutes les pages de l'application, y compris la page d'accueil, l'analyse d'article, l'historique des analyses, la gestion du profil et les pages d'information générale telles que « À propos » et « Contact ».
 
g)	Pandas et NumPy :




Pandas est une librairie Python employée pour le traitement et l'examen des données en format tabulaire (DataFrames), tandis que NumPy facilite la manipulation performante des structures de données numériques. On a fait appel à ces bibliothèques pour l'importation, le nettoyage et la structuration des jeux de données avant de les passer au modèle.
h)	Scikit-learn :



Scikit-learn est une bibliothèque open source en Python dédiée à l'apprentissage automatique. Elle fournit une large gamme d’outils efficaces pour la classification, la régression, le clustering et la réduction de dimension. Dans ce projet, elle a été utilisée pour le prétraitement des données, la vectorisation du texte avec TfidfVectorizer, la création du pipeline de traitement, ainsi que pour entraîner et évaluer un modèle de régression logistique chargé de détecter les fausses nouvelles.
 
i)	Git et Github :



Git est un instrument de contrôle de version employé pour enregistrer les modifications du code source durant l'ensemble du projet. GitHub, la plateforme liée, a servi à collaborer, partager les fichiers au sein de l'équipe et garder un enregistrement organisé de la progression du projet.
j)	Xampp :




XAMPP est une plateforme de serveur web local qui intègre Apache, MySQL, PHP et Perl. Il rend plus aisé le développement et l'expérimentation d'applications web localement avant leur mise en ligne sur un serveur éloigné. Dans le cadre de notre projet, nous avons eu recours à XAMPP pour l'hébergement et l'exécution du backend de l'application, ce qui a permis une gestion performante de la base de données et un traitement efficace des requêtes sur le serveur.
 
2.	Collecte et préparation des données :

Le développement d’un modèle de détection de fausses informations repose avant tout sur la qualité des données utilisées pour l’entraîner. Dans le cadre de notre projet Clarifyr, nous avons dû rassembler un ensemble de textes représentatifs de trois catégories d’informations : les informations vraies, les fausses informations, et les contenus satiriques. Cette approche permet non seulement d'entraîner un modèle plus nuancé, mais aussi d'assurer que Clarifyr puisse différencier entre mensonge volontaire et humour volontairement absurde, un enjeu fondamental dans la lutte contre la désinformation.
3.1.	Origine et justification du choix des sources :

Pour garantir la qualité, la diversité et la pertinence des données utilisées dans l’entraînement du modèle de classification de Clarifyr, nous avons adopté une stratégie de sélection rigoureuse, fondée sur la nature des contenus et la fiabilité de leur provenance.

L’objectif principal était de construire un ensemble de données équilibré, représentatif des trois grandes catégories ciblées : les informations vraies, les fausses nouvelles, et les contenus satiriques.

	Informations réelles (classe : True):

Ce données proviennent de sites d’actualités de renommée mondiale, notamment Al Jazeera[46], qui est réputé pour sa rigueur journalistique, de couverture globale et de neutralité éditoriale.
Ce choix vise à ancrer l’apprentissage du modèle sur des textes structurés, bien sourcés, et exempts de biais sensationnalistes. Ces articles permettent au modèle de détecter les éléments caractéristiques d’un discours informatif factuel : ton neutre, présence de citations vérifiables, sources officielles, structures syntaxiques claires, etc.
	Fausses nouvelles (classe : Fake)

La classe Fake est alimenté par des données issues de bases de données open-source disponibles sur des sites spécialisés tels que Kaggle[47].

Ces jeux de données ont été élaborés à partir de publications diffusées sur les réseaux sociaux ou des sites à faible crédibilité, contenant des affirmations délibérément fausses ou trompeuses.
Ces contenus ont été conçus soit pour illustrer des cas typiques de désinformation, soit extraits de campagnes réelles de diffusion de fake news. Ils sont généralement marqués par
 
des titres accrocheurs, un vocabulaire émotionnellement chargé, une absence de vérifiabilité, voire des références à des "experts anonymes".

En exposant le modèle à ces caractéristiques récurrentes, on lui permet d’apprendre à reconnaître les signaux faibles qui trahissent une information erronée, même lorsque celle- ci semble plausible à première vue.

	Contenus satiriques (classe : Satire)

La classe Satire repose principalement sur des articles issus de sites humoristiques tels que The Onion [48], connus pour leur ton ironique et leur traitement volontairement absurde de l’actualité. Bien que ces articles soient inventés, leur objectif n’est pas de désinformer, mais de divertir par l’exagération ou la parodie.

Cependant, leur forme imite souvent celle d’un article d’actualité légitime (titres sérieux, structures rédactionnelles classiques), ce qui les rend particulièrement complexes à distinguer automatiquement des vraies ou fausses informations.
Inclure cette catégorie est donc essentiel pour éviter que notre modèle ne les classe à tort comme des articles « vrais » ou « faux », et pour renforcer sa capacité à nuancer son interprétation selon le contexte.
Ce choix stratégique de sources permet non seulement de couvrir un spectre large des types de contenus circulant en ligne, mais aussi de renforcer la robustesse et la capacité de généralisation du modèle. Il s'agit d'une approche stratégique pour entraîner un modèle qui, au-delà d’une simple détection binaire, est capable de comprendre l’intention sous-jacente du contenu : informer, manipuler ou divertir.

Cette démarche garantit également que Clarifyr ne se contente pas d’appliquer des règles superficielles de classification, mais développe une compréhension plus fine des dynamiques narratives et stylistiques propres à chaque type de contenu.
3.2.	Description du jeu de données utilisé :

Pour entraîner notre modèle de classification de textes, nous avons constitué un jeu de données en combinant deux méthodes complémentaires de collecte : le scraping personnalisé et le téléchargement de jeux de données publics.
	Scraping personnalisé :
Le Web scraping consiste à extraire automatiquement des données depuis des pages web en simulant la navigation humaine. À l’aide de scripts Python, nous avons pu collecter des contenus
 
textuels à partir de sites ciblés pour leur appartenance à des catégories bien définies.




Nous avons notamment ciblé :
•	The Onion [48], un site satirique reconnu pour ses articles humoristiques et volontairement absurdes, afin d’alimenter la classe satirical.
•	Al Jazeera [46] , un média d’information international réputé pour son sérieux, afin de constituer la classe real.

Pour ce faire, nous avons utilisé un ensemble d’outils Python :

•	requests pour envoyer des requêtes HTTP et récupérer les pages HTML,
•	BeautifulSoup pour parser et extraire les données textuelles pertinentes,
•	Selenium pour les pages dynamiques nécessitant une interaction avec le JavaScript.
Les scripts développés ont permis de récupérer automatiquement les titres et le corps des articles, en les nettoyant des éléments superflus (menus, publicités, scripts, etc.) afin de conserver uniquement le contenu rédactionnel.

	Téléchargement de jeux de données publics :

Nous avons également enrichi notre corpus avec des jeux de données open-source disponibles sur Kaggle, spécifiquement ceux relatifs à la détection de fausses informations. Ces jeux contenaient déjà une annotation (label) précisant si un article était fake ou real, facilitant ainsi leur intégration dans notre structure.

Au terme de la collecte, nous avons constitué un corpus contenant environ 24 000 articles, répartis entre les trois classes (real, fake, satirical).

Chaque article est représenté sous la forme d’un dictionnaire Python avec au minimum deux clés :

•	text : le contenu brut de l’article,
•	label : une étiquette catégorisant l’article selon sa nature.

En effet, les données brutes collectées présentaient plusieurs imperfections :

•	Présence de caractères spéciaux corrompus (souvent liés à l’encodage des caractères),
•	Balises HTML résiduelles provenant des contenus web extraits,
•	Phrases incomplètes ou répétitives,
 
Une phase de prétraitement a donc été mise en place pour préparer les textes à la vectorisation et à l'entraînement du modèle.
3.3.	Nettoyage et prétraitement des données :

Figure 10: Processus de transformation des données
Lors de l’analyse exploratoire de notre jeu de données, nous avons remarqué un déséquilibre significatif entre les classes. En particulier, la classe satirique était nettement surreprésentée par rapport aux classes réelle et fausse. Ce type de déséquilibre peut affecter la performance d’un modèle de classification : il risque d’apprendre à prédire la classe majoritaire par défaut, au détriment des classes minoritaires, pourtant tout aussi importantes dans notre cas d’usage.
Afin de garantir une répartition équitable des exemples et offrir à chaque classe une chance égale d’être correctement apprise par le modèle, nous avons appliqué une stratégie d’équilibrage des classes.
Plus précisément, nous avons opté pour une méthode d’under-sampling de la classe majoritaire, consistant à réduire le nombre d'exemples dans cette classe pour le ramener au niveau des classes minoritaires. Cette approche, bien que réduisant légèrement la quantité totale de données, permet d’éviter un apprentissage biaisé et améliore considérablement la capacité du modèle à généraliser.
Ce rééquilibrage a été appliqué avant la phase de vectorisation, afin que le modèle reçoive en entrée des données bien réparties. Grâce à cette étape, nous avons obtenu un jeu de données final équilibre entre les trois catégories (real, fake, satirical), ce qui a contribué à une meilleure robustesse du modèle, notamment dans la détection des cas ambigus.
Nous avons ensuite visualisé cette répartition équilibrée à l’aide d’un diagramme circulaire, permettant de vérifier visuellement que chaque classe était représentée de manière équitable.
 
 	 

 
Figure 11: Répartition initiale des classes
 
Figure 12: Répartition des classes après équilibrage
 


•	Nettoyage textuel :

Après l'étape d'équilibrage des classes, nous avons procédé à un nettoyage approfondi du contenu textuel pour préparer les données à l’entraînement du modèle. Cette phase est cruciale, car les algorithmes d'apprentissage automatique sont très sensibles à la qualité du texte d’entrée.
1.	Uniformisation de la casse :
L’ensemble du texte a été converti en minuscules. Cette étape permet d’éviter qu’un même mot, écrit différemment (par exemple “Gouvernement” vs “gouvernement”), ne soit traité comme deux entités distinctes par le modèle.
2.	Nettoyage de la ponctuation et des caractères spéciaux :
Nous avons supprimé tous les caractères spéciaux non utiles à l’analyse (tels que les symboles @, #, etc.), sauf ceux qui peuvent porter une information syntaxique utile à la compréhension (comme les points ou les virgules, selon le cas).
3.	Élimination des doublons :
Pour éviter les biais liés à la répétition d’un même texte, nous avons retiré les doublons exacts du corpus. Cette réduction de la redondance permet de renforcer la diversité des exemples présentés au modèle.
 
4.	Correction des erreurs d'encodage :
Certains textes présentaient des caractères corrompus ou mal encodés (comme des “â€”” à la place des tirets, ou des “Ã©” pour “é”). Nous avons nettoyé ces anomalies pour restaurer une lecture correcte du texte.
•	Vectorisation :

Pour transformer le texte brut en une représentation exploitable par des modèles d’apprentissage automatique, nous avons opté pour une approche simple mais efficace : la vectorisation via TF-IDF (Term Frequence – Inverse Document Frequency) à l’aide de la bibliothèque Scikit-learn.

L'application du TfidfVectorizer transforme chaque document (article) en un vecteur numérique de grande dimension, où chaque dimension correspond à un mot du vocabulaire total. La valeur associée à chaque mot dans le vecteur dépend :
•	Sa fréquence dans le document(TF),
•	Pondérée par sa rareté dans l’ensemble du corpus (IDF).
Le produit final de cette opération est une matrice creuse (sparse matrix), c’est-à-dire une matrice majoritairement remplie de zéros. En effet, chaque article ne contient qu’une fraction du vocabulaire total, ce qui rend cette représentation très économe en mémoire.

Ce choix de transformation a été motivé par :
•	Faible complexité computationnelle : TF-IDF est rapide à exécuter, ce qui est essentiel pour un prototypage agile et un déploiement en environnement web.
•	Interprétabilité élevée : Contrairement aux embeddings denses, les vecteurs TF-IDF permettent d’identifier facilement quels mots sont les plus influents dans une prédiction.
•	Compatibilité avec les modèles utilisés : Cette représentation s’intègre naturellement avec des algorithmes linéaires tels que la régression logistique, qui a été retenue pour sa performance et sa simplicité.
Cette étape de préparation des données fut essentielle pour la réussite du projet. Elle a permis non seulement de rendre les données exploitables par des algorithmes d'apprentissage automatique, mais aussi de réduire considérablement le bruit et les biais potentiels.
Elle constitue le socle sur lequel repose la fiabilité du modèle que nous avons entraîné. Un jeu de données bien préparé, équilibré et cohérent garantit de meilleures performances de classification, ainsi qu'une meilleure généralisation en conditions réelles.
 
3.	Entraînement et évaluation des modèles :
Pour évaluer la performance de notre système de classification, nous avons entraîné plusieurs modèles d’apprentissage supervisé sur le même jeu de données prétraité : la régression logistique, le Support Vector Machine (SVM), le Naive Bayes multinomial, et le Random Forest. Cette diversité de modèles nous a permis d’obtenir un aperçu comparatif sur leurs capacités à détecter les fausses, vraies, et satiriques informations.
Les résultats des différentes évaluations sont résumés dans le tableau suivant, où nous présentons les mesures classiques de précision, rappel, et F1-score pour chaque classe ainsi que l’exactitude globale


Figure 13: Evaluation des modeles
Les résultats obtenus par les différents modèles sont très proches les uns des autres, avec des précisions et rappels généralement supérieurs à 97%. Malgré cette similarité, nous avons choisi de retenir la régression logistique pour notre système de classification. Ce choix s’explique par plusieurs raisons essentielles : tout d’abord, la régression logistique présente une excellente interprétabilité, ce qui facilite la compréhension des décisions du modèle, un aspect crucial dans le contexte sensible de la vérification d’informations. Ensuite, elle offre une robustesse face aux variations des données et des paramètres, ce qui garantit une performance stable dans différents scénarios d’utilisation. Enfin, sa simplicité computationnelle permet une intégration efficace et rapide dans notre pipeline, favorisant ainsi une réponse rapide à l’utilisateur. Ces éléments combinés font de la régression logistique le meilleur compromis entre performance, fiabilité et facilité d’implémentation pour notre projet.
4.	Intégration dans Clarifyr :
L’intégration du modèle de classification au sein de Clarifyr a nécessité la mise en place d’un pipeline backend structuré et optimisé afin d’assurer une interaction fluide entre la soumission des données par l’utilisateur et la génération de la prédiction. Dès qu’un utilisateur soumet un texte à vérifier, celui-ci est stocké dans la base de données avec un statut initial « pending », indiquant que la vérification est en cours. Un processus automatisé interroge ensuite en premier lieu l’API Google
 
Fact Check pour tenter de récupérer une correspondance dans les bases officielles de vérification. Cette étape permet de capitaliser sur des sources externes reconnues pour leur fiabilité.
Si aucune correspondance n’est trouvée, le texte est alors prétraité : suppression des balises HTML, nettoyage des caractères spéciaux, conversion en minuscules, puis vectorisation avec TfidfVectorizer pour transformer le texte en une représentation numérique exploitable par le modèle. Cette représentation est ensuite envoyée à notre modèle de régression logistique, qui prédit la classe la plus probable (vrai, faux, satirique). Le résultat est sauvegardé dans la base avec une mise à jour du statut (exemple : « verified » ou « classified »), assurant la traçabilité des traitements effectués.
Enfin, la prédiction est retournée à l’interface utilisateur via un ensemble de contrôleurs API qui gèrent la communication entre la base de données et le front-end. Ce système permet non seulement de répondre rapidement aux demandes, mais aussi d’enregistrer chaque étape pour des besoins d’audit, d’amélioration continue et d’analyse statistique.
Un autre aspect clé de cette intégration est la gestion du feedback utilisateur. Lorsque la classification proposée semble erronée, l’utilisateur peut signaler son insatisfaction. Ces retours sont collectés et stockés afin d’être exploités ultérieurement pour entraîner à nouveau le modèle, garantissant une amélioration progressive et une meilleure adaptation aux évolutions des discours et des formes de désinformation.
Le diagramme de classes suivant illustre les principales entités de l'application, notamment les articles soumis, les résultats issus de la vérification, les utilisateurs, et les composants ML :

Figure 14: Diagramme de Class
 
5.	Limites et améliorations possibles :
Malgré l’efficacité démontrée par le modèle de régression logistique et son intégration fonctionnelle dans Clarifyr, plusieurs limites inhérentes doivent être soulignées. Premièrement, la diversité linguistique reste un défi important. Les données utilisées proviennent majoritairement de sources anglophones et francophones, ce qui limite la capacité du modèle à traiter correctement les textes en arabe dialectal, amazigh ou autres langues présentes dans le contexte marocain. Ce point constitue un axe d’amélioration primordial pour garantir une couverture plus large et une pertinence accrue dans les environnements multilingues.
Deuxièmement, la détection des contenus satiriques ou sarcastiques demeure un problème complexe. Ces types de textes jouent souvent sur l’ambiguïté, l’ironie ou l’exagération, rendant leur classification plus délicate. Bien que notre modèle intègre une catégorie spécifique pour le contenu satirique, il peut encore y avoir des confusions avec les vraies ou fausses nouvelles, particulièrement lorsque le contexte manque ou est mal interprété.
Par ailleurs, l’approche actuelle repose sur un modèle statique entraîné sur un jeu de données figé. Or, la nature de la désinformation évolue rapidement, avec l’apparition régulière de nouveaux schémas, langages et tactiques pour manipuler l’opinion publique. La mise en place d’un mécanisme de réentraînement dynamique, basé sur l’exploitation des retours utilisateurs et l’intégration continue de nouvelles données, représente une piste majeure d’amélioration. Cela garantirait que Clarifyr reste à jour, pertinent et capable d’adapter ses prédictions à un environnement médiatique en constante mutation.
Enfin, des optimisations techniques comme l’intégration de modèles plus complexes (ex : transformers ou réseaux de neurones profonds) pourraient à terme améliorer la précision, notamment sur des cas ambigus. Cependant, ce choix doit être pondéré face à la complexité, le temps de calcul et la nécessité de transparence dans les décisions du modèle, aspects cruciaux dans un outil de fact-checking.
6.	Conclusion :
Ce chapitre décrit la conception et l’intégration du modèle de classification de Clarifyr, qui combine l’API Google Fact Check avec un modèle interne de régression logistique. Cette approche permet une vérification efficace et rapide des informations. Le modèle choisi allie simplicité et performance, garantissant une gestion fluide des requêtes. Enfin, des perspectives d’évolution, comme la prise en charge multilingue et l’amélioration continue, sont envisagées pour renforcer l’efficacité du système face à la désinformation.