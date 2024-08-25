import { getPlayerData, savePlayerData } from "#database/model/database";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder()
    .setName('bankrupt')
    .setDescription('Declare bankruptcy')
    .addStringOption(option => 
        option.setName('toPlayers')
            .setDescription('Comma-separated list of players to share assets with')
            .setRequired(true)
    );

export const run: SlashCommand['run'] = async (
    game: MonopolyGame,
    interaction: ChatInputCommandInteraction<'cached'>
): Promise<void> => {
    if (game) {
        const currentPlayer = game.turnManager.getCurrentPlayer();
        const toPlayersNames = interaction.options.getString('toPlayers')?.split(',').map(name => name.trim()) || [];
        const toPlayers = game.players.filter(player => toPlayersNames.includes(player.name));

        currentPlayer.declareBankruptcy(toPlayers);

        await interaction.reply(`${currentPlayer.name} has declared bankruptcy and shared assets with ${toPlayersNames.join(', ')}!`);

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

        for (const toPlayer of toPlayers) {
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
}
