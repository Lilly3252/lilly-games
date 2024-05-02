
import { Monopoly } from '#structures/monopoly/classes/monopoly';
import { MakeDiceRoll } from '#structures/monopoly/functions/functions ';
import type { SlashCommand } from '#type/index.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('join').setDescription('join a monopoly game');

export const run: SlashCommand['run'] = async (monopoly : Monopoly , interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
	
    MakeDiceRoll(interaction,monopoly.currentPlayer)
    console.log(`${interaction.user.id} rolled a dice and he's now at ${monopoly.currentPlayer.playerPosition}`);
    
    return
}
