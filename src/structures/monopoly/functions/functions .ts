import jsonData from "#structures/monopoly/JSON/board.json";
import { DiceRollResult, MonopolyPlayerProperty } from "#type/index";
import { ChatInputCommandInteraction, CollectorFilter, Message } from "discord.js";
import MonopolyProperty from "../classes/boardProperties";
import { Monopoly } from "../classes/monopoly";
import MonopolyPlayer from "../classes/player";

const data = jsonData


/**
 * Generates a random dice roll result.
 * @returns The result of the dice roll.
 */
export function throwDice(): DiceRollResult {
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
 * Handles the interaction when a player lands on or tries to buy a property.
 * @param propertyName - The name of the property being handled.
 * @param propertyCost - The cost of the property being bought.
 * @param propertyOwner - The player who owns the property.
 * @returns A promise that resolves once the property handling is completed.
 */
	export async function handleProperty(interaction:ChatInputCommandInteraction,game:Monopoly,property: MonopolyProperty, propertyOwner: MonopolyPlayer): Promise<void> {
		const currentPlayer = game.currentPlayer
		const properties = game.getPropertyByName(property.name);
		const propertyCost = property.getCost()
		const rentAmount = properties.isMortgaged ? property.mortgage : property.rent;

		console.log(`${currentPlayer.user.username} pays rent of ${rentAmount} to ${propertyOwner.user.username}.`);
		currentPlayer.payMoney({ amount: rentAmount });
		propertyOwner.receiveMoney( {amount: rentAmount });

		if (currentPlayer.balance < propertyCost) {
			await interaction.editReply(`${currentPlayer.user.username} does not have enough money to buy ${properties}.`);
			this.startAuction(properties, propertyCost);
			return;
		}

		currentPlayer.payMoney({ amount: propertyCost });
		await interaction.editReply(`${currentPlayer.user.username} has bought ${properties} for ${propertyCost}.`);
	}
    /**
 * Initiates an auction for a property among the players.
 * @param propertyName - The name of the property being auctioned.
 * @param propertyCost - The cost of the property being auctioned.
 */
	export function startAuction(interaction:ChatInputCommandInteraction,property: MonopolyPlayerProperty): void {
		const currentPlayer = Monopoly.prototype.currentPlayer
		const properties = Monopoly.prototype.getPropertyByName(property.name)
		const auctionFilter: CollectorFilter<[Message<true>]> = (message: Message<true>) => {
			return message.author.id === currentPlayer.user.id && /^bid [0-9]+$/.test(message.content.toLowerCase());
		};

		const auctionCollector = this.messageCollector.channel.createMessageCollector({ filter: auctionFilter });
		let highestBidder = currentPlayer;
		let highestBid = property.property.getCost();

		auctionCollector.on("collect", async (message: Message<true>) => {
			const bid = parseInt(message.content.toLowerCase().split(" ")[1]);
			if (bid > highestBid) {
				highestBidder = currentPlayer;
				highestBid = bid;
				await interaction.editReply(`${highestBidder.user.username} has made a bid of $${highestBid}.`);
			}
		});

		auctionCollector.on("end", async () => {
			if (highestBidder !== currentPlayer) {
				currentPlayer.balance += highestBid;

				currentPlayer.properties.push(property);
				await interaction.editReply(`${highestBidder.user.username} has won the auction for ${property} with a bid of $${highestBid}.`);
			} else {
				await interaction.editReply("No one bid on the property. The property remains unsold.");
			}
		});
	}

   /**
 * Handles the standard dice roll logic for a player who is not in jail.
 * @param player - The player for whom the standard roll logic is being handled.
 * @param rollResult - The result of the dice roll for the player.
 */
	export async function standardRollLogic(interaction:ChatInputCommandInteraction,player: MonopolyPlayer, rollResult: DiceRollResult): Promise<void> {
		if (rollResult.double) {
			player.incrementDoublesCount();

			if (player.doublesCount === 3) {
				goToJail(player);
				await interaction.editReply("You rolled three doubles in a row! Go to jail.");
			} else {
				player.move({ number: rollResult.sum });
				await interaction.editReply("You rolled a double! Advance to the corresponding index on the board and roll again.");
			}
		} else {
			player.resetDoublesCount();
			player.move({ number: rollResult.sum });
			await interaction.editReply("You rolled a sum of " + rollResult.sum);
		}
	}
   /**
 * Handles the logic for a player who is currently jailed.
 * @param player - The player in jail for whom the logic is being handled.
 * @param rollResult - The result of the dice roll for the player.
 */
	export async function handleJailLogic(interaction:ChatInputCommandInteraction ,player: MonopolyPlayer, rollResult: DiceRollResult): Promise<void> {
		player.incrementRollsCount();

		if (rollResult.double) {
			player.isJailed = false;
			await interaction.editReply("You rolled doubles! Get out of jail for free.");
		} else {
			await interaction.editReply("You did not roll doubles on roll " + player.rollsCount + ". Pass the turn to the next player.");

			if (player.rollsCount === 3) {
				player.payMoney({ amount: 50 });
				player.move({ number: rollResult.sum });
				await interaction.editReply("You did not roll doubles after three attempts. Pay $50 and move " + rollResult.sum + " spaces.");
			} else {
				await interaction.editReply("Roll again on your next turn.");
			}

			Monopoly.prototype.updateCurrentPlayerIndex()
		}
	}
    /**
 * Makes a dice roll for the specified player in the Monopoly game.
 * @param player - The player for whom the dice roll is being made.
 */
	export async function MakeDiceRoll(interaction:ChatInputCommandInteraction,player: MonopolyPlayer): Promise<void> {
		const rollResult: DiceRollResult = throwDice();

		if (player.isInJail) {
			handleJailLogic(interaction, player, rollResult);
		} else {
			await standardRollLogic(interaction,player, rollResult);
		}
	}
    /**
 * Sends the player to jail by setting their position, resetting doubles count, and marking them as jailed.
 * @param player - The player sent to jail.
 * @param reason The reason for being jailed.
 */
	export function goToJail(player:MonopolyPlayer , reason?:string) {
		player.resetDoublesCount();
		player.isJailed = true;
		player.setPlayerPosition(10);
	}
    
	/**
 * Sets the player's jail status to false, indicating they are no longer in jail.
 * @param player - The player getting out of jail.
 */
	export function getOutOfJail(player:MonopolyPlayer , reason?:string) {
        if (player.isInJail){
		player.isJailed = false;
	}

}

export async function releaseProperty(interaction:ChatInputCommandInteraction,player: MonopolyPlayer, property: MonopolyProperty): Promise<void> {
    const index = player.getIndexOfProperty(property);
    if (index !== -1) {
        if (property.isMortgaged) {
            player.balance += property.mortgage; // Return the mortgage cost
        } else {
            player.balance += property.cost; // Return the full cost of the property
        }
        
        player.properties.splice(index, 1);
        await interaction.editReply(`${property.name} has been released.`);
    } else {
        await interaction.editReply(`${property.name} is not owned by ${player.user.username}.`);
    }
}