import { BoardData, DiceRollResult, MonopolyCreationData, BoardSpaceOrProperty } from "#utils/types/monopoly.js";
import { MessageCollector, CollectorFilter, Message } from "discord.js";
import { Player } from "./player.js";
import { ChanceCardHandler } from "./chance.js";
import { CommunityCardHandler } from "./community.js";
/**
 * Represents a Monopoly game session.
 */
export class Monopoly {
	/**
	 * The list of players in the game.
	 */
	public players: Player[];
	/**
	 * Index of the current player taking the turn.
	 */
	public currentPlayerIndex: number = 0;
	/**
	 * Message collector used to listen for player commands.
	 */
	public messageCollector: MessageCollector;
	/**
	 * Handler for Chance cards.
	 */
	private chanceCardHandler: ChanceCardHandler = new ChanceCardHandler();
	/**
	 * Handler for Community cards.
	 */
	private communityCardHandler: CommunityCardHandler = new CommunityCardHandler();

	/**
	 * The game board data.
	 */
	public board: BoardData;
	/**
	 * A mapping of board spaces or properties.
	 */
	public propertyMap: BoardSpaceOrProperty;
	/**
	 * Constructs a new instance of the Monopoly game.
	 * @param {MonopolyCreationData} options - The creation data for initializing the game.
	 */
	constructor({ board, propertyMap, textChannel }: MonopolyCreationData) {
		this.board = board;
		this.propertyMap = propertyMap;
		this.messageCollector = textChannel.createMessageCollector({ filter: this.filterByCurrentPlayer });
		this.players = [];
	}
	/**
	 * Message filtering function to collect messages only from the current player.
	 * @type {CollectorFilter<[Message<true>]>}
	 */
	public filterByCurrentPlayer: CollectorFilter<[Message<true>]> = (message: Message<true>) => {
		return message.author.id === this.players[this.currentPlayerIndex].id;
	};
	/**
	 * Adds a new player to the game.
	 * @param {Player} player The player object to be added to the game.
	 */
	public addPlayer(player: Player): void {
		this.players.push(player);
	}
	/**
	 * Starts the Monopoly game session by managing player turns until the game over condition is met.
	 * Stops the message collector and logs "Game Over" when the game ends.
	 * @returns {Promise<void>} A promise that resolves when the game is over.
	 */
	public async startGame(): Promise<void> {
		while (!this.gameOverConditionMet()) {
			await this.manageTurns();
		}
		this.messageCollector.stop();
		console.log("Game Over");
	}
	/**
	 * Checks if the game over condition is met by determining if there is only one active player left in the game.
	 * An active player is defined as a player who has not left the game.
	 * @returns {boolean} Returns true if the game over condition is met, false otherwise.
	 */
	public gameOverConditionMet(): boolean {
		const activePlayers = this.players.filter((player) => !player.hasLeftGame);
		return activePlayers.length === 1;
	}
	/**
	 * Manages the player turns in the Monopoly game by listening for player input events.
	 * Makes the dice roll for the current player and advances the turn to the next player if the current player is not jailed.
	 * @returns {Promise<void>} A promise that resolves when the turn is successfully managed.
	 */
	public async manageTurns(): Promise<void> {
		this.messageCollector.on("collect", async () => {
			const currentPlayer = this.players[this.currentPlayerIndex];

			await this.MakeDiceRoll(currentPlayer);

			if (!currentPlayer.isJailed) {
				this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
			}
		});
	}
	/**
	 * Simulates throwing dice by generating random values for two dice rolls between 1 and 6.
	 * @returns {DiceRollResult} An object containing the sum of the dice rolls, whether it's a double roll, and the individual values of each die.
	 */
	private throwDice(): DiceRollResult {
		const dice1 = Math.floor(Math.random() * 6) + 1;
		const dice2 = Math.floor(Math.random() * 6) + 1;

		return {
			sum: dice1 + dice2,
			double: dice1 === dice2,
			dice1,
			dice2
		};
	}
	/**
	 * Makes a dice roll for the specified player in the Monopoly game.
	 * If the player is jailed, handles the logic for rolling dice while in jail.
	 * If the player is not jailed, handles the standard dice roll logic.
	 * @param {Player} player The player for whom the dice roll is being made.
	 * @returns {Promise<void>} A promise that resolves once the dice roll logic is handled.
	 */
	public async MakeDiceRoll(player: Player): Promise<void> {
		const rollResult: DiceRollResult = this.throwDice();

		if (player.isJailed) {
			await this.handleJailLogic(player, rollResult);
		} else {
			await this.standardRollLogic(player, rollResult);
		}
	}
	/**
	 * Handles the logic for a player who is currently jailed based on the given dice roll result.
	 * If the player rolls doubles, releases them from jail.
	 * If the player does not roll doubles, enforces the rules for being in jail (up to 3 attempts)
	 * and passes the turn to the next player accordingly.
	 * @param {Player} player The player in jail for whom the logic is being handled.
	 * @param {DiceRollResult} rollResult The result of the dice roll for the player.
	 * @returns {Promise<void>} A promise that resolves once the jail logic is handled for the player.
	 */
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
	/**
	 * Handles the standard dice roll logic for a player who is not in jail based on the given dice roll result.
	 * If the player rolls doubles, advances the player's token accordingly.
	 * If the player rolls three doubles in a row, sends the player to jail.
	 * If the player does not roll doubles, moves the player's token according to the roll result.
	 * @param {Player} player The player not in jail for whom the standard roll logic is being handled.
	 * @param {DiceRollResult} rollResult The result of the dice roll for the player.
	 * @returns {Promise<void>} A promise that resolves once the standard roll logic is handled for the player.
	 */
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
	/**
	 * Handles the property-related actions, such as paying rent, buying properties, and starting auctions.
	 * @param {string} propertyName - The name of the property.
	 * @param {number} propertyCost - The cost of the property.
	 * @param {Player} propertyOwner - The player who owns the property.
	 */
	public handleProperty(propertyName: string, propertyCost: number, propertyOwner: Player): void {
		const currentPlayer = this.players[this.currentPlayerIndex];
		const property = this.propertyMap[propertyName];
		const rentAmount = propertyOwner.properties[propertyName].mortgage ? property.mortgage : property.rent;

		console.log(`${currentPlayer.name} pays rent of ${rentAmount} to ${propertyOwner.name}.`);
		currentPlayer.payMoney(rentAmount);
		propertyOwner.receiveMoney(rentAmount);

		if (currentPlayer.balance < propertyCost) {
			console.log(`${currentPlayer.name} does not have enough money to buy ${propertyName}.`);
			this.startAuction(propertyName, propertyCost);
			return;
		}

		currentPlayer.payMoney(propertyCost);
		console.log(`${currentPlayer.name} has bought ${propertyName} for ${propertyCost}.`);
	}
	/**
	 * Initiates an auction for a property among the players, starting with the current player.
	 * Players can place bids through messages in the channel where the auction is taking place.
	 * The property is sold to the highest bidder at the end of the auction.
	 * @param {string} propertyName The name of the property being auctioned.
	 * @param {number} propertyCost The cost of the property being auctioned.
	 */
	private startAuction(propertyName: string, propertyCost: number): void {
		const currentPlayer = this.players[this.currentPlayerIndex];
		const property = this.propertyMap[propertyName];
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
				currentPlayer.balance += highestBid;

				currentPlayer.properties.push(property);
				console.log(`${highestBidder.name} has won the auction for ${propertyName} with a bid of $${highestBid}.`);
			} else {
				console.log("No one bid on the property. The property remains unsold.");
			}
		});
	}
	/**
	 * Handles a chance card for the specified player by drawing a chance card and executing its effect.
	 * @param {Player} player The player for whom the chance card is being handled.
	 */
	public handleChanceCard(player: Player) {
		const drawnCard = this.chanceCardHandler.drawChanceCard();
		this.chanceCardHandler.handleChanceCard(player, drawnCard);
	}
	/**
	 * Handles a community chest card for the specified player by drawing a community chest card and executing its effect.
	 * @param {Player} player The player for whom the community chest card is being handled.
	 */
	public handleCommunityCard(player: Player) {
		const drawnCard = this.communityCardHandler.drawCommunityCard();
		this.communityCardHandler.handleCommunityCard(player, drawnCard);
	}
}
