import { MonopolyCommand } from "#slashyInformations/index.js";
import { Monopoly } from "#utils/monopoly/classes/monopoly.js";

import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";

export default class extends Command<typeof MonopolyCommand> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override async chatInput(interaction: InteractionParam, args: ArgsParam<typeof MonopolyCommand>, locale: LocaleParam): Promise<void> {
		const currentPlayer = Monopoly.prototype.players[Monopoly.prototype.currentPlayerIndex];
		await Monopoly.prototype.MakeDiceRoll(currentPlayer);

		await interaction.reply(`Player ${currentPlayer.name} made a dice roll.`);
	}
}
