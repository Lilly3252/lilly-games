import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const CreateCommand = {
	name: "create",
	description: "create your character.",
	description_localizations: {
		fr: "crée."
	},
	default_member_permissions: "0"
} as const;
