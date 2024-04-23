import { BoardSpace, BoardData, Property } from "#utils/types/monopoly.js";
import { ChatInputCommandInteraction, User } from "discord.js";
import jsonData from "../JSON/board.json" with { type: "json" };
export const propertiesData = Object.fromEntries(jsonData.map((item: BoardSpace) => [item.name, item])) as Record<string, BoardSpace>;
export class Player {
	public name: string;
	public properties: string[];
	public balance: number;
	public board: BoardData;
	public _position: number;
	public interaction: ChatInputCommandInteraction;
	public username: string;
	public id: string;
	public cash: number;
	public isJailed: boolean;
	public ownsFreedomCommunity: boolean;
	public ownsFreedomChance: boolean;
	public hasLeftGame: boolean;

	public constructor(name: string, user: User, board: BoardData) {
		this.name = name;
		this._position = 0;
		this.balance = 1500;
		this.id = user.id;
		this.username = user.username;
		this.properties = [];
		this.board = board;
		this.cash = 0;
		this.isJailed = false;
		this.ownsFreedomCommunity = false;
		this.ownsFreedomChance = false;
		this.hasLeftGame = false;
	}

	public get position() {
		return this.board[this._position];
	}

	public async move(number: number): Promise<void> {
		const newPosition = (this._position + number) % this.board.length;

		if (newPosition < this._position) {
			await this.earn(200);
		}

		this._position = newPosition;
		await this.interaction.reply(`${this.username} moved to ${this.position.name}`);
	}

	public async earn(amount: number): Promise<void> {
		this.cash += amount;
		await this.interaction.reply(`${this.username} earned $${amount}.`);
	}

	public toggleMortgage(propertyToMortgage: string): void {
		const propertyIndex = this.properties.findIndex((property) => property === propertyToMortgage);

		if (propertyIndex === -1) {
			console.log(`${this.name} does not own the property ${propertyToMortgage}.`);
			return;
		}

		const ownedProperty = this.properties[propertyIndex];

		if (this.board[ownedProperty].mortgaged) {
			console.log(`${this.name} cannot mortgage ${propertyToMortgage} as it is already mortgaged.`);
			return;
		}

		this.board[ownedProperty].mortgaged = true;
		console.log(`${this.name} has mortgaged ${propertyToMortgage} successfully.`);
	}

	public toggleUnmortgage(propertyToUnmortgage: string): void {
		const propertyIndex = this.properties.findIndex((property) => property === propertyToUnmortgage);

		if (propertyIndex === -1) {
			console.log(`${this.name} does not own the property ${propertyToUnmortgage}.`);
			return;
		}

		const ownedProperty = this.properties[propertyIndex];

		if (!this.board[ownedProperty].mortgaged) {
			console.log(`${this.name} cannot unmortgage ${propertyToUnmortgage} as it is not currently mortgaged.`);
			return;
		}

		this.board[ownedProperty].mortgaged = false;
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

	public async pay(amount: number): Promise<void> {
		if (this.balance >= amount) {
			this.balance -= amount;
			await this.interaction.reply(`${this.username} paid ${amount} dollars.`);
		} else {
			await this.interaction.reply(`${this.username} does not have enough balance to pay ${amount} dollars.`);
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
