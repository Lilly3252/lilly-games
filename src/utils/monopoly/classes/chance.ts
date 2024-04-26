import { BoardData, ChanceCard } from "#utils/types/index.js";
import { isNumber } from "lodash";
import chanceCardsData from "./../JSON/chance.json";
import boardData from "./../JSON/board.json";
import { Player } from "./player.js";
import { Monopoly } from "./monopoly.js";

export class ChanceCardHandler {
	private chanceCards: ChanceCard[];
	private board: BoardData;
	private players: Monopoly["players"];

	constructor() {
		this.chanceCards = chanceCardsData;
		this.board = boardData;
	}

	public drawChanceCard(): ChanceCard {
		const cardIndex = Math.floor(Math.random() * this.chanceCards.length);
		return this.chanceCards[cardIndex];
	}
	public handleChanceCard(player: Player, card: ChanceCard): void {
		switch (card.type) {
			case "advance":
				this.handleAdvance(player, card.amount);
				break;
			case "earn":
				this.handleEarn(player, Number(card.amount));
				break;
			case "jail-card":
				this.handleJailCard(player);
				break;
			case "back":
				this.handleBack(player);
				break;
			case "jail":
				this.handleJail(player);
				break;
			case "repairs":
				this.handleRepairs(player, card.amount[1], card.amount[2]);
				break;
			case "spend":
				this.handleSpend(player, Number(card.amount));
				break;
			case "spend-each-player":
				this.handleSpendEachPlayer(this.players, Number(card.amount));
				break;
			case "fine":
				this.handleFine(player, Number(card.amount));
				break;
			case "tax":
				this.handleTax(player, Number(card.amount));
				break;
			default:
				console.log("Invalid chance card type");
				break;
		}
	}
	handleAdvance(player: Player, amount: string | number | number[]) {
		// TODO : Handle this according to JSON data
		if (isNumber(amount)) {
			const amountPosition = this.board[amount].name;
			player.move(Number(amountPosition));
			if (player.position && player.position.name > amountPosition) {
				player.receiveMoney(200);
			}
		} else if (amount === "utility") {
			const closestUtilityIndex = this.findClosestUtility(player.position.name);
			if (closestUtilityIndex !== -1) {
				player.receiveMoney(200);
				player.move(closestUtilityIndex);
			}
		} else if (amount === "railroad") {
			const closestRailroadIndex = this.findClosestRailroad(player.position.name);
			if (closestRailroadIndex !== -1) {
				player.receiveMoney(200);
				player.move(closestRailroadIndex);
			}
		}
	}

	private findClosestUtility(playerPositionName: string): number {
		let closestUtilityIndex = -1;
		let minDistance = Number.MAX_SAFE_INTEGER;

		this.board.forEach((space, index) => {
			if (space.type === "utility") {
				const distance = Math.abs(playerPositionName.localeCompare(space.name));
				if (distance < minDistance) {
					minDistance = distance;
					closestUtilityIndex = index;
				}
			}
		});

		return closestUtilityIndex;
	}

	private findClosestRailroad(playerPositionName: string): number {
		let closestRailroadIndex = -1;
		let minDistance = Number.MAX_SAFE_INTEGER;

		this.board.forEach((space, index) => {
			if (space.type === "railroad") {
				const distance = Math.abs(playerPositionName.localeCompare(space.name));
				if (distance < minDistance) {
					minDistance = distance;
					closestRailroadIndex = index;
				}
			}
		});

		return closestRailroadIndex;
	}

	handleEarn(player: Player, amount: number) {
		player.receiveMoney(amount);
		// TODO : Handle this according to JSON data
	}
	handleJailCard(player: Player) {
		// TODO : Handle this according to JSON data
		player.ownsFreedomChance = true;
	}
	handleBack(player: Player) {
		player.move(-3);
		// TODO : Handle this according to JSON data
	}
	handleJail(player: Player) {
		player.goToJail();
		// TODO : Handle this according to JSON data
	}
	handleRepairs(player: Player, house: Array<number>, hotel: Array<number>) {
		const houseCost = house[0];
		const hotelCost = hotel[1];

		// Calculate total repair cost based on player's properties
		player.calculateRepairCost(houseCost, hotelCost);
	}
	handleSpend(player: Player, amount: number) {
		player.payMoney(amount);
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
	handleFine(player: Player, amount: number) {
		player.payMoney(amount);
		// TODO : Handle this according to JSON data
	}
	handleTax(player: Player, amount: number) {
		player.payMoney(amount);
		// TODO : Handle this according to JSON data
	}
}
