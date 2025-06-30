# Instructions pour utiliser les diagrammes dans Excalidraw

Ce dossier contient plusieurs diagrammes au format Mermaid qui peuvent être utilisés dans Excalidraw pour créer des visualisations pour le projet StudyConnect.

## Diagrammes disponibles

1. **user_flow.txt** - Flux utilisateur principal de l'application
2. **auth_flow.txt** - Flux détaillé d'authentification et d'autorisation
3. **study_room_flow.txt** - Flux détaillé de la gestion des salles d'étude
4. **resource_flow.txt** - Flux de gestion des ressources dans les salles d'étude
5. **main_resources_flow.txt** - Flux de gestion des ressources publiques avec processus d'approbation (montre à la fois l'implémentation actuelle et les évolutions futures)
6. **communication_flow.txt** - Flux de communication en temps réel

## Comment utiliser ces diagrammes dans Excalidraw

1. Ouvrez [Excalidraw](https://excalidraw.com/)
2. Cliquez sur l'onglet "Text to diagram"
3. Sélectionnez "Mermaid"
4. Copiez le contenu du fichier `.txt` de votre choix dans l'éditeur
5. Cliquez sur "Insert"
6. Le diagramme sera généré et vous pourrez le modifier selon vos besoins

## Personnalisation des diagrammes

Une fois le diagramme généré dans Excalidraw, vous pouvez:

- Réorganiser les éléments pour une meilleure lisibilité
- Modifier les couleurs et les styles des nœuds et des connexions
- Ajouter des annotations ou des éléments supplémentaires
- Exporter le diagramme en PNG, SVG ou en tant que fichier Excalidraw

## Conseils pour un meilleur rendu

- **Utilisez un code couleur cohérent** :
  - Vert pour les actions réussies
  - Rouge pour les erreurs ou refus
  - Bleu pour les actions utilisateur
  - Orange pour les décisions/validations
  - Gris pour les processus système
  - Violet pour les actions d'approbation/modération
  - Cyan pour les fonctionnalités futures (non encore implémentées)

- **Ajoutez des icônes** pour améliorer la compréhension visuelle
- **Regroupez les éléments connexes** à l'aide de la fonctionnalité de groupe d'Excalidraw
- **Ajustez l'épaisseur des flèches** pour indiquer l'importance des flux
- **Utilisez des sous-graphes** pour distinguer les fonctionnalités actuelles des évolutions futures

## Intégration dans la documentation

Après avoir personnalisé vos diagrammes dans Excalidraw:

1. Exportez-les au format PNG
2. Placez les fichiers PNG dans le dossier `documents/diagrams/`
3. Référencez-les dans vos fichiers Markdown avec le chemin relatif:
   ```markdown
   ![Nom du diagramme](../diagrams/nom_du_fichier.png)
   ```

## Mise à jour des diagrammes

Si vous devez mettre à jour un diagramme:

1. Modifiez le fichier `.txt` correspondant
2. Générez à nouveau le diagramme dans Excalidraw
3. Exportez et remplacez l'ancien fichier PNG 