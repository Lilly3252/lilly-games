import { MonopolyGame } from "./monopoly";

export type CardType = 'advance' | 'pay' | 'collect' | 'move' | 'jail' | 'back' | 'repairs' | 'spend' | 'spend-each-player' | 'fine' | 'tax' | 'jail-card' | 'earn-each-player' | 'improvement';

export class Card {
    type: CardType;
    description: string;
    amount: number | string | number[];
    action: (game: MonopolyGame, player: any) => void;

    constructor(type: CardType, description: string, amount: number | string | number[]) {
        this.type = type;
        this.description = description;
        this.amount = amount;
        this.action = this.getActionFunction(type, amount);
    }

    private getActionFunction(type: CardType, amount: number | string | number[]): (game: MonopolyGame, player: any) => void {
        switch (type) {
            case 'advance':
                return (game, player) => advanceAction(amount as string | number, game, player);
            case 'pay':
                return (game, player) => payAction(amount as number, player);
            case 'collect':
                return (game, player) => collectAction(amount as number, player);
            case 'move':
                return (game, player) => moveAction(amount as string | number, game, player);
            case 'jail':
                return (game, player) => jailAction(player);
            case 'back':
                return (game, player) => backAction(amount as number, player, game);
            case 'repairs':
                return (game, player) => repairsAction(amount as number[], player);
            case 'spend':
                return (game, player) => payAction(amount as number, player);
            case 'spend-each-player':
                return (game, player) => spendEachPlayerAction(amount as number, player, game);
            case 'fine':
                return (game, player) => fineAction(amount as number, player);
            case 'tax':
                return (game, player) => taxAction(amount as number, player);
            case 'jail-card':
                return (game, player) => jailCardAction(player);
            case 'earn-each-player':
                return (game, player) => earnEachPlayerAction(amount as number, player, game);
            case 'improvement':
                return (game, player) => improvementAction(amount as number[], player);
            default:
                return () => console.log('Unknown action');
        }
    }

    static fromJSON(json: any): Card {
        return new Card(json.type, json.description, json.amount);
    }

    toJSON(): any {
        return {
            type: this.type,
            description: this.description,
            amount: this.amount,
            action: this.action.toString()
        };
    }
}
// Define action functions
function advanceAction(amount: number | string, game: MonopolyGame, player: any) {
    if (typeof amount === 'number') {
        player.move(amount, game.board);
    } else if (amount === 'utility') {
        // Logic to move to the nearest utility
        const nearestUtility = game.board.find(space => space.type === 'utility');
        if (nearestUtility) {
            player.position = nearestUtility.position;
        }
    } else if (amount === 'railroad') {
        // Logic to move to the nearest railroad
        const nearestRailroad = game.board.find(space => space.type === 'railroad');
        if (nearestRailroad) {
            player.position = nearestRailroad.position;
        }
    }
    console.log(`Advance by ${amount}`);
}

function payAction(amount: number, player: any) {
    player.money -= amount;
    console.log(`Pay ${amount}`);
}

function collectAction(amount: number, player: any) {
    player.money += amount;
    console.log(`Collect ${amount}`);
}

function moveAction(amount: number | string, game: MonopolyGame, player: any) {
    if (typeof amount === 'number') {
        player.move(amount, game.board);
    } else {
        // Logic to move to a specific location
        const targetSpace = game.board.find(space => space.name === amount);
        if (targetSpace) {
            player.position = targetSpace.position;
        }
    }
    console.log(`Move to ${amount}`);
}

function jailAction(player: any) {
    player.inJail = true;
    console.log('Go to Jail');
}

function backAction(amount: number, player: any, game: MonopolyGame) {
    player.move(-amount, game.board);
    console.log(`Go back ${amount} spaces`);
}

function repairsAction(amount: number[], player: any) {
    const houses = player.properties.reduce((acc: number, property: any) => acc + property.houses, 0);
    const hotels = player.properties.reduce((acc: number, property: any) => acc + property.hotels, 0);
    const totalCost = (houses * amount[0]) + (hotels * amount[1]);
    player.money -= totalCost;
    console.log(`Pay ${amount[0]} per house and ${amount[1]} per hotel`);
}

function spendEachPlayerAction(amount: number, player: any, game: MonopolyGame) {
    game.players.forEach((p: any) => {
        if (p !== player) {
            player.money -= amount;
            p.money += amount;
        }
    });
    console.log(`Pay each player ${amount}`);
}

function fineAction(amount: number, player: any) {
    player.money -= amount;
    console.log(`Pay fine of ${amount}`);
}

function taxAction(amount: number, player: any) {
    player.money -= amount;
    console.log(`Pay tax of ${amount}`);
}

function jailCardAction(player: any) {
    player.getOutOfJailFreeCards += 1;
    console.log('Get out of Jail free card');
}

function earnEachPlayerAction(amount: number, player: any, game: MonopolyGame) {
    game.players.forEach((p: any) => {
        if (p !== player) {
            player.money += amount;
            p.money -= amount;
        }
    });
    console.log(`Collect ${amount} from each player`);
}

function improvementAction(amount: number[], player: any) {
    const houses = player.properties.reduce((acc: number, property: any) => acc + property.houses, 0);
    const hotels = player.properties.reduce((acc: number, property: any) => acc + property.hotels, 0);
    const totalCost = (houses * amount[0]) + (hotels * amount[1]);
    player.money -= totalCost;
    console.log(`Pay ${amount[0]} per house and ${amount[1]} per hotel`);
}
