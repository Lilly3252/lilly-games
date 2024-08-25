import { getPlayerData, savePlayerData } from "#database/model/database";
import { BoardSpace } from "./boardSpace";
import { Card } from "./card";
import { Deck } from "./deck";
import { Player } from "./players";
import { TurnManager } from "./turnManager";

/**
 * Represents a Monopoly game.
 */
export class MonopolyGame {
    players: Player[];
    board: BoardSpace[];
    turnManager: TurnManager;
    chanceDeck: Deck;
    communityChestDeck: Deck;
    freeParkingMoney: number;

    /**
     * Creates an instance of MonopolyGame.
     * @param players - The players in the game.
     * @param board - The board spaces.
     * @param chanceCards - The Chance cards.
     * @param communityChestCards - The Community Chest cards.
     */
    constructor(players: Player[], board: BoardSpace[], chanceCards: Card[], communityChestCards: Card[]) {
        this.players = players;
        this.board = board;
        this.turnManager = new TurnManager(players);
        this.chanceDeck = new Deck(chanceCards);
        this.communityChestDeck = new Deck(communityChestCards);
        this.freeParkingMoney = 0;
    }

    /**
     * Saves the player data to the database.
     * @param player - The player whose data is to be saved.
     */
    async savePlayerData(player: Player): Promise<void> {
        const playerData = await getPlayerData(player.name);
        if (playerData) {
            playerData.position = player.position;
            playerData.money = player.money;
            playerData.properties = player.properties;
            playerData.inJail = player.inJail;
            playerData.getOutOfJailFreeCards = player.getOutOfJailFreeCards;
            await savePlayerData(playerData);
        }
    }

    /**
     * Adds a player to the game.
     * @param player - The player to add.
     */
    addPlayer(player: Player) {
        this.players.push(player);
        this.turnManager.players = this.players; // Update the TurnManager's player list
    }

    /**
     * Proceeds to the next turn in the game.
     */
    nextTurn() {
        const currentPlayer = this.turnManager.getCurrentPlayer();
        const diceRoll = this.rollDice();
        currentPlayer.move(diceRoll, this.board);

        // Handle landing on a space (e.g., property, Chance, Community Chest)
        this.handleSpace(currentPlayer);

        // Move to the next player
        this.turnManager.nextTurn();
    }

    /**
     * Rolls the dice.
     * @returns The total value of the dice roll.
     */
    rollDice(): number {
        return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    }

    /**
     * Handles the actions when a player lands on a space.
     * @param player - The player who landed on the space.
     */
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
        } else if (space.type === 'free-parking') {
            this.handleFreeParking(player);
        } else if (space.type === 'go') {
            this.handleGo(player);
        } else if (space.type === 'go-to-jail') {
            this.handleGoToJail(player);
        }
    }

    /**
     * Handles the actions when a player lands on a property space.
     * @param player - The player who landed on the property space.
     * @param space - The property space.
     */
    handleProperty(player: Player, space: BoardSpace) {
        // Implement logic for handling property spaces
        console.log(`${player.name} can buy the property ${space.name} for $${space.cost}`);
    }

    /**
     * Handles the actions when a player draws a Chance card.
     * @param player - The player who draws the Chance card.
     */
    handleChance(player: Player) {
        const card = this.drawChanceCard();
        console.log(`${player.name} draws a Chance card: ${card.description}`);
        card.executeAction(this, player);
    }

    /**
     * Handles the actions when a player draws a Community Chest card.
     * @param player - The player who draws the Community Chest card.
     */
    handleCommunityChest(player: Player) {
        const card = this.drawCommunityChestCard();
        console.log(`${player.name} draws a Community Chest card: ${card.description}`);
        card.executeAction(this, player);
    }

    /**
     * Handles the actions when a player lands on a tax space.
     * @param player - The player who landed on the tax space.
     * @param space - The tax space.
     */
    handleTax(player: Player, space: BoardSpace) {
        player.updateMoney(-space.cost);
        this.freeParkingMoney += space.cost;
        console.log(`${player.name} pays $${space.cost} in taxes`);
    }

    /**
     * Sends a player to jail.
     * @param player - The player to send to jail.
     */
    sendToJail(player: Player) {
        player.position = this.board.findIndex(space => space.type === 'jail');
        player.inJail = true;
        console.log(`${player.name} is sent to Jail!`);
    }

    /**
     * Handles the actions when a player lands on the Free Parking space.
     * @param player - The player who landed on the Free Parking space.
     */
    handleFreeParking(player: Player) {
        player.updateMoney(this.freeParkingMoney);
        console.log(`${player.name} collects $${this.freeParkingMoney} from Free Parking`);
        this.freeParkingMoney = 0;
    }

    /**
     * Handles the actions when a player lands on the Go space.
     * @param player - The player who landed on the Go space.
     */
    handleGo(player: Player) {
        player.updateMoney(200);
        console.log(`${player.name} collects $200 for passing Go`);
    }

    /**
     * Handles the actions when a player lands on the Go to Jail space.
     * @param player - The player who landed on the Go to Jail space.
     */
    handleGoToJail(player: Player) {
        this.sendToJail(player);
    }

    /**
     * Draws a Chance card from the deck.
     * @returns The drawn Chance card.
     */
    drawChanceCard(): Card {
        return this.chanceDeck.drawCard();
    }

    /**
     * Draws a Community Chest card from the deck.
     * @returns The drawn Community Chest card.
     */
    drawCommunityChestCard(): Card {
        return this.communityChestDeck.drawCard();
    }
}
