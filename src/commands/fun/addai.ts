import { AIPlayer } from "#structures/monopoly/classes/AIPlayer";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder()
    .setName('addai')
    .setDescription('Add an AI player to the game');

export const run: SlashCommand['run'] = async (
    game: MonopolyGame,
    interaction: ChatInputCommandInteraction<'cached'>
): Promise<void> => { 
    if (!game) {
        await interaction.reply('No game found in this channel.');
        return;
    }
    const aiPlayer = new AIPlayer('AI Bot');
    game.addPlayer(aiPlayer);
    await interaction.reply('AI player added to the game!');
};
