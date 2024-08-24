import { Player } from "./players";

export class TurnManager {
    players: Player[];
    currentPlayerIndex: number;
    turnCount: number;

    constructor(players: Player[]) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.turnCount = 0;
    }

    getCurrentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.turnCount += 1;
    }

    resetTurns() {
        this.currentPlayerIndex = 0;
        this.turnCount = 0;
    }

    skipTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    getTurnCount(): number {
        return this.turnCount;
    }
}
