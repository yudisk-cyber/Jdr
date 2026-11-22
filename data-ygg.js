/* Yggdrasill — Le jeu de rôle (7e Cercle). Mécaniques relevées dans le livre de règles : valeurs, listes et résumés rédigés pour l'appli. */
window.YGG_DATA = {
  carac: [
    { id: 'pui', name: 'Puissance', abbr: 'PUI', g: 'Corps' }, { id: 'vig', name: 'Vigueur', abbr: 'VIG', g: 'Corps' }, { id: 'agi', name: 'Agilité', abbr: 'AGI', g: 'Corps' },
    { id: 'int', name: 'Intellect', abbr: 'INT', g: 'Esprit' }, { id: 'per', name: 'Perception', abbr: 'PER', g: 'Esprit' }, { id: 'ten', name: 'Ténacité', abbr: 'TEN', g: 'Esprit' },
    { id: 'cha', name: 'Charisme', abbr: 'CHA', g: 'Âme' }, { id: 'ins', name: 'Instinct', abbr: 'INS', g: 'Âme' }, { id: 'com', name: 'Communication', abbr: 'COM', g: 'Âme' },
  ],
  /* id, nom, type (g = générale, m = martiale, s = magique), astérisque (pas de test à 0), spécialisation, caractéristique suggérée */
  skills: [
    ['acrobatie', 'Acrobatie', 'g', 0, 0, 'agi'], ['artisanat', 'Artisanat', 'g', 0, 1, 'agi'], ['arts', 'Arts', 'g', 0, 1, 'com'], ['attelage', 'Attelage', 'g', 0, 0, 'agi'],
    ['chercher', 'Chercher', 'g', 0, 0, 'per'], ['chevaucher', 'Chevaucher', 'g', 0, 0, 'agi'], ['commerce', 'Commerce', 'g', 0, 0, 'int'], ['discretion', 'Discrétion', 'g', 0, 0, 'agi'],
    ['eloquence', 'Éloquence', 'g', 0, 0, 'com'], ['empathie', 'Empathie', 'g', 0, 0, 'ins'], ['escalade', 'Escalade', 'g', 0, 0, 'agi'], ['esquive', 'Esquive', 'g', 0, 0, 'agi'],
    ['herboristerie', 'Herboristerie', 'g', 0, 0, 'int'], ['intimidation', 'Intimidation', 'g', 0, 0, 'cha'], ['jeux', 'Jeux', 'g', 0, 0, 'int'], ['langues', 'Langues', 'g', 1, 1, 'int'],
    ['larcins', 'Larcins', 'g', 0, 0, 'agi'], ['medecine', 'Médecine', 'g', 1, 0, 'int'], ['mouvement', 'Mouvement', 'g', 0, 0, 'agi'], ['natation', 'Natation', 'g', 0, 0, 'vig'],
    ['navigation', 'Navigation', 'g', 0, 0, 'int'], ['negociation', 'Négociation', 'g', 0, 0, 'com'], ['sagas', 'Sagas', 'g', 0, 0, 'com'], ['savoir', 'Savoir', 'g', 0, 1, 'int'],
    ['seduction', 'Séduction', 'g', 0, 0, 'cha'], ['superstition', 'Superstition', 'g', 0, 0, 'ins'], ['survie', 'Survie', 'g', 0, 0, 'ins'], ['tactique', 'Tactique', 'g', 0, 0, 'int'],
    ['traditions', 'Traditions', 'g', 0, 0, 'int'], ['vigilance', 'Vigilance', 'g', 0, 0, 'per'],
    ['a2m', 'Armes à deux mains', 'm', 0, 0, 'pui'], ['acourtes', 'Armes courtes', 'm', 0, 0, 'agi'], ['ahast', 'Armes d\'hast', 'm', 0, 0, 'agi'], ['atir', 'Armes de tir', 'm', 0, 0, 'agi'],
    ['aimpro', 'Armes improvisées', 'm', 0, 0, 'agi'], ['alongues', 'Armes longues', 'm', 0, 0, 'agi'], ['lancer', 'Lancer', 'm', 0, 0, 'agi'], ['lutte', 'Lutte', 'm', 0, 0, 'pui'],
    ['sejdr', 'Sejdr', 's', 1, 0, 'ins'], ['galdr', 'Galdr', 's', 1, 0, 'cha'], ['runes', 'Runes', 's', 1, 0, 'com'],
  ],
  levels: [[0, 'Inexpérimenté'], [1, 'Novice'], [4, 'Confirmé'], [8, 'Expert'], [13, 'Maître'], [18, 'Légende']],

  archetypes: [
    { g: 'Nobles', n: 'Jarl', fav: ['chevaucher', 'eloquence', 'tactique', 'traditions', '+martiale'] },
    { g: 'Nobles', n: 'Chef de guerre', fav: ['chevaucher', 'intimidation', 'savoir:Géographie', 'tactique', '+martiale'] },
    { g: 'Nobles', n: 'Conseiller du seigneur', fav: ['discretion', 'negociation', 'eloquence', 'savoir:Politique de la Scandia', '+martiale'] },
    { g: 'Sages', n: 'Völva', fav: ['empathie', 'savoir:Divinités (Ases et Vanes)', 'superstition', '+martiale', '+magique'], don: 'Initié' },
    { g: 'Sages', n: 'Thulr', fav: ['herboristerie', 'savoir:Rites funéraires', 'survie', '+martiale', '+magique'], don: 'Initié' },
    { g: 'Sages', n: 'Scalde', fav: ['arts', 'eloquence', 'sagas', '+martiale', '+magique (Galdr ou Runes)'], note: 'La magie demande le don Initié.' },
    { g: 'Sages', n: 'Soigneur', fav: ['herboristerie', 'medecine', 'survie', '+martiale'] },
    { g: 'Guerriers', n: 'Hirdmen', fav: ['chevaucher', 'esquive', 'mouvement', '+martiale', '+martiale'] },
    { g: 'Guerriers', n: 'Berserkr', fav: ['esquive', 'intimidation', 'mouvement', 'survie', '+martiale'], don: 'Guerrier-fauve' },
    { g: 'Guerriers', n: 'Mercenaire', fav: ['chevaucher', 'negociation', 'jeux', 'survie', '+martiale'] },
    { g: 'Voyageurs', n: 'Marchand', fav: ['commerce', 'navigation', 'negociation', 'savoir:Géographie', '+martiale'] },
    { g: 'Voyageurs', n: 'Émissaire', fav: ['eloquence', 'empathie', 'negociation', 'savoir:Personnalités de la Scandia', 'traditions'] },
    { g: 'Voyageurs', n: 'Forgeron itinérant', fav: ['artisanat:Forge', 'attelage', 'commerce', 'savoir:Géographie', '+martiale'] },
    { g: 'Voyageurs', n: 'Espion', fav: ['chercher', 'discretion', 'larcins', 'traditions', '+martiale'] },
    { g: 'Travailleurs', n: 'Artisan', fav: ['artisanat', 'commerce', 'runes', 'savoir:Artisans légendaires', '+martiale'], note: 'Les Runes demandent le don Initié.' },
    { g: 'Travailleurs', n: 'Fermier', fav: ['artisanat', 'attelage', 'savoir:Agriculture et élevage', 'superstition', '+martiale'] },
    { g: 'Travailleurs', n: 'Forestier', fav: ['artisanat:Travail du bois', 'savoir:Forêts de la Scandia', 'survie', 'vigilance', '+martiale'] },
    { g: 'Travailleurs', n: 'Mineur', fav: ['artisanat:Taille de pierre', 'chercher', 'savoir:Travail de la mine', 'survie', '+martiale'] },
  ],

  /* Runes du Destin : aett, n°, nom, type (pn = positif/négatif, p = exclusivement positif, n = exclusivement négatif), résumé + / − */
  aetts: ['Aett de Freyr', 'Aett de Heimdall', 'Aett de Tyr'],
  runes: [
    [0, 1, 'Fehu', 'pn', 'Prospérité, richesse, réussite sociale.', 'Pauvreté, revers de fortune, rejet social.'],
    [0, 2, 'Uruz', 'pn', 'Santé de fer, force et énergie.', 'Maladif, manque d\'énergie.'],
    [0, 3, 'Thurz', 'n', '', 'Géants du givre : les ennuis et les conflits le suivent.'],
    [0, 4, 'Ansuz', 'p', 'Bénédiction d\'Odhinn : inspiration scaldique ou magique.', ''],
    [0, 5, 'Reith', 'pn', 'Voyages, évolution, changement.', 'Immobilisme, refus du changement.'],
    [0, 6, 'Kaun', 'pn', 'Passion, créativité, talent d\'artisan.', 'Instabilité, manque de persévérance.'],
    [0, 7, 'Gebô', 'pn', 'Sacrifices bien accueillis par les dieux.', 'Aucune aide divine.'],
    [0, 8, 'Wunjô', 'p', 'Joie de vivre, plaisirs, amours.', ''],
    [1, 1, 'Hagall', 'n', '', 'Colère de la nature : catastrophes, disette.'],
    [1, 2, 'Nauthr', 'n', '', 'Souffrance : perte d\'un proche, captivité, bannissement…'],
    [1, 3, 'Isa', 'n', '', 'Glace, stagnation, trahison.'],
    [1, 4, 'Jerà', 'p', 'Bonnes récoltes, paix, opportunités retrouvées.', ''],
    [1, 5, 'Iwaz', 'p', 'Protection, loyauté des proches (cesse en cas de trahison).', ''],
    [1, 6, 'Perth', 'pn', 'Divination, énigmes, résiste aux illusions.', 'Insensible aux arcanes, vulnérable aux sorts.'],
    [1, 7, 'Algiz', 'p', 'Protection contre le mal et les malédictions (cesse en cas de parjure).', ''],
    [1, 8, 'Sôl', 'p', 'Victoire, reconnaissance, legs inattendu.', ''],
    [2, 1, 'Tiwaz', 'pn', 'Justice : jamais victime d\'arbitraire.', 'Injustices, échecs aux compétitions.'],
    [2, 2, 'Bjarken', 'pn', 'Mariage heureux, enfants robustes.', 'Mariage malheureux, naissance non désirée.'],
    [2, 3, 'Ehwaz', 'p', 'Voyage réussi ; renforce les autres runes positives.', ''],
    [2, 4, 'Mathr', 'pn', 'Personne de bien, communicateur, meneur.', 'Isolé, sans aide de ses semblables.'],
    [2, 5, 'Lôgr', 'pn', 'Intuition, rêves prémonitoires.', 'Confus, sans direction.'],
    [2, 6, 'Ingvi', 'p', 'Famille bienveillante, sérénité.', ''],
    [2, 7, 'Dagaz', 'p', 'Amélioration inespérée, réussite après l\'échec.', ''],
    [2, 8, 'Othal', 'pn', 'Héritage, terres, propriété.', 'Jamais propriétaire terrien.'],
  ],

  dons: [
    ['Adroit', 'Artisanat, travaux manuels.'], ['Affinité', 'Une forme de magie choisie (Galdr, Sejdr ou Runes).'], ['Agile', 'Activités physiques de coordination.'], ['Ambidextre', 'Jamais de pénalité pour la mauvaise main.'],
    ['Avenant', 'Apparence, première impression.'], ['Bagarreur', 'Combat à mains nues.'], ['Bénédiction du Destin', 'Jeux de hasard, chance.'], ['Brave', 'Résister à la peur.'],
    ['Cavalier', 'Chevaux : monter, soigner, juger.'], ['Colosse', 'Intimider, travaux de force.'], ['Corps de fer', '+1D10 pour encaisser un choc.'], ['Discret', 'Passer inaperçu, se cacher.'],
    ['Don de Freyr/Freyja', 'Séduction, sympathie.'], ['Éloquent', 'Convaincre, argumenter.'], ['Élu de Njördr', 'Mer et navigation.'], ['Empathie', 'Deviner les émotions et les mensonges.'],
    ['Érudit', 'Culture générale, légendes, histoire.'], ['Frère de Mímir', 'Sagesse, dilemmes.'], ['Guerrier-fauve', 'Transe de combat d\'Odhinn (berserkr, ulfhedinn ou svinfylkingar).'], ['Guidé par Thorr', 'Coups terribles au combat.'],
    ['Homme des bois', 'Ne se perd jamais, survie en forêt.'], ['Initié', 'Peut pratiquer la magie (Galdr, Sejdr, Runes).'], ['Inspiré', 'Œuvres d\'art fascinantes.'], ['Masque de Loki', 'Comédie, mensonge.'],
    ['Mémoire parfaite', 'Se souvenir des détails.'], ['Meneur d\'hommes', 'Commander, s\'imposer.'], ['Montagnard', 'Montagne, escalade.'], ['Réfléchi', 'Énigmes, jeux d\'esprit.'],
    ['Robuste', 'Froid, faim, maladies, toxines, alcool.'], ['Sens aiguisés', 'Vigilance, difficile à surprendre.'],
  ],
  faiblesses: [
    ['Amnésique', 'Aucun souvenir du passé.'], ['Arrogant', 'Méprise presque tout le monde.'], ['Brute', 'Relations fondées sur la force.'], ['Cruel', 'Aime voir souffrir.'],
    ['Curieux', 'Fourre son nez partout.'], ['Distrait', 'Rêveur, facile à surprendre.'], ['Étrange', 'Aura qui met mal à l\'aise.'], ['Faible', 'S\'épuise vite.'],
    ['Froid', 'Distant, peu de sympathie.'], ['Handicapé', 'Pied bot (DEP −1), borgne (−2 Perception), manchot (−3 à deux mains)…'], ['Hors-la-loi', 'Banni d\'une contrée.'], ['Imberbe', 'Sa virilité est raillée.'],
    ['Impétueux', 'Agit avant de réfléchir.'], ['Interdit', 'Code personnel rigide.'], ['Ivrogne', 'Boit plus que de raison.'], ['Malédiction de Loki', 'Malchance incroyable.'],
    ['Misogyne / Misandre', 'Méprise l\'autre sexe.'], ['Naïf', 'Croit tout ce qu\'on lui dit.'], ['Paillard', 'Ne résiste jamais à un festin ou une nuit de plaisir.'], ['Peur', 'Peur d\'une chose banale (nuit, loups, mer…).'],
    ['Rancunier', 'N\'oublie jamais une offense.'], ['Rigide', 'Ne trahit jamais sa parole.'], ['Sang chaud', 'Ne refuse jamais un défi.'], ['Souffreteux', 'Souvent malade, ne tient pas l\'alcool.'],
    ['Téméraire', 'Fonce tête baissée.'], ['Vendetta', 'Poursuit une vengeance.'],
  ],
  fauves: ['Berserkr (ours)', 'Ulfhedinn (loup)', 'Svinfylkingar (sanglier)'],

  /* Prouesses : nom, type (A attaque, D défense, U utilitaire), niveau (ou [min,max]), armes/prérequis, effet résumé */
  prouesses: [
    ['Aucun abri sûr', 'A', 1, 'Tir, jet · martiale Novice', 'Touche une cible abritée derrière un obstacle léger : moitié des dégâts, sans la protection de l\'obstacle.'],
    ['Charge impétueuse', 'A', 1, 'Mêlée · Novice', 'Après un déplacement : +DEP aux dégâts (×2 après une course, ×3 après un sprint).'],
    ['Coup de bouclier', 'A', 1, 'Avec bouclier · Armes improvisées Novice', 'Riposte après une parade réussie : PUI + MR + 5 dégâts.'],
    ['Sonner', 'A', 1, 'Mêlée · Novice', 'Si touché, test de Ténacité SR 10 − dégâts, sinon la cible passe en mode défensif.'],
    ['Assommer', 'A', 2, 'Mêlée · Confirmé', 'Moitié des dégâts ; Vigueur SR 14 − MR ou inconscient 1D10 min.'],
    ['Briser le bouclier', 'A', 2, 'Deux mains · Confirmé', 'Détruit le bouclier ; ne peut qu\'être esquivé.'],
    ['Comme des lapins !', 'A', 2, 'Mêlée · Expert', 'Contre des figurants : chaque ennemi abattu permet d\'enchaîner une attaque.'],
    ['Coup de tête', 'A', 2, 'Courtes, longues, deux mains · Confirmé', 'Après une parade : Lutte, PUI + MR (+casque) dégâts, +3 à la prochaine action adverse.'],
    ['Désarçonner', 'A', 2, 'Deux mains, hast, jet · Confirmé', 'Vigueur + Chevaucher SR 14 − dégâts ou la cible tombe de sa monture.'],
    ['Prise de l\'ours', 'A', 2, 'Lutte · Confirmé', 'Étreinte : PUI × 2 dégâts par tour tant qu\'elle tient (opposition de Puissance).'],
    ['Soumets-toi !', 'A', 2, 'Lutte, deux mains · Confirmé', 'Projette la cible au sol, moitié des dégâts.'],
    ['Venez à moi !', 'A', 2, 'Longues, deux mains, hast · Confirmé', 'Répartit les dégâts entre plusieurs adversaires (DP la plus haute).'],
    ['Vider les mains', 'A', 2, 'Courtes (Expert), longues (Confirmé)', 'La cible qui rate sa défense lâche son arme (1D5 m).'],
    ['Fendre le casque', 'A', 3, 'Longues, deux mains, hast, jet · Confirmé', 'DP −2 ce tour ; casque fendu (protection réduite) ; Vigueur SR 10 − dégâts ou mode défensif.'],
    ['Franchir la ligne ennemie', 'A', 3, 'Mêlée · Expert', 'Charge contre 3+ ennemis groupés, finit derrière eux (DEP/2).'],
    ['Impact !', 'A', 3, 'Tir, jet · Confirmé', 'La cible est projetée de PUI mètres ; Agilité SR 14 − dégâts ou chute.'],
    ['Projectile humain', 'A', 3, 'Lutte · Expert', 'Après une Prise de l\'ours : lance la victime (PUI m, PUI × 2 dégâts).'],
    ['Entre les yeux', 'A', 4, 'Tir, jet · Expert', 'La cible perd la moitié de ses PV restants ; un figurant meurt.'],
    ['Grêle mortelle', 'A', [2, 4], 'Tir, jet · Confirmé', '2 à 4 projectiles sur une cible : (MR + arme) × nombre, protection × nombre.'],
    ['La charge du sanglier', 'A', [1, 4], 'Svinfylkingar, épée et bouclier', 'Ne peut qu\'être esquivée ; PUI + MR + 5/10/15/20 ; renverse la cible.'],
    ['Les crocs du loup', 'A', [2, 4], 'Ulfhedinn, lance', '2 à 4 attaques en une action : PUI + lance + niveau chacune.'],
    ['Par le Bras de Thor !', 'A', [1, 4], 'Longues, deux mains, hast, jet · Novice', '+1D10 par niveau aux dégâts.'],
    ['Féroce comme l\'ours', 'A', [1, 4], 'Berserkr, hache à deux mains', '+5/10/15/20 dégâts ; +1 à 4 dés de furor (une fois par combat).'],
    ['Feinte de corps', 'D', 1, 'Mêlée', 'Parade : la prochaine action adverse subit −3.'],
    ['Saut du lynx', 'D', 1, 'Esquive Confirmé', 'Esquive en restant debout et au contact (ou DEP/2 contre un tir).'],
    ['À toi !', 'D', 2, 'Esquive Confirmé', 'L\'attaque esquivée frappe un autre adversaire (moitié des dégâts).'],
    ['Défense de fer !', 'D', 2, 'Courtes, longues · Confirmé', 'Une action pour parer deux attaquants différents.'],
    ['Mur de fer', 'D', 3, 'Courtes, longues · Confirmé', 'Parade réussie : l\'action n\'est pas dépensée.'],
    ['Ni d\'estoc, ni de taille', 'D', 3, 'Longues · Confirmé', 'Une seconde parade gratuite dans le tour.'],
    ['Blocage', 'D', [2, 4], 'Mêlée', 'Bloque l\'arme : pas d\'attaque adverse à sa prochaine action ; en cas d\'échec, −2/4/6 dégâts.'],
    ['Hurlement sanguinaire', 'U', 1, 'Intimidation Novice', 'CHA + Intimidation SR 14 + DM : DP adverse −CHA pour le combat.'],
    ['Rapide comme la foudre', 'U', 1, 'Mouvement Novice', 'Mouvement SR 14 + DP : échange son rang d\'initiative avec l\'adversaire.'],
    ['Ralliez-vous à moi', 'U', 2, 'Tactique Confirmé', 'INT + Tactique : +5 à toutes les actions des alliés ce tour.'],
    ['Rugissement de Fenrir', 'U', 3, 'Intimidation Confirmé, guerrier-fauve ou thulr', 'Les ennemis qui ratent TEN + DM subissent −CHA contre vous.'],
    ['Pas encore mort !', 'U', 4, 'Ténacité 3+', 'Au stade Mort : test de Ténacité SR 14 chaque tour pour continuer à agir.'],
    ['Inspiré par Odhinn', 'U', [1, 4], 'Instinct 3+', 'Instinct SR 14 : +3/6/9/12 aux tests de Ténacité du combat.'],
  ],

  /* Sejdr : catégorie, niveau, nom, préparation, effet résumé, page */
  sejdr: [
    ['Divination', 1, 'Sinistres présages', '1 action', 'Pressentiment bon ou mauvais sur l\'avenir proche.', 151],
    ['Divination', 2, 'Ce que murmurent les os', '3 tours', 'Lire l\'avenir proche dans les osselets (quelques détails).', 151],
    ['Divination', 3, 'Songes divinatoires', '1 heure', 'Rêve flou sur un sujet précis.', 151],
    ['Divination', 3, 'Prophétie', '3 heures', 'Sur le haut siège, sentir si l\'avenir du clan est menacé.', 151],
    ['Divination', 4, 'Dormir sur le tertre', '1 heure', 'Questionner l\'âme d\'un mort (1 à 5 questions selon la MR).', 151],
    ['Transmission de forces', 1, 'Renforcement / Abaissement de protections', '2 actions', 'Protection d\'une pièce d\'armure ± INS.', 152],
    ['Transmission de forces', 1, 'Amélioration de la Défense Physique', '3 actions', 'Sa propre DP + INS.', 153],
    ['Transmission de forces', 2, 'Amélioration / Abaissement de la DP d\'autrui', '2 tours', 'DP d\'une personne ± INS.', 153],
    ['Transmission de forces', 2, 'Renforcement des armes / Armes émoussées', '3 tours', 'Dégâts d\'une arme ± INS.', 153],
    ['Transmission de forces', 2, 'Augmentation de la Santé', '2 tours', 'PV max + somme de INS D10 (sur soi).', 153],
    ['Transmission de forces', 3, 'Amélioration des protections', '2 tours', 'Une pièce d\'armure + niveau de Sejdr.', 153],
    ['Transmission de forces', 3, 'Augmentation de la Santé d\'autrui', '3 tours', 'PV max d\'une personne + INS D10.', 153],
    ['Transmission de forces', 3, 'Augmentation de la Réserve de dés', '3 tours', 'Réserve de furor + (INS + 1) dés (réserve pleine requise).', 153],
    ['Transmission de forces', 4, 'Amélioration des armes', '3 tours', 'Dégâts d\'une arme + niveau de Sejdr.', 153],
    ['Transmission de forces', 4, 'Augmentation de la Réserve de dés d\'autrui', '3 tours', 'Réserve d\'une personne + INS dés.', 153],
    ['Transmission de forces', 4, 'Augmentation de la Défense physique', '3 tours', 'Répartit le niveau de Sejdr en DP sur INS personnes.', 154],
    ['Guérison', 1, 'Protection contre les envoûtements', '5 tours', 'Bonus égal à la DM du mage contre les envoûtements.', 154],
    ['Guérison', 1, 'Les mains qui soignent / Celui qui blesse', '2 actions', '±1D10 PV.', 154],
    ['Guérison', 1, 'Stabilisation', '1 action', 'Un mourant dans le coma revient à 1 PV.', 154],
    ['Guérison', 1, 'Libérer de la peur / Créer la peur', '3 actions', 'Nouveau test de Peur avec bonus = Sejdr (ou l\'inverse).', 154],
    ['Guérison', 1, 'Guérison des maladies mineures', '3 tours', 'Guérit une maladie mineure (SR = virulence).', 154],
    ['Guérison', 2, 'Préparation de baumes, onguents', '3 heures', 'Baumes de soin conservables (1 à 5 doses).', 154],
    ['Guérison', 2, 'Stabilisation des hémorragies', '1 action', 'Stoppe toutes les hémorragies.', 154],
    ['Guérison', 2, 'Sortir de l\'épuisement', '2 actions', 'Rend 1 dé de furor, sort de l\'épuisement.', 154],
    ['Guérison', 3, 'Regagner / Faire perdre des Dés de Réserve', '3 actions', '± INS dés de furor.', 155],
    ['Guérison', 3, 'Soins modérés / Blessures modérées', '2 actions', '± INS D10 PV.', 155],
    ['Guérison', 3, 'Annulation d\'envoûtement mineur sur un objet', '3 heures', 'Opposition contre l\'envoûtement d\'un objet.', 155],
    ['Guérison', 3, 'Soigner Empoisonnement', '3 tours', 'Purifie d\'un poison (SR = virulence).', 155],
    ['Guérison', 3, 'Préparation de potion', '3 heures', 'Potion de soins conservable.', 155],
    ['Guérison', 3, 'Guérison des maladies modérées', '3 tours', 'Guérit une maladie modérée.', 155],
    ['Guérison', 4, 'Récupération totale', '4 tours', 'Rend tous les PV (pas les hémorragies ni blessures graves).', 155],
    ['Guérison', 4, 'Annulation d\'un envoûtement mineur sur une personne', '3 heures', 'Libère définitivement une personne.', 155],
    ['Guérison', 5, 'Baume de récupération totale', '12 heures', 'Baume qui rend tous les PV en 1D10 minutes.', 155],
    ['Guérison', 5, 'Guérison des maladies graves', '3 tours', 'Guérit une maladie grave.', 156],
    ['Maîtrise des éléments', 1, 'Maîtriser le brouillard', '4 minutes', 'Lever ou dissiper un brouillard (INS × 200 m³).', 156],
    ['Maîtrise des éléments', 1, 'Maîtriser les vents légers', '1 action', 'Lever ou calmer des vents légers (INS × 10 m³).', 156],
    ['Maîtrise des éléments', 1, 'Invoquer la pluie', '1 heure', 'Faire tomber la pluie si le ciel est chargé.', 156],
    ['Maîtrise des éléments', 2, 'Ouvrir le lit d\'une rivière', '3 tours', 'Ouvrir un passage dans une rivière.', 156],
    ['Maîtrise des éléments', 2, 'Créer / Lever l\'obscurité', '4 actions', 'Contrôle de la lumière dans une zone.', 156],
    ['Maîtrise des éléments', 3, 'Maîtriser la pluie', '1 heure', 'Faire pleuvoir quel que soit le temps.', 156],
    ['Maîtrise des éléments', 3, 'Ouvrir le lit d\'un fleuve', '—', 'Ouvrir un passage dans un fleuve.', 156],
    ['Maîtrise des éléments', 3, 'Maîtriser les vents violents', '2 tours', 'Créer des vents violents.', 156],
    ['Maîtrise des éléments', 4, 'Créer une tempête de neige', '1 heure', 'Tempête de neige sur INS × 500 m².', 157],
    ['Maîtrise des éléments', 4, 'Glissement de terrain', '10 minutes', 'Fait s\'effondrer une paroi (dégâts selon le terrain).', 157],
    ['Maîtrise des éléments', 4, 'Détourner le lit d\'une rivière ou d\'un fleuve', '2 heures', 'Dévie un cours d\'eau.', 157],
    ['Maîtrise des éléments', 5, 'Créer / Calmer un tremblement de terre', '2 heures', 'Séisme dévastateur sur INS × 200 m².', 157],
    ['Malédictions', 2, 'Rêves sinistres', '3 actions', 'Envoie de mauvais rêves à la victime (voir livre).', 158],
    ['Malédictions', 3, 'Faire naître la confusion', '3 actions', 'La victime perd tout intérêt pour ce qu\'elle faisait.', 158],
    ['Malédictions', 4, 'Pris de folie', '3 actions', 'Plonge la victime dans la folie (voir livre).', 158],
    ['Malédictions', 5, 'La chevauchée de la mara', '3 heures', 'Le hamr du mage chevauche la victime dans son sommeil (voir livre).', 158],
  ],
  sejdrDur: [[0, '1D5 actions'], [6, '1D10 tours'], [11, '1D10 minutes'], [16, '1D10 heures'], [26, '1D5 jours']],

  /* Galdr : voies et domaines (SD 3 à 15) */
  galdr: {
    'Malédictions': ['Action ou maladie mineure', 'Action ou maladie modérée', 'Malédiction mineure', 'Action ou maladie majeure', 'Malédiction majeure'],
    'Illusions': ['Ouïe', 'Vue', 'Odorat', 'Goût', 'Toucher'],
    'Charme': ['Sommeil', 'Séduire', 'Charmer des animaux', 'Charmer des humains', 'Charmer des créatures'],
  },
  galdrDur: ['1D5 actions', '1D10 tours', '1D10 minutes', '1D10 heures', '1D5 jours'],
  galdrCibles: ['1 cible', '2 à 4', '5 à 9', '10 à 49', '50 et +'],
  galdrZone: ['INS × 10 cm³ (chat, épée)', 'INS × 50 cm³ (tabouret, enfant)', 'INS × 1 m³ (homme)', 'INS × 5 m³ (charrette)', 'INS × 10 m³ (maison, navire)'],

  /* Runes magiques : nom, niveau, effet positif / négatif (la puissance sert de bonus ou de malus) */
  runesMag: [
    ['Kaun', 1, '+puissance en Artisanat', ''], ['Reith', 1, '+puissance en orientation et Navigation', '−puissance en orientation et Navigation'],
    ['Sôl', 1, '+puissance en Tactique', ''], ['Tiwaz', 1, '+puissance en Éloquence devant le thing', '−puissance en Éloquence devant le thing'],
    ['Algiz', 2, '+puissance aux tests de résistance magique', ''], ['Fehu', 2, '+puissance en Négociation commerciale', '−puissance en Négociation'],
    ['Jerá', 2, '+puissance en diplomatie', '−puissance en diplomatie'], ['Ingvi', 2, '+puissance en Vigilance pendant le sommeil', ''], ['Wunjô', 2, '+puissance en Séduction', ''],
    ['Ansuz', 3, '+puissance aux tests de Défense Mentale', ''], ['Bjarken', 3, '+puissance en Vigueur lors d\'un accouchement', '−puissance en Vigueur lors d\'un accouchement'],
    ['Dagaz', 3, '+puissance en Perception la nuit', ''], ['Gebô', 3, '+puissance en Sejdr', '−puissance en Sejdr'], ['Isa', 3, '', '−puissance à l\'initiative / Réaction'],
    ['Mathr', 3, '+puissance aux tests d\'Intellect', '−puissance aux tests d\'Intellect'], ['Othal', 3, '+puissance en Charisme sur ses terres (noble)', '−puissance en Charisme sur ses terres'],
    ['Perth', 3, '+puissance en Perception pour détecter la magie', ''], ['Uruz', 3, 'regagne puissance PV par heure', 'perd puissance PV par heure'],
    ['Hagall', 4, '', '−puissance aux tests de Vigueur'], ['Lôgr', 4, 'rêve prémonitoire (INS + puissance)', ''], ['Nauthr', 4, '', '−puissance aux tests de Défense Mentale'],
    ['Thurz', 4, '', 'antipathie : −puissance en Charisme et Communication'], ['Ehwaz', 5, 'ajoute sa puissance à une autre rune positive', ''], ['Iwaz', 5, '+puissance en Vigueur contre les maladies', ''],
  ],
  runeSupport: [['Peau', 'heures', 'actions'], ['Tissu', 'jours', 'tours'], ['Cuir', 'semaines', 'minutes'], ['Bois', 'mois', 'heures'], ['Pierre, métal', 'années', 'jours']],

  /* Armes : nom, compétence, dégâts, solidité, enc., portée, valeur (onces d'argent), jetable */
  weapons: [
    ['Poignard', 'acourtes', 3, 9, 0, '3/6/9/12', '0,5', 1], ['Hachette', 'acourtes', 4, 8, 0, '3/6/9/15', '0,3', 1],
    ['Épée courte', 'alongues', 5, 11, 0, '', '2'], ['Épée longue', 'alongues', 7, 11, 1, '', '4'], ['Hache de guerre', 'alongues', 9, 10, 2, '', '1'],
    ['Longue hache', 'a2m', 14, 12, 3, '', '3'], ['Épée à deux mains', 'a2m', 12, 14, 3, '', '5'], ['Lance', 'ahast', 10, 11, 2, '5/10/15/30 (jet : 8)', '4', 1],
    ['Javeline', 'lancer', 6, 7, 2, '5/10/20/40', '0,4'], ['Hache de jet', 'lancer', 4, 8, 0, '3/6/9/15', '0,3'],
    ['Arc de chasse', 'atir', 6, 8, 2, '10/20/40/80', '1'], ['Arc de guerre', 'atir', 7, 10, 2, '10/30/50/100', '2'], ['Fronde', 'atir', 4, 12, 0, '10/20/30/40', '0,1'],
    ['Mains nues', 'lutte', 0, 0, 0, '', '—'],
  ],
  armors: [['Veste de cuir', 2, 0, '0,3'], ['Cuir renforcé', 4, 1, '1'], ['Cuir lamellé', 6, 3, '2'], ['Cotte de mailles', 9, 5, '8']],
  pieces: [['Casque', 3, 2, '2'], ['Épaulières de fourrure', 2, 1, '0,6'], ['Bracelets de cuir renforcé', 1, 0, '0,3'], ['Jambières de cuir renforcé', 2, 1, '0,4']],
  shield: { dp: 3, enc: '0 au combat / 2 sinon', sol: 18, val: '4' },

  sr: [['Très simple', 5], ['Simple', 7], ['Aisé', 10], ['Moyen', 14], ['Difficile', 19], ['Très difficile', 25], ['Exceptionnel', 32], ['Légendaire', 40], ['Divin', 49]],
  actions: [0, -2, -5, -10, -15, -20],

  sequelles: [
    [2, 'Thorax enfoncé', 'Vigueur SR 19 ou hors d\'action 1D5 tours ; tests +1 cran jusqu\'aux soins. (VIG −1)'],
    [3, 'Mâchoire fracturée', 'Ne peut plus attaquer ce tour ; Vigueur SR 14 ou mode défensif. (COM −1)'],
    [4, 'Poignet brisé', 'Agilité SR 19 ou lâche ce qu\'il tient. (AGI −1)'], [5, 'Cuisse perforée', 'Vigueur SR 19 ou tombe. (DEP −1)'],
    [6, 'Épaule démise', 'Ne peut plus attaquer ce tour. (AGI −1)'], [7, 'Jambe cassée', 'Agilité SR 25 ou chute. (DEP −1)'],
    [12, 'Plaie ouverte', 'Une belle cicatrice, sans autre effet.'], [13, 'Côtes cassées', 'Ténacité SR 19 chaque tour ou une seule action. (PUI −1)'],
    [14, 'Tripes à l\'air', 'Vigueur SR 25 ou s\'effondre ; caractéristiques −1. (PUI −1)'], [15, 'Vilaine entaille', 'Hémorragie : −2 PV par tour. (VIG −1)'],
    [16, 'Hémorragie interne', 'Vigueur SR 19 ou inconscient ; −2 PV par tour. (VIG −1)'], [17, 'Arcade ouverte', 'Perception +1 cran de difficulté. (PER −1)'],
    [18, 'Front ouvert', 'Tests d\'Esprit avec un dé de moins.'], [19, 'Tranché !', 'Doigt, oreille, nez… (AGI −1 ou CHA −1)'],
    [20, 'Amputé !', '−4 PV par tour jusqu\'aux soins ; caractéristiques −1.'],
  ],
  fumbles: [[1, 'Touche l\'allié le plus proche (arme + marge d\'échec), sinon l\'arme se fiche ou se brise.'], [3, 'Touche un allié pour moitié, sinon perd le contrôle (−2 à la prochaine action).'],
    [7, 'Lâche son arme (1D5 m).'], [9, 'Se blesse : (arme + marge)/2 dégâts.'], [10, 'Se blesse : arme + marge d\'échec.']],
  crits: [[1, 'L\'adversaire perd une action (ou agit dernier au tour suivant).'], [3, 'Brise l\'arme adverse, dégâts +5.'], [7, 'Désarme et renverse, dégâts +10.'],
    [9, 'Action non décomptée (mais pas d\'attaque à la suivante), dégâts +5.'], [10, 'Nouvelle attaque gratuite, dégâts +10.']],

  /* Figurants : nom, conflit off/déf, relationnel, physique, mental, mystique act/pass, vitalité */
  figurants: [
    ['Berserkr (élite)', 12, 8, 2, 8, 2, 3, 5, 12], ['Bondi (milicien)', 6, 3, 2, 3, 3, 2, 1, 8], ['Hirdmen (vétéran)', 10, 6, 3, 6, 3, 2, 2, 10],
    ['Marchand (émissaire)', 2, 2, 10, 3, 4, 1, 2, 6], ['Noble (chef)', 8, 7, 6, 5, 5, 2, 2, 10], ['Paysan (villageois)', 2, 2, 2, 4, 2, 2, 1, 8],
    ['Pirate (brigand)', 8, 6, 4, 6, 3, 2, 2, 10], ['Scalde', 6, 4, 10, 5, 5, 7, 5, 8], ['Thulr', 5, 3, 5, 4, 6, 8, 6, 8], ['Völva', 4, 2, 7, 3, 8, 8, 8, 7],
  ],
  animaux: [
    ['Baleine', 2, 4, 0, 15, 0, 0, 1, 25, ''], ['Cerf', 1, 1, 0, 6, 0, 0, 1, 8, ''], ['Cheval', 1, 2, 3, 5, 1, 0, 1, 8, ''], ['Chien de chasse', 4, 3, 4, 3, 1, 0, 1, 5, ''],
    ['Loup', 4, 4, 1, 3, 1, 0, 1, 5, ''], ['Ours', 6, 4, 1, 7, 1, 0, 1, 10, ''], ['Renne', 0, 1, 1, 5, 0, 0, 1, 7, ''],
    ['Géant (Jötun)', 14, 8, 2, 14, 2, 2, 4, 22, 'Armure naturelle 6, Terreur 4, Ravageur'], ['Guerrier de Hel', 10, 6, 0, 6, 1, 1, 5, 12, 'Armure naturelle 4, Terreur 4, Increvable'],
    ['Kraken', 12, 8, 0, 18, 1, 2, 4, 30, 'Armure naturelle 10, Terreur 6, Ravageur, Attaques multiples 6, Point faible (yeux), Aquatique'],
    ['Loup d\'Hiver', 10, 10, 1, 7, 3, 4, 4, 12, 'Armure naturelle 2, Terreur 5, Crocs de gel'], ['Margygr (sirène)', 4, 8, 2, 4, 5, 4, 4, 10, 'Aquatique, Murmure'],
    ['Marmennill', 6, 8, 2, 6, 4, 4, 4, 12, 'Aquatique (don de prophétie)'], ['Troll', 14, 6, 1, 8, 2, 3, 3, 18, 'Armure naturelle 6, Terreur 4, Ravageur'],
  ],
  /* Caractères : nom, modifs {co, cd, rel, phy, men, mya, myp, vit}, note */
  caracteres: [
    ['Agile', { phy: 3, vit: 1 }], ['Alerte', { men: 2, mya: 1 }], ['Armement supérieur', { co: 2 }, 'Dégâts +2'], ['Bagarreur', { co: 1, phy: 1 }, '+1D10 dégâts à mains nues'],
    ['Brutal', { phy: 1, rel: -2 }], ['Érudit', { men: 3, mya: 1 }], ['Initié', { mya: 2, myp: 1, men: 1 }, '1 sort par 3 points de Mystique actif'], ['Leader', { rel: 3, men: 1 }],
    ['Machiavélique', { men: 2, rel: 2 }], ['Mystique', { mya: 3, myp: 1, phy: -1 }], ['Pleutre', { co: -1, myp: -3 }], ['Primitif', { rel: -2, mya: 2, myp: 2 }],
    ['Protection supérieure', { cd: 2, vit: 2 }], ['Puissant', { phy: 2, vit: 2 }], ['Robuste', { vit: 3 }], ['Séducteur', { rel: 2, co: -2 }],
    ['Souffreteux', { vit: -3, phy: -2 }], ['Sournois', { rel: -1, men: 1 }], ['Téméraire', { myp: 3 }], ['Véloce', { co: 1, cd: 1, phy: 1 }],
    ['Vétéran', { co: 1, cd: 1, myp: 1 }], ['Violent', { co: 3, men: -2 }],
    ['Alpha', { co: 2, cd: 2, rel: 1, phy: 2, men: 1, myp: 1, vit: 2 }, 'Créature dominante'], ['Colossal', { phy: 3, vit: 5 }, 'Créature'], ['Féroce', { co: 2, cd: -1, men: -1 }, 'Créature'],
  ],

  quickref: [
    { t: 'Faire un test', h: `<p>Lance autant de <b>D10</b> que la caractéristique, <b>garde les 2 meilleurs</b>, additionne-les, ajoute la <b>compétence</b>. Réussite si le total atteint le <b>Seuil de Réussite (SR)</b>.</p>
      <p>Un <b>10</b> gardé se relance et s'ajoute (tant qu'il fait 10). Le MJ choisit la caractéristique selon l'approche.</p>
      <p><b>Test de caractéristique pur</b> : ajoute la valeur de la caractéristique au lieu d'une compétence. <b>Sans compétence</b> : les dés seuls (impossible pour les compétences marquées *).</p>
      <p><b>Plusieurs compétences</b> : on ajoute la plus faible.</p>` },
    { t: 'Seuils de réussite', h: `<table><tr><th>Difficulté</th><th>SR</th><th>Modif.</th></tr><tr><td>Très simple</td><td>5</td><td>±1</td></tr><tr><td>Simple</td><td>7</td><td>±2</td></tr><tr><td>Aisé</td><td>10</td><td>±3</td></tr><tr><td>Moyen</td><td>14</td><td>±4</td></tr><tr><td>Difficile</td><td>19</td><td>±5</td></tr><tr><td>Très difficile</td><td>25</td><td>±6</td></tr><tr><td>Exceptionnel</td><td>32</td><td>±7</td></tr><tr><td>Légendaire</td><td>40</td><td>±8</td></tr><tr><td>Divin</td><td>49</td><td>±9</td></tr></table>
      <p>« +1 cran » = passer au SR suivant.</p>` },
    { t: 'Critiques', h: `<p><b>Réussite critique</b> : total ≥ 2 × SR.</p><p><b>Échec critique</b> (dés de caractéristique seulement) : 1 dé → un « 1 » ; 2 dés → deux « 1 » ; 3 dés ou plus → au moins trois « 1 ».</p>` },
    { t: 'Destin, dons, faiblesses', h: `<p><b>Destin</b> : si une de tes 3 runes prend sens, garde <b>3 dés</b> au lieu de 2 (une action par rencontre).</p>
      <p><b>Don</b> (1 fois par séance) : +1 dé lancé. <b>Faiblesse</b> (imposée par le MJ, 1 fois par séance) : garde le meilleur <b>et</b> le plus mauvais dé.</p>` },
    { t: 'Furor', h: `<p>Réserve : (VIG + TEN + INS) / 2. Guerrier-fauve : VIG + TEN + INS. Initié : VIG + INT + INS.</p>
      <p><b>Bonus héroïque</b> : dépense 1 dé de furor et ajoute-le au résultat d'un test (1 seul dé à la fois).</p>
      <p>Réserve à 0 : <b>Épuisé</b> (un dé gardé de moins) pendant 10 min par dé dépensé, puis récupère 1 dé. Récupération : 1 dé par 2 h de sommeil, tout en une nuit, 1 dé par festin.</p>
      <p><b>Guerrier-fauve en transe</b> : ajoute 1 à TEN dés de furor à chaque attaque (impossible de revenir à moins de dés), ignore les malus de blessure, DP = 0, un seul dé en défense, peut descendre à −PV.</p>
      <p><b>Initié</b> : chaque sort coûte au moins 1 dé (jusqu'à INS dés ajoutés), DP et DM −3 pendant le tour.</p>` },
    { t: 'Caractéristiques secondaires', h: `<p><b>PV</b> = Corps × 3 + Esprit × 2 + Âme. <b>Réaction</b> = INT + PER + INS. <b>DP</b> = AGI + VIG + INS. <b>DM</b> = TEN + INS + INT. <b>Déplacement</b> = AGI + VIG (course ×2, sprint ×3). <b>Encombrement (CPE)</b> = PUI × 2 + VIG.</p>
      <p>Gêné (ENC > CPE) : −3. Encombré (> 2 × CPE) : SR +1 cran. Surchargé (> 3 × CPE) : immobile.</p>` },
    { t: 'Blessures', h: `<table><tr><td>Fringant</td><td>plus de PV/2</td><td>—</td></tr><tr><td>Blessé</td><td>&lt; PV/2</td><td>−3</td></tr><tr><td>Meurtri</td><td>&lt; PV/4</td><td>1 seul dé gardé</td></tr><tr><td>Inconscient</td><td>0 PV</td><td>−1 PV/heure</td></tr><tr><td>Mort</td><td>−PV/4</td><td></td></tr></table>
      <p><b>Blessure grave</b> : perte ≥ PV/2 en un coup → Vigueur SR = dégâts, sinon à terre (Ténacité SR 14 chaque tour pour se reprendre).</p>
      <p>Guérison : Vigueur PV par nuit de repos complet. Premiers soins : INT + Survie (SR 10 à 32 selon l'état), rend INT PV.</p>` },
    { t: 'Combat : tour et initiative', h: `<p>Initiative : <b>Réaction + 1D10</b>. Actions par tour : <b>AGI + 1</b>. Malus des actions supplémentaires : 2e −2, 3e −5, 4e −10, 5e −15, 6e −20.</p>
      <p>Se défendre quand on n'a pas encore agi consomme l'action de base.</p>` },
    { t: 'Combat : attaquer et se défendre', h: `<p>Attaque : <b>carac + compétence martiale ≥ 14 + DP</b> de la cible.</p>
      <table><tr><th>Mêlée</th><th>Effet</th></tr><tr><td>Classique (AGI)</td><td>—</td></tr><tr><td>En force (PUI)</td><td>dégâts +PUI</td></tr><tr><td>Dévastatrice (PUI)</td><td>malus −PUI, dégâts +PUI×3</td></tr><tr><td>Précise (PER)</td><td>protection −PER</td></tr><tr><td>Visée (PER)</td><td>malus −PER, protection −PER×3</td></tr></table>
      <p>À distance : Posé (AGI), Arrêt (INS tir / PUI jet, +dégâts), Précis (PER).</p>
      <p><b>Parade / Esquive</b> : AGI + compétence ≥ score d'attaque (l'esquive met au sol). On garde la meilleure défense entre le test et 14 + DP.</p>
      <p><b>Dégâts</b> = Marge de réussite + arme (+ bonus) − protection.</p>
      <p>Arme à une main tenue à deux mains : dégâts +3, initiative −2. Deux armes (PUI 3+) : +AGI en attaque / −AGI en parade, ou l'inverse.</p>` },
    { t: 'Modificateurs de combat', h: `<p>Mêlée : adversaire surélevé −3, sur le côté −3, derrière −8 ; de côté +3, de dos +6, au sol +6, aveuglé +8, entravé +10, surpris +6.</p>
      <p>Distance : courte +3, moyenne 0, longue −6, extrême −16, immobile +8, rapide −6, obscurité −8, abrité −3 à −16.</p>` },
    { t: 'Magie', h: `<p><b>Sejdr</b> : INS + Sejdr ≥ 14 (+ DM si effet négatif), malus −3 × niveau. Durée selon la marge : 0-5 1D5 actions, 6-10 1D10 tours, 11-15 1D10 min, 16-25 1D10 h, 26+ 1D5 jours.</p>
      <p><b>Galdr</b> : CHA + Galdr ≥ SD domaine + SD durée + SD zone ou cibles (3 à 15 chacun). Préparation 3 actions.</p>
      <p><b>Runes</b> : COM + Runes ≥ puissance (1-15) + SD support (3-15) + niveau × 3. Au moins 1 dé de furor. Résistance : TEN + DM ≥ 14 + puissance.</p>
      <p>Raccourcir la préparation : −3 par unité, −10 par catégorie (action, tour, minute, heure, jour). L'allonger : +3 / +10.</p>` },
    { t: 'Figurants', h: `<p>Attaque : 2D10 + Conflit offensif. Les toucher : 14 + Conflit défensif. Dégâts : Physique + MR + 1D10.</p>
      <p>Dégâts ≥ Vitalité : un état de plus (Fringant → Blessé → Mort). ≥ 2 × Vitalité : tué net. 2 actions (3 si Conflit ≥ 10).</p>` },
    { t: 'Expérience (Points de Légende)', h: `<p>2 à 10 PL par scénario. Caractéristique : <b>5 × nouvelle valeur</b>. Compétence : <b>2 × nouveau niveau</b> (nouvelle compétence : 5 PL pour +1). Prouesse ou sort : <b>5 × niveau</b>. Entraînement : 1 PL/semaine (1 PL/5 jours avec un mentor).</p>
      <p>Renommée de départ = plus haute compétence.</p>` },
  ],
};
