import { isEqual } from "lodash";
import { TMonopoly } from "#utils/types/monopoly.js";
import { ChatInputCommandInteraction } from "discord.js";
import { Session } from "./session.js";
import Board from "./board.json";

export class Player {
	cash: number;
	properties: Map<string, TMonopoly[]>;
	ownsFreedomChance: boolean;
	ownsFreedomCommunity: boolean;
	_position: number;
	session: Session;
	turnsInJail: number;
	id: string;
	username: string;
	board = Board;
	interaction: ChatInputCommandInteraction;
	constructor() {
		this.cash = 1500;
		this.properties = new Map();
		this._position = 0; // referencing the array starting "Go is position 0"
		this.turnsInJail = 0;
	}

	get canBeFreed() {
		return this.ownsFreedomCommunity || this.ownsFreedomChance;
	}

	get position() {
		return this.board[this._position];
	}
	set isJailed(boolean: boolean) {
		if (boolean === true) {
			true;
		} else false;
	}
	advance(number: number) {
		const newPosition = this._position + number;
		const remainder = newPosition % this.board.length;
		if (newPosition >= this.board.length) {
			this.interaction.reply(`${this.username} passed by Go. Collected 200$ and advanced to ${this.position.name}`);
			this.earn(200);
		} else {
			if (remainder === 0) {
				this.interaction.reply(`${this.username} reached Go.`);
				this.earn(200);
			} else {
				this.interaction.reply("not greater than 40 and not a remainder of 0 , so they just moved from A to B without pass go");
			}
		}
	}

	buy(property, amount: number) {
		this.pay(amount || property.cost);
		property.owner = this;
		this.session.setTakenProperty(property, this);
		this.interaction.reply(`${this.username} now owns ${property.name}`);
	}
	earn(amount: number) {
		this.cash += amount;
		this.interaction.reply(`${this.username} earned ${amount}.`);
	}

	jail(reason: string) {
		this.isJailed = true;
		switch (reason) {
			case "card": {
				this.interaction.reply({ content: `${this.username} drew a Go to Jail card and was jailed.` });
				break;
			}
			case "tile": {
				this.interaction.reply({ content: `${this.username} stepped on Go to Jail and was jailed.` });
				break;
			}
			case "3 doubles": {
				this.interaction.reply({ content: `${this.username} made 3 doubles, and went to jail. ` });
				break;
			}
		}
	}

	free(reason: string) {
		this.isJailed = false;
		switch (reason) {
			case "card": {
				this.interaction.reply({ content: `${this.username} consumed a freedom card and was freed.` });
				break;
			}
			case "3 turns": {
				this.interaction.reply({ content: `${this.username} stayed in jail for too long and was freed.` });
				break;
			}
			case "doubles": {
				this.interaction.reply({ content: `${this.username} rolled a double and did a barrel roll out of jail. ` });
				break;
			}
			case "fine": {
				this.interaction.reply({ content: `${this.username} paid some money ($50) and was freed. ` });
				break;
			}
		}
		if (reason === "card") {
			if (this.ownsFreedomCommunity) {
				this.ownsFreedomCommunity = false;
			} else if (this.ownsFreedomChance) {
				this.ownsFreedomChance = false;
			}
		}
	}

	goBack(number: number) {
		this._position -= number;
		if (this._position < 0) {
			this._position += this.board.length;
		}
		this.interaction.reply(`${this.username} went back ${-number} tiles.`);
	}

	ownsTile = (function () {
		return function ownsTile(tile = this.position) {
			return isEqual(tile.owner, this);
		}.bind(Player.prototype);
	})();

	pay(amount: number) {
		this.cash -= amount;
		this.interaction.reply(`${this.username} paid $${amount}.`);
	}

	releaseProperty(tile, getMoney) {
		tile.owner = undefined;
		if (getMoney) {
			this.earn(tile.cost / 2);
		}
	}
}
