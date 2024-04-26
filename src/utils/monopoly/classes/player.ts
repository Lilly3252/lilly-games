import { BoardSpace, BoardData, Property, PropertyMap, BoardSpaceOrProperty, PlayerCreationData } from "#utils/types/monopoly.js";
import { ChatInputCommandInteraction } from "discord.js";
import jsonData from "../JSON/board.json" with { type: "json" };

export const propertiesData = Object.fromEntries(jsonData.map((item: BoardSpace) => [item.name, item])) as Record<string, BoardSpace>;

export class Player {
	constructor({ name, balance, guildMember, propertyMap, board }: PlayerCreationData) {
		this.name = name;
		this._position = 0;
		this.balance = balance;
		this.id = guildMember.id;
		this.username = guildMember.displayName;
		this.properties = propertyMap;
		this.board = board;
		this.isJailed = false;
		this.ownsFreedomCommunity = false;
		this.ownsFreedomChance = false;
		this.hasLeftGame = false;
	}

	public name: string;
	public properties: PropertyMap;
	public balance: number;
	public board: BoardData;
	public _position: number = 0;
	public interaction: ChatInputCommandInteraction;
	public username: string;
	public id: string;
	public cash: number;
	public isJailed: boolean;
	public ownsFreedomCommunity: boolean;
	public ownsFreedomChance: boolean;
	public hasLeftGame: boolean;
	public doublesCount: number;
	public rollsCount: number;

	public get position() {
		return this.board[this._position];
	}

	incrementDoublesCount(): void {
		this.doublesCount++;
	}

	resetDoublesCount(): void {
		this.doublesCount = 0;
	}

	incrementRollsCount(): void {
		this.rollsCount++;
	}

	getOutOfJail(): void {
		this.isJailed = false;
	}
	calculateRepairCost(houseCost: number, hotelCost: number) {
		if (typeof this.properties !== "object" || this.properties === null) {
			throw new Error("Invalid properties data");
		}

		const property = this.properties as unknown as Property;

		const totalHouseCost = property.houses * houseCost;
		const totalHotelCost = property.hotels * hotelCost;

		const totalRepairCost = totalHouseCost + totalHotelCost;
		return totalRepairCost;
	}
	public async move(number: number): Promise<void> {
		const newPosition = (this._position + number) % this.board.length;

		if (newPosition < this._position) {
			await this.receiveMoney(200);
		}

		this._position = newPosition;
		await this.interaction.reply(`${this.username} moved to ${this.position.name}`);
	}

	public receiveMoney(amount: number): void {
		this.balance += amount;
	}

	public goToJail(): void {
		this.resetDoublesCount();
		this.isJailed = true;
		this._position = 10; // Assuming jail position is 10
	}

	public payMoney(amount: number): void {
		if (this.balance >= amount) {
			this.balance -= amount;
		} else {
			console.log(`${this.username} does not have enough balance to pay ${amount} dollars.`);
		}
	}
	public toggleMortgage(propertyToMortgage: string): void {
		const ownedProperty = this.properties[propertyToMortgage] as unknown as BoardSpaceOrProperty;

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

	public toggleUnmortgage(propertyToUnmortgage: string): void {
		const ownedProperty = this.properties[propertyToUnmortgage] as unknown as BoardSpaceOrProperty;

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
