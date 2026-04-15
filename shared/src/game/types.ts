// TypeScript types for boardgame.io integration
// Defines the game state, moves, and player information

/**
 * Pearl Card - Value 1-8
 * Some cards have a swap symbol
 */
export interface PearlCard {
  id: string;
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  hasSwapSymbol: boolean;
  /** Wenn true: beim Aufdecken dieser Karte werden die beiden Charakterkarten der Auslage entfernt und 2 neue nachgezogen. */
  hasRefreshSymbol: boolean;
}

/**
 * Cost Component - Flexible cost system
 */
export interface CostComponent {
  type: 'number' | 'nTuple' | 'sumAnyTuple' | 'sumTuple' | 'run' | 'evenTuple' | 'oddTuple' | 'diamond' | 'tripleChoice';
  value?: number;
  n?: number;
  sum?: number;
  length?: number;
  value1?: number;
  value2?: number;
}

/**
 * Character Card
 */
export interface CharacterCard {
  id: string;
  name: string;
  imageName: string;
  cost: CostComponent[];
  powerPoints: number;
  diamonds: number;
  abilities: CharacterAbility[];
  /** Aufgedruckte Perlenwerte auf der Karte (für numberAdditionalCardActions / anyAdditionalCardActions) */
  printedPearls?: PrintedPearlValue[];
  /** Geteilte Aktivierung: Nachbarn des Besitzers können diese Karte in ihren Zügen aktivieren (irrlicht) */
  sharedActivation?: boolean;
}

/**
 * Aufgedruckter Perlenwert auf einer Charakterkarte.
 * Kann ein fester Wert (1–8) oder eine Wildcard ('?') sein.
 */
export type PrintedPearlValue = { value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 } | { wildcard: true };

/**
 * Alle 18 Fähigkeitstypen:
 * Rote (persistent: false) – werden sofort nach Aktivierung ausgeführt:
 * - 'threeExtraActions': +3 Aktionen im aktuellen Zug
 * - 'nextPlayerOneExtraAction': nächster Spieler erhält +1 Aktion
 * - 'discardOpponentCharacter': entfernt eine Charakterkarte vom Portal eines Gegners
 * - 'stealOpponentHandCard': stiehlt eine Perlenkarte aus der Hand eines Gegners
 * - 'takeBackPlayedPearl': holt die zuletzt gespielte Perlenkarte vom Ablagestapel zurück
 *
 * Blaue (persistent: true) – dauerhafter Effekt:
 * - 'handLimitPlusOne': +1 Handlimit (bereits implementiert)
 * - 'oneExtraActionPerTurn': +1 Aktion pro Zug dauerhaft
 * - 'onesCanBeEights': 1-Perlen können bei Kostenprüfung als 8 gelten
 * - 'threesCanBeAny': 3-Perlen können bei Kostenprüfung beliebigen Wert (1–8) haben
 * - 'decreaseWithPearl': Diamant kann Perlenwert um 1 reduzieren (min. 1)
 * - 'changeCharacterActions': Portal-Karte vor der ersten Aktion tauschen
 * - 'changeHandActions': Hand nach der letzten Aktion neu ziehen
 * - 'previewCharacter': Deck vor der ersten Aktion einsehen
 * - 'tradeTwoForDiamond': 2-Perle gegen 1 Diamant tauschen
 * - 'numberAdditionalCardActions': Karte hat aufgedruckten Perlenwert (fester Wert)
 * - 'anyAdditionalCardActions': Karte hat aufgedruckte Wildcard-Perle (?)
 * - 'irrlicht': geteilte Aktivierung – unmittelbare Nachbarn können aktivieren
 * - 'none': keine Fähigkeit
 */
export type CharacterAbilityType =
  | 'handLimitPlusOne'
  | 'oneExtraActionPerTurn'
  | 'threeExtraActions'
  | 'nextPlayerOneExtraAction'
  | 'discardOpponentCharacter'
  | 'stealOpponentHandCard'
  | 'takeBackPlayedPearl'
  | 'onesCanBeEights'
  | 'threesCanBeAny'
  | 'decreaseWithPearl'
  | 'changeCharacterActions'
  | 'changeHandActions'
  | 'previewCharacter'
  | 'tradeTwoForDiamond'
  | 'numberAdditionalCardActions'
  | 'anyAdditionalCardActions'
  | 'irrlicht'
  | 'none';

export interface CharacterAbility {
  id: string;
  persistent: boolean; // true = blaue Fähigkeit, false = rote Fähigkeit
  type: CharacterAbilityType;
  description: string;
}

/**
 * Definiert eine Zahlungskarte (echt oder virtuell), die vom UI zusammengestellt wird.
 */
export interface PaymentSelection {
  source: 'hand' | 'ability' | 'trade' | 'diamond';
  value: number;

  // Nur relevant, wenn source === 'hand'
  handCardIndex?: number;
  abilityType?: CharacterAbilityType;
  diamondsUsed?: number;

  // Nur relevant, wenn source === 'ability'
  // Auch relevant wenn source === 'trade': characterId = Karte mit tradeTwoForDiamond-Ability,
  // handCardIndex = Index der 2-Perle in der Hand (wird konsumiert, zählt nicht als Kostenperle)
  characterId?: string;
}

/**
 * Activated Character (placed on portal)
 */
export interface ActivatedCharacter {
  id: string;
  card: CharacterCard;  // full card data needed for activation
  activated: boolean; // true = ability used (rotated 180°)
}

/**
 * Player State
 */
export interface PlayerState {
  id: string;
  name: string;
  hand: PearlCard[];
  portal: ActivatedCharacter[]; // max 2, Karten noch nicht aktiviert
  activatedCharacters: ActivatedCharacter[]; // aktivierte Karten (aus Portal entfernt)
  powerPoints: number;
  diamondCards: CharacterCard[];
  readyUp: boolean;
  isAI: boolean;
  aiDifficulty?: 1 | 2 | 3 | 4 | 5; // 1=leicht, 5=genius
  /**
   * Handlimit-Modifier – kumulativer Anstieg durch aktivierte Charakterfähigkeiten.
   * Jeder Charakter mit der Fähigkeit `handLimitPlusOne` erhöht diesen Wert um 1.
   * Effektives Handlimit: 5 (Basis) + handLimitModifier.
   */
  handLimitModifier: number;
  /**
   * Aktive blaue Fähigkeiten dieses Spielers (persistent nach Aktivierung).
   * Wird durch `activatePortalCard` befüllt, niemals geleert.
   */
  activeAbilities: CharacterAbility[];
  /**
   * Die vom Spieler mit `previewCharacter` eingesehene Karte vom Nachziehstapel.
   * Wird verwendet, um dem Spieler per playerView das Geheimnis zu zeigen.
   */
  peekedCard?: CharacterCard | null;
  /**
   * Portalfarbe des Spielers (1=Lila, 2=Hellgrün, 3=Dunkelgrün, 4=Rot, 5=Hellblau).
   * Bestimmt das Portal-Hintergrundbild (Portal{colorIndex}.jpeg).
   */
  colorIndex: number;
}

/**
 * Game State - Main game data structure
 */
export interface GameState {
  // Decks
  pearlDeck: PearlCard[];
  characterDeck: CharacterCard[];
  pearlDiscardPile: PearlCard[];
  characterDiscardPile: CharacterCard[];
  
  // Auslage
  pearlSlots: (PearlCard | null)[]; // 4 offene Perlenkarten (null = leerer Slot)
  characterSlots: CharacterCard[]; // 2 offene Charakterkarten
  
  // Spieler
  players: { [playerId: string]: PlayerState };
  playerOrder: string[]; // Spielerreihenfolge
  
  // Spielzustand
  actionCount: number; // Aktionszähler des aktuellen Spielers (0–3+)
  maxActions: number; // Maximale Aktionen dieses Zuges (3 + Boni)
  finalRound: boolean; // true wenn die letzte Runde begonnen hat
  finalRoundStartingPlayer: string | null; // Spieler der die letzte Runde ausgelöst hat
  finalRoundTriggerTurn: number | null; // ctx.turn in dem finalRound ausgelöst wurde
  requiresHandDiscard: boolean; // true wenn aktueller Spieler Karten abwerfen muss
  excessCardCount: number; // Anzahl abzuwerfender Karten
  currentHandLimit: number; // Aktuelles Handlimit für UI-Anzeige

  /**
   * Flag für rote Fähigkeit `nextPlayerOneExtraAction`.
   * Wird in `turn.onBegin` des nächsten Spielers ausgewertet und danach gelöscht.
   */
  nextPlayerExtraAction: boolean;

  /** IDs aller echten Perlenkarten, die im aktuellen Zug gespielt wurden (für `takeBackPlayedPearl`). Wird am Zugende geleert. */
  playedRealPearlIds: string[];

  /** Ausstehende Kartenauswahl für `takeBackPlayedPearl`-Ability. */
  pendingTakeBackPlayedPearl: boolean;

  /** Signalisiert dem Frontend, dass der Perlen-Nachziehstapel gerade neu gemischt wurde. */
  isReshufflingPearlDeck: boolean;
  /** Signalisiert dem Frontend, dass der Charakter-Nachziehstapel gerade neu gemischt wurde. */
  isReshufflingCharacterDeck: boolean;

  /** Signalisiert dem Frontend, dass ein Perlenkarten-Refresh ausgelöst wurde (Charakterauslage erneuert). Wird am Zugende zurückgesetzt. */
  isPearlRefreshTriggered: boolean;

  /** Ausstehende Auswahl einer gegnerischen Handkarte zum Stehlen. */
  pendingStealOpponentHandCard: boolean;

  /** Ausstehende Auswahl einer gegnerischen Portal-Karte zum Entfernen. */
  pendingDiscardOpponentCharacter: boolean;

  /**
   * Fähigkeitstypen (onesCanBeEights, threesCanBeAny, decreaseWithPearl), die in diesem Zug
   * bereits als Zahlungsmodifikator genutzt wurden. Wird am Zugbeginn zurückgesetzt.
   */
  usedPaymentAbilityTypes: CharacterAbilityType[];

  /**
   * IDs von aktivierten Charakteren, die in diesem Zug bereits als Ability-Quelle (source: 'ability')
   * genutzt wurden. Wird am Zugbeginn zurückgesetzt.
   */
  usedAbilitySourceCharacterIds: string[];

  // Metadaten
  startingPlayer: string;
  portalEntryCounter: number; // Monotoner Zähler für deterministische Portal-Eintrags-IDs
}

/**
 * boardgame.io Context (provided by framework)
 */
export interface GameContext {
  numPlayers: number;
  currentPlayer: string;
  playOrder: string[];
  playOrderPos: number;
  activePlayers: { [playerId: string]: string } | null;
  stage: string | null;
}

/**
 * Move arguments
 */
export interface TakePearlCardPayload {
  slotIndex: number; // 0-3 for face-up, -1 for deck
}

export interface ActivateCharacterPayload {
  characterSlotIndex: number; // 0–1 für offene Karten
  pearlCardIndices: number[]; // Indizes der Handkarten
  /** Vom Spieler explizit gewählte aufgedruckte Perlenwerte der zu aktivierenden Karte (TIER 6) */
  selectedPrintedPearls?: PrintedPearlValue[];
}

export interface ReplaceCharacterPayload {
  pearlCardIndices: number[]; // Indices from hand to use
}

export interface ReadyUpPayload {
  ready: boolean;
}
