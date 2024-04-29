import { GameSession, Player, Property } from "#type/monopoly.js";
import { GuildTextBasedChannel, Message, MessageCollector } from "discord.js";

import { MakeDiceRoll } from "../functions/functions .js";
import MonopolyProperty from "./boardProperties.js";
import { ChanceCardHandler } from "./chance.js";
import { CommunityCardHandler } from "./community.js";
import MonopolyPlayer from "./player.js";


/**
 * Represents a Monopoly game session.
 */
export class Monopoly implements GameSession{
    /**
     * The list of players in the game.
     */
    public players: Player[];
    /**
     * Index of the current player taking the turn.
     */
    public currentPlayerIndex: number = 0;
    /**
     * Message collector used to listen for player commands.
     */
    public messageCollector: MessageCollector;
    /**
     * Handler for Chance cards.
     */
    private chanceCardHandler: ChanceCardHandler = new ChanceCardHandler();
    /**
     * Handler for Community cards.
     */
    private communityCardHandler: CommunityCardHandler = new CommunityCardHandler();
	/**
     * The text-based channel for the game communication.
     */
    public textChannel: GuildTextBasedChannel;
    /**
     * The game board data.
     */
    public board: Property[];
    /**
     * A mapping of board spaces or properties.
     */
    public propertyMap: Property;

    /**
     * Constructs a new instance of the Monopoly game.
     */
    constructor(public properties: MonopolyProperty[]) {
        this.messageCollector = new MessageCollector(this.textChannel, { filter: this.filterByCurrentPlayer.bind(this) });
        this.players = [];
        
    }

    /**
     * Message filtering function to collect messages only from the current player.
     * @param message - The message to filter.
     * @returns Returns true if the message author is the current player, false otherwise.
     */
    public filterByCurrentPlayer(message: Message): boolean {
        return message.author.id === this.players[this.currentPlayerIndex].id;
    }

    /**
     * Adds a new player to the game.
     * @param player - The player object to be added to the game.
     */
    public async addPlayer(player: Player): Promise<void> {
        this.players.push(player);
    }

    /**
     * Updates the current player index to the next player in the turn order.
     */
    public updateCurrentPlayerIndex(): void {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    /**
     * Retrieves the player object of the current player taking the turn.
     * @returns The player object of the current player.
     */
    public get currentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Retrieves the board spaces associated with a specific property name.
     * @param propertyName - The name of the property to retrieve.
     * @returns An array of BoardSpace objects corresponding to the property name.
     */
    getPropertyByName(name: string): MonopolyProperty | undefined {
        return this.properties.find(property => property.name === name);
    }
    getPropertiesByType(type: string): MonopolyProperty[] {
        return this.properties.filter(property => property.type === type);
    }
    getTotalPropertyValue(): number {
        return this.properties.reduce((total, property) => total + property.cost, 0);
    }
    getPropertyWithHighestRent(): MonopolyProperty | undefined {
        return this.properties.reduce((maxRentProperty, property) =>
            property.rent > maxRentProperty.rent ? property : maxRentProperty
        );
    }
    getTotalRent(): number {
        return this.properties.reduce((total, property) => {
            if (property.rent) {
                return total + property.rent;
            } else {
                return total;
            }
        }, 0);
    }

    getPropertiesByGroup(groupNumber: number): Property[] {
        return this.properties.filter(property => property.group.includes(groupNumber));
    }
    /**
     * Starts the Monopoly game session, managing player turns until the game over condition is met.
     * Stops the message collector and logs "Game Over" when the game ends.
     * @returns A promise that resolves when the game is over.
     */
    public async startGame(): Promise<void> {
        while (!this.gameOverConditionMet()) {
            await this.manageTurns();
        }
        this.messageCollector.stop();
        console.log("Game Over");
    }

    /**
     * Checks if the game over condition is met by determining if there is only one active player left in the game.
     * @returns True if the game over condition is met, false otherwise.
     */
    public async gameOverConditionMet(): Promise<boolean> {
        const activePlayers = this.players.filter((player) => !player.hasLeftGame);
        return activePlayers.length === 1;
    }

    /**
     * Manages player turns in the game by listening for player input events.
     */
    public async manageTurns(): Promise<void> {
        this.messageCollector.on("collect", async () => {
            const currentPlayer = this.currentPlayer;

            MakeDiceRoll(currentPlayer);

            if (!currentPlayer.isJailed) {
                this.updateCurrentPlayerIndex();
            }
        });
    }

    /**
     * Handles a chance card for a specified player, drawing and executing the card effect.
     * @param player - The player receiving the chance card.
     */
    public async handleChanceCard(player: Player): Promise<void> {
        const drawnCard = await this.chanceCardHandler.drawChanceCard();
        this.chanceCardHandler.handleChanceCard(player, drawnCard);
    }

    /**
     * Handles a community chest card for a specified player, drawing and executing the card effect.
     * @param player - The player receiving the community chest card.
     */
    public async handleCommunityCard(player:MonopolyPlayer): Promise<void> {
        const drawnCard = await this.communityCardHandler.drawCommunityCard();
        this.communityCardHandler.handleCommunityCard(player, drawnCard);
    }
}