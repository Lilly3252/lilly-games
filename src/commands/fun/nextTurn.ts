import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('nextturn').setDescription('start a monopoly game');

export const run: SlashCommand['run'] = async (game: MonopolyGame,interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
if (game) {
    game.nextTurn();
    const currentPlayer = game.turnManager.getCurrentPlayer();
    await interaction.reply(`It's now ${currentPlayer.name}'s turn!`);
} else {
    await interaction.reply('No game is currently running. Use /startgame to start a new game.');
}
}