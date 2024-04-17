import { isEqual } from "lodash";
import { InterfaceMonopoly } from "#utils/types/monopoly.js";
import { User } from "discord.js";
import { Session } from "./session.js";
import Board from "./board.json";
export class Player {
	cash: number;
	properties: Map<string, InterfaceMonopoly>;
	isJailed: boolean;
	ownsFreedomChance: boolean;
	ownsFreedomCommunity: boolean;
	_position: number;
	session: Session;
	turnsInJail: number;
	id: string;
	username: string;
	board: InterfaceMonopoly[] = Board;
	constructor(user: User, session: Session) {
		this.id = user.id;
		this.username = user.username;
		this.cash = 1500;
		this.properties = new Map();
		this.isJailed = false;
		this.ownsFreedomChance = false;
		this.ownsFreedomCommunity = false;
		this._position = 0;
		this.session = session;
		this.turnsInJail = 0;
	}

	get canBeFreed() {
		return this.ownsFreedomCommunity || this.ownsFreedomChance;
	}

	get position() {
		return this.board[this._position];
	}

	advance(number: number) {
		const newPosition = this._position + number;

		if (newPosition >= this.board.length) {
			this._position = newPosition - this.board.length;
		} else {
			this._position = newPosition;
		}
		if (newPosition === this.board.length) {
			this.session.stackMessage(`${this.username} reached Go.`);
			this.earn(200);
		} else if (newPosition > this.board.length) {
			this.session.stackMessage(`${this.username} passed by Go.`);
			this.earn(200);
			this.session.stackMessage(`${this.username} stopped at ${this.position.name}.`);
		}
	}

	buy(property, amount: number) {
		this.pay(amount || property.cost);
		property.owner = this;
		this.session.setTakenProperty(property, this);
		this.session.stackMessage(`${this.username} now owns ${property.name}`);
	}
	earn(amount: number) {
		this.cash += amount;
		this.session.stackMessage(`${this.username} earned ${amount}.`);
	}

	jail(reason: string) {
		this.isJailed = true;
		this.session.stackMessage(
			{
				"card": `${this.username} drew a Go to Jail card and was jailed.`,
				"tile": `${this.username} stepped on Go to Jail and was jailed.`,
				"3 doubles": `${this.username} made 3 doubles, and went to jail. `
			}[reason]
		);
	}

	free(reason: string) {
		this.isJailed = false;
		this.session.stackMessage(
			{
				"card": `${this.username} consumed a freedom card and was freed.`,
				"3 turns": `${this.username} stayed in jail for too long and was freed.`,
				"doubles": `${this.username} rolled a double and did a barrel roll out of jail.`,
				"fine": `${this.username} paid some money ($50) and was freed.`
			}[reason]
		);
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
		this.session.stackMessage(`${this.username} went back ${-number} tiles.`);
	}

	ownsTile = (function () {
		return function ownsTile(tile = this.position) {
			return isEqual(tile.owner, this);
		}.bind(Player.prototype);
	})();

	pay(amount: number) {
		this.cash -= amount;
		this.session.stackMessage(`${this.username} paid $${amount}.`);
	}

	releaseProperty(tile, getMoney) {
		tile.owner = undefined;
		if (getMoney) {
			this.earn(tile.cost / 2);
		}
	}
}
