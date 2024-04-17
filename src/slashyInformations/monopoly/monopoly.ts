import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const MonopolyCommand = {
	name: "monopoly",
	description: "Monopoly settings and other stuff.",
	description_localizations: {
		fr: "Parametre du jeux monopoly et autre truc"
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "create",
			description: "Create the monopoly game.",
			description_localizations: {
				fr: "Creation de la session de Monopoly"
			},
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: "hide",
					name_localizations: {
						fr: "masquer"
					},
					description: "Hides the output",
					description_localizations: {
						fr: "Masque(cacher) le résultat"
					}
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "edition",
					name_localizations: {
						fr: "edition"
					},
					description: "Choose the edition you wanna play.",
					description_localizations: {
						fr: "Choisissez l'edition du jeux que vous voulez jouer."
					},
					choices: [
						{
							name: "US Edition",
							value: "us"
						},
						{
							name: "UK edition",
							value: "uk"
						},
						{
							name: "Amusement park Edition",
							value: "park"
						},
						{
							name: "Haunted Edition",
							value: "haunted"
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: "game",
			description: "play the monopoly game.",
			description_localizations: {
				fr: "jouer de la session de Monopoly"
			},
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "roll",
					name_localizations: {
						fr: "brasser"
					},
					description: "roll the dices",
					description_localizations: {
						fr: "brasser les dees"
					}
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "trade",
					name_localizations: {
						fr: "echanger"
					},
					description: "trade property",
					description_localizations: {
						fr: "echanger une propriete"
					}
				}
			]
		}
	],
	default_member_permissions: "0"
} as const;
