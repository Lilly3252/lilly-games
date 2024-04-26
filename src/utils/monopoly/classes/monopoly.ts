import { PropertyMap, BoardData, DiceRollResult, MonopolyCreationData } from "#utils/types/monopoly.js";
import { MessageCollector, CollectorFilter, Message } from "discord.js";
import { Player } from "./player.js";
import { ChanceCardHandler } from "./chance.js";
import { CommunityCardHandler } from "./community.js";

export class Monopoly {
	public players: Player[] = [];
	public currentPlayerIndex: number = 0;
	public messageCollector: MessageCollector;
	private chanceCardHandler: ChanceCardHandler = new ChanceCardHandler();
	private communityCardHandler: CommunityCardHandler = new CommunityCardHandler();
	public board: BoardData;
	public propertyMap: PropertyMap;

	constructor({ board, propertyMap, textChannel }: MonopolyCreationData) {
		this.board = board;
		this.propertyMap = propertyMap;
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
				player.payMoney(50);
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
	// TODO : HandleProperty is broken :( !!
	public handleProperty(propertyName: string, propertyCost: number, propertyOwner: Player): void {
		const currentPlayer = this.players[this.currentPlayerIndex];
		//Property 'properties' does not exist on type 'Player[]' ... RAHHHHH
		const property = this.players.properties[propertyName];

		if (propertyOwner && propertyOwner !== currentPlayer) {
			//Property 'mortgaged' does not exist on type 'BoardSpace'. Did you mean 'mortgage'?   ... no bitch i didn't mean that ..
			const rentAmount = propertyOwner.properties[propertyName].mortgaged ? property.mortgage : property.rent;
			console.log(`${currentPlayer.name} pays rent of ${rentAmount} to ${propertyOwner.name}.`);
			currentPlayer.payMoney(rentAmount);
			propertyOwner.receiveMoney(rentAmount);
		}

		if (currentPlayer.cash < propertyCost) {
			console.log(`${currentPlayer.name} does not have enough money to buy ${propertyName}.`);
			this.startAuction(propertyName, propertyCost);
			return;
		}

		currentPlayer.payMoney(propertyCost);
		// Type 'BoardSpace' has no call signatures. , NO SHIT SHERLOCK ..
		currentPlayer.properties.push(propertyName);
		console.log(`${currentPlayer.name} has bought ${propertyName} for ${propertyCost}.`);
	}

	private startAuction(propertyName: string, propertyCost: number): void {
		const currentPlayer = this.players[this.currentPlayerIndex];

		const auctionFilter: CollectorFilter<[Message<true>]> = (message: Message<true>) => {
			return message.author.id === currentPlayer.id && /^bid [0-9]+$/.test(message.content.toLowerCase());
		};

		const auctionCollector = this.messageCollector.channel.createMessageCollector({ filter: auctionFilter });

		let highestBidder: Player = currentPlayer;
		let highestBid: number = propertyCost;

		auctionCollector.on("collect", (message: Message<true>) => {
			const bid = parseInt(message.content.toLowerCase().split(" ")[1]);
			if (bid > highestBid) {
				highestBidder = currentPlayer;
				highestBid = bid;
				console.log(`${highestBidder.name} has made a bid of $${highestBid}.`);
			}
		});

		auctionCollector.on("end", () => {
			if (highestBidder !== currentPlayer) {
				currentPlayer.cash += highestBid;
				currentPlayer.properties.push(propertyName);
				console.log(`${highestBidder.name} has won the auction for ${propertyName} with a bid of $${highestBid}.`);
			} else {
				console.log("No one bid on the property. The property remains unsold.");
			}
		});
	}
	public handleChanceCard(player: Player) {
		const drawnCard = this.chanceCardHandler.drawChanceCard();
		this.chanceCardHandler.handleChanceCard(player, drawnCard);
	}
	public handleCommunityCard(player: Player) {
		const drawnCard = this.communityCardHandler.drawCommunityCard();
		this.communityCardHandler.handleCommunityCard(player, drawnCard);
	}
}
