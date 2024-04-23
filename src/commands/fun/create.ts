import { CreateCommand } from "#slashyInformations/index.js";
import { characterCreateModal } from "#utils/index.js";
import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";

export default class extends Command<typeof CreateCommand> {
	public override async chatInput(interaction: InteractionParam, args: ArgsParam<typeof CreateCommand>, locale: LocaleParam): Promise<void> {
		await interaction.showModal(characterCreateModal(locale));
	}
}
