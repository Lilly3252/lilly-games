import { AIPlayer } from "#structures/monopoly/classes/AIPlayer";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('nextturn').setDescription('Proceed to the next turn');

export const run: SlashCommand['run'] = async (game: MonopolyGame, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
    if (game) {
        game.nextTurn();
        const currentPlayer = game.turnManager.getCurrentPlayer();

        if (currentPlayer instanceof AIPlayer) {
            await interaction.reply(`It's now ${currentPlayer.name}'s turn! The AI player is making its move...`);
            await currentPlayer.makeMove(game);
            game.turnManager.nextTurn(); // Move to the next turn after AI player finishes its move
            const nextPlayer = game.turnManager.getCurrentPlayer();
            await interaction.followUp(`It's now ${nextPlayer.name}'s turn!`);
        } else {
            await interaction.reply(`It's now ${currentPlayer.name}'s turn!`);
        }
    } else {
        await interaction.reply('No game is currently running. Use /startgame to start a new game.');
    }
}
