import { MonopolyCommand } from "#slashyInformations/index.js";

import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";

export default class extends Command<typeof MonopolyCommand> {
	public override async chatInput(interaction: InteractionParam, args: ArgsParam<typeof MonopolyCommand>, locale: LocaleParam): Promise<void> {}
}
