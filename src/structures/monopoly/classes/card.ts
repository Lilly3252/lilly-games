import { convertToIPlayer, savePlayerData } from '#database/model/database';
import { MonopolyGame } from '#structures/monopoly/classes/monopoly';
import { Player as PlayerClass } from '#structures/monopoly/classes/players';


export type CardType = 'advance' | 'pay' | 'collect' | 'move' | 'jail' | 'back' | 'repairs' | 'spend' | 'spend-each-player' | 'fine' | 'tax' | 'jail-card' | 'earn-each-player' | 'improvement';
/**
 * Represents a card in the Monopoly game.
 */
export class Card {
    type: CardType;
    description: string;
    amount: number | string | number[];
 /**
     * Creates an instance of Card.
     * @param type - The type of the card.
     * @param description - The description of the card.
     * @param amount - The amount associated with the card.
     */
    constructor(type: CardType, description: string, amount: number | string | number[]) {
        this.type = type;
        this.description = description;
        this.amount = amount;
    }
 /**
     * Executes the action associated with the card.
     * @param game - The Monopoly game instance.
     * @param player - The player executing the action.
     */
    async executeAction(game: MonopolyGame, player: PlayerClass) {
        switch (this.type) {
            case 'advance':
                await advanceAction(this.amount as number | string, game, player);
                break;
            case 'pay':
                await payAction(this.amount as number, player);
                break;
            case 'collect':
                await collectAction(this.amount as number, player);
                break;
            case 'move':
                await moveAction(this.amount as number | string, game, player);
                break;
            case 'jail':
                await jailAction(player);
                break;
            case 'back':
                await backAction(this.amount as number, player, game);
                break;
            case 'repairs':
                await repairsAction(this.amount as number[], player);
                break;
            case 'spend':
                await payAction(this.amount as number, player);
                break;
            case 'spend-each-player':
                await spendEachPlayerAction(this.amount as number, player, game);
                break;
            case 'fine':
                await fineAction(this.amount as number, player);
                break;
            case 'tax':
                await taxAction(this.amount as number, player);
                break;
            case 'jail-card':
                await jailCardAction(player);
                break;
            case 'earn-each-player':
                await earnEachPlayerAction(this.amount as number, player, game);
                break;
            case 'improvement':
                await improvementAction(this.amount as number[], player);
                break;
            default:
                console.log('Unknown action');
        }
    }
}

/**
 * Advances the player by a specified amount.
 * @param amount - The amount to advance.
 * @param game - The Monopoly game instance.
 * @param player - The player to advance.
 */
async function advanceAction(amount: number | string, game: MonopolyGame, player: PlayerClass) {
    if (typeof amount === 'number') {
        player.move(amount, game.board);
    } else if (amount === 'utility') {
        const nearestUtility = game.board.find(space => space.type === 'utility');
        if (nearestUtility) {
            player.position = nearestUtility.position;
        }
    } else if (amount === 'railroad') {
        const nearestRailroad = game.board.find(space => space.type === 'railroad');
        if (nearestRailroad) {
            player.position = nearestRailroad.position;
        }
    }
    await savePlayerData(convertToIPlayer(player));
    console.log(`Advance by ${amount}`);
}
/**
 * Deducts a specified amount from the player's money.
 * @param amount - The amount to deduct.
 * @param player - The player to deduct the amount from.
 */
async function payAction(amount: number, player: PlayerClass) {
    player.money -= amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay ${amount}`);
}
/**
 * Adds a specified amount to the player's money.
 * @param amount - The amount to add.
 * @param player - The player to add the amount to.
 */
async function collectAction(amount: number, player: PlayerClass) {
    player.money += amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Collect ${amount}`);
}
/**
 * Moves the player to a specified location.
 * @param amount - The amount to move.
 * @param game - The Monopoly game instance.
 * @param player - The player to move.
 */
async function moveAction(amount: number | string, game: MonopolyGame, player: PlayerClass) {
    if (typeof amount === 'number') {
        player.move(amount, game.board);
    } else {
        const targetSpace = game.board.find(space => space.name === amount);
        if (targetSpace) {
            player.position = targetSpace.position;
        }
    }
    await savePlayerData(convertToIPlayer(player));
    console.log(`Move to ${amount}`);
}
/**
 * Sends the player to jail.
 * @param player - The player to send to jail.
 */
async function jailAction(player: PlayerClass) {
    player.inJail = true;
    await savePlayerData(convertToIPlayer(player));
    console.log('Go to Jail');
}
/**
 * Moves the player back by a specified amount.
 * @param amount - The amount to move back.
 * @param player - The player to move back.
 * @param game - The Monopoly game instance.
 */
async function backAction(amount: number, player: PlayerClass, game: MonopolyGame) {
    player.move(-amount, game.board);
    await savePlayerData(convertToIPlayer(player));
    console.log(`Go back ${amount} spaces`);
}
/**
 * Charges the player for repairs based on the number of houses and hotels.
 * @param amount - The cost per house and hotel.
 * @param player - The player to charge.
 */
async function repairsAction(amount: number[], player: PlayerClass) {
    const houses = player.properties.reduce((acc: number, property: any) => acc + property.houses, 0);
    const hotels = player.properties.reduce((acc: number, property: any) => acc + property.hotels, 0);
    const totalCost = (houses * amount[0]) + (hotels * amount[1]);
    player.money -= totalCost;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay ${amount[0]} per house and ${amount[1]} per hotel`);
}
/**
 * Charges the player a specified amount to each other player.
 * @param amount - The amount to charge each player.
 * @param player - The player to charge.
 * @param game - The Monopoly game instance.
 */
async function spendEachPlayerAction(amount: number, player: PlayerClass, game: MonopolyGame) {
    game.players.forEach(async (p: PlayerClass) => {
        if (p !== player) {
            player.money -= amount;
            p.money += amount;
            await savePlayerData(convertToIPlayer(p));
        }
    });
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay each player ${amount}`);
}
/**
 * Charges the player a fine.
 * @param amount - The amount of the fine.
 * @param player - The player to charge.
 */
async function fineAction(amount: number, player: PlayerClass) {
    player.money -= amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay fine of ${amount}`);
}

/**
 * Charges the player a tax.
 * @param amount - The amount of the tax.
 * @param player - The player to charge.
 */
async function taxAction(amount: number, player: PlayerClass) {
    player.money -= amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay tax of ${amount}`);
}
/**
 * Gives the player a "Get Out of Jail Free" card.
 * @param player - The player to give the card to.
 */
async function jailCardAction(player: PlayerClass) {
    player.getOutOfJailFreeCards += 1;
    await savePlayerData(convertToIPlayer(player));
    console.log('Get out of Jail free card');
}
/**
 * Collects a specified amount from each other player.
 * @param amount - The amount to collect from each player.
 * @param player - The player to collect the amount.
 * @param game - The Monopoly game instance.
 */
async function earnEachPlayerAction(amount: number, player: PlayerClass, game: MonopolyGame) {
    game.players.forEach(async (p: PlayerClass) => {
        if (p !== player) {
            player.money += amount;
            p.money -= amount;
            await savePlayerData(convertToIPlayer(p));
        }
    });
    await savePlayerData(convertToIPlayer(player));
    console.log(`Collect ${amount} from each player`);
}
/**
 * Charges the player for improvements based on the number of houses and hotels.
 * @param amount - The cost per house and hotel.
 * @param player - The player to charge.
 */
async function improvementAction(amount: number[], player: PlayerClass) {
    const houses = player.properties.reduce((acc: number, property: any) => acc + property.houses, 0);
    const hotels = player.properties.reduce((acc: number, property: any) => acc + property.hotels, 0);
    const totalCost = (houses * amount[0]) + (hotels * amount[1]);
    player.money -= totalCost;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay ${amount[0]} per house and ${amount[1]} per hotel`);
}
