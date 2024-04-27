
import { Monopoly } from '#structures/monopoly/classes/monopoly';
import { Player } from '#structures/monopoly/classes/player';
import type { SlashCommand } from '#type/index.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('join').setDescription('join a monopoly game');

export const run: SlashCommand['run'] = async (monopoly : Monopoly , interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
	const newPlayer = new Player(`${interaction.user.displayName}` , 1500 , interaction.user)
    await monopoly.addPlayer(newPlayer)

    console.log("Character created!" + newPlayer)
}
