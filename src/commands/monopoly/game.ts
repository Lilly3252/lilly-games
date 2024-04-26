import { MonopolyCommand } from "#slashyInformations/index.js";
import { Monopoly } from "#utils/monopoly/classes/monopoly.js";
import { Player, propertiesData } from "#utils/monopoly/classes/player.js";
import { BoardData, MonopolyCreationData, PlayerCreationData } from "#utils/types/index.js";
import jsonData from "#utils/monopoly/JSON/board.json" with { type: "json" };
import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { GuildTextBasedChannel } from "discord.js";

export default class extends Command<typeof MonopolyCommand> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override async chatInput(interaction: InteractionParam, args: ArgsParam<typeof MonopolyCommand>, locale: LocaleParam): Promise<void> {
		const textChannel: GuildTextBasedChannel = interaction.channel;
		const board: BoardData = jsonData;
		const propertyMap = propertiesData;
		const monopolyData: MonopolyCreationData = {
			board,
			propertyMap,
			textChannel
		};

		const monopolyGame = new Monopoly(monopolyData);
		// mannn i dont know about that one ...

		function createPlayers(numberPlayer: number): Player[] {
			const players: Player[] = [];

			for (const x of players) {
				const playerData: PlayerCreationData = {
					name: "Alice",
					balance: 1500,
					//that is broken
					guildMember: { id: interaction.member.id, displayName: interaction.member.displayName },
					propertyMap: propertyMap,
					board: board,
					interaction: interaction
				};

				const player = new Player(playerData);
				players.push(player);
			}

			return players;
		}

		// Create 8 Player instances
		createPlayers(8);

		monopolyGame.startGame();
	}
}
