import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { Player } from "#structures/monopoly/classes/players";

export class AIPlayer extends Player {
    constructor(name: string) {
        super(name);
    }

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

    async buyProperty(space: any) {
        if (this.money >= space.cost) {
            this.money -= space.cost;
            this.properties.push(space);
            space.owner = this.name;
            console.log(`${this.name} bought ${space.name}`);
            await this.save();
        }
    }

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
