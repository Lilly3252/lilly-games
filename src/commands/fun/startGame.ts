//import emoji from "../../structures/JSONs/emoji.json" assert {type : "json"};
import { Monopoly } from '#structures/monopoly/classes/monopoly';
import type { SlashCommand } from '#type/index.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('startgame').setDescription('start a monopoly game');

export const run: SlashCommand['run'] = async (monopoly : Monopoly , interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
	await monopoly.startGame()
    console.log("Game Started!")
}
