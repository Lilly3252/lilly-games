import { AbstractStack } from "./classes/abstractStack.js";
import { Player } from "./classes/player.js";
import Board from "./JSON/board.json";
import { isEqual, findIndex, indexOf } from "lodash";
import { TMonopoly } from "#utils/types/monopoly.js";
import { Session } from "./classes/session.js";

const board = Board;

function getDistance(pos: number, dest: number) {
	return {
		destination: dest,
		distance: Math.abs(pos - dest)
	};
}

function advanceToGo(player: Player) {
	return {
		message: `${player.username} advances straight to Go tile and receives $200.`,
		effect: () => {
			player.advance(0);
		}
	};
}

function advanceToTile(tileName: string, player: Player) {
	return {
		message: `Advance directly to ${tileName}. If you pass across Go, receive $200.`,
		effect: () => {
			const position = findIndex(board, (tile) => tile.name === tileName);
			player.advance(board.length - player._position + position);
			player.session.handleTileAction(player, position);
		}
	};
}

function advanceToIllinois(player: Player) {
	return advanceToTile("Illinois Avenue", player);
}

function advanceToStCharles(player: Player) {
	return advanceToTile("St. Charles Place", player);
}

function advanceToBoardwalk(player: Player) {
	return advanceToTile("Boardwalk", player);
}

function advanceToNearestUtility(player: Player) {
	const utilities = board.filter((tile) => tile.type === "utility");
	const distances = utilities.map((tile) => getDistance(player._position, need to find tile position here)).sort((a, b) => a.distance - b.distance);
	const nearestUtility = distances[0];
	return {
		message: `Advance to nearest utility (${nearestUtility.destination.name}). If it's already owned, a set of dice will be rolled and you will pay 10 times that amount to its owner.`,
		effect: () => {
			player.advance(nearestUtility.distance);
			if (nearestUtility.destination.owner) {
				const roll = player.session.throwDice();
				player.pay(roll.sum * 10);
				nearestUtility.destination.owner.earn(roll.sum * 10);
			}
		}
	};
}

function getOutOfJail(player: Player) {
	return {
		message: `${player.username} drew a Get out of Jail card.`,
		effect: () => {
			if (player.session.hasChanceOutOfJail) {
				player.ownsFreedomChance = true;
				player.session.hasChanceOutOfJail = false;
			}
		}
	};
}

function goBack3Spaces(player: Player) {
	return {
		message: `${player.username} goes back 3 steps.`,
		effect: () => {
			player.goBack(-3);
			player.session.handleTileAction(player, player._position);
		}
	};
}

function jailPlayer(player: Player) {
	return {
		effect: () => player.jail("card")
	};
}

function receiveAmount(player: Player, amount: number, message: string) {
	return {
		message,
		effect: () => player.earn(amount)
	};
}

function receiveReturnOnInvestment(player: Player) {
	return receiveAmount(player, 150, `Your building and loan matures. Receive $150.`);
}

function winCrosswords(player: Player) {
	return receiveAmount(player, 100, `You won a crosswords competition. Receive $100.`);
}

function receiveDividends(player: Player) {
	return receiveAmount(player, 50, "Bank pays you a dividend of $50.");
}

function payAllPlayers(player: Player, session: Session) {
	return {
		message: "You have been elected Chairman of the Board. Pay each player $50.",
		effect: () => {
			session.players.forEach((otherPlayer) => {
				if (!isEqual(otherPlayer, player)) {
					player.pay(50);
					otherPlayer.earn(50);
				}
			});
		}
	};
}

const reference = {
	payAllPlayers,
	receiveDividends,
	winCrosswords,
	receiveReturnOnInvestment,
	jailPlayer,
	goBack3Spaces,
	advanceToNearestUtility,
	advanceToIllinois,
	advanceToBoardwalk,
	advanceToStCharles,
	advanceToGo,
	getOutOfJail
};

const CardHandler = new AbstractStack(reference);

function drawCard(session: Session) {
	const chosenToggler = CardHandler.selectToggler(session.hasChanceOutOfJail);
	return chosenToggler.next().value;
}

export function card(session: Session) {
	const card = drawCard(session);
	return card;
}
