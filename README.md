# Codex JDR

Appli compagnon de jeu de rôle (PWA, fonctionne hors ligne).

Modules : **Star Wars (FFG)** (*Aux confins de l'Empire*, *L'Ère de la Rébellion*, *Force et Destinée*) et **Le Seigneur des Anneaux** (Decipher, système CODA).

- **Persos** : création guidée propre à chaque gamme.
  - Espèce, carrière et spécialisation, avec les rangs offerts.
  - Dépense d'XP avec les limites de création.
  - Obligation, Devoir ou Moralité, avec les échanges contre de l'XP ou des crédits.
  - Motivations et équipement de départ (500 crédits, argent de poche).
  - **Arbres de talents interactifs** pour les 57 spécialisations des trois livres.
  - **Pouvoirs de la Force** (11 pouvoirs) avec leurs améliorations.
  - Fiche de jeu : blessures, stress, blessures critiques, talents appliqués automatiquement.
  - Export et import en JSON.
- **Dés** : lanceur de dés narratifs.
- **MJ** : initiative, réserve de Destin, PNJ, **178 adversaires** des livres (ajout en un clic), **75 véhicules et vaisseaux** avec suivi de la coque, du stress et des coups critiques, tests d'Obligation et de Devoir, **Conflit et Moralité** de fin de séance, notes.
- **Règles** : aide-mémoire, plus une recherche hors ligne dans tes livres via un fichier d'index importé sur le téléphone.
- **Catalogue** : armes, armures, matériel et kits (accessoires, cristaux de sabre laser) avec gestion des emplacements.
- **Fiche imprimable** : bouton 🖨️ PDF sur chaque perso.

## Mise en ligne (GitHub Pages)

1. Mets tous les fichiers de ce dossier dans le dépôt `codex-jdr` (remplace les anciens).
2. Va dans Settings → Pages → Branch `main` / root.
3. Ouvre `https://<ton-compte>.github.io/codex-jdr/` sur le téléphone. Si l'ancienne version reste affichée, ferme et rouvre l'appli : la mise à jour se fait au 2e lancement.

⚠️ Ne mets **jamais** les fichiers `index-*.json` dans le dépôt : ils contiennent le texte des livres. Ils s'importent directement dans l'appli (Règles → Livres), un par système.

Données : arbres et véhicules issus du jeu de données communautaire d'OggDude, adversaires de sw-adversaries (stoogoff), noms français relevés dans les livres ou traduits.
