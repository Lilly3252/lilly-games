import { GameSession, MonopolyPlayerProperty, Player, Property } from "#type/monopoly.js";
import { ChatInputCommandInteraction, GuildTextBasedChannel, Message, MessageCollector } from "discord.js";

import { MakeDiceRoll } from "../functions/functions .js";
import { ChanceCardHandler } from "./chance.js";
import { CommunityCardHandler } from "./community.js";
import MonopolyPlayer from "./player.js";


/**
 * Represents a Monopoly game session.
 */
export class Monopoly implements GameSession{
    public properties: MonopolyPlayerProperty[];
    /**
     * The list of players in the game.
     */
    public players: MonopolyPlayer[];
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
     * Constructs a new instance of the Monopoly game.
     */
    constructor() {
        this.messageCollector = new MessageCollector(this.textChannel, { filter: this.filterByCurrentPlayer.bind(this) });
        this.players = [];
        
    }

    /**
     * Message filtering function to collect messages only from the current player.
     * @param message - The message to filter.
     * @returns Returns true if the message author is the current player, false otherwise.
     */
    public filterByCurrentPlayer(message: Message): boolean {
        return message.author.id === this.players[this.currentPlayerIndex].user.id;
    }

    /**
     * Adds a new player to the game.
     * @param player - The player object to be added to the game.
     */
    public async addPlayer(player: MonopolyPlayer): Promise<void> {
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
    public get currentPlayer():MonopolyPlayer {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Retrieves the board spaces associated with a specific property name.
     * @param propertyName - The name of the property to retrieve.
     * @returns An array of BoardSpace objects corresponding to the property name.
     */
    getPropertyByName(name: string): MonopolyPlayerProperty | undefined {
        return this.properties.find(property => property.property.name === name);
    }
    getPropertiesByType(type: string): MonopolyPlayerProperty[] {
        return this.properties.filter(property => property.property.type === type);
    }
    getTotalPropertyValue(): number {
        return this.properties.reduce((total, property) => total + property.property.cost, 0);
    }
    getPropertyWithHighestRent(): MonopolyPlayerProperty | undefined {
        return this.properties.reduce((maxRentProperty, property) =>
            property.property.rent > maxRentProperty.property.rent ? property : maxRentProperty
        );
    }
    getTotalRent(): number {
        return this.properties.reduce((total, property) => {
            if (property.property.rent) {
                return total + property.property.rent;
            } else {
                return total;
            }
        }, 0);
    }

    getPropertiesByGroup(groupNumber: number):  MonopolyPlayerProperty[] {
        return this.properties.filter(property => property.property.group.includes(groupNumber));
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
        let interaction:ChatInputCommandInteraction
        this.messageCollector.on("collect", async () => {
            const currentPlayer = this.currentPlayer;


            MakeDiceRoll(interaction , currentPlayer);

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