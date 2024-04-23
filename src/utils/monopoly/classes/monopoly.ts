import { PropertyMap, BoardData, DiceRollResult } from "#utils/types/monopoly.js";
import { MessageCollector, TextChannel, CollectorFilter, Message } from "discord.js";
import { Player } from "./player.js";

export class Monopoly {
	public players: Player[];
	public propertyMap: PropertyMap;
	public board: BoardData;
	public currentPlayerIndex: number;
	public messageCollector: MessageCollector;

	public constructor(board: BoardData, propertyMap: PropertyMap, textChannel: TextChannel) {
		this.players = [];
		this.currentPlayerIndex = 0;
		this.propertyMap = propertyMap;
		this.board = board;
		this.messageCollector = textChannel.createMessageCollector({ filter: this.filterByCurrentPlayer });
	}

	public filterByCurrentPlayer: CollectorFilter<[Message<true>]> = (message: Message<true>) => {
		return message.author.id === this.players[this.currentPlayerIndex].id;
	};

	public addPlayer(player: Player): void {
		this.players.push(player);
	}

	public async startGame(): Promise<void> {
		while (!this.gameOverConditionMet()) {
			await this.manageTurns();
		}
		console.log("Game Over");
	}

	public gameOverConditionMet(): boolean {
		const activePlayers = this.players.filter((player) => !player.hasLeftGame);
		return activePlayers.length === 1;
	}

	public async manageTurns(): Promise<void> {
		const totalPlayers = this.players.length;

		const currentPlayer = this.players[this.currentPlayerIndex];

		await this.messageCollector.on("collect", async (message: Message) => {
			if (message.author.id === currentPlayer.id) {
				await this.MakeDiceRoll(currentPlayer);
				this.currentPlayerIndex = (this.currentPlayerIndex + 1) % totalPlayers;
			}
		});
	}

	public throwDice(): DiceRollResult {
		const dice1 = Math.floor(Math.random() * 5) + 1;
		const dice2 = Math.floor(Math.random() * 5) + 1;
		return {
			sum: dice1 + dice2,
			double: dice1 === dice2,
			dice1,
			dice2
		};
	}

	public async MakeDiceRoll(player: Player): Promise<void> {
		let doublesCount: number = 0;

		const rollResult: DiceRollResult = this.throwDice();

		if (rollResult.double) {
			doublesCount++;
			player.move(rollResult.sum);
			if (doublesCount === 3) {
				player.move(10);
				console.log("You rolled three doubles in a row! Go to jail.");
				doublesCount = 0;
			} else {
				console.log("You rolled a double! Advance to the corresponding index on the board and roll again.");
				await this.MakeDiceRoll(player);
			}
		} else {
			console.log("You rolled a sum of " + rollResult.sum);
		}
	}

	public handleProperty(propertyName: string, propertyCost: number, propertyOwner: Player): void {
		const currentPlayer = this.players[this.currentPlayerIndex];
		const property = this.propertyMap[propertyName];

		if (propertyOwner && propertyOwner !== currentPlayer) {
			const rentAmount = propertyOwner.properties[propertyName].mortgaged ? property.mortgage : property.rent;
			console.log(`${currentPlayer.name} pays rent of ${rentAmount} to ${propertyOwner.name}.`);
			// Deduct rent amount from currentPlayer's money and add to propertyOwner's money
		}

		if (currentPlayer.cash < propertyCost) {
			console.log(`${currentPlayer.name} does not have enough money to buy ${propertyName}.`);
			return;
		}

		currentPlayer.cash -= propertyCost;
		currentPlayer.properties.push(propertyName);
		console.log(`${currentPlayer.name} has bought ${propertyName} for ${propertyCost}.`);
	}
}
