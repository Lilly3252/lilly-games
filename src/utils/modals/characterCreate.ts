import { createModal } from "@yuudachi/framework";
import { APIActionRowComponent, APIModalActionRowComponent, APIModalInteractionResponseCallbackData, ComponentType, TextInputStyle } from "discord.js";
import i18next from "i18next";

export function characterCreateModal(locale: string): APIModalInteractionResponseCallbackData {
	const nameInput: APIActionRowComponent<APIModalActionRowComponent> = {
		type: ComponentType.ActionRow,
		components: [
			{
				type: ComponentType.TextInput,
				label: i18next.t("modal.character_create.nameInput.label", { lng: locale }),
				custom_id: "nameInput",
				style: TextInputStyle.Short,
				required: true
			}
		]
	};
	const hobbiesInput: APIActionRowComponent<APIModalActionRowComponent> = {
		type: ComponentType.ActionRow,
		components: [
			{
				type: ComponentType.TextInput,
				label: i18next.t("modal.character_create.hobbiesInput.label", { lng: locale }),
				custom_id: "hobbiesInput",
				style: TextInputStyle.Paragraph
			}
		]
	};

	return createModal({
		components: [nameInput, hobbiesInput],
		customId: "characterCreate",
		title: i18next.t("modal.character_create.title", { lng: locale })
	});
}
