import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { Player } from "#structures/monopoly/classes/players";

/**
 * Represents an AI player in the Monopoly game.
 */
export class AIPlayer extends Player {
    /**
     * Creates an instance of AIPlayer.
     * @param name - The name of the AI player.
     */
    constructor(name: string) {
        super(null, true);
        this.name = name;
    }

    /**
     * Makes a move for the AI player.
     * @param game - The Monopoly game instance.
     */
    async makeMove(game: MonopolyGame) {
        this.handleJailSituation();
        const diceRoll = game.rollDice();
        this.move(diceRoll, game.board);
        const currentBoardSpaceName = this.getCurrentBoardSpaceName(game.board);
        console.log(`${this.name} rolled a ${diceRoll} and moved to ${currentBoardSpaceName} (position ${this.position})!`);

        // Handle landing on a space (e.g., property, Chance, Community Chest)
        game.handleSpace(this);

        // Save player data to the database
        await game.savePlayerData(this);
    }

    /**
     * Buys a property for the AI player.
     * @param space - The space representing the property to buy.
     */
    async buyProperty(space: any) {
        if (this.money >= space.cost) {
            this.money -= space.cost;
            this.properties.push(space);
            space.owner = this.name;
            console.log(`${this.name} bought ${space.name}`);
            await this.save();
        }
    }

    /**
     * Manages the properties of the AI player.
     * @param game - The Monopoly game instance.
     */
    async manageProperties(game: MonopolyGame) {
        for (const property of this.properties) {
            const groupProperties = game.board.filter(space => space.group.includes(property.group[0]));
            const ownsAllInGroup = groupProperties.every(space => space.owner === this.name as unknown as Player);

            if (ownsAllInGroup && this.money >= property.house) {
                property.houses++;
                this.money -= property.house;
                console.log(`${this.name} built a house on ${property.name}`);
                await this.save();
            }
        }
    }

    /**
     * Proposes a trade with other players.
     * @param game - The Monopoly game instance.
     */
    async proposeTrade(game: MonopolyGame) {
        for (const player of game.players) {
            if (player !== this) {
                for (const property of this.properties) {
                    if (!property.group.includes(player.properties[0].group[0])) {
                        // Propose a trade
                        console.log(`${this.name} proposes a trade with ${player.name}`);
                        const tradeSuccessful = await this.executeTrade(player, property);
                        if (tradeSuccessful) {
                            console.log(`Trade successful: ${this.name} traded ${property.name} with ${player.name}`);
                        } else {
                            console.log(`Trade failed: ${this.name} could not trade ${property.name} with ${player.name}`);
                        }
                    }
                }
            }
        }
    }

    /**
     * Executes a trade with another player.
     * @param player - The player to trade with.
     * @param property - The property to trade.
     * @returns A promise that resolves to a boolean indicating whether the trade was successful.
     */
    async executeTrade(player: Player, property: any): Promise<boolean> {
        const offerAmount = property.cost * 1.2; //  120% 
        if (player.money >= offerAmount) {
            player.money -= offerAmount;
            this.money += offerAmount;
            player.properties.push(property);
            this.properties = this.properties.filter(p => p.name !== property.name);
            await player.save();
            await this.save();
            return true;
        }
        return false;
    }

    /**
     * Handles the jail situation for the AI player.
     */
    handleJailSituation() {
        if (this.inJail) {
            if (this.getOutOfJailFreeCards > 0) {
                this.getOutOfJailFreeCards--;
                this.inJail = false;
                console.log(`${this.name} used a Get Out of Jail Free card`);
            } else if (this.money >= 50) {
                this.money -= 50;
                this.inJail = false;
                console.log(`${this.name} paid to get out of jail`);
            }
        }
    }
}
