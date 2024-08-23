import { getPlayerData, savePlayerData } from "#database/model/database";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder()
    .setName('bankrupt')
    .setDescription('Declare bankruptcy');

export const run: SlashCommand['run'] = async (
    game: MonopolyGame,
    interaction: ChatInputCommandInteraction<'cached'>
): Promise<void> => {
    if (game) {
        const currentPlayer = game.turnManager.getCurrentPlayer();
        const toPlayerName = interaction.options.getString('toPlayer');
        const toPlayer = game.players.find(player => player.name === toPlayerName) || null;

        currentPlayer.declareBankruptcy(toPlayer);

        await interaction.reply(`${currentPlayer.name} has declared bankruptcy!`);

        // Update player data in the database
        const playerData = await getPlayerData(currentPlayer.name);
        if (playerData) {
            playerData.position = currentPlayer.position;
            playerData.money = currentPlayer.money;
            playerData.properties = currentPlayer.properties;
            playerData.inJail = currentPlayer.inJail;
            playerData.getOutOfJailFreeCards = currentPlayer.getOutOfJailFreeCards;
            await savePlayerData(playerData);
        }

        if (toPlayer) {
            const toPlayerData = await getPlayerData(toPlayer.name);
            if (toPlayerData) {
                toPlayerData.position = toPlayer.position;
                toPlayerData.money = toPlayer.money;
                toPlayerData.properties = toPlayer.properties;
                toPlayerData.inJail = toPlayer.inJail;
                toPlayerData.getOutOfJailFreeCards = toPlayer.getOutOfJailFreeCards;
                await savePlayerData(toPlayerData);
            }
        }
    } else {
        await interaction.reply('No game is currently running. Use /startgame to start a new game.');
    }
};
