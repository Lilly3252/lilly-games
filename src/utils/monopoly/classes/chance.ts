import { ChanceCard } from "#utils/types/index.js";
import chanceCardsData from "./../JSON/chance.json";
import { Player } from "./player.js";

export class ChanceCardHandler {
	private chanceCards: ChanceCard[];

	constructor() {
		this.chanceCards = chanceCardsData;
	}

	public drawChanceCard(): any {
		const cardIndex = Math.floor(Math.random() * this.chanceCards.length);
		return this.chanceCards[cardIndex];
	}

	public handleAdvance(player: Player, amount: number | string): void {
		if (amount === "utility") {
			// Handle advance to the nearest Discord Server logic
		} else if (amount === "railroad") {
			// Handle advance to the nearest Discord Train Station logic
		}
	}

	public handleEarn(player: Player, amount: number): void {
		player.receiveMoney(amount);
	}

	public handleJailCard(player: Player): void {
		player.ownsFreedomChance = true;
	}

	public handleBack(player: Player, amount: number): void {
		player.move(amount);
	}

	public handleJail(player: Player): void {
		player.goToJail();
	}

	public handleRepairs(player: Player, houseRepairCost: number, hotelRepairCost: number): void {
		// Handle repairs on player's property logic
	}

	public handleSpend(player: Player, amount: number): void {
		player.payMoney(amount);
	}

	public handleSpendEachPlayer(players: Player[], amount: number): void {
		for (const otherPlayer of players) {
			otherPlayer.receiveMoney(amount);
			player.payMoney(amount);
		}
	}

	public handleFine(player: Player, amount: number): void {
		player.payMoney(amount);
	}

	public handleTax(player: Player, amount: number): void {
		player.payMoney(amount);
	}

	// Add functions to handle other types of chance cards

	// Add any additional logic needed for handling specific chance cards
}
