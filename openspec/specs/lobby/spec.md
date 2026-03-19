# Lobby Specification

## Purpose
Match creation, seat assignment, and synchronized multiplayer session entry for the web edition of Portale von Molthar.

## Requirements

### Requirement: Match Creation
The system SHALL allow a player to create a new multiplayer match for 2 to 5 players.

#### Scenario: Create a new match
- GIVEN a player has entered a display name
- WHEN the player creates a match and selects a player count
- THEN the system creates a new open match
- AND the creating player joins seat `0`
- AND the match becomes available for additional players until all seats are filled

### Requirement: Open Match Discovery
The system SHALL show joinable matches that still contain at least one free player seat.

#### Scenario: View open matches
- GIVEN the lobby server is reachable
- WHEN a player opens the lobby screen or refreshes the list
- THEN the system retrieves available matches for the Molthar game
- AND only matches with at least one unnamed or unclaimed seat are shown as joinable

### Requirement: Seat-Based Joining
The system SHALL assign a player to a concrete seat in a match and issue player credentials for that seat.

#### Scenario: Join a free seat
- GIVEN an open match has at least one free seat
- AND the joining player has entered a display name
- WHEN the player joins the match
- THEN the system assigns the player to one specific seat
- AND returns credentials that authorize moves for that seat
- AND transitions the player from lobby view into the game session

#### Scenario: Reject joining without a valid seat
- GIVEN a match has no remaining free seats or the selected seat is no longer available
- WHEN a player attempts to join
- THEN the system MUST reject the join attempt
- AND the player remains in the lobby with an actionable error message

### Requirement: Shared Session Connectivity
The system SHALL connect all joined players to the same authoritative game session.

#### Scenario: Enter the shared game
- GIVEN a player has a match ID, player ID, and valid credentials
- WHEN the game client starts the session
- THEN the client connects to the multiplayer server for that match
- AND the player receives the shared game state for the assigned seat
- AND subsequent moves are synchronized through the same session

### Requirement: Lobby Error Feedback
The system SHOULD surface lobby connectivity failures as user-visible errors.

#### Scenario: Server unavailable during lobby action
- GIVEN the multiplayer server cannot be reached
- WHEN a player tries to create a match, join a match, or refresh the match list
- THEN the system shows an error explaining that the game server is unavailable
- AND the player can retry from the lobby
