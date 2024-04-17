/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection, GuildTextBasedChannel, Message, User } from "discord.js";
import { bidDuration, turnDuration } from "./config.json";
import Board from "./board.json";
import { MessageHandler } from "./message.js";
import { getUser } from "./getUser.js";
import { Player } from "./player.js";
import { handleAuction, handleNumericalDecision, handleTurn } from "./collectors.js";
import { handleJailDecision } from "./collectorCallbacks.js";
import { isEqual } from "lodash";
import { InterfaceMonopoly } from "#utils/types/monopoly.js";

export class Session {
	id: string;
	players: Collection<string,Player>;
	messageHandler: MessageHandler;
	channel: GuildTextBasedChannel;
	occupiedProperties: Collection<string, unknown>;
	turnListener: object;
	hotels: number;
	houses: number;
	hasChanceOutOfJail: boolean;
	hasCommunityOutOfJail: boolean;
	turnHandler: Generator<number, void,Player>;
	started: boolean;
	board: InterfaceMonopoly[];
	orderedPlayers: Array<number>;
	
	constructor(user: User) {
		this.id = user.id;
		this.players = new Collection();
		this.board = Board;
		this.messageHandler = new MessageHandler(this.channel);
		this.occupiedProperties = new Collection();
		this.turnListener = {};
		this.hotels = 12;
		this.houses = 32;
		this.hasChanceOutOfJail = true;
		this.hasCommunityOutOfJail = true;
		this.turnHandler = this.createTurnToggler();
		this.started = false;
	}
	*createTurnToggler() {
		let i = 0;
		while (true) {
			yield this.orderedPlayers[i];
			if (i + 1 === this.orderedPlayers.length) {
				i = 0;
			} else {
				i++;
			}
		}
	}

addPlayer = function (message) {
	const user = getUser(message);
	if (user) {
		if (!this.players.has(user)) {
			this.players.set(user.id, new Player(user, this));
			return true;
		} else {
			return "already here";
		}
	}

	return false;
};
clearPlayerList = function () {
	if (this.players.size) {
		this.players.clear();
		return true;
	}
	return false;
};
executeTurn(player: Player, fixedRoll: number) {
	const roll = this.makeDiceRoll(player,...)|| fixedRoll
	if (player.isJailed) {
		this.handleJailedPlayer(player);
		return;
	} else {
		if (roll.doubleCount === 3) {
			player.jail("doubles");
			return;
		}
		player.advance(roll.rollTotal);
		this.handleTileAction(player, roll);
		return;
	}
};
endGame = function (currentSessions) {
	if (this.started) {
		const text = this.players
			.array()
			.sort(function (player1, player2) {
				return player2.cash - player1.cash;
			})
			.map((user, i) => {
				const { username, cash } = user;
				return `${i + 1} - ${username} ($${cash})`;
			})
			.join("\n");
		this.turnListener.stop("ended game");
		this.channel.send(`Game over. Ranking of players (not including disqualified users):
${text}`);
	} else {
		this.channel.send("You've decided to abandon playing.");
	}
	currentSessions.splice(currentSessions.indexOf(this.channel.id), 1);
};
handleBankruptcy(player:Player, startingCount = 0) {
	const failedAnswers = startingCount;
	this.flushMessages().then(() => {
		this.manageBankruptPlayer(this , player, failedAnswers);
	});
};
handleAuction(property) {
	this.stackMessage(`Auction time! For ${bidDuration}s, place your bids in order to buy ${property.name}.`);
	this.flushMessages().then((msgg: Message<true>) => {
		let max = 0;
		const winner = this.players.get(msgg.author.id);
		const bidHandler = handleAuction(this, this.channel);
		bidHandler.on("collect", (msgg: Message<true>) => {
			if (+msgg.content > max) {
				max = +msgg.content;
				this.sendMessage(`The leader is currently ${winner.username} with a $${max} offer.`);
			}
		});
		bidHandler.on("end", (collected) => {
			this.sendMessage("Time's up!").then(() => {
				if (collected.size) {
					winner.buy(property, max);
					this.flushMessages().then(() => {
						this.toggleTurns();
					});
				} else {
					this.sendMessage("No bid was made. Moving on.").then(() => {
						this.toggleTurns();
					});
				}
			});
		});
	});
};
handleJailedPlayer(player:Player) {
	if (player.turnsInJail === 3) {
		player.free("3 turns");
		const dice = this.throwDice();
		if (!dice.double) {
			player.pay(50);
			this.executeTurn(player,dice.sum);
		}
	} else {
		const leftTurns = 3 - player.turnsInJail;
		const options = [`Wait for ${leftTurns} turn(s).`];
		if (player.cash >= 50) {
			options.push("Pay $50 as a fine.");
		}
		if (player.canBeFreed) {
			const numberOfCards = Number(player.ownsFreedomChance) + Number(player.ownsFreedomCommunity);
			options.push(`Use a card out of ${numberOfCards} and free yourself.`);
		}
		const cap = options.length;
		const fields = options.map((option, i) => {
			return {
				name: `Option ${i + 1}`,
				value: option,
				inline: true
			};
		});
		const Embed = createEmbed(fields);
		this.stackMessage(Embed);
		this.flushMessages().then(() => {
			const decisionMaker = handleNumericalDecision(player, this.channel, cap);
			decisionMaker.on("end", handleJailDecision(player, this));
		});
	}
};
handleTileAction(player:Player, roll) {
	if (player.position.name === "Go To Jail") {
		this.jailPlayer(player, "tile");
		return;
	}
	if (player.position.type === "tax") {
		this.handleTax(player);
		return;
	}
	if (["community-chest", "chance"].includes(player.position.type)) {
		this.handleSupriseCard(player);
		return;
	}
	if (["railroad", "property"].includes(player.position.type)) {
		this.handleProperty(player, roll);
		return;
	}
	if (["go", "free-parking"].includes(player.position.type)) {
		this.flushMessages().then(() => {
			this.toggleTurns();
		});
	}
};
handleTax(player:Player) {
	this.stackMessage(`${player.username} landed on a Tax tile.`);
	player.pay(player.position.cost);
	this.flushMessages().then(() => {
		this.toggleTurns();
	});
};
handleSupriseCard(player:Player) {
	const card = player.position.type === "community-chest" ? Community(this)(player, this) : Chance(this)(player, this);
	if (card.message) {
		this.stackMessage(card.message);
	}
	card.effect(player, this);
	this.flushMessages().then(() => {
		if (player.cash >= 0) {
			this.toggleTurns();
		} else {
			this.handleBankruptcy(player);
		}
	});
};
handleProperty(player:Player, roll) {
	const property = player.position;
	if (this.occupiedProperties.has(property)) {
		const owner = this.occupiedProperties.get(property);
		if (isEqual(owner, player)) {
			this.stackMessage(`${owner.username} owns this property, so nothing happens.`);
			this.flushMessages().then(() => {
				this.toggleTurns();
			});
		} else {
			player.pay(property.rent);
			owner.receive(property.rent);
			if (player.cash < 0) {
				this.handleBankruptcy(player);
			} else {
				this.flushMessages().then(() => {
					this.toggleTurns();
				});
			}
		}
	} else {
		if (player.cash >= property.cost) {
			const embed = createEmbed([`Buy the property for $${property.cost}`, "Do nothing (will put the property for auction)"]);
			this.stackMessage(`Choose your action`, embed);
			this.flushMessages().then(() => {
				const decisionMaker = handleNumericalDecision(player, this.channel, 2);
				decisionMaker.on("end", (collected, reason) => {
					if (reason === "time") {
						this.sendMessage("You took too much time to decide. The property will now be auctioned.").then(() => {
							this.handleAuction(property);
						});
					} else {
						const msg = collected.first();
						if (+msg.content === 1) {
							player.buy(property);
							this.flushMessages().then(() => {
								this.toggleTurns();
							});
						} else {
							this.handleAuction(property);
						}
					}
				});
			});
		} else {
			this.handleAuction(property);
		}
	}
};
jailPlayer(player:Player, reason) {
	player.jail(reason);
	this.flushMessages().then(() => {
		this.toggleTurns();
	});
};
killPlayer(player:Player) {
	this.players.delete(player.id);
	if (player.ownsFreedomChance) {
		this.hasChanceOutOfJail = true;
	}
	if (player.ownsFreedomCommunity) {
		this.hasCommunityOutOfJail = true;
	}
	for (const property of player.properties) {
		player.releaseProperty(property, player.cash);
	}
	this.sendMessage(`${player.username} has lost.`);
	player = {}; // bye bye
};
listPlayers() {
	const players = this.players
		.array()
		.map((name) => `\`${name}\``)
		.join(", ");
	return `Currently registered players: ${players}`;
};

throwDice() {
	const dice1 = Math.floor(Math.random() * 5) + 1;
	const dice2 = Math.floor(Math.random() * 5) + 1;
	return {
		sum: dice1 + dice2,
		double: dice1 === dice2,
		dice1,
		dice2
	};
};

makeDiceRoll(player:Player, iterations) {
	let roll = {};
	let doubleCount = 0;
	let rollTotal = 0;
	if (iterations) {
		for (let i = 0; i < iterations; i++) {
			roll = this.throwDice();
			this.stackMessage(`${player.username} rolled ${roll.sum} (${roll.dice1}, ${roll.dice2}).`);
			rollTotal += roll.sum;
			if (roll.double) {
				doubleCount++;
			}
		}
	} else {
		while (doubleCount < 3) {
			roll = this.throwDice();
			this.stackMessage(`${player.username} rolled ${roll.sum} (${roll.dice1}, ${roll.dice2}).`);
			rollTotal += roll.sum;
			if (roll.double) {
				doubleCount++;
			}
			if (!roll.double) {
				break;
			}
		}
	}
	return {
		rollTotal,
		doubleCount
	};
};
manageTurn(player:Player) {
	this.messageHandler.send("turn", player.username, turnDuration).then((msg) => {
		this.turnListener = handleTurn(player, msg.channel);
		this.turnListener.on("end", (message, reason) => {
			if (reason === "time") {
				this.messageHandler.send("timeout", player.username).then(() => {
					this.toggleTurns();
				});
			} else if (reason === "ended game") {
				return;
			} else {
				this.executeTurn(player);
			}
		});
	});
};
removePlayer(message) {
	const player = getUser(message);
	if (player) {
		if (this.players.has(player.id)) {
			this.players.delete(player.id);
			return true;
		} else {
			return false;
		}
	}

	return null;
};
stackMessage(...content) {
	this.messageHandler.stackCrudeMessage(content);
}

stackCardMessage(message) {
	this.messageHandler.stackCardMessage(message);
}

flushMessages() {
	return this.messageHandler.flushMessages();
}

setTakenProperty(property, owner) {
	this.occupiedProperties.set(property, owner);
}

sendMessage(...content) {
	return this.channel.send(this.channel, content);
}

startGame() {
	this.started = true;
	this.orderedPlayers = this.randomize(this.players.size[0]);
	this.toggleTurns();
}
toggleTurns() {
	const user = this.turnHandler.next().value;
	const player = this.players.get(user.id);
	this.manageTurn(player);
}

randomize(array: Array<number>) {
	const n = Math.floor(Math.random() * array.length);
	const [item] = array.splice(n, 1);
	array.push(item);
	return array;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
format(str:string) {
	return this.capitalize(str.replace("-", ""));
}

capitalize(str:string) {
	return str.replace(/\W*./g, (match) => match.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
manageBankruptPlayer(session: Session, player: Player, failedAnswers = 0) {
	const allOwnedTiles = session.occupiedProperties.keyArray().filter((property) => isEqual(property.owner, player));
	session.stackMessage(`${player.username}'s balance is -$${Math.abs(player.cash)}.`);

	if (allOwnedTiles.length) {
		const fields = allOwnedTiles
			.map((tile) => `Sell ${tile.name} for $${tile.cost / 2}.`)
			.slice(0, 23)
			.push("Forfeit.");
		// discord only allows for max. 25 fields to show up, but it only serves for buy-happy people
		const totalCollected = allOwnedTiles.map((tile) => tile.cost / 2).reduce((a, b) => a + b);
		if (totalCollected >= Math.abs(player.cash)) {
			const length = fields.length;
			const embed = createEmbed(fields);
			session.sendMessage(`Choose which property you will sell. You need $${Math.abs(player.cash)} to stay in the game.`, embed).then(() => {
				const decisionMaker = handleNumericalDecision(player, this.channel, length);
				decisionMaker.on("end", this.decideBehavior(session, failedAnswers, player));
			});
		} else {
			session.sendMessage(`Even if ${player.username} sold all the properties they own, they will still have a negative balance.
${player.username} has lost.`);
			session.killPlayer(player);
		}
	} else {
		session.killPlayer(player);
	}
}

decideBehavior(session: Session, failedAnswers = 0, player: Player) {
	return function (collected, reason) {
		const message = collected.first();
		if (reason === "time") {
			session.sendMessage(`You didn't provide any answer in time for attempt ${failedAnswers + 1}/3.`);
			failedAnswers++;
			if (failedAnswers === 3) {
				session.sendMessage(`${turnDuration * 3} seconds have passed without any action from the player.`);
				session.killPlayer(player);
			} else {
				session.handleBankruptcy(player, failedAnswers);
			}
		} else {
			failedAnswers = 0;
			const choiceIndex = +message.content;
			if (choiceIndex === fields.length) {
				session.sendMessage(`You chose to forfeit.`);
				session.killPlayer(player);
			} else {
				const aimedTile = fullOwnedTiles[choiceIndex];
				player.releaseProperty(aimedTile, true);
				session.flushMessages().then(() => {
					if (player.cash < 0) {
						session.handleBankruptcy(player);
					} else {
						session.toggleTurns();
					}
				});
			}
		}
	};
}
}


