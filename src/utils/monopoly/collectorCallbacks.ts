import { GuildTextBasedChannel, Message, MessageCollector } from "discord.js";
import { Session } from "./session.js";
import { flushMessages, send, sendCrude, stackCrudeMessage } from "./message.js";
import { Player } from "./player.js";
export function addUser(channel: GuildTextBasedChannel) {
	return function (session: Session, msg: Message<true>) {
		const behavior = session.addPlayer(msg).toString();
		channel.send(
			{
				"false": "User not found.",
				"true": "Player successfully added.",
				"already here": "Player already in the list."
			}[behavior]
		);
	};
}
export function clearList(session: Session, channel: GuildTextBasedChannel) {
	return function () {
		const originalSize = session.players.size;
		session.players.clear();
		channel.send(
			{
				false: "No player was in the list.",
				true: "List successfully cleared."
			}[Boolean(originalSize)]
		);
	};
}
export function commencePlay(session: Session, channel: GuildTextBasedChannel, collectors: MessageCollector[]) {
	return function () {
		if (session.players.size >= 2) {
			for (const collector of collectors) {
				collector.stop();
			}
			send("start").then(() => {
				session.startGame();
			});
		} else {
			const leftPlayers = 2 - session.players.size;
			send("notEnoughPlayers", leftPlayers);
		}
	};
}
export function endGame(session: Session, channel: GuildTextBasedChannel, currentSessions: any[]) {
	return session.endGame.bind(session, currentSessions);
}
export function handleJailDecision(player: Player, session: Session) {
	return function (collected, reason: string) {
		const message = collected.first();
		if (reason === "time") {
			sendCrude(`You took more than ${turnDuration} seconds to decide. You will stay in jail one more turn.`).then(() => {
				player.turnsInJail++;
				session.toggleTurns();
			});
		} else {
			const decision = +message.content;
			const action = {
				1() {
					session.stackCrudeMessage("You have decided to stay one more turn in jail.");
					player.turnsInJail++;
				},
				2() {
					player.pay(50);
					player.free({ reason: "fine" });
				},
				3() {
					if (player.ownsFreedomCommunity) {
						player.ownsFreedomCommunity = false;
					} else if (player.ownsFreedomChance) {
						player.ownsFreedomChance = false;
					}
					player.free({ reason: "card" });
				}
			}[decision];
			runAction(session, action).then(() => {
				session.toggleTurns();
			});
		}
	};
}
export function removeUser(session: Session, channel: GuildTextBasedChannel) {
	return function (msg: any) {
		const behavior = session.removePlayer(msg).toString();
		channel.send(
			{
				null: "User not found.",
				true: "Player successfully removed.",
				false: "Player is not in the list."
			}[behavior]
		);
	};
}

export function runAction(session: Session, action: (() => void) | (() => void) | (() => void)) {
	return new Promise((resolve, reject) => {
		action();
		flushMessages().then(() => {
			resolve("for the lulz");
		});
	});
}
