import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { AIPlayer } from "./AIPlayer";

export class GameManager {
    games: { [channelId: string]: MonopolyGame } = {};

    getGameForChannel(channelId: string): MonopolyGame | null {
        return this.games[channelId] || null;
    }

    addGameForChannel(channelId: string, game: MonopolyGame): void {
        this.games[channelId] = game;
    }

    async playTurn(channelId: string) {
        const game = this.getGameForChannel(channelId);
        if (!game) {
            console.error(`No game found for channel ${channelId}`);
            return;
        }

        const currentPlayer = game.turnManager.getCurrentPlayer();
        if (currentPlayer instanceof AIPlayer) {
            currentPlayer.makeMove(game);
        } else {
            // Handle human player's turn
        }
        // Proceed to the next turn
        game.turnManager.nextTurn();
    }
}

export const gameManager = new GameManager();
