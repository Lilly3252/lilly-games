import { PropertyMap, BoardData, DiceRollResult } from "#utils/types/monopoly.js";
import { MessageCollector, TextChannel, CollectorFilter, Message } from "discord.js";
import { Player } from "./player.js";
import { ChanceCardHandler } from "./chance.js";

export class Monopoly {
	public players: Player[];
	public propertyMap: PropertyMap;
	public board: BoardData;
	public currentPlayerIndex: number;
	public messageCollector: MessageCollector;
	private chanceCardHandler: ChanceCardHandler;

	public constructor(board: BoardData, propertyMap: PropertyMap, textChannel: TextChannel) {
		this.players = [];
		this.currentPlayerIndex = 0;
		this.propertyMap = propertyMap;
		this.board = board;
		this.messageCollector = textChannel.createMessageCollector({ filter: this.filterByCurrentPlayer });
		this.chanceCardHandler = new ChanceCardHandler();
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
		this.messageCollector.stop();
		console.log("Game Over");
	}

	public gameOverConditionMet(): boolean {
		const activePlayers = this.players.filter((player) => !player.hasLeftGame);
		return activePlayers.length === 1;
	}
	public async manageTurns(): Promise<void> {
		this.messageCollector.on("collect", async () => {
			const currentPlayer = this.players[this.currentPlayerIndex];

			await this.MakeDiceRoll(currentPlayer);

			if (!currentPlayer.isJailed) {
				this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
			}
		});
	}

	public throwDice(): DiceRollResult {
		const dice1 = Math.floor(Math.random() * 6) + 1;
		const dice2 = Math.floor(Math.random() * 6) + 1;

		return {
			sum: dice1 + dice2,
			double: dice1 === dice2,
			dice1,
			dice2
		};
	}

	public async MakeDiceRoll(player: Player): Promise<void> {
		const rollResult: DiceRollResult = this.throwDice();

		if (player.isJailed) {
			await this.handleJailLogic(player, rollResult);
		} else {
			await this.standardRollLogic(player, rollResult);
		}
	}

	private async handleJailLogic(player: Player, rollResult: DiceRollResult): Promise<void> {
		player.incrementRollsCount();

		if (rollResult.double) {
			player.isJailed = false;
			console.log("You rolled doubles! Get out of jail for free.");
		} else {
			console.log("You did not roll doubles on roll " + player.rollsCount + ". Pass the turn to the next player.");

			if (player.rollsCount === 3) {
				player.pay(50);
				player.move(rollResult.sum);
				console.log("You did not roll doubles after three attempts. Pay $50 and move " + rollResult.sum + " spaces.");
			} else {
				console.log("Roll again on your next turn.");
			}

			this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
		}
	}

	private async standardRollLogic(player: Player, rollResult: DiceRollResult): Promise<void> {
		if (rollResult.double) {
			player.incrementDoublesCount();

			if (player.doublesCount === 3) {
				player.goToJail();
				console.log("You rolled three doubles in a row! Go to jail.");
			} else {
				player.move(rollResult.sum);
				console.log("You rolled a double! Advance to the corresponding index on the board and roll again.");
			}
		} else {
			player.resetDoublesCount();
			player.move(rollResult.sum);
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
			currentPlayer.cash -= rentAmount;
			propertyOwner.cash += rentAmount;
		}

		if (currentPlayer.cash < propertyCost) {
			console.log(`${currentPlayer.name} does not have enough money to buy ${propertyName}.`);
			return;
		}

		currentPlayer.cash -= propertyCost;
		currentPlayer.properties.push(propertyName);
		console.log(`${currentPlayer.name} has bought ${propertyName} for ${propertyCost}.`);
	}
	public async handleChanceCard(): Promise<void> {
		const chanceCard = this.chanceCardHandler.drawChanceCard();
		//TODO
		// Call functions in ChanceCardHandler to handle the chance card
	}
	public handleCommunityCard() {}
}
