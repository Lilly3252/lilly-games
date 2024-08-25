import { Player } from "./players";

/**
 * Manages the turns in the Monopoly game.
 */
export class TurnManager {
    players: Player[];
    currentPlayerIndex: number;
    turnCount: number;

    /**
     * Creates an instance of TurnManager.
     * @param players - The players in the game.
     */
    constructor(players: Player[]) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.turnCount = 0;
    }

    /**
     * Gets the current player.
     * @returns The current player.
     */
    getCurrentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Proceeds to the next turn.
     */
    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.turnCount += 1;
    }

    /**
     * Resets the turns.
     */
    resetTurns() {
        this.currentPlayerIndex = 0;
        this.turnCount = 0;
    }

    /**
     * Skips the current player's turn.
     */
    skipTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    /**
     * Gets the total number of turns.
     * @returns The total number of turns.
     */
    getTurnCount(): number {
        return this.turnCount;
    }
}
