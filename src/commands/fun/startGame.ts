
import { loadCardData } from '#database/model/database';
import { MonopolyGame } from '#structures/monopoly/classes/monopoly';
import { Player } from '#structures/monopoly/classes/players';
import { acceptButton, declineButton } from '#structures/monopoly/functions/buttons';
import { createStandardEmbed } from '#structures/monopoly/functions/standarizedEmbed';
import { gameDataMap } from '#structures/monopoly/game';
import type { SlashCommand } from '#type/index.js';
import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder()
    .setName('startgame')
    .setDescription('Start a Monopoly game')
    .addStringOption(option => 
        option.setName('players')
            .setDescription('Comma-separated list of player names')
            .setRequired(true)
    );

export const run: SlashCommand['run'] = async (
    game: MonopolyGame,
    interaction: ChatInputCommandInteraction<'cached'>
): Promise<void> => {
    const playerNames = interaction.options.getString('players')?.split(',').map((name: string) => name.trim()) || [];
    // Create Player instances from player names
    const players = playerNames.map(name => new Player(interaction.user));
    const chanceCards = loadCardData('src/structures/monopoly/JSON/chance.json');
    const communityChestCards = loadCardData('src/structures/monopoly/JSON/community.json');
   

    const rulesEmbed = createStandardEmbed(
      'Monopoly Rules',
      `
    **Objective**: The goal is to become the wealthiest player through buying, renting, and selling property.
    
    **Setup**: Each player starts with \$1500. Players take turns rolling two dice and moving their token around the board.
    
    **Buying Property**: When you land on an unowned property, you can buy it from the bank. If you don't buy it, the property goes to auction.
    
    **Paying Rent**: If you land on a property owned by another player, you must pay them rent. The rent amount depends on the property's development.
    
    **Building Houses and Hotels**: Once you own all properties in a color group, you can build houses and hotels to increase rent.
    
    **Chance and Community Chest**: Landing on these spaces requires you to draw a card and follow its instructions.
    
    **Jail**: You can go to jail by landing on the "Go to Jail" space, drawing a "Go to Jail" card, or rolling doubles three times in a row. You can get out by rolling doubles, using a "Get Out of Jail Free" card, or paying \$50.
    
    **Free Parking**: This is a resting space where nothing happens.
    
    **Bankruptcy**: If you owe more money than you can pay, you must declare bankruptcy. You turn over all your assets to the player you owe or the bank.
    
    **Winning the Game**: The game ends when all but one player has gone bankrupt. The remaining player is the winner.
    
    Enjoy the game and have fun!
      `,
      '#0099ff',
      [],
      'Powered by Monopoly Game'
    );
    
const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(acceptButton,declineButton
    );

await interaction.reply({ embeds: [rulesEmbed], components: [row] });
gameDataMap.set(interaction.id, { playerNames, chanceCards, communityChestCards });
   
};

