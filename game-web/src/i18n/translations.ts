export type Locale = 'de' | 'en-GB' | 'fr';

export const DEFAULT_LOCALE: Locale = 'de';

export type TranslationKey =
  // App
  | 'app.checkingConnection'
  // Lobby
  | 'lobby.yourName'
  | 'lobby.namePlaceholder'
  | 'lobby.errorNameRequired'
  | 'lobby.errorJoinFailed'
  | 'lobby.errorCreateFailed'
  | 'lobby.errorNoSlot'
  | 'lobby.runningGames'
  | 'lobby.rejoin'
  | 'lobby.discard'
  | 'lobby.leaveGame'
  | 'lobby.endGame'
  | 'lobby.endGameConfirm'
  // Waiting room
  | 'waiting.title'
  | 'waiting.description'
  | 'waiting.cancel'
  // Create match
  | 'create.title'
  | 'create.playerCount'
  | 'create.nPlayers'
  | 'create.create'
  // Match list
  | 'matches.title'
  | 'matches.noMatches'
  | 'matches.join'
  // Character preview
  | 'character.takeTitle'
  | 'character.viewTitle'
  | 'character.take'
  | 'character.close'
  // Character replacement
  | 'replacement.title'
  | 'replacement.description'
  | 'replacement.discard'
  // Activated character detail view
  | 'detail.title'
  | 'detail.powerPoints'
  | 'detail.diamonds'
  | 'detail.abilities'
  | 'detail.redInstant'
  | 'detail.bluePersistent'
  // Activation dialog
  | 'activation.title'
  | 'activation.handCards'
  | 'activation.abilities'
  | 'activation.activate'
  | 'activation.invalidPayment'
  | 'activation.abilityOnesAsEights'
  | 'activation.abilityThreesAsAny'
  | 'activation.abilityDecreaseCard'
  | 'activation.addValue'
  | 'activation.removeValue'
  | 'activation.pearlLabel'
  | 'activation.tradeTwoPearl'
  | 'activation.tradeTwoPearlActive'
  // Discard cards dialog
  | 'discard.title'
  | 'discard.handSize'
  | 'discard.handLimit'
  | 'discard.mustDiscardOne'
  | 'discard.mustDiscardMany'
  | 'discard.selectOne'
  | 'discard.selectMany'
  | 'discard.confirm'
  | 'discard.invalidSelection'
  // Discard opponent character dialog
  | 'discardOpponent.title'
  | 'discardOpponent.description'
  // Endgame
  | 'endgame.title'
  | 'endgame.terminated'
  | 'endgame.rank'
  | 'endgame.player'
  | 'endgame.points'
  | 'endgame.me'
  | 'endgame.backToLobby'
  | 'endgame.autoLeave'
  // Game board
  | 'game.rehandCards'
  | 'game.finalRound'
  | 'game.leaderHasPoints'
  | 'game.leadersHavePoints'
  | 'game.pearlRefresh'
  // Disconnect dialog
  | 'disconnect.waiting'
  | 'disconnect.connectionLost'
  // Steal dialog
  | 'steal.title'
  | 'steal.chooseOpponent'
  | 'steal.chooseCardFrom'
  | 'steal.back'
  | 'steal.card'
  | 'steal.cards'
  // Common
  | 'common.cancel'
  ;

const de: Record<TranslationKey, string> = {
  'app.checkingConnection':      'Verbindung wird geprüft…',
  'lobby.yourName':              'Dein Name',
  'lobby.namePlaceholder':       'Name eingeben',
  'lobby.errorNameRequired':     'Bitte Namen eingeben',
  'lobby.errorJoinFailed':       'Beitreten fehlgeschlagen. Ist der Platz noch frei?',
  'lobby.errorCreateFailed':     'Spiel konnte nicht erstellt werden. Läuft der Server auf Port 3001?',
  'lobby.errorNoSlot':           'Kein freier Platz in diesem Spiel',
  'lobby.runningGames':          'Meine laufenden Spiele',
  'lobby.rejoin':                'Wiedereinsteigen',
  'lobby.discard':               'Verwerfen',
  'lobby.leaveGame':             'Spiel verlassen',
  'lobby.endGame':               'Spiel beenden',
  'lobby.endGameConfirm':        'Spiel wirklich beenden? Das Spiel wird für alle Spieler beendet.',
  'waiting.title':               'Warte auf alle Spieler...',
  'waiting.description':         'Das Spiel startet automatisch, wenn alle {count} Spieler beigetreten sind.',
  'waiting.cancel':              'Abbrechen',
  'create.title':                'Neues Spiel erstellen',
  'create.playerCount':          'Spieleranzahl:',
  'create.nPlayers':             '{n} Spieler',
  'create.create':               'Spiel erstellen',
  'matches.title':               'Offene Spiele',
  'matches.noMatches':           'Keine offenen Spiele vorhanden.',
  'matches.join':                'Beitreten',
  'character.takeTitle':         'Charakterkarte nehmen?',
  'character.viewTitle':         'Charakterkarte',
  'character.take':              'Nehmen',
  'character.close':             'Schließen',
  'replacement.title':           'Portal-Karte ersetzen',
  'replacement.description':     'Beide Portal-Slots sind belegt. Welche Karte ersetzen?',
  'replacement.discard':         'Verwerfen',
  'detail.title':                'Charakterdetails',
  'detail.powerPoints':          'Machtpunkte',
  'detail.diamonds':             'Diamanten',
  'detail.abilities':            'Fähigkeiten',
  'detail.redInstant':           'Rot (Sofort)',
  'detail.bluePersistent':       'Blau (Dauerhaft)',
  'activation.title':            'Charakter aktivieren',
  'activation.handCards':        'Handkarten ({count} ausgewählt)',
  'activation.abilities':        'Fähigkeiten',
  'activation.activate':         'Aktivieren',
  'activation.invalidPayment':   'Ungültige Zahlung',
  'activation.abilityOnesAsEights':  '1→8',
  'activation.abilityThreesAsAny':   '3er zählen als beliebiger Wert',
  'activation.abilityDecreaseCard':  'Karte −1 (kostet 1 💎)',
  'activation.addValue':         '+{value} hinzufügen',
  'activation.removeValue':      '✕ Entfernen (+{value})',
  'activation.pearlLabel':       'Perle {value}:',
  'activation.tradeTwoPearl':    '2-Perle → 💎',
  'activation.tradeTwoPearlActive': '✕ 2-Perle → 💎',
  'discard.title':               'Perlenkarten abwerfen',
  'discard.handSize':            'Handgröße: {count} Karten',
  'discard.handLimit':           'Handlimit: {count} Karten',
  'discard.mustDiscardOne':      'Du musst {count} Karte abwerfen',
  'discard.mustDiscardMany':     'Du musst {count} Karten abwerfen',
  'discard.selectOne':           'Wähle {count} Karte zum Abwerfen',
  'discard.selectMany':          'Wähle {count} Karten zum Abwerfen',
  'discard.confirm':             'Abwerfen bestätigen',
  'discard.invalidSelection':    'Ungültige Auswahl',
  'discardOpponent.title':       'Gegner-Karte entfernen',
  'discardOpponent.description': 'Wähle eine Portal-Karte eines Gegners zum Entfernen:',
  'endgame.title':               'Spiel beendet',
  'endgame.terminated':          'Das Spiel wurde vom Ersteller beendet.',
  'endgame.rank':                'Rang',
  'endgame.player':              'Spieler',
  'endgame.points':              'Punkte',
  'endgame.me':                  '(Du)',
  'endgame.backToLobby':         'Zurück zur Lobby',
  'endgame.autoLeave':           'Automatisch in {countdown}s',
  'game.rehandCards':            'Hand neu ziehen',
  'game.finalRound':             '🏁 Letzte Runde!',
  'game.leaderHasPoints':        '⚔ {leaders} hat 12+ Punkte',
  'game.leadersHavePoints':      '⚔ {leaders} haben 12+ Punkte',
  'game.pearlRefresh':           '🔄 Charakterauslage erneuert – 2 neue Karten nachgezogen',
  'disconnect.waiting':          'Warte auf {name}...',
  'disconnect.connectionLost':   'Verbindung unterbrochen',
  'steal.title':                 'Perlenkarte stehlen',
  'steal.chooseOpponent':        'Wähle einen Gegner:',
  'steal.chooseCardFrom':        'Wähle eine Karte von {name}:',
  'steal.back':                  '← Zurück',
  'steal.card':                  'Karte',
  'steal.cards':                 'Karten',
  'common.cancel':               'Abbrechen',
};

const enGB: Record<TranslationKey, string> = {
  'app.checkingConnection':      'Checking connection…',
  'lobby.yourName':              'Your Name',
  'lobby.namePlaceholder':       'Enter name',
  'lobby.errorNameRequired':     'Please enter a name',
  'lobby.errorJoinFailed':       'Failed to join. Is the slot still available?',
  'lobby.errorCreateFailed':     'Could not create game. Is the server running on port 3001?',
  'lobby.errorNoSlot':           'No free slot in this game',
  'lobby.runningGames':          'My running games',
  'lobby.rejoin':                'Rejoin',
  'lobby.discard':               'Discard',
  'lobby.leaveGame':             'Leave Game',
  'lobby.endGame':               'End Game',
  'lobby.endGameConfirm':        'Really end the game? It will end for all players.',
  'waiting.title':               'Waiting for all players...',
  'waiting.description':         'The game starts automatically when all {count} players have joined.',
  'waiting.cancel':              'Cancel',
  'create.title':                'Create New Game',
  'create.playerCount':          'Number of players:',
  'create.nPlayers':             '{n} players',
  'create.create':               'Create Game',
  'matches.title':               'Open Games',
  'matches.noMatches':           'No open games available.',
  'matches.join':                'Join',
  'character.takeTitle':         'Take Character Card?',
  'character.viewTitle':         'Character Card',
  'character.take':              'Take',
  'character.close':             'Close',
  'replacement.title':           'Replace Portal Card',
  'replacement.description':     'Both portal slots are full. Choose which card to replace:',
  'replacement.discard':         'Discard',
  'detail.title':                'Character Details',
  'detail.powerPoints':          'Power Points',
  'detail.diamonds':             'Diamonds',
  'detail.abilities':            'Abilities',
  'detail.redInstant':           'Red (Instant)',
  'detail.bluePersistent':       'Blue (Persistent)',
  'activation.title':            'Activate Character',
  'activation.handCards':        'Hand cards ({count} selected)',
  'activation.abilities':        'Abilities',
  'activation.activate':         'Activate',
  'activation.invalidPayment':   'Invalid Payment',
  'activation.abilityOnesAsEights':  '1→8',
  'activation.abilityThreesAsAny':   '3s count as any value',
  'activation.abilityDecreaseCard':  'Card −1 (costs 1 💎)',
  'activation.addValue':         'Add +{value}',
  'activation.removeValue':      '✕ Remove (+{value})',
  'activation.pearlLabel':       'Pearl {value}:',
  'activation.tradeTwoPearl':    '2-Pearl → 💎',
  'activation.tradeTwoPearlActive': '✕ 2-Pearl → 💎',
  'discard.title':               'Discard Pearl Cards',
  'discard.handSize':            'Hand size: {count} cards',
  'discard.handLimit':           'Hand limit: {count} cards',
  'discard.mustDiscardOne':      'You must discard {count} card',
  'discard.mustDiscardMany':     'You must discard {count} cards',
  'discard.selectOne':           'Select {count} card to discard',
  'discard.selectMany':          'Select {count} cards to discard',
  'discard.confirm':             'Confirm Discard',
  'discard.invalidSelection':    'Invalid Selection',
  'discardOpponent.title':       'Remove Opponent Card',
  'discardOpponent.description': 'Choose a portal card from an opponent to remove:',
  'endgame.title':               'Game Over',
  'endgame.terminated':          'The game was ended by the host.',
  'endgame.rank':                'Rank',
  'endgame.player':              'Player',
  'endgame.points':              'Points',
  'endgame.me':                  '(You)',
  'endgame.backToLobby':         'Back to Lobby',
  'endgame.autoLeave':           'Automatically in {countdown}s',
  'game.rehandCards':            'Redraw Hand',
  'game.finalRound':             '🏁 Final Round!',
  'game.leaderHasPoints':        '⚔ {leaders} has 12+ points',
  'game.leadersHavePoints':      '⚔ {leaders} have 12+ points',
  'game.pearlRefresh':           '🔄 Character display refreshed – 2 new cards drawn',
  'disconnect.waiting':          'Waiting for {name}...',
  'disconnect.connectionLost':   'Connection lost',
  'steal.title':                 'Steal Pearl Card',
  'steal.chooseOpponent':        'Choose an opponent:',
  'steal.chooseCardFrom':        'Choose a card from {name}:',
  'steal.back':                  '← Back',
  'steal.card':                  'card',
  'steal.cards':                 'cards',
  'common.cancel':               'Cancel',
};

const fr: Record<TranslationKey, string> = {
  'app.checkingConnection':      'Vérification de la connexion…',
  'lobby.yourName':              'Votre nom',
  'lobby.namePlaceholder':       'Entrer un nom',
  'lobby.errorNameRequired':     'Veuillez entrer un nom',
  'lobby.errorJoinFailed':       'Échec. La place est-elle encore libre ?',
  'lobby.errorCreateFailed':     'Impossible de créer la partie. Le serveur tourne-t-il sur le port 3001 ?',
  'lobby.errorNoSlot':           'Pas de place libre dans cette partie',
  'lobby.runningGames':          'Mes parties en cours',
  'lobby.rejoin':                'Rejoindre',
  'lobby.discard':               'Ignorer',
  'lobby.leaveGame':             'Quitter la partie',
  'lobby.endGame':               'Terminer la partie',
  'lobby.endGameConfirm':        'Vraiment terminer la partie ? Elle sera terminée pour tous les joueurs.',
  'waiting.title':               'En attente de tous les joueurs...',
  'waiting.description':         'La partie démarre automatiquement quand tous les {count} joueurs ont rejoint.',
  'waiting.cancel':              'Annuler',
  'create.title':                'Créer une nouvelle partie',
  'create.playerCount':          'Nombre de joueurs :',
  'create.nPlayers':             '{n} joueurs',
  'create.create':               'Créer la partie',
  'matches.title':               'Parties ouvertes',
  'matches.noMatches':           'Aucune partie ouverte disponible.',
  'matches.join':                'Rejoindre',
  'character.takeTitle':         'Prendre la carte personnage ?',
  'character.viewTitle':         'Carte personnage',
  'character.take':              'Prendre',
  'character.close':             'Fermer',
  'replacement.title':           'Remplacer la carte portail',
  'replacement.description':     'Les deux emplacements sont pleins. Quelle carte remplacer ?',
  'replacement.discard':         'Ignorer',
  'detail.title':                'Détails du personnage',
  'detail.powerPoints':          'Points de pouvoir',
  'detail.diamonds':             'Diamants',
  'detail.abilities':            'Capacités',
  'detail.redInstant':           'Rouge (Immédiat)',
  'detail.bluePersistent':       'Bleu (Permanent)',
  'activation.title':            'Activer le personnage',
  'activation.handCards':        'Cartes en main ({count} sélectionnées)',
  'activation.abilities':        'Capacités',
  'activation.activate':         'Activer',
  'activation.invalidPayment':   'Paiement invalide',
  'activation.abilityOnesAsEights':  '1→8',
  'activation.abilityThreesAsAny':   'Les 3 comptent comme n\'importe quelle valeur',
  'activation.abilityDecreaseCard':  'Carte −1 (coûte 1 💎)',
  'activation.addValue':         'Ajouter +{value}',
  'activation.removeValue':      '✕ Retirer (+{value})',
  'activation.pearlLabel':       'Perle {value} :',
  'activation.tradeTwoPearl':    'Perle 2 → 💎',
  'activation.tradeTwoPearlActive': '✕ Perle 2 → 💎',
  'discard.title':               'Défausser des cartes perle',
  'discard.handSize':            'Taille de la main : {count} cartes',
  'discard.handLimit':           'Limite de main : {count} cartes',
  'discard.mustDiscardOne':      'Vous devez défausser {count} carte',
  'discard.mustDiscardMany':     'Vous devez défausser {count} cartes',
  'discard.selectOne':           'Sélectionnez {count} carte à défausser',
  'discard.selectMany':          'Sélectionnez {count} cartes à défausser',
  'discard.confirm':             'Confirmer la défausse',
  'discard.invalidSelection':    'Sélection invalide',
  'discardOpponent.title':       'Retirer une carte adversaire',
  'discardOpponent.description': 'Choisissez une carte portail d\'un adversaire à retirer :',
  'endgame.title':               'Partie terminée',
  'endgame.terminated':          'La partie a été terminée par le créateur.',
  'endgame.rank':                'Rang',
  'endgame.player':              'Joueur',
  'endgame.points':              'Points',
  'endgame.me':                  '(Moi)',
  'endgame.backToLobby':         'Retour au lobby',
  'endgame.autoLeave':           'Automatiquement dans {countdown}s',
  'game.rehandCards':            'Repiocher la main',
  'game.finalRound':             '🏁 Dernier tour !',
  'game.leaderHasPoints':        '⚔ {leaders} a 12+ points',
  'game.leadersHavePoints':      '⚔ {leaders} ont 12+ points',
  'game.pearlRefresh':           '🔄 Affichage actualisé – 2 nouvelles cartes piochées',
  'disconnect.waiting':          'En attente de {name}...',
  'disconnect.connectionLost':   'Connexion perdue',
  'steal.title':                 'Voler une carte perle',
  'steal.chooseOpponent':        'Choisissez un adversaire :',
  'steal.chooseCardFrom':        'Choisissez une carte de {name} :',
  'steal.back':                  '← Retour',
  'steal.card':                  'carte',
  'steal.cards':                 'cartes',
  'common.cancel':               'Annuler',
};

export const translations: Record<Locale, Record<TranslationKey, string>> = { de, 'en-GB': enGB, fr };
