import { Player } from "./player.js";
import { CommunityCard } from "#utils/types/index.js";
import communityCardsData from "./../JSON/community.json";
import { Monopoly } from "./monopoly.js";

export class CommunityCardHandler {
	private communityCards: CommunityCard[];
	private players: Monopoly["players"];

	constructor() {
		this.communityCards = communityCardsData;
	}

	public drawCommunityCard(): CommunityCard {
		const cardIndex = Math.floor(Math.random() * this.communityCards.length);
		return this.communityCards[cardIndex];
	}

	public handleCommunityCard(player: Player, card: CommunityCard): void {
		switch (card.type) {
			case "advance":
				this.handleAdvance(player, card.amount);
				break;
			case "earn":
				this.handleEarn(player, Number(card.amount));
				break;
			case "spend":
				this.handleSpend(player, Number(card.amount));
				break;
			case "jail-card":
				this.handleJailCard(player);
				break;
			case "jail":
				this.handleJail(player);
				break;
			case "earn-each-player":
				this.handleSpendEachPlayer(this.players, Number(card.amount));
				break;
			case "repairs":
				this.handleRepairs(player, card.amount[0], card.amount[1]);
				break;
			// Add additional cases for other types of community cards as needed
			default:
				console.log("Invalid community card type");
				break;
		}
	}
	handleAdvance(player: Player, amount: number | number[]) {
		player.move(Number(amount));
	}
	handleEarn(player: Player, amount: number) {
		player.receiveMoney(amount);
		// TODO : Handle this according to JSON data
	}
	handleSpend(player: Player, amount: number) {
		player.payMoney(amount);
		// TODO : Handle this according to JSON data
	}
	handleJailCard(player: Player) {
		// TODO : Handle this according to JSON data
		player.ownsFreedomChance = true;
	}
	handleJail(player: Player) {
		player.goToJail();
		// TODO : Handle this according to JSON data
	}
	handleSpendEachPlayer(player: Player[], amount: number) {
		if (!Array.isArray(player) || player.length === 0) {
			throw new Error("Invalid players data");
		}
		const totalPlayers = player.length;

		// Calculate total amount to be paid to all players
		const totalPayment = amount * totalPlayers;

		// Deduct the total payment from the player's balance
		player.forEach((player) => {
			player.payMoney(amount);
		});

		return totalPayment;
		// TODO : Handle this according to JSON data
	}
	handleRepairs(player: Player, house: Array<number>, hotel: Array<number>) {
		const houseCost = house[0];
		const hotelCost = hotel[1];

		// Calculate total repair cost based on player's properties
		player.calculateRepairCost(houseCost, hotelCost);
	}

	// Implement handleAdvance, handleEarn, handleSpend, handleJailCard, handleJail, handleRepairs and any other required functions based on the JSON data
}
