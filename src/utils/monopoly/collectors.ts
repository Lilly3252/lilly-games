import { MessageCollector, GuildTextBasedChannel, Message } from "discord.js";
import config from "./config.json";
import { getUser } from "./getUser.js";
import { Session } from "./session.js";
import { Player } from "./player.js";

export function handleSessionStart(assignedCommand: string, session: Session, channel: GuildTextBasedChannel) {}
export function handleAuction(session: Session, channel: GuildTextBasedChannel) {
	const time = config.bidDuration * 1000;
	return new MessageCollector(
		channel,
		function (msg: Message<true>) {
			return +msg.content && session.players.has(msg.author.id) && +msg.content <= session.players.get(msg.author.id).cash;
		},
		time
	);
}
export function handleTurn(decidingPlayer: { id: any }, channel: GuildTextBasedChannel) {
	const time = config.turnDuration * 1000;
	return new MessageCollector(
		channel,
		function (msg: Message<true>) {
			return msg.content === `${config.prefix}dice` && decidingPlayer.id === msg.author.id;
		},
		{ maxMatches: 1, time }
	);
}
export function handleNumericalDecision(decidingPlayer: Player, channel: GuildTextBasedChannel, cap: number) {
	const time = config.turnDuration * 1000;
	return new MessageCollector(
		channel,
		function (msg: Message<true>) {
			return decidingPlayer.id === msg.author.id && +msg.content && +msg.content <= cap;
		},
		{ maxMatches: 1, time }
	);
}
export function handlePlayersList(assignedCommand: string, channel: GuildTextBasedChannel) {
	return new MessageCollector(channel, function (msg: Message<true>) {
		return (
			ownerSpoke(msg.author.id) && (assignedCommand !== "clear" ? msg.content.startsWith(`${config.prefix}${assignedCommand}`) && getUser(msg) : msg.content === `${config.prefix}${assignedCommand}`)
		);
	});
}
export function handleStatusChange(status: string, channel: GuildTextBasedChannel) {
	return new MessageCollector(
		channel,
		function (msg: Message<true>) {
			return msg.content === `${config.prefix}${status}` && ownerSpoke(msg.author.id);
		},
		{ maxMatches: 1 }
	);
}

function ownerSpoke(id: string) {
	if (Array.isArray(config.owners)) {
		return config.owners.includes(id);
	} else {
		return config.owners === id;
	}
}
