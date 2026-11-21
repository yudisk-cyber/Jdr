/* Données de jeu — Star Wars (FFG) : Aux confins de l'Empire, L'Ère de la Rébellion, Force et Destinée.
   Uniquement des mécaniques (valeurs, listes). Aucun texte des livres n'est recopié ici. */
window.SW_DATA = {
  books: { eote: "Aux confins de l'Empire", aor: "L'Ère de la Rébellion", fad: 'Force et Destinée' },

  chars: [
    { id: 'vig', name: 'Vigueur', abbr: 'VIG' },
    { id: 'agi', name: 'Agilité', abbr: 'AGI' },
    { id: 'int', name: 'Intelligence', abbr: 'INT' },
    { id: 'rus', name: 'Ruse', abbr: 'RUS' },
    { id: 'vol', name: 'Volonté', abbr: 'VOL' },
    { id: 'pre', name: 'Présence', abbr: 'PRÉ' },
  ],

  skills: [
    { id: 'astro', name: 'Astrogation', car: 'int', type: 'general' },
    { id: 'athl', name: 'Athlétisme', car: 'vig', type: 'general' },
    { id: 'calme', name: 'Calme', car: 'pre', type: 'general' },
    { id: 'charme', name: 'Charme', car: 'pre', type: 'general' },
    { id: 'coer', name: 'Coercition', car: 'vol', type: 'general' },
    { id: 'comm', name: 'Commandement', car: 'pre', type: 'general' },
    { id: 'coord', name: 'Coordination', car: 'agi', type: 'general' },
    { id: 'disc', name: 'Discrétion', car: 'agi', type: 'general' },
    { id: 'info', name: 'Informatique', car: 'int', type: 'general' },
    { id: 'mag', name: 'Magouilles', car: 'rus', type: 'general' },
    { id: 'meca', name: 'Mécanique', car: 'int', type: 'general' },
    { id: 'med', name: 'Médecine', car: 'int', type: 'general' },
    { id: 'nego', name: 'Négociation', car: 'pre', type: 'general' },
    { id: 'perc', name: 'Perception', car: 'rus', type: 'general' },
    { id: 'pplan', name: 'Pilotage (planétaire)', car: 'agi', type: 'general' },
    { id: 'pesp', name: 'Pilotage (espace)', car: 'agi', type: 'general' },
    { id: 'resi', name: 'Résistance', car: 'vig', type: 'general' },
    { id: 'sangf', name: 'Sang-froid', car: 'vol', type: 'general' },
    { id: 'surv', name: 'Survie', car: 'rus', type: 'general' },
    { id: 'sysd', name: 'Système D', car: 'rus', type: 'general' },
    { id: 'trom', name: 'Tromperie', car: 'rus', type: 'general' },
    { id: 'vigi', name: 'Vigilance', car: 'vol', type: 'general' },
    { id: 'art', name: 'Artillerie', car: 'agi', type: 'combat' },
    { id: 'cac', name: 'Corps à corps', car: 'vig', type: 'combat' },
    { id: 'dleg', name: 'Distance (armes légères)', car: 'agi', type: 'combat' },
    { id: 'dlou', name: 'Distance (armes lourdes)', car: 'agi', type: 'combat' },
    { id: 'pug', name: 'Pugilat', car: 'vig', type: 'combat' },
    { id: 'sabre', name: 'Sabre laser', car: 'vig', type: 'combat' },
    { id: 'kbe', name: 'Connaissance (Bordure extérieure)', car: 'int', type: 'connaissance' },
    { id: 'kcult', name: 'Connaissance (Culture)', car: 'int', type: 'connaissance' },
    { id: 'kedu', name: 'Connaissance (Éducation)', car: 'int', type: 'connaissance' },
    { id: 'kguer', name: 'Connaissance (Guerre)', car: 'int', type: 'connaissance' },
    { id: 'kmn', name: 'Connaissance (Mondes du Noyau)', car: 'int', type: 'connaissance' },
    { id: 'kpeg', name: 'Connaissance (Pègre)', car: 'int', type: 'connaissance' },
    { id: 'kxeno', name: 'Connaissance (Xénologie)', car: 'int', type: 'connaissance' },
  ],

  /* car = vig, agi, int, rus, vol, pre */
  species: [
    // Aux confins de l'Empire
    { id: 'bothan', name: 'Bothan', book: 'eote', car: { vig: 1, agi: 2, int: 2, rus: 3, vol: 2, pre: 2 }, wound: 10, strain: 11, xp: 100,
      free: [{ label: 'Rang offert', from: ['sysd'] }],
      talents: ['CONV'],
      abil: ['1 rang en Système D (max 2 à la création).', 'Commence avec le talent Persuasion convaincante (rang 1).'] },
    { id: 'droide', name: 'Droïde', book: 'eote', car: { vig: 1, agi: 1, int: 1, rus: 1, vol: 1, pre: 1 }, wound: 10, strain: 10, xp: 175,
      careerFree: 6, specFree: 3,
      talents: ['ENDUR'],
      abil: ['Ne mange, ne dort ni ne respire ; immunisé aux toxines et poisons.', 'Rangs gratuits : 6 compétences de carrière (au lieu de 4) et 3 de spécialité (au lieu de 2).', 'Inorganique : pas de bacta ni de stimpack ; commence avec le talent Endurance (rang 1).', 'Être mécanique : ne peut pas être sensible à la Force.'] },
    { id: 'gand', name: 'Gand', book: 'eote', car: { vig: 2, agi: 2, int: 2, rus: 2, vol: 3, pre: 1 }, wound: 10, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['sangf'] }],
      abil: ['1 rang en Sang-froid (max 2 à la création).', 'Selon la sous-espèce : respirateur d\'ammoniac ou Gand sans poumons (voir livre).'] },
    { id: 'humain', name: 'Humain', book: 'eote', car: { vig: 2, agi: 2, int: 2, rus: 2, vol: 2, pre: 2 }, wound: 10, strain: 10, xp: 110,
      free: [{ label: '1re compétence hors carrière', from: 'noncareer' }, { label: '2e compétence hors carrière', from: 'noncareer' }],
      abil: ['1 rang dans deux compétences hors carrière au choix (max 2 à la création).'] },
    { id: 'rodien', name: 'Rodien', book: 'eote', car: { vig: 2, agi: 3, int: 2, rus: 2, vol: 1, pre: 2 }, wound: 10, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['surv'] }],
      talents: ['EXTRACK'],
      abil: ['1 rang en Survie (max 2 à la création).', 'Commence avec le talent Pisteur chevronné (rang 1).'] },
    { id: 'trando', name: 'Trandosien', book: 'eote', car: { vig: 3, agi: 1, int: 2, rus: 2, vol: 2, pre: 2 }, wound: 12, strain: 9, xp: 90,
      free: [{ label: 'Rang offert', from: ['perc'] }],
      abil: ['1 rang en Perception (max 2 à la création).', 'Régénération et griffes (bonus au Pugilat) : voir livre.'] },
    { id: 'twilek', name: "Twi'lek", book: 'eote', car: { vig: 1, agi: 2, int: 2, rus: 2, vol: 2, pre: 3 }, wound: 10, strain: 11, xp: 100,
      free: [{ label: 'Charme ou Tromperie', from: ['charme', 'trom'] }],
      abil: ['1 rang en Charme ou Tromperie (max 2 à la création).', 'Retire 1 dé d\'infortune dû à un environnement chaud ou aride.'] },
    { id: 'wookie', name: 'Wookie', book: 'eote', car: { vig: 3, agi: 2, int: 2, rus: 2, vol: 1, pre: 2 }, wound: 14, strain: 8, xp: 90,
      free: [{ label: 'Rang offert', from: ['pug'] }],
      abil: ['1 rang en Pugilat (max 2 à la création).', 'Rage wookie : bonus aux dégâts au contact quand il est blessé (voir livre).'] },
    // L'Ère de la Rébellion
    { id: 'duros', name: 'Duros', book: 'aor', car: { vig: 1, agi: 2, int: 3, rus: 2, vol: 2, pre: 2 }, wound: 11, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['pesp'] }],
      abil: ['1 rang en Pilotage (espace) (max 2 à la création).', 'Navigation intuitive : ajoute un avantage aux tests d\'Astrogation.'] },
    { id: 'gran', name: 'Gran', book: 'aor', car: { vig: 2, agi: 2, int: 2, rus: 1, vol: 2, pre: 3 }, wound: 10, strain: 9, xp: 100,
      free: [{ label: 'Charme ou Négociation', from: ['charme', 'nego'] }],
      abil: ['1 rang en Charme ou Négociation (max 2 à la création).', 'Vision supérieure : avantage sur certains tests de perception à distance (voir livre).'] },
    { id: 'ithorien', name: 'Ithorien', book: 'aor', car: { vig: 2, agi: 1, int: 2, rus: 2, vol: 3, pre: 2 }, wound: 9, strain: 12, xp: 90,
      free: [{ label: 'Rang offert', from: ['surv'] }],
      abil: ['1 rang en Survie (max 2 à la création).', 'Mugissement ithorien : attaque sonique (voir livre).'] },
    { id: 'moncal', name: 'Mon Calamari', book: 'aor', car: { vig: 2, agi: 2, int: 3, rus: 1, vol: 2, pre: 2 }, wound: 10, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['kedu'] }],
      abil: ['1 rang en Connaissance (Éducation) (max 2 à la création).', 'Amphibie : respire sous l\'eau, pas de malus de mouvement aquatique.'] },
    { id: 'sullust', name: 'Sullustéen', book: 'aor', car: { vig: 2, agi: 3, int: 2, rus: 1, vol: 2, pre: 2 }, wound: 10, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['astro'] }],
      talents: ['SKILLJOCK'],
      abil: ['1 rang en Astrogation (max 2 à la création).', 'Commence avec le talent Pilote chevronné (rang 1).'] },
    // Force et Destinée
    { id: 'cereen', name: 'Céréen', book: 'fad', car: { vig: 2, agi: 1, int: 3, rus: 2, vol: 2, pre: 2 }, wound: 10, strain: 13, xp: 90,
      free: [{ label: 'Rang offert', from: ['vigi'] }],
      extraCareer: ['kbe', 'kcult', 'kedu', 'kguer', 'kmn', 'kpeg', 'kxeno'],
      abil: ['1 rang en Vigilance (max 2 à la création).', 'Traitement binaire : toutes les compétences de Connaissance sont des compétences de carrière.'] },
    { id: 'keldor', name: 'Kel Dor', book: 'fad', car: { vig: 1, agi: 2, int: 2, rus: 2, vol: 3, pre: 2 }, wound: 10, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['kedu'] }],
      abil: ['1 rang en Connaissance (Éducation) (max 2 à la création).', 'Vision dans le noir ; besoin d\'un masque hors de leur atmosphère (voir livre).'] },
    { id: 'mirialan', name: 'Mirialan', book: 'fad', car: { vig: 2, agi: 3, int: 2, rus: 1, vol: 2, pre: 2 }, wound: 11, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['sangf'] }, { label: 'Rang offert', from: ['calme'] }],
      abil: ['1 rang en Sang-froid et 1 rang en Calme (max 2 à la création).'] },
    { id: 'nautolan', name: 'Nautolan', book: 'fad', car: { vig: 3, agi: 2, int: 2, rus: 2, vol: 1, pre: 2 }, wound: 11, strain: 9, xp: 100,
      free: [{ label: 'Rang offert', from: ['athl'] }],
      abil: ['1 rang en Athlétisme (max 2 à la création).', 'Amphibie : respire sous l\'eau, pas de malus de mouvement aquatique.'] },
    { id: 'togruta', name: 'Togruta', book: 'fad', car: { vig: 1, agi: 2, int: 2, rus: 3, vol: 2, pre: 2 }, wound: 10, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['perc'] }],
      abil: ['1 rang en Perception (max 2 à la création).', 'Instinct de meute : bonus quand un allié aide (voir livre).'] },
    { id: 'zabrak', name: 'Zabrak', book: 'fad', car: { vig: 2, agi: 2, int: 2, rus: 2, vol: 3, pre: 1 }, wound: 10, strain: 10, xp: 100,
      free: [{ label: 'Rang offert', from: ['surv'] }],
      abil: ['1 rang en Survie (max 2 à la création).', 'Apparence effrayante : avantage sur les tests de Coercition (voir livre).'] },
  ],

  /* freeRanks = rangs gratuits dans les compétences de carrière ; force = indice de Force donné */
  careers: [
    // ----- Aux confins de l'Empire
    { id: 'chasseur', name: 'Chasseur de primes', book: 'eote', freeRanks: 4, skills: ['athl', 'dlou', 'perc', 'pplan', 'pesp', 'pug', 'sysd', 'vigi'], specs: [
      { id: 'assassin', name: 'Assassin', skills: ['cac', 'disc', 'dlou', 'mag'] },
      { id: 'gadgets', name: 'Expert en gadgets', skills: ['pug', 'coer', 'meca', 'dleg'] },
      { id: 'exsurvie', name: 'Expert en survie', skills: ['kxeno', 'perc', 'resi', 'surv'] }] },
    { id: 'colon', name: 'Colon', book: 'eote', freeRanks: 4, skills: ['charme', 'comm', 'kmn', 'kedu', 'kcult', 'nego', 'sysd', 'trom'], specs: [
      { id: 'medecin', name: 'Médecin', skills: ['calme', 'kedu', 'med', 'resi'] },
      { id: 'diplocolon', name: 'Diplomate', skills: ['charme', 'coer', 'kmn', 'trom'] },
      { id: 'erudit', name: 'Érudit', skills: ['kbe', 'kpeg', 'kxeno', 'perc'] }] },
    { id: 'explo', name: 'Explorateur', book: 'eote', freeRanks: 4, skills: ['astro', 'calme', 'kbe', 'kcult', 'kxeno', 'perc', 'pesp', 'surv'], specs: [
      { id: 'bourl', name: 'Bourlingueur', skills: ['astro', 'coord', 'nego', 'sysd'] },
      { id: 'eclaireur', name: 'Éclaireur', skills: ['athl', 'med', 'pplan', 'surv'] },
      { id: 'negociant', name: 'Négociant', skills: ['kmn', 'kpeg', 'nego', 'trom'] }] },
    { id: 'merc', name: 'Mercenaire', book: 'eote', freeRanks: 4, skills: ['athl', 'cac', 'dleg', 'pplan', 'pug', 'resi', 'sangf', 'vigi'], specs: [
      { id: 'garde', name: 'Garde du corps', skills: ['art', 'dlou', 'perc', 'pplan'] },
      { id: 'maraudeur', name: 'Maraudeur', skills: ['coer', 'cac', 'resi', 'surv'] },
      { id: 'soldatl', name: 'Soldat à louer', skills: ['art', 'comm', 'dlou', 'sangf'] }] },
    { id: 'contre', name: 'Contrebandier', book: 'eote', freeRanks: 4, skills: ['kpeg', 'coord', 'mag', 'perc', 'pesp', 'sysd', 'trom', 'vigi'], specs: [
      { id: 'pilote', name: 'Pilote', skills: ['astro', 'art', 'pplan', 'pesp'] },
      { id: 'vaurien', name: 'Vaurien', skills: ['calme', 'charme', 'dleg', 'trom'] },
      { id: 'voleur', name: 'Voleur', skills: ['disc', 'info', 'mag', 'vigi'] }] },
    { id: 'tech', name: 'Technicien', book: 'eote', freeRanks: 4, skills: ['astro', 'info', 'coord', 'sangf', 'kbe', 'meca', 'perc', 'pplan'], specs: [
      { id: 'mecanicien', name: 'Mécanicien', skills: ['pug', 'meca', 'pesp', 'mag'] },
      { id: 'techhl', name: 'Tech hors-la-loi', skills: ['kedu', 'kpeg', 'meca', 'sysd'] },
      { id: 'slicer', name: 'Slicer', skills: ['info', 'kedu', 'kpeg', 'disc'] }] },
    // ----- L'Ère de la Rébellion
    { id: 'as', name: 'As', book: 'aor', freeRanks: 4, skills: ['art', 'astro', 'calme', 'dleg', 'meca', 'perc', 'pesp', 'pplan'], specs: [
      { id: 'artilleur', name: 'Artilleur', skills: ['art', 'dlou', 'resi', 'sangf'] },
      { id: 'fonceur', name: 'Fonceur', skills: ['calme', 'art', 'meca', 'pplan'] },
      { id: 'pilote2', name: 'Pilote', skills: ['art', 'astro', 'pesp', 'pplan'] }] },
    { id: 'diplo', name: 'Diplomate', book: 'aor', freeRanks: 4, skills: ['charme', 'comm', 'kbe', 'kcult', 'kmn', 'kxeno', 'nego', 'trom'], specs: [
      { id: 'agitateur', name: 'Agitateur', skills: ['coer', 'kpeg', 'sysd', 'trom'] },
      { id: 'ambassadeur', name: 'Ambassadeur', skills: ['charme', 'kmn', 'nego', 'sangf'] },
      { id: 'intendant', name: 'Intendant', skills: ['info', 'mag', 'nego', 'vigi'] }] },
    { id: 'espion', name: 'Espion', book: 'aor', freeRanks: 4, skills: ['calme', 'kguer', 'coord', 'disc', 'info', 'mag', 'perc', 'trom'], specs: [
      { id: 'eclaireur2', name: 'Éclaireur', skills: ['athl', 'med', 'pplan', 'surv'] },
      { id: 'slicer2', name: 'Slicer', skills: ['kedu', 'kpeg', 'disc', 'info'] },
      { id: 'taupe', name: 'Taupe', skills: ['cac', 'mag', 'sysd', 'trom'] }] },
    { id: 'inge', name: 'Ingénieur', book: 'aor', freeRanks: 4, skills: ['athl', 'kedu', 'dleg', 'info', 'meca', 'perc', 'pesp', 'vigi'], specs: [
      { id: 'mecanicien2', name: 'Mécanicien', skills: ['mag', 'meca', 'pesp', 'pug'] },
      { id: 'saboteur', name: 'Saboteur', skills: ['coord', 'disc', 'mag', 'meca'] },
      { id: 'scient', name: 'Scientifique', skills: ['kcult', 'kedu', 'info', 'med'] }] },
    { id: 'soldat', name: 'Soldat', book: 'aor', freeRanks: 4, skills: ['athl', 'kguer', 'cac', 'dleg', 'dlou', 'med', 'pug', 'surv'], specs: [
      { id: 'commando', name: 'Commando', skills: ['cac', 'pug', 'resi', 'surv'] },
      { id: 'tireur', name: "Tireur d'élite", skills: ['calme', 'dleg', 'dlou', 'perc'] },
      { id: 'urgent', name: 'Urgentiste', skills: ['kxeno', 'med', 'resi', 'vigi'] }] },
    { id: 'strat', name: 'Stratège', book: 'aor', freeRanks: 4, skills: ['calme', 'coer', 'comm', 'kguer', 'dleg', 'perc', 'sangf', 'vigi'], specs: [
      { id: 'chefesc', name: "Chef d'escadron", skills: ['art', 'meca', 'pesp', 'pplan'] },
      { id: 'commodore', name: 'Commodore', skills: ['astro', 'kbe', 'kedu', 'info'] },
      { id: 'tacticien', name: 'Tacticien', skills: ['comm', 'dlou', 'pug', 'sangf'] }] },
    // ----- Force et Destinée (6 compétences de carrière, 3 rangs gratuits, Force 1)
    { id: 'consul', name: 'Consulaire', book: 'fad', freeRanks: 3, force: 1, skills: ['calme', 'comm', 'kcult', 'kedu', 'nego', 'sangf'], specs: [
      { id: 'niman', name: 'Disciple niman', skills: ['comm', 'nego', 'sangf', 'sabre'] },
      { id: 'guerisseur', name: 'Guérisseur', skills: ['kedu', 'kxeno', 'med', 'sangf'] },
      { id: 'sage', name: 'Sage', skills: ['astro', 'calme', 'charme', 'kcult'] }] },
    { id: 'errant', name: 'Errant', book: 'fad', freeRanks: 3, force: 1, skills: ['kxeno', 'dlou', 'pesp', 'pplan', 'surv', 'vigi'], specs: [
      { id: 'arpenteur', name: 'Arpenteur', skills: ['dleg', 'med', 'resi', 'surv'] },
      { id: 'ataru', name: 'Bretteur ataru', skills: ['athl', 'coord', 'perc', 'sabre'] },
      { id: 'chasseurf', name: 'Chasseur', skills: ['coord', 'disc', 'dlou', 'vigi'] }] },
    { id: 'gardien', name: 'Gardien', book: 'fad', freeRanks: 3, force: 1, skills: ['calme', 'cac', 'pug', 'resi', 'sangf', 'vigi'], specs: [
      { id: 'soresu', name: 'Défenseur soresu', skills: ['kcult', 'sabre', 'sangf', 'vigi'] },
      { id: 'pacif', name: 'Pacificateur', skills: ['comm', 'perc', 'pplan', 'sangf'] },
      { id: 'protect', name: 'Protecteur', skills: ['athl', 'dleg', 'med', 'resi'] }] },
    { id: 'guerrier', name: 'Guerrier', book: 'fad', freeRanks: 3, force: 1, skills: ['athl', 'calme', 'cac', 'perc', 'pug', 'surv'], specs: [
      { id: 'agresseur', name: 'Agresseur', skills: ['coer', 'kpeg', 'dleg', 'sysd'] },
      { id: 'asesp', name: "As de l'espace", skills: ['astro', 'art', 'meca', 'pesp'] },
      { id: 'shiicho', name: 'Chevalier shii-cho', skills: ['athl', 'coord', 'cac', 'sabre'] }] },
    { id: 'mystique', name: 'Mystique', book: 'fad', freeRanks: 3, force: 1, skills: ['charme', 'coer', 'kbe', 'kcult', 'perc', 'vigi'], specs: [
      { id: 'conseiller', name: 'Conseiller', skills: ['charme', 'nego', 'sysd', 'trom'] },
      { id: 'makashi', name: 'Duelliste makashi', skills: ['calme', 'charme', 'coord', 'sabre'] },
      { id: 'vision', name: 'Visionnaire', skills: ['kcult', 'sangf', 'surv', 'vigi'] }] },
    { id: 'sentinelle', name: 'Sentinelle', book: 'fad', freeRanks: 3, force: 1, skills: ['kmn', 'disc', 'info', 'mag', 'perc', 'trom'], specs: [
      { id: 'artisan', name: 'Artisan', skills: ['astro', 'kedu', 'info', 'meca'] },
      { id: 'shien', name: 'Expert shien', skills: ['athl', 'mag', 'resi', 'sabre'] },
      { id: 'ombre', name: 'Ombre', skills: ['kpeg', 'disc', 'mag', 'sysd'] }] },
    // ----- Spécialisations universelles (achetables par tous, jamais « de carrière »)
    { id: 'univ', name: 'Universel', book: 'aor', universal: true, freeRanks: 0, skills: [], specs: [
      { id: 'fugitif', name: 'Fugitif de la Force', skills: [], force: 1 },
      { id: 'aspirant', name: 'Aspirant de la Force', skills: [], force: 1 },
      { id: 'recrue', name: 'Recrue', skills: ['athl', 'sangf', 'surv', 'vigi'] }] },
  ],

  books_rules: {
    eote: {
      start: [[2, 20], [3, 15], ['4-5', 10], ['6+', 5]],
      extra: [ // chaque option une seule fois, total supplémentaire ≤ Obligation de départ
        { id: 'xp5', label: '+5 XP de départ', ob: 5, xp: 5 },
        { id: 'xp10', label: '+10 XP de départ', ob: 10, xp: 10 },
        { id: 'cr1000', label: '+1 000 crédits', ob: 5, cr: 1000 },
        { id: 'cr2500', label: '+2 500 crédits', ob: 10, cr: 2500 },
      ],
    },
    aor: {
      start: [[2, 20], [3, 15], [4, 10], [5, 10], ['6+', 5]],
      extra: [ // déductions : on ne peut pas dépenser plus que sa valeur de départ
        { id: 'xp5', label: '+5 XP de départ', du: 5, xp: 5 },
        { id: 'xp10', label: '+10 XP de départ', du: 10, xp: 10 },
        { id: 'cr1000', label: '+1 000 crédits', du: 5, cr: 1000 },
        { id: 'cr2500', label: '+2 500 crédits', du: 10, cr: 2500 },
      ],
    },
    fad: {
      extra: [ // une seule option
        { id: '', label: 'Aucun échange (Moralité 50)' },
        { id: 'xp10', label: '+10 XP de départ', xp: 10 },
        { id: 'cr2500', label: '+2 500 crédits', cr: 2500 },
        { id: 'mix', label: '+5 XP et +1 000 crédits', xp: 5, cr: 1000 },
        { id: 'up', label: 'Moralité +21 (départ à 71)', mo: 21 },
        { id: 'down', label: 'Moralité −21 (départ à 29)', mo: -21 },
      ],
      note: 'Une seule option au choix à la création.',
    },
  },

  obligations: ['Addiction', 'Activités criminelles', 'Chantage', 'Dette', 'Devoir', 'Famille', 'Faveur', 'Obsession', 'Prime', 'Responsabilité', 'Serment', 'Trahison'],
  duties: ['Combat spatial', 'Contre-espionnage', 'Obtention de ressources', 'Recrutement', 'Renfort', 'Renseignements', 'Sabotage', 'Secours', 'Sécurité interne', 'Soutien politique', 'Technologie', 'Victoire militaire'],
  strengths: ['Bravoure', 'Amour', 'Prudence', 'Enthousiasme', 'Compassion', 'Pitié', 'Curiosité', 'Fierté', 'Indépendance', 'Ambition', 'Justice', 'Discipline'],
  weaknesses: ['Colère', 'Jalousie', 'Peur', 'Témérité', 'Haine', 'Faiblesse', 'Obsession', 'Arrogance', 'Froideur', 'Cupidité', 'Cruauté', 'Obstination'],

  /* [min, max, nom, effet résumé] — table d100 des blessures critiques */
  crits: [
    [1, 5, 'Petite entaille', 'Facile · 1 stress'],
    [6, 10, 'Ralentissement', 'Facile · agit plus tard au prochain tour'],
    [11, 15, 'Choc', 'Facile · lâche ce qu\'il tient'],
    [16, 20, 'Distraction', 'Facile · pas de manœuvre gratuite au prochain tour'],
    [21, 25, 'Déséquilibre', 'Facile · +1 infortune au prochain test'],
    [26, 30, 'Blessure accablante', 'Facile · un point de Destin lumineux passe côté obscur'],
    [31, 35, 'Étourdissement', 'Facile · étourdi jusqu\'à la fin de son prochain tour'],
    [36, 40, 'Piqûre', 'Facile · +1 difficulté au prochain test'],
    [41, 45, 'Renversement', 'Moyenne · à terre + 1 stress'],
    [46, 50, 'Mal de crâne', 'Moyenne · +1 difficulté en Intelligence et Ruse (rencontre)'],
    [51, 55, 'Blessure effroyable', 'Moyenne · +1 difficulté en Présence et Volonté (rencontre)'],
    [56, 60, 'Blessure lancinante', 'Moyenne · +1 difficulté en Vigueur et Agilité (rencontre)'],
    [61, 65, 'Hébétement', 'Moyenne · désorienté (rencontre)'],
    [66, 70, 'Confusion', 'Moyenne · retire tous ses dés de fortune (rencontre)'],
    [71, 75, 'Paralysé', 'Moyenne · perd sa manœuvre gratuite (rencontre)'],
    [76, 80, 'Aux abois', 'Moyenne · l\'attaquant gagne une attaque gratuite'],
    [81, 85, 'Hors d\'haleine', 'Moyenne · ne peut plus subir de stress volontairement (rencontre)'],
    [86, 90, 'Mis à mal', 'Moyenne · +1 difficulté à tous ses tests (rencontre)'],
    [91, 95, 'Exténuation', 'Difficile · 1 stress par action'],
    [96, 100, 'Infirmité', 'Difficile · un membre infirme jusqu\'aux soins'],
    [101, 105, 'Mutilation', 'Difficile · perte définitive d\'un membre'],
    [106, 110, 'Blessure épouvantable', 'Difficile · −1 à une caractéristique (d10) jusqu\'aux soins'],
    [111, 115, 'Invalidité', 'Difficile · une seule manœuvre par tour'],
    [116, 120, 'Aveuglement', 'Difficile · privé de la vue'],
    [121, 125, 'Perte de connaissance', 'Difficile · étourdi (rencontre)'],
    [126, 130, 'Blessure de cauchemar', 'Intimidante · −1 permanent à une caractéristique (d10)'],
    [131, 140, 'Hémorragie', 'Intimidante · 1 blessure + 1 stress par round'],
    [141, 150, 'La fin est proche', 'Intimidante · mourra au prochain round'],
    [151, 999, 'Mort', '—'],
  ],

  /* Aide-mémoire rédigé pour l'appli (résumés, pas de texte des livres) */
  quickref: [
    { t: 'Faire un test', h: `<p>1. Prends la caractéristique et les rangs de la compétence. La plus haute valeur = nombre de dés d'<b>Aptitude</b> (verts) ; la plus basse valeur en transforme autant en dés de <b>Maîtrise</b> (jaunes).</p>
      <p>2. Ajoute les dés de <b>Difficulté</b> (violets) selon la tâche, et éventuellement des dés de <b>Défi</b> (rouges).</p>
      <p>3. Ajoute <b>Fortune</b> (bleus) pour les circonstances favorables, <b>Infortune</b> (noirs) pour les défavorables.</p>
      <p>4. Lance : succès et échecs s'annulent, avantages et menaces aussi. Au moins 1 succès net = réussite.</p>
      <p class="mut">Dans la fiche d'un perso, touche une compétence : la réserve est préparée automatiquement dans l'onglet Dés.</p>` },
    { t: 'Niveaux de difficulté', h: `<table><tr><th>Difficulté</th><th>Dés</th></tr>
      <tr><td>Simple</td><td>0</td></tr><tr><td>Facile</td><td>1</td></tr><tr><td>Moyenne</td><td>2</td></tr>
      <tr><td>Difficile</td><td>3</td></tr><tr><td>Intimidante</td><td>4</td></tr><tr><td>Formidable</td><td>5</td></tr></table>` },
    { t: 'Symboles', h: `<p>✦ <b>Succès</b> / ✖ <b>Échec</b> : s'annulent ; détermine la réussite.</p>
      <p>⬢ <b>Avantage</b> / ⬣ <b>Menace</b> : s'annulent ; effets secondaires positifs ou négatifs.</p>
      <p>★ <b>Triomphe</b> : compte comme un succès + effet spectaculaire.</p>
      <p>☠ <b>Désastre</b> : compte comme un échec + complication grave.</p>
      <p>○ / ● <b>Lumière / Obscurité</b> : uniquement sur le dé de Force (pouvoirs, réserve de Destin).</p>` },
    { t: 'Améliorer / dégrader', h: `<p><b>Améliorer</b> un test : un dé d'Aptitude devient un dé de Maîtrise (s'il n'y en a plus, ajoute un dé d'Aptitude).</p>
      <p><b>Améliorer la difficulté</b> : un dé de Difficulté devient un dé de Défi (sinon ajoute un dé de Difficulté).</p>
      <p>Les boutons ⇧ de l'onglet Dés font exactement ça.</p>` },
    { t: 'Combat : tour de jeu', h: `<p>Chaque tour : <b>1 action</b> + <b>1 manœuvre</b> (une 2e manœuvre possible en subissant 2 stress, ou en renonçant à l'action).</p>
      <p><b>Initiative</b> : Calme si on est prêt, Vigilance si on est surpris. Les emplacements PJ / PNJ sont ensuite remplis librement par les joueurs.</p>
      <p><b>Dégâts</b> : dégâts de l'arme + 1 par succès net, moins l'encaissement de la cible.</p>
      <p><b>Coup critique</b> : dépense autant d'avantages que la valeur de critique de l'arme (ou un triomphe) → la cible lance sur la table des blessures critiques.</p>` },
    { t: 'Portées', h: `<table><tr><th>Portée</th><th>Difficulté d'attaque à distance</th></tr>
      <tr><td>Courte</td><td>Facile</td></tr><tr><td>Moyenne</td><td>Moyenne</td></tr><tr><td>Longue</td><td>Difficile</td></tr><tr><td>Extrême</td><td>Intimidante</td></tr></table>
      <p>Une attaque de corps à corps ou de pugilat est de difficulté Moyenne par défaut.</p>
      <p class="mut">Les cas particuliers (cible engagée, armes lourdes au contact…) : onglet Recherche, mot « portée ».</p>` },
    { t: 'Stress, blessures, récupération', h: `<p>Dépasser son <b>seuil de blessure</b> = hors de combat + blessure critique. Dépasser son <b>seuil de stress</b> = neutralisé (souvent inconscient).</p>
      <p>Après une rencontre : test de Calme ou de Sang-froid Simple ; chaque succès retire 1 stress.</p>
      <p>Chaque blessure critique non soignée ajoute +10 aux jets suivants sur la table (l'appli le calcule).</p>` },
    { t: 'Réserve de Destin', h: `<p>Au début de chaque séance, chaque joueur lance 1 dé de Force : ○ = Destin lumineux, ● = Destin obscur.</p>
      <p>Les joueurs dépensent les points lumineux, le MJ les points obscurs ; un point dépensé passe de l'autre côté. 1 point maximum par test et par camp.</p>
      <p>Usages : améliorer un test, améliorer la difficulté d'un test adverse, ou introduire un détail narratif.</p>` },
    { t: 'Arbres de talents', h: `<p>Chaque spécialisation a un arbre de 20 talents (5 rangées × 4). La 1re rangée est toujours accessible ; ensuite un talent s'achète seulement s'il est <b>relié</b> par un trait à un talent déjà acquis.</p>
      <p>Coût : 5 XP × numéro de rangée (5, 10, 15, 20, 25). Un talent « cumulable » acheté plusieurs fois (dans un ou plusieurs arbres) augmente son rang.</p>
      <p class="mut">Endurci, Robustesse, Endurance, Valeur de Force et Entraînement sont appliqués automatiquement à la fiche.</p>` },
    { t: 'Pouvoirs de la Force', h: `<p>On lance autant de dés de Force que sa <b>Valeur de Force</b>. Les points générés activent le pouvoir de base et les améliorations achetées.</p>
      <p>Un personnage du côté lumineux utilise les points ○ ; utiliser des points ● demande un effort supplémentaire (Destin et stress, voir livre).</p>
      <p>Un pouvoir s'apprend d'abord par son pouvoir de base, puis les améliorations reliées (Contrôle, Puissance, Portée, Amplitude, Durée, Maîtrise).</p>` },
    { t: 'Moralité et Conflit (Force et Destinée)', h: `<p>Le MJ attribue du Conflit pendant la séance pour les actes égoïstes ou cruels. En fin de séance, le joueur lance 1d10 et retire son Conflit : le résultat s'ajoute à sa Moralité (il peut être négatif).</p>
      <p class="mut">Seuils et effets détaillés : onglet Recherche, mot « Moralité ».</p>` },
    { t: 'Combat de véhicules', h: `<p><b>Coque</b> (seuil de dégâts de coque) = les « blessures » du vaisseau ; <b>stress mécanique</b> = sa « fatigue » (manœuvres poussées, avaries).</p>
      <p>Le <b>blindage</b> joue le rôle de l'encaissement. Les armes de véhicule infligent des dégâts à l'échelle des vaisseaux : contre un personnage, multiplie par 10.</p>
      <p>Le pilote peut subir du stress mécanique pour une manœuvre supplémentaire. La difficulté d'attaque dépend de l'écart de <b>gabarit</b> entre le tireur et la cible.</p>
      <p class="mut">Suivi de la coque, du stress et des coups critiques : MJ → Véhicules. Détails : Recherche « gabarit », « maniabilité ».</p>` },
    { t: 'Dépenser l\'XP', h: `<table><tr><th>Achat</th><th>Coût</th></tr>
      <tr><td>Caractéristique (création uniquement)</td><td>10 × nouvelle valeur</td></tr>
      <tr><td>Rang de compétence de carrière</td><td>5 × nouveau rang</td></tr>
      <tr><td>Rang hors carrière</td><td>5 × nouveau rang + 5</td></tr>
      <tr><td>Talent</td><td>5 × rangée (5 à 25)</td></tr>
      <tr><td>Spécialisation de carrière</td><td>10 × nb de spécialisations après achat</td></tr>
      <tr><td>Spécialisation hors carrière</td><td>idem + 10</td></tr></table>
      <p>À la création : caractéristique max 5, compétence max 2 rangs.</p>` },
  ],
};
