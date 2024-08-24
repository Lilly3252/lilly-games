import { convertToIPlayer, savePlayerData } from '#database/model/database';
import { MonopolyGame } from '#structures/monopoly/classes/monopoly';
import { Player as PlayerClass } from '#structures/monopoly/classes/players';


export type CardType = 'advance' | 'pay' | 'collect' | 'move' | 'jail' | 'back' | 'repairs' | 'spend' | 'spend-each-player' | 'fine' | 'tax' | 'jail-card' | 'earn-each-player' | 'improvement';

export class Card {
    type: CardType;
    description: string;
    amount: number | string | number[];

    constructor(type: CardType, description: string, amount: number | string | number[]) {
        this.type = type;
        this.description = description;
        this.amount = amount;
    }

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

// Define action functions
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

async function payAction(amount: number, player: PlayerClass) {
    player.money -= amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay ${amount}`);
}

async function collectAction(amount: number, player: PlayerClass) {
    player.money += amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Collect ${amount}`);
}

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

async function jailAction(player: PlayerClass) {
    player.inJail = true;
    await savePlayerData(convertToIPlayer(player));
    console.log('Go to Jail');
}

async function backAction(amount: number, player: PlayerClass, game: MonopolyGame) {
    player.move(-amount, game.board);
    await savePlayerData(convertToIPlayer(player));
    console.log(`Go back ${amount} spaces`);
}

async function repairsAction(amount: number[], player: PlayerClass) {
    const houses = player.properties.reduce((acc: number, property: any) => acc + property.houses, 0);
    const hotels = player.properties.reduce((acc: number, property: any) => acc + property.hotels, 0);
    const totalCost = (houses * amount[0]) + (hotels * amount[1]);
    player.money -= totalCost;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay ${amount[0]} per house and ${amount[1]} per hotel`);
}

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

async function fineAction(amount: number, player: PlayerClass) {
    player.money -= amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay fine of ${amount}`);
}

async function taxAction(amount: number, player: PlayerClass) {
    player.money -= amount;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay tax of ${amount}`);
}

async function jailCardAction(player: PlayerClass) {
    player.getOutOfJailFreeCards += 1;
    await savePlayerData(convertToIPlayer(player));
    console.log('Get out of Jail free card');
}

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

async function improvementAction(amount: number[], player: PlayerClass) {
    const houses = player.properties.reduce((acc: number, property: any) => acc + property.houses, 0);
    const hotels = player.properties.reduce((acc: number, property: any) => acc + property.hotels, 0);
    const totalCost = (houses * amount[0]) + (hotels * amount[1]);
    player.money -= totalCost;
    await savePlayerData(convertToIPlayer(player));
    console.log(`Pay ${amount[0]} per house and ${amount[1]} per hotel`);
}
