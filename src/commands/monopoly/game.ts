import { MonopolyCommand } from "#slashyInformations/index.js";
import { Monopoly } from "#utils/monopoly/classes/monopoly.js";
import { Player, propertiesData } from "#utils/monopoly/classes/player.js";
import { BoardData } from "#utils/types/index.js";
import jsonData from "#utils/monopoly/JSON/board.json" with { type: "json" };
import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { GuildTextBasedChannel, TextChannel } from "discord.js";

export default class extends Command<typeof MonopolyCommand> {
	public override async chatInput(interaction: InteractionParam, args: ArgsParam<typeof MonopolyCommand>, locale: LocaleParam): Promise<void> {
		const textChannel: GuildTextBasedChannel = interaction.channel as TextChannel;
		const initialBoard: BoardData = jsonData;

		const monopolyGame = new Monopoly(initialBoard, propertiesData, textChannel);
		const player1 = new Player("Player1", interaction.user, initialBoard);
		const player2 = new Player("Player2", interaction.user, initialBoard);

		monopolyGame.addPlayer(player1);
		monopolyGame.addPlayer(player2);

		monopolyGame.startGame();
	}
}
