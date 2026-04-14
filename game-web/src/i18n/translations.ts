export type Locale = 'de' | 'en-GB' | 'fr';

export const DEFAULT_LOCALE: Locale = 'de';

export type TranslationKey =
  // App
  | 'app.title'
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
  | 'activation.diamondCost'
  | 'activation.diamondAvailable'
  | 'activation.diamondConfirm'
  | 'activation.diamondConfirmed'
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
  // Character swap dialog
  | 'swap.title'
  | 'swap.description'
  | 'swap.cancel'
  // Take back played pearl dialog
  | 'takeBackPearl.title'
  | 'takeBackPearl.noVirtualCards'
  | 'takeBackPearl.chooseCard'
  | 'takeBackPearl.pearlAlt'
  // End turn button
  | 'game.endTurn'
  // Player status dialog
  | 'player.points'
  | 'player.diamonds'
  | 'player.activeAbilities'
  | 'player.noAbilities'
  // Deck reshuffle animation
  | 'deck.reshufflingPearl'
  | 'deck.reshufflingCharacter'
  // Canvas labels
  | 'canvas.swap'
  | 'canvas.discardCards'
  | 'canvas.clickToTake'
  // Lobby session info
  | 'lobby.sessionInfo'
  | 'lobby.fallbackPlayerName'
  // Ability names
  | 'ability.threeExtraActions.name'
  | 'ability.nextPlayerOneExtraAction.name'
  | 'ability.discardOpponentCharacter.name'
  | 'ability.stealOpponentHandCard.name'
  | 'ability.takeBackPlayedPearl.name'
  | 'ability.handLimitPlusOne.name'
  | 'ability.oneExtraActionPerTurn.name'
  | 'ability.onesCanBeEights.name'
  | 'ability.threesCanBeAny.name'
  | 'ability.decreaseWithPearl.name'
  | 'ability.changeCharacterActions.name'
  | 'ability.changeHandActions.name'
  | 'ability.previewCharacter.name'
  | 'ability.tradeTwoForDiamond.name'
  | 'ability.numberAdditionalCardActions.name'
  | 'ability.anyAdditionalCardActions.name'
  | 'ability.irrlicht.name'
  // Ability descriptions
  | 'ability.threeExtraActions.description'
  | 'ability.nextPlayerOneExtraAction.description'
  | 'ability.discardOpponentCharacter.description'
  | 'ability.stealOpponentHandCard.description'
  | 'ability.takeBackPlayedPearl.description'
  | 'ability.handLimitPlusOne.description'
  | 'ability.oneExtraActionPerTurn.description'
  | 'ability.onesCanBeEights.description'
  | 'ability.threesCanBeAny.description'
  | 'ability.decreaseWithPearl.description'
  | 'ability.changeCharacterActions.description'
  | 'ability.changeHandActions.description'
  | 'ability.previewCharacter.description'
  | 'ability.tradeTwoForDiamond.description'
  | 'ability.numberAdditionalCardActions.description'
  | 'ability.anyAdditionalCardActions.description'
  | 'ability.irrlicht.description'
  ;

const de: Record<TranslationKey, string> = {
  'app.title':                   'Die Portale von Molthar',
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
  'activation.diamondCost':      'Diamanten bezahlen',
  'activation.diamondAvailable': '{count} verfügbar',
  'activation.diamondConfirm':   '💎 Bezahlen',
  'activation.diamondConfirmed': '✓ Bezahlt',
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
  'swap.title':                  'Portal-Karte tauschen',
  'swap.description':            'Wähle eine Auslage-Karte zum Tauschen:',
  'swap.cancel':                 'Abbrechen',
  'takeBackPearl.title':         'Perlenkarte zurückholen',
  'takeBackPearl.noVirtualCards': 'Nur virtuelle Perlenkarten wurden gespielt.',
  'takeBackPearl.chooseCard':    'Wähle eine Karte zum Zurückholen:',
  'takeBackPearl.pearlAlt':      'Perle {value}',
  'game.endTurn':                'Zug beenden',
  'player.points':               'Punkte',
  'player.diamonds':             'Diamanten',
  'player.activeAbilities':      'Aktive Fähigkeiten',
  'player.noAbilities':          'Keine aktiven Fähigkeiten',
  'deck.reshufflingPearl':       'Perlenstapel\nwird gemischt…',
  'deck.reshufflingCharacter':   'Charakterstapel\nwird gemischt…',
  'canvas.swap':                 'Tauschen',
  'canvas.discardCards':         'Karten abwerfen',
  'canvas.clickToTake':          '← Klick zum Nehmen',
  'lobby.sessionInfo':           'Spiel {matchID} als {playerName}',
  'lobby.fallbackPlayerName':    'Spieler {n}',
  'ability.threeExtraActions.name':              '+3 Aktionen',
  'ability.nextPlayerOneExtraAction.name':       '+1 Aktion für nächsten Spieler',
  'ability.discardOpponentCharacter.name':       'Portalkarte entfernen',
  'ability.stealOpponentHandCard.name':          'Handkarte stehlen',
  'ability.takeBackPlayedPearl.name':            'Perlenkarte zurücknehmen',
  'ability.handLimitPlusOne.name':               '+1 Handlimit',
  'ability.oneExtraActionPerTurn.name':          '+1 Aktion/Runde',
  'ability.onesCanBeEights.name':                '1er zählen als 8',
  'ability.threesCanBeAny.name':                 '3er zählen als beliebig',
  'ability.decreaseWithPearl.name':              'Diamant senkt Perlenwert',
  'ability.changeCharacterActions.name':         'Portal tauschen (vor 1. Aktion)',
  'ability.changeHandActions.name':              'Hand neu aufnehmen (nach letzter Aktion)',
  'ability.previewCharacter.name':               'Karte vom Stapel ansehen',
  'ability.tradeTwoForDiamond.name':             '2-Perle gegen Diamant tauschen',
  'ability.numberAdditionalCardActions.name':    'Karte mit aufgedrucktem Perlenwert',
  'ability.anyAdditionalCardActions.name':       'Karte mit beliebigem Perlenwert',
  'ability.irrlicht.name':                       'Irrlicht – Nachbarn können mitaktivieren',
  'ability.threeExtraActions.description':           'Sofort: +3 Aktionen in diesem Zug',
  'ability.nextPlayerOneExtraAction.description':    'Der nächste Spieler erhält +1 Aktion in seinem Zug',
  'ability.discardOpponentCharacter.description':    'Sofort: Entferne eine Portalkarte eines Gegners',
  'ability.stealOpponentHandCard.description':       'Sofort: Nimm eine Handkarte eines Gegners',
  'ability.takeBackPlayedPearl.description':         'Sofort: Nimm deine zuletzt gespielte Perlenkarte zurück auf die Hand',
  'ability.handLimitPlusOne.description':            'Dauerhaft: Dein Handlimit erhöht sich um 1',
  'ability.oneExtraActionPerTurn.description':       'Dauerhaft: Du erhältst jede Runde +1 Aktion',
  'ability.onesCanBeEights.description':             'Dauerhaft: 1er-Perlenkarten zählen bei Kosten als 8',
  'ability.threesCanBeAny.description':              'Dauerhaft: 3er-Perlenkarten zählen bei Kosten als beliebiger Wert',
  'ability.decreaseWithPearl.description':           'Dauerhaft: Gib 1 Diamant aus um den Wert einer Perlenkarte um 1 zu senken',
  'ability.changeCharacterActions.description':      'Dauerhaft: Tausche vor deiner 1. Aktion eine Portalkarte aus',
  'ability.changeHandActions.description':           'Dauerhaft: Nimm nach deiner letzten Aktion deine Hand neu auf',
  'ability.previewCharacter.description':            'Dauerhaft: Sieh vor deiner 1. Aktion die oberste Karte des Charakterstapels an',
  'ability.tradeTwoForDiamond.description':          'Dauerhaft: Tausche bei der Aktivierung eine 2er-Perle gegen 1 Diamant',
  'ability.numberAdditionalCardActions.description': 'Dauerhaft: Diese Karte hat einen aufgedruckten Perlenwert der bei Kosten mitgezählt wird',
  'ability.anyAdditionalCardActions.description':    'Dauerhaft: Diese Karte hat einen aufgedruckten Wildcard-Perlenwert',
  'ability.irrlicht.description':                    'Dauerhaft: Direkte Nachbarn können diese Karte mitaktivieren',
};

const enGB: Record<TranslationKey, string> = {
  'app.title':                   'Portal of Heroes',
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
  'activation.diamondCost':      'Pay Diamonds',
  'activation.diamondAvailable': '{count} available',
  'activation.diamondConfirm':   '💎 Pay',
  'activation.diamondConfirmed': '✓ Paid',
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
  'swap.title':                  'Swap Portal Card',
  'swap.description':            'Choose a display card to swap with:',
  'swap.cancel':                 'Cancel',
  'takeBackPearl.title':         'Retrieve Pearl Card',
  'takeBackPearl.noVirtualCards': 'Only virtual pearl cards were played.',
  'takeBackPearl.chooseCard':    'Choose a card to retrieve:',
  'takeBackPearl.pearlAlt':      'Pearl {value}',
  'game.endTurn':                'End Turn',
  'player.points':               'Points',
  'player.diamonds':             'Diamonds',
  'player.activeAbilities':      'Active Abilities',
  'player.noAbilities':          'No active abilities',
  'deck.reshufflingPearl':       'Pearl deck\nbeing shuffled…',
  'deck.reshufflingCharacter':   'Character deck\nbeing shuffled…',
  'canvas.swap':                 'Swap',
  'canvas.discardCards':         'Discard Cards',
  'canvas.clickToTake':          '← Click to take',
  'lobby.sessionInfo':           'Game {matchID} as {playerName}',
  'lobby.fallbackPlayerName':    'Player {n}',
  'ability.threeExtraActions.name':              '+3 Actions',
  'ability.nextPlayerOneExtraAction.name':       '+1 Action for next player',
  'ability.discardOpponentCharacter.name':       'Remove portal card',
  'ability.stealOpponentHandCard.name':          'Steal hand card',
  'ability.takeBackPlayedPearl.name':            'Retrieve pearl card',
  'ability.handLimitPlusOne.name':               '+1 Hand limit',
  'ability.oneExtraActionPerTurn.name':          '+1 Action/Round',
  'ability.onesCanBeEights.name':                '1s count as 8',
  'ability.threesCanBeAny.name':                 '3s count as any',
  'ability.decreaseWithPearl.name':              'Diamond lowers pearl value',
  'ability.changeCharacterActions.name':         'Swap portal (before 1st action)',
  'ability.changeHandActions.name':              'Redraw hand (after last action)',
  'ability.previewCharacter.name':               'Preview top deck card',
  'ability.tradeTwoForDiamond.name':             'Trade 2-pearl for diamond',
  'ability.numberAdditionalCardActions.name':    'Card with printed pearl value',
  'ability.anyAdditionalCardActions.name':       'Card with wildcard pearl value',
  'ability.irrlicht.name':                       'Will-o-wisp – neighbours can co-activate',
  'ability.threeExtraActions.description':           'Instant: +3 actions this turn',
  'ability.nextPlayerOneExtraAction.description':    'The next player gets +1 action on their turn',
  'ability.discardOpponentCharacter.description':    'Instant: Remove a portal card from an opponent',
  'ability.stealOpponentHandCard.description':       'Instant: Take a hand card from an opponent',
  'ability.takeBackPlayedPearl.description':         'Instant: Return your last played pearl card to your hand',
  'ability.handLimitPlusOne.description':            'Persistent: Your hand limit increases by 1',
  'ability.oneExtraActionPerTurn.description':       'Persistent: You get +1 action each round',
  'ability.onesCanBeEights.description':             'Persistent: 1-pearl cards count as 8 for costs',
  'ability.threesCanBeAny.description':              'Persistent: 3-pearl cards count as any value for costs',
  'ability.decreaseWithPearl.description':           'Persistent: Spend 1 diamond to reduce a pearl card value by 1',
  'ability.changeCharacterActions.description':      'Persistent: Swap a portal card before your 1st action',
  'ability.changeHandActions.description':           'Persistent: Redraw your hand after your last action',
  'ability.previewCharacter.description':            'Persistent: Before your 1st action, peek at the top card of the character deck',
  'ability.tradeTwoForDiamond.description':          'Persistent: Trade a 2-pearl for 1 diamond during activation',
  'ability.numberAdditionalCardActions.description': 'Persistent: This card has a printed pearl value that counts toward costs',
  'ability.anyAdditionalCardActions.description':    'Persistent: This card has a printed wildcard pearl value',
  'ability.irrlicht.description':                    'Persistent: Direct neighbours can co-activate this card',
};

const fr: Record<TranslationKey, string> = {
  'app.title':                   'Le Portail des Héros',
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
  'activation.diamondCost':      'Payer des diamants',
  'activation.diamondAvailable': '{count} disponibles',
  'activation.diamondConfirm':   '💎 Payer',
  'activation.diamondConfirmed': '✓ Payé',
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
  'swap.title':                  'Échanger une carte portail',
  'swap.description':            'Choisissez une carte de l\'affichage à échanger :',
  'swap.cancel':                 'Annuler',
  'takeBackPearl.title':         'Récupérer une carte perle',
  'takeBackPearl.noVirtualCards': 'Seules des cartes perle virtuelles ont été jouées.',
  'takeBackPearl.chooseCard':    'Choisissez une carte à récupérer :',
  'takeBackPearl.pearlAlt':      'Perle {value}',
  'game.endTurn':                'Terminer le tour',
  'player.points':               'Points',
  'player.diamonds':             'Diamants',
  'player.activeAbilities':      'Capacités actives',
  'player.noAbilities':          'Aucune capacité active',
  'deck.reshufflingPearl':       'Pioche perle\nen cours de mélange…',
  'deck.reshufflingCharacter':   'Pioche personnage\nen cours de mélange…',
  'canvas.swap':                 'Échanger',
  'canvas.discardCards':         'Défausser',
  'canvas.clickToTake':          '← Cliquer pour prendre',
  'lobby.sessionInfo':           'Partie {matchID} en tant que {playerName}',
  'lobby.fallbackPlayerName':    'Joueur {n}',
  'ability.threeExtraActions.name':              '+3 actions',
  'ability.nextPlayerOneExtraAction.name':       '+1 action pour le prochain joueur',
  'ability.discardOpponentCharacter.name':       'Retirer une carte portail',
  'ability.stealOpponentHandCard.name':          'Voler une carte en main',
  'ability.takeBackPlayedPearl.name':            'Récupérer une carte perle',
  'ability.handLimitPlusOne.name':               '+1 limite de main',
  'ability.oneExtraActionPerTurn.name':          '+1 action/tour',
  'ability.onesCanBeEights.name':                'Les 1 comptent comme 8',
  'ability.threesCanBeAny.name':                 'Les 3 comptent comme n\'importe quelle valeur',
  'ability.decreaseWithPearl.name':              'Diamant réduit la valeur perle',
  'ability.changeCharacterActions.name':         'Échanger portail (avant 1re action)',
  'ability.changeHandActions.name':              'Repiocher la main (après dernière action)',
  'ability.previewCharacter.name':               'Voir la carte du dessus',
  'ability.tradeTwoForDiamond.name':             'Échanger une perle-2 contre un diamant',
  'ability.numberAdditionalCardActions.name':    'Carte avec valeur perle imprimée',
  'ability.anyAdditionalCardActions.name':       'Carte avec valeur perle générique',
  'ability.irrlicht.name':                       'Feu follet – les voisins peuvent co-activer',
  'ability.threeExtraActions.description':           'Immédiat : +3 actions ce tour',
  'ability.nextPlayerOneExtraAction.description':    'Le prochain joueur obtient +1 action pendant son tour',
  'ability.discardOpponentCharacter.description':    'Immédiat : Retirez une carte portail d\'un adversaire',
  'ability.stealOpponentHandCard.description':       'Immédiat : Prenez une carte en main d\'un adversaire',
  'ability.takeBackPlayedPearl.description':         'Immédiat : Reprenez votre dernière carte perle jouée en main',
  'ability.handLimitPlusOne.description':            'Permanent : Votre limite de main augmente de 1',
  'ability.oneExtraActionPerTurn.description':       'Permanent : Vous obtenez +1 action chaque tour',
  'ability.onesCanBeEights.description':             'Permanent : Les cartes perle-1 comptent comme 8 pour les coûts',
  'ability.threesCanBeAny.description':              'Permanent : Les cartes perle-3 comptent comme n\'importe quelle valeur pour les coûts',
  'ability.decreaseWithPearl.description':           'Permanent : Dépensez 1 diamant pour réduire la valeur d\'une carte perle de 1',
  'ability.changeCharacterActions.description':      'Permanent : Échangez une carte portail avant votre 1re action',
  'ability.changeHandActions.description':           'Permanent : Repiochez votre main après votre dernière action',
  'ability.previewCharacter.description':            'Permanent : Avant votre 1re action, regardez la carte du dessus de la pioche personnage',
  'ability.tradeTwoForDiamond.description':          'Permanent : Échangez une perle-2 contre 1 diamant lors de l\'activation',
  'ability.numberAdditionalCardActions.description': 'Permanent : Cette carte a une valeur perle imprimée qui compte pour les coûts',
  'ability.anyAdditionalCardActions.description':    'Permanent : Cette carte a une valeur perle générique imprimée',
  'ability.irrlicht.description':                    'Permanent : Les voisins directs peuvent co-activer cette carte',
};

export const translations: Record<Locale, Record<TranslationKey, string>> = { de, 'en-GB': enGB, fr };
