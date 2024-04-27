import { Player } from "./player.js";
import { CommunityCard } from "#utils/types/index.js";
import communityCardsData from "./../JSON/community.json";
import { Monopoly } from "./monopoly.js";
/**
 * Represents a handler for community cards in the Monopoly game.
 */
export class CommunityCardHandler {
	public communityCards: CommunityCard[]; // An array of community cards
	public players: Monopoly["players"]; // Reference to the players in the Monopoly game

	/**
	 * Constructor for CommunityCardHandler class.
	 * Initializes the community cards with data from a JSON file.
	 */
	constructor() {
		/**
		 * Initialize community cards with data from JSON
		 */
		this.communityCards = communityCardsData;
	}

	/**
	 * Draw a random community card from the available set of community cards.
	 * @returns A random CommunityCard object.
	 */
	public async drawCommunityCard(): Promise<CommunityCard> {
		const cardIndex = Math.floor(Math.random() * this.communityCards.length);
		return this.communityCards[cardIndex];
	}

	/**
	 * Handle the effect of a community card on a player.
	 * @param player The player affected by the community card.
	 * @param card The CommunityCard object representing the community card drawn.
	 */
	public async handleCommunityCard(player: Player, card: CommunityCard): Promise<void> {
		switch (card.type) {
			case "advance":
				await this.handleAdvance(player, card.amount);
				break;
			case "earn":
				await this.handleEarn(player, Number(card.amount));
				break;
			case "spend":
				await this.handleSpend(player, Number(card.amount));
				break;
			case "jail-card":
				this.handleJailCard(player);
				break;
			case "jail":
				await this.handleJail(player);
				break;
			case "earn-each-player":
				await this.handleSpendEachPlayer(this.players, Number(card.amount));
				break;
			case "repairs":
				await this.handleRepairs(player, card.amount[0], card.amount[1]);
				break;
			// Add additional cases for other types of community cards as needed
			default:
				console.log("Invalid community card type");
				break;
		}
	}
	/**
	 * Move the player by a specified number of steps.
	 * @param player The player to move.
	 * @param amount The number of steps to move the player by.
	 */
	public async handleAdvance(player: Player, amount: number | number[]) {
		await player.move(Number(amount));
	}

	/**
	 * Give the player a certain amount of money.
	 * @param player The player to give money to.
	 * @param amount The amount of money to give to the player.
	 */
	public async handleEarn(player: Player, amount: number) {
		await player.receiveMoney(amount);
	}

	/**
	 * Make the player pay a certain amount of money.
	 * @param player The player who needs to pay.
	 * @param amount The amount of money the player needs to pay.
	 */
	public async handleSpend(player: Player, amount: number) {
		await player.payMoney(amount);
	}

	/**
	 * Handle the effect of a "get out of jail free" card on the player.
	 * @param player The player who receives the card.
	 */
	public handleJailCard(player: Player) {
		player.ownsFreedomChance = true;
	}

	/**
	 * Send the player to jail.
	 * @param player The player to send to jail.
	 */
	public async handleJail(player: Player) {
		await player.goToJail();
	}
	/**
	 * Make each player in the provided array pay a specified amount of money.
	 * @param players An array of players who need to pay.
	 * @param amount The amount of money each player needs to pay.
	 * @returns The total amount paid by all players.
	 * @throws Error if the provided players data is invalid.
	 */
	public async handleSpendEachPlayer(players: Player[], amount: number): Promise<number> {
		if (!Array.isArray(players) || players.length === 0) {
			throw new Error("Invalid players data");
		}
		const totalPlayers = players.length;

		const totalPayment = amount * totalPlayers;

		players.forEach(async (player) => {
			await player.payMoney(amount);
		});

		return totalPayment;
	}

	/**
	 * Handle the repair costs for houses and hotels owned by the player.
	 * @param player The player who needs to pay for repairs.
	 * @param house An array containing the cost of repairs for houses.
	 * @param hotel An array containing the cost of repairs for hotels.
	 */
	public async handleRepairs(player: Player, house: Array<number>, hotel: Array<number>) {
		const houseCost = house[0];
		const hotelCost = hotel[1];

		// Calculate total repair cost based on player's properties
		await player.calculateRepairCost(houseCost, hotelCost);
	}

	// Implement handleAdvance, handleEarn, handleSpend, handleJailCard, handleJail, handleRepairs and any other required functions based on the JSON data
}
