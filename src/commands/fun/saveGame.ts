import { saveGameData } from "#database/model/database";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('savegame').setDescription('Save the current game state');

export const run: SlashCommand['run'] = async (game: MonopolyGame, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
    if (game) {
        await saveGameData(game);
        await interaction.reply('Game state has been saved successfully!');
    } else {
        await interaction.reply('No game is currently running. Use /startgame to start a new game.');
    }
}
