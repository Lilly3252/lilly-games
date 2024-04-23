import Board from "./JSON/board.json";
import { isEqual } from "lodash";
import { AbstractStack } from "./classes/abstractStack.js";
import { Player } from "./classes/player.js";
import { Message } from "discord.js";
import { Session } from "./classes/session.js";

export function payout(message: Message<true>, amount: number) {
	return function (player: Player) {
		return {
			message,
			effect: player.earn.bind(player, amount)
		};
	};
}

export function advanceToGo(player: Player) {
	return {
		message: `${player.username} advances straight to Go Tile and receives $200.`,
		effect: player.advance.bind(player, (player._position = 0))
	};
}

export function doctorFee(player: Player) {
	return {
		message: `${player.username} pays $50 for doctor fees.`,
		effect: player.pay.bind(player, 50)
	};
}

export function goToJail() {
	return {
		effect: function (player: Player) {
			player.jail("card");
		}
	};
}

export function getOutOfJail(player: Player) {
	return {
		message: `${player.username} draws a Get out of Jail card.`,
		effect: function (session: Session) {
			if (session.hasCommunityOutOfJail) {
				player.ownsFreedomCommunity = true;
				this.ownsFreedomCommunity = false;
			}
		}
	};
}

export function saleOfStocks(player: Player) {
	return {
		message: `${player.username} receives $50 from stock sales.`,
		effect: player.earn.bind(player, 50)
	};
}

export function bankError(player: Player) {
	return {
		message: `${player.username} receives $200 from a bank error.`,
		effect: player.earn.bind(player, 200)
	};
}

export function inheritance(player: Player) {
	return {
		message: `${player.username} receives $100 from inheritance.`,
		effect: player.earn.bind(player, 100)
	};
}

export function beautyContest(player: Player) {
	return {
		message: `${player.username} receives $10 from a 2nd position in a beauty contest.`,
		effect: player.earn.bind(player, 10)
	};
}

export function hospital(player: Player) {
	return {
		message: `${player.username} has to pay $50 for hospital fees.`,
		effect: player.pay.bind(player, 50)
	};
}

export function school(player: Player) {
	return {
		message: `${player.username} has to pay $50 for school fees.`,
		effect: player.pay.bind(player, 50)
	};
}

export function consultancy(player: Player) {
	return {
		message: `${player.username} received $25 for consultancy fees.`,
		effect: player.earn.bind(player, 25)
	};
}

export function birthday(player: Player) {
	return {
		message: `${player.username} receives $10 from every other player because it's their birthday.`,
		effect: function (whatever, session) {
			let total = 0;
			for (const [p] of session.players.entries()) {
				if (!isEqual(p, player)) {
					p.pay(10);
					total += 10;
				}
			}
			player.earn(total);
		}
	};
}

export function lifeInsurance(player: Player) {
	return {
		message: `${player.username} receives $100 from life insurance.`,
		effect: player.earn.bind(player, 100)
	};
}

export function incomeTax(player: Player) {
	return {
		message: `${player.username} receives $20 for an income tax refund.`,
		effect: player.earn.bind(player, 20)
	};
}

export function grandOpera(player: Player) {
	return {
		message: `${player.username} hosts an opera show and receives $50 from each player for opening night seats.`,
		effect: function (player: Player, session: Session) {
			let total = 0;
			for (const [p] of session.players.entries()) {
				if (!isEqual(p, player)) {
					p.pay(50);
					total += 50;
				}
			}
			player.earn(total);
		}
	};
}

const reference = {
	grandOpera,
	lifeInsurance,
	incomeTax,
	getOutOfJail,
	birthday,
	consultancy,
	school,
	hospital,
	advanceToGo,
	doctorFee,
	bankError,
	inheritance
};

const CardHandler = new AbstractStack(reference);

function drawCard(session) {
	const chosenToggler = session.hasCommunityOutOfJail ? CardHandler.cardfulToggler : CardHandler.cardlessToggler;
	return chosenToggler.next().value;
}

export function card(session: Session) {
	const card = drawCard(session);
	return card;
}
