import { calculateHotel, calculateHouse } from "#database/functions";
import { ChanceCard, MonopolyPlayerProperty, Players } from "#type/index.js";
import { isNumber } from "lodash";
import { goToJail } from "../functions/functions ";
import boardData from "./../JSON/board.json";
import chanceCardsData from "./../JSON/chance.json";
import { Monopoly } from "./monopoly.js";
import MonopolyPlayer from "./player.js";

/**
 * A class representing a handler for chance cards in Monopoly game
 */
export class ChanceCardHandler {
	/**
	 * @property {ChanceCard[]} chanceCards - Array of chance cards
	 * @property {BoardData} board - Data of the game board
	 * @property {Monopoly["players"]} players - Array of players in the game
	 */
	private chanceCards: ChanceCard[];
	
	private players: Monopoly["players"];
	board:typeof  boardData;
	/**
	 * Creates an instance of ChanceCardHandler.
	 */
	constructor() {
		this.chanceCards = chanceCardsData;
		this.board = boardData;
	}
	/**
	 * Draws a random chance card from the deck.
	 * @returns {ChanceCard} The drawn chance card
	 */
	public async drawChanceCard(): Promise<ChanceCard> {
		const cardIndex = Math.floor(Math.random() * this.chanceCards.length);
		return this.chanceCards[cardIndex];
	}
	/**
	 * Handles the effect of a chance card on a player.
	 * @param {Player} player - The player affected by the chance card
	 * @param {ChanceCard} card - The chance card drawn
	 */
	public async handleChanceCard(player: MonopolyPlayer, card: ChanceCard): Promise<void> {
		switch (card.type) {
			case "advance":
				await this.handleAdvance(player, Number(card.amount));
				break;
			case "earn":
				await this.handleEarn(player, Number(card.amount));
				break;
			case "jail-card":
				this.handleJailCard(player);
				break;
			case "back":
				await this.handleBack(player);
				break;
			case "jail":
				await this.handleJail(player);
				break;
			case "repairs":
				//await this.handleRepairs(player,player.properties);
				break;
			case "spend":
				await this.handleSpend(player, Number(card.amount));
				break;
			case "spend-each-player":
				await this.handleSpendEachPlayer(this.players, Number(card.amount));
				break;
			case "fine":
				await this.handleFine(player, Number(card.amount));
				break;
			case "tax":
				await this.handleTax(player, Number(card.amount));
				break;
			default:
				console.log("Invalid chance card type");
				break;
		}
	}
	/**
	 * Handles the advance action of a chance card on a player.
	 * @param {Player} player - The player advancing on the board
	 * @param {string | number | number[]} amount - The amount to advance
	 */
	public async handleAdvance(player: MonopolyPlayer, amount:string |number ) {
		if (isNumber(amount)) {
			const amountPosition = this.board[amount];
			player.move({ number: Number(amountPosition) });
			if (player.playerPosition() && player.board[await player.playerPosition()] > amountPosition) {
				player.receiveMoney({ amount: 200 } );
			}
		} else if (amount === "utility") {
			const closestUtilityIndex = await this.findClosestUtility(player.board[await player.playerPosition()].name);
			if (closestUtilityIndex !== -1) {
				player.receiveMoney({ amount: 200 });
				player.move({ number: closestUtilityIndex });
			}
		} else if (amount === "railroad") {
			const closestRailroadIndex = await this.findClosestRailroad(player.board[await player.playerPosition()].name);
			if (closestRailroadIndex !== -1) {
				player.receiveMoney({ amount: 200 });
				player.move({ number: closestRailroadIndex });
			}
		}
	}
	/**
	 * Finds the index of the closest utility to the player's position.
	 * @param {string} playerPositionName - The name of the player's current position
	 * @returns {number} The index of the closest utility space
	 */
	public async findClosestUtility(playerPositionName: string): Promise<number> {
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
	/**
	 * Finds the index of the closest railroad to the player's position.
	 * @param {string} playerPositionName - The name of the player's current position
	 * @returns {number} The index of the closest railroad space
	 */
	public async findClosestRailroad(playerPositionName: string): Promise<number> {
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
	/**
	 * Handles the earn action of a chance card for a player.
	 * @param {Player} player - The player earning money
	 * @param {number} amount - The amount earned
	 */
	public async handleEarn(player: MonopolyPlayer, amount: number) {
		player.receiveMoney({ amount });
	}
	/**
	 * Handles the jail card action of a chance card for a player.
	 * @param {Player} player - The player who receives the jail card
	 */
	public handleJailCard(player: MonopolyPlayer) {
		player.setOwnsFreedomChance(true)
	}
	/**
	 * Handles the back action of a chance card for a player.
	 * @param {Player} player - The player moving back on the board
	 */
	public async handleBack(player: MonopolyPlayer) {
		player.move({ number: -3 });
	}
	/**
	 * Handles the jail action of a chance card for a player.
	 * @param {Player} player - The player going to jail
	 */
	public handleJail(player: MonopolyPlayer) {
		goToJail(player);
	}
	/**
	 * Handles the repairs action of a chance card for a player.
	 * @param {Player} player - The player
	 * @param {MonopolyPlayerProperty} properties the property
	 * 
	 * @todo UN BREAK THIS 
	 */
	public async handleRepairs(player:MonopolyPlayer,properties:MonopolyPlayerProperty):Promise<number> {
		 const house = (await calculateHouse(player.user.id , properties.name))
		 const hotel = (await calculateHotel(player.user.id , properties.name))
			 const totalOfEverything = house * 25 + hotel * 100
			 return totalOfEverything
	}
	/**
	 * Handles the spend action of a chance card for a player.
	 * @param {Player} player - The player paying money
	 * @param {number} amount - The amount to spend
	 */
	public async handleSpend(player: Players, amount: number) {
		await player.payMoney({ amount });
	}
	/**
	 * Handles the spend-each-player action of a chance card for all players.
	 * @param {Player[]} player - Array of players in the game
	 * @param {number} amount - The amount to be spent by each player
	 * @returns {number} The total amount spent by all players
	 */
	public async handleSpendEachPlayer(player: Players[], amount: number): Promise<number> {
		if (!Array.isArray(player) || player.length === 0) {
			throw new Error("Invalid players data");
		}
		const totalPlayers = player.length;

		// Calculate total amount to be paid to all players
		const totalPayment = amount * totalPlayers;

		// Deduct the total payment from the player's balance
		player.forEach(async (player) => {
			await player.payMoney({ amount:amount });
		});

		return totalPayment;
	}
	/**
	 * Handles the fine action of a chance card for a player.
	 * @param {Player} player - The player paying a fine
	 * @param {number} amount - The amount of the fine
	 */
	public async handleFine(player: Players, amount: number) {
		await player.payMoney({ amount:amount });
	}
	/**
	 * Handles the tax action of a chance card for a player.
	 * @param {Player} player - The player paying tax
	 * @param {number} amount - The amount of tax
	 */
	public async handleTax(player: Players, amount: number) {
		await player.payMoney({ amount:amount });
	}
}
