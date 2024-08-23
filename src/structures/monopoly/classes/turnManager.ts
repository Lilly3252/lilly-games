import { Player } from "./players";

export class TurnManager {
     players: Player[];
    currentPlayerIndex: number;

    constructor(players: Player[]) {
        this.players = players;
        this.currentPlayerIndex = 0;
    }

    getCurrentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
}