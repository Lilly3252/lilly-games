import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { AIPlayer } from "./AIPlayer";

/**
 * Manages Monopoly games for different channels.
 */
export class GameManager {
    games: { [channelId: string]: MonopolyGame } = {};

    /**
     * Gets the game associated with a specific channel.
     * @param channelId - The ID of the channel.
     * @returns The Monopoly game for the channel, or null if no game is found.
     */
    getGameForChannel(channelId: string): MonopolyGame | null {
        return this.games[channelId] || null;
    }

    /**
     * Adds a game for a specific channel.
     * @param channelId - The ID of the channel.
     * @param game - The Monopoly game to add.
     */
    addGameForChannel(channelId: string, game: MonopolyGame): void {
        this.games[channelId] = game;
    }

    /**
     * Plays a turn for the current player in the specified channel.
     * @param channelId - The ID of the channel.
     */
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

/**
 * Singleton instance of GameManager.
 */
export const gameManager = new GameManager();
