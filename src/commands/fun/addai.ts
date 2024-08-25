import { AIPlayer } from "#structures/monopoly/classes/AIPlayer";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder()
    .setName('addai')
    .setDescription('Add AI players to the game')
    .addIntegerOption(option => 
        option.setName('count')
            .setDescription('Number of AI players to add')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(7)
    )
    .addStringOption(option => 
        option.setName('names')
            .setDescription('Comma-separated list of AI player names')
            .setRequired(false)
    );

export const run: SlashCommand['run'] = async (
    game: MonopolyGame,
    interaction: ChatInputCommandInteraction<'cached'>
): Promise<void> => { 
    if (!game) {
        await interaction.reply('No game found in this channel.');
        return;
    }

    const count = interaction.options.getInteger('count', true);
    const names = interaction.options.getString('names');
    const nameList = names ? names.split(',').map(name => name.trim()) : [];

    // Add the specified number of AI players to the game
    for (let aiIndex = 0; aiIndex < count; aiIndex++) {
        const aiName = nameList[aiIndex] || `AI Bot ${aiIndex + 1}`;
        const aiPlayer = new AIPlayer(aiName);
        game.addPlayer(aiPlayer);
    }

    await interaction.reply(`${count} AI player(s) added to the game!`);
};
