import { BoardSpace, Property } from "#utils/types/monopoly.js";
import { ChatInputCommandInteraction, User } from "discord.js";

import jsonData from "../JSON/board.json" with { type: "json" };
import { Monopoly } from "./monopoly.js";

export const propertiesData = Object.fromEntries(jsonData.map((item: BoardSpace) => [item.name, item])) as Record<string, BoardSpace>;

/**
 * Represents a player in the Monopoly game.
 */
export class Player extends Monopoly {
	/**
	 * The name of the player.
	 */
	name: string;

	/**
	 * The balance of the player.
	 */
	balance: number;

	/**
	 * The ID of the player.
	 */
	id: string;

	/**
	 * The current position of the player on the game board.
	 */
	_position: number;

	/**
	 * The number of consecutive doubles rolled by the player.
	 */
	doublesCount: number;

	/**
	 * The total number of rolls made by the player.
	 */
	rollsCount: number;

	/**
	 * Flag indicating if the player is currently in jail.
	 */
	isJailed: boolean;

	/**
	 * The properties owned by the player.
	 */
	properties: Property[];

	/**
	 * The interaction object for handling player commands in Discord.
	 */
	interaction: ChatInputCommandInteraction;

	/**
	 * The username associated with the player.
	 */
	username: string;

	/**
	 * Flag indicating if the player owns a Freedom Community Chest Card.
	 */
	ownsFreedomCommunity: boolean;

	/**
	 * Flag indicating if the player owns a Freedom Chance Card.
	 */
	ownsFreedomChance: boolean;

	/**
	 * Flag indicating if the player has left the game.
	 */
	hasLeftGame: boolean;

	/**
	 * Constructor for creating a new player object.
	 * @param {string} name The name of the player.
	 * @param {number} balance The initial balance of the player.
	 * @param {User} guildMember The Discord user associated with the player.
	 * @param {BoardSpace[]} board The game board spaces.
	 */
	constructor(name: string, balance: number, guildMember: User, board: BoardSpace[]) {
		super({ board, propertyMap: {}, textChannel: null });
		this.name = name;
		this.balance = balance;
		this.id = guildMember.id;
	}
	/**
	 * Getter method for retrieving the current position of the player on the game board.
	 * @returns The BoardSpace object representing the player's current position on the board.
	 */
	public get position() {
		return this.board[this._position];
	}
	/**
	 * Increment the doubles count for the player when doubles are rolled.
	 */
	incrementDoublesCount(): void {
		this.doublesCount++;
	}

	/**
	 * Reset the doubles count for the player to zero.
	 */
	resetDoublesCount(): void {
		this.doublesCount = 0;
	}

	/**
	 * Increment the total number of rolls made by the player.
	 */
	incrementRollsCount(): void {
		this.rollsCount++;
	}

	/**
	 * Set the player's jail status to false, indicating that they are no longer in jail.
	 */
	getOutOfJail(): void {
		this.isJailed = false;
	}
	/**
	 * Calculate the total repair cost for the player's properties based on the cost of houses and hotels.
	 * @param houseCost The cost of building a house on a property.
	 * @param hotelCost The cost of building a hotel on a property.
	 * @returns The total repair cost for all properties.
	 * @throws Error if the properties data is invalid.
	 */
	calculateRepairCost(houseCost: number, hotelCost: number) {
		if (typeof this.properties !== "object" || this.properties === null) {
			throw new Error("Invalid properties data");
		}
		const totalHouseCost = this.properties.reduce((acc, property) => acc + property.houses * houseCost, 0);
		const totalHotelCost = this.properties.reduce((acc, property) => acc + property.hotels * hotelCost, 0);

		const totalRepairCost = totalHouseCost + totalHotelCost;
		return totalRepairCost;
	}
	/**
	 * Move the player by a specified number of board spaces and handle passing Go.
	 * @param number The number of board spaces to move the player.
	 * @returns A Promise that resolves when the player has finished moving.
	 */
	public async move(number: number): Promise<void> {
		const newPosition = (this._position + number) % this.board.length;

		if (newPosition < this._position) {
			this.receiveMoney(200);
		}

		this._position = newPosition;
		console.log(`${this.username} moved to ${this.position.name}`);
	}
	/**
	 * Increase the player's balance by the specified amount.
	 * @param amount The amount of money to receive.
	 */
	public receiveMoney(amount: number): void {
		this.balance += amount;
	}
	/**
	 * Send the player to jail by setting their position to the jail square, resetting their doubles count, and marking them as jailed.
	 */
	public goToJail(): void {
		this.resetDoublesCount();
		this.isJailed = true;
		this._position = 10;
	}
	/**
	 * Deduct the specified amount from the player's balance if they have enough balance, otherwise log a message indicating insufficient funds.
	 * @param amount The amount of money to pay.
	 */
	public payMoney(amount: number): void {
		if (this.balance >= amount) {
			this.balance -= amount;
		} else {
			console.log(`${this.username} does not have enough balance to pay ${amount} dollars.`);
		}
	}
	/**
	 * Toggle the mortgage status of the specified property owned by the player.
	 * @param propertyToMortgage The name of the property to mortgage.
	 */
	public toggleMortgage(propertyToMortgage: string): void {
		const ownedProperty = this.properties[propertyToMortgage];

		if (!ownedProperty) {
			console.log(`${this.name} does not own the property ${propertyToMortgage}.`);
			return;
		}

		if (ownedProperty.mortgaged) {
			console.log(`${this.name} cannot mortgage ${propertyToMortgage} as it is already mortgaged.`);
			return;
		}

		ownedProperty.mortgaged = true;
		console.log(`${this.name} has mortgaged ${propertyToMortgage} successfully.`);
	}
	/**
	 * Toggle the mortgage status of the specified property owned by the player to unmortgaged.
	 * @param propertyToUnmortgage The name of the property to unmortgage.
	 */
	public toggleUnmortgage(propertyToUnmortgage: string): void {
		const ownedProperty = this.properties[propertyToUnmortgage];

		if (!ownedProperty) {
			console.log(`${this.name} does not own the property ${propertyToUnmortgage}.`);
			return;
		}

		if (!ownedProperty.mortgaged) {
			console.log(`${this.name} cannot unmortgage ${propertyToUnmortgage} as it is not currently mortgaged.`);
			return;
		}

		ownedProperty.mortgaged = false;
		console.log(`${this.name} has unmortgaged ${propertyToUnmortgage} successfully.`);
	}

	/**
	 * Put the player in jail with the specified reason.
	 * @param reason The reason for being jailed - can be "card", "tile", or "3 doubles".
	 * @returns A Promise that resolves once the player is jailed and a message is sent.
	 */
	public async jail(reason: string): Promise<void> {
		this.isJailed = true;

		switch (reason) {
			case "card":
				await this.interaction.reply(`${this.username} was jailed by a Go to Jail card.`);
				break;
			case "tile":
				await this.interaction.reply(`${this.username} landed on Go to Jail and was jailed.`);
				break;
			case "3 doubles":
				await this.interaction.reply(`${this.username} rolled three doubles and was sent to jail.`);
				break;
		}
	}

	/**
	 * Release the player from jail with the specified reason.
	 * @param reason The reason for being released - can be "card", "3 turns", "doubles", or "fine".
	 * @returns A Promise that resolves once the player is released and a message is sent.
	 */
	public async free(reason: string): Promise<void> {
		this.isJailed = false;

		switch (reason) {
			case "card":
				await this.interaction.reply(`${this.username} used a freedom card and got out of jail.`);
				break;
			case "3 turns":
				await this.interaction.reply(`${this.username} served 3 turns in jail and got out.`);
				break;
			case "doubles":
				await this.interaction.reply(`${this.username} rolled doubles and was freed.`);
				break;
			case "fine":
				await this.interaction.reply(`${this.username} paid a $50 fine and was freed.`);
				break;
		}

		if (reason === "card" && (this.ownsFreedomCommunity || this.ownsFreedomChance)) {
			this.ownsFreedomCommunity = false;
			this.ownsFreedomChance = false;
		}
	}
	/**
	 * Release the specified properties owned by the player.
	 * @param propertyToRelease An array of Property objects to release.
	 * @returns A Promise that resolves once the properties are released and a message is sent.
	 */
	public async releaseProperty(propertyToRelease: Property[]): Promise<void> {
		for (const property of propertyToRelease) {
			if (property.owner === this.username) {
				const propertyCost = propertiesData[property.name].cost;
				property.owner = null;

				await this.interaction.reply(`${this.username} released property ${property.name} for ${propertyCost} coins.`);
				return;
			}
		}

		await this.interaction.reply(`${this.username} does not own any of the specified properties.`);
	}

	// other stuff can be added
}
