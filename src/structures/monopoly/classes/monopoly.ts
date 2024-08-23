import { BoardSpace } from "./boardSpace";
import { Player } from "./players";
import { TurnManager } from "./turnManager";

export class MonopolyGame {
    players: Player[];
    board: BoardSpace[];
    turnManager: TurnManager;

    constructor(players: Player[], board:BoardSpace[]) {
        this.players = players;
        this.board = board;
        this.turnManager = new TurnManager(players);
    }


    nextTurn() {
        const currentPlayer = this.turnManager.getCurrentPlayer();
        const diceRoll = this.rollDice();
        currentPlayer.move(diceRoll, this.board);

        // Handle landing on a space (e.g., property, Chance, Community Chest)
        this.handleSpace(currentPlayer);

        // Move to the next player
        this.turnManager.nextTurn();
    }

    rollDice(): number {
        return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    }

    handleSpace(player: Player) {
        const space = this.board[player.position];
        console.log(`${player.name} landed on ${space.name}`);

        // Implement logic for handling different types of spaces
        if (space.type === 'property') {
            this.handleProperty(player, space);
        } else if (space.type === 'chance') {
            this.handleChance(player);
        } else if (space.type === 'community-chest') {
            this.handleCommunityChest(player);
        } else if (space.type === 'tax') {
            this.handleTax(player, space);
        } else if (space.type === 'jail') {
            this.sendToJail(player);
        }
    }

    handleProperty(player: Player, space: BoardSpace) {
        // Implement logic for handling property spaces
        console.log(`${player.name} can buy the property ${space.name} for $${space.cost}`);
    }

    handleChance(player: Player) {
        // Implement logic for handling Chance cards
        console.log(`${player.name} draws a Chance card`);
    }

    handleCommunityChest(player: Player) {
        // Implement logic for handling Community Chest cards
        console.log(`${player.name} draws a Community Chest card`);
    }

    handleTax(player: Player, space: BoardSpace) {
        // Implement logic for handling tax spaces
        player.updateMoney(-space.cost);
        console.log(`${player.name} pays $${space.cost} in taxes`);
    }

    sendToJail(player: Player) {
        player.position = this.board.findIndex(space => space.type === 'jail');
        console.log(`${player.name} is sent to Jail!`);
    }
}