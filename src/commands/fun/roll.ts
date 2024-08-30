import { convertToIPlayer, getPlayerData, savePlayerData } from "#database/model/database";
import { convertToProperty } from "#structures/monopoly/classes/boardSpace";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { checkAllAchievements, checkChanceTaker, checkCommunityHelper } from "#structures/monopoly/functions/rewards";
import { chanceCards, communityChestCards } from "#structures/monopoly/game";
import { createPropertyOrRailroadCard } from "#structures/monopoly/imageGeneration";
import { SlashCommand } from "#type/slashCommands";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Deck } from "./../../structures/monopoly/classes/deck";

export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('roll').setDescription('start a monopoly game');

export const run: SlashCommand['run'] = async (game: MonopolyGame, interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
    if (game) {
        const currentPlayer = game.turnManager.getCurrentPlayer();
        const diceRoll = game.rollDice();
        currentPlayer.move(diceRoll, game.board);
        const currentBoardSpaceName = currentPlayer.getCurrentBoardSpaceName(game.board);
        await interaction.reply(`${currentPlayer.name} rolled a ${diceRoll} and moved to ${currentBoardSpaceName} (position ${currentPlayer.position})!`);
        const currentBoardSpace = game.board[currentPlayer.position];
        const properties = currentPlayer.properties.map(prop => convertToProperty(prop));
        await createPropertyOrRailroadCard(currentBoardSpace, interaction, properties);
        const playersData = convertToIPlayer(currentPlayer)

        await checkAllAchievements(playersData)
        
        const chanceDeck = new Deck(chanceCards);
        const communityDeck = new Deck(communityChestCards);

        if (currentBoardSpaceName === 'Chance') {
            const drawnCard = chanceDeck.drawCard();
            if (drawnCard) {
                await interaction.followUp(`You drew a Chance card: ${drawnCard.description}`);
                drawnCard.executeAction(game, currentPlayer);
                currentPlayer.addDrawnCard(currentPlayer , drawnCard)
                await checkChanceTaker(playersData, currentPlayer.chanceCardsDrawn);
            }
        } else if (currentBoardSpaceName === 'Community Chest') {
            const drawnCard = communityDeck.drawCard();
            if (drawnCard) {
                await interaction.followUp(`You drew a Community Chest card: ${drawnCard.description}`);
                drawnCard.executeAction(game, currentPlayer);
                currentPlayer.addDrawnCard(currentPlayer , drawnCard)
                await checkCommunityHelper(playersData, currentPlayer.communityChestCardsDrawn);
            }
        }

  
        const playerData = await getPlayerData(currentPlayer.name);
        if (playerData) {
            playerData.position = currentPlayer.position;
            playerData.money = currentPlayer.money;
            playerData.properties = currentPlayer.properties;
            playerData.inJail = currentPlayer.inJail;
            playerData.getOutOfJailFreeCards = currentPlayer.getOutOfJailFreeCards;
            await savePlayerData(playerData);
        }
    } else {
        await interaction.reply('No game is currently running. Use /startgame to start a new game.');
    }
}
