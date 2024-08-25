/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { convertToIPlayer, savePlayerData } from '#database/model/database';
import { PlayerModel } from '#database/model/player';
import { Auction } from '#structures/monopoly/classes/auctions';
import { gameManager } from '#structures/monopoly/classes/gameManager';
import { MonopolyGame } from '#structures/monopoly/classes/monopoly';
import { Property } from '#structures/monopoly/classes/property';
import { boardData, gameDataMap } from '#structures/monopoly/game';
import type { ContextCommand, event, ModalCommand, SlashCommand } from '#type/index.js';
import type { AutocompleteInteraction, ButtonInteraction, Interaction, ModalSubmitInteraction } from 'discord.js';

/**
 * The name of the event.
 */
export const name: event['name'] = 'interactionCreate';

/**
 * Indicates whether the event should be executed only once.
 */
export const once: event['once'] = false;

/**
 * Handles the interaction create event.
 * @param interaction - The interaction object from Discord.
 */
export const run: event['run'] = async (interaction: Interaction<'cached'>): Promise<any> => {
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        return handleCommand(interaction);
    }
    if (interaction.isAutocomplete()) {
        return handleAutocomplete(interaction);
    }
    if (interaction.isModalSubmit()) {
        return handleModal(interaction);
    }
    if (interaction.isButton()) {
        return handleButton(interaction);
    }
};

/**
 * Handles chat input and context menu commands.
 * @param interaction - The interaction object from Discord.
 */
async function handleCommand(interaction: Interaction): Promise<any> {
    try {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName) as SlashCommand;
            if (command) {
                await command.run(MonopolyGame, interaction);
            }
        }
        if (interaction.isContextMenuCommand()) {
            const command = interaction.client.commands.get(interaction.commandName) as ContextCommand;
            if (command) {
                await command.run(interaction);
            }
        }
    } catch (err: any) {
        return console.error(err);
    }
}

/**
 * Handles autocomplete interactions.
 * @param interaction - The autocomplete interaction object from Discord.
 */
async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<any> {
    try {
        const command = interaction.client.commands.get(interaction.commandName) as SlashCommand | undefined;
        if (command) {
            await command.run(MonopolyGame, interaction);
        }
    } catch (err: unknown) {
        return interaction.respond([]);
    }
}

/**
 * Handles modal submit interactions.
 * @param interaction - The modal submit interaction object from Discord.
 */
async function handleModal(interaction: ModalSubmitInteraction): Promise<any> {
    try {
        const modal = interaction.client.modals.get(interaction.customId) as ModalCommand;
        if (modal) {
            await modal.run(interaction);
        }
    } catch (err: unknown) {
        return interaction.reply('Cannot find that modal...');
    }
}

let game: MonopolyGame | null = null;
/**
 * Handles button interactions.
 * @param interaction - The button interaction object from Discord.
 */
async function handleButton(interaction: ButtonInteraction): Promise<any> {
    try {
        const currentPlayer = game.turnManager.getCurrentPlayer();
        const space = game.board[currentPlayer.position];

        if (interaction.customId === 'buy') {
            if (game) {
                if (space.type === 'property' && !space.owner) {
                    currentPlayer.updateMoney(-space.cost);
                    currentPlayer.addProperty(space.name);
                    space.owner = currentPlayer;
                    await interaction.update({ content: `${currentPlayer.name} bought ${space.name} for $${space.cost}`, components: [] });
                } else {
                    await interaction.update({ content: 'This space cannot be bought or auctioned.', components: [] });
                }
            }
        } else if (interaction.customId === 'auction') {
            if (game) {
                if (space.type === 'property' && !space.owner) {
                    const auction = new Auction(space[currentPlayer.position], game.players);
                    await interaction.update({ content: `Auction started for ${space.name}!`, components: [] });

                    // Example of placing bids (this should be expanded to handle actual bidding logic)
                    auction.placeBid(currentPlayer, 100); // Example bid
                    auction.finalizeAuction();
                } else {
                    await interaction.update({ content: 'This space cannot be auctioned.', components: [] });
                }
            } else {
                await interaction.update({ content: 'No game is currently running. Use /startgame to start a new game.', components: [] });
            }
        } else if (interaction.customId === 'buildHouse') {
            if (space.type === 'property' && space.owner === currentPlayer) {
                const property = space as unknown as Property; // Cast BoardSpace to Property
                const properties = game.board.filter(s => s.type === 'property') as unknown as Property[]; // Filter to only include Property objects
                property.buildHouse(properties);
                await interaction.update({ content: `${currentPlayer.name} built a house on ${space.name}`, components: [] });
            } else {
                await interaction.update({ content: 'You cannot build a house on this property.', components: [] });
            }
        } else if (interaction.customId === 'buildHotel') {
            if (space.type === 'property' && space.owner === currentPlayer) {
                const property = space as unknown as Property; // Cast BoardSpace to Property
                const properties = game.board.filter(s => s.type === 'property') as unknown as Property[]; // Filter to only include Property objects
                property.buildHotel(properties);
                await interaction.update({ content: `${currentPlayer.name} built a hotel on ${space.name}`, components: [] });
            } else {
                await interaction.update({ content: 'You cannot build a hotel on this property.', components: [] });
            }
        } else if (interaction.customId === 'accept') {
            const gameData = gameDataMap.get(interaction.message.interaction.id);
            if (gameData) {
                const { playerNames, chanceCards, communityChestCards } = gameData;

                const players = playerNames.map(name => new PlayerModel(name));
                const game = new MonopolyGame(players, boardData, chanceCards, communityChestCards);
                gameManager.addGameForChannel(interaction.channelId, game);

                // Save initial player data to the database
                for (const player of game.players) {
                    const playerData = convertToIPlayer(player);
                    await savePlayerData(playerData);
                }

                await interaction.update({ content: `Monopoly game started with ${playerNames.join(', ')}!` });
                gameDataMap.delete(interaction.message.interaction.id);
            } else {
                await interaction.update({ content: 'Failed to start the game. Please try again.' });
            }
        } else if (interaction.customId === 'decline') {
            await interaction.update({ content: 'You declined the rules.' });
            return;
        }
    } catch (err: unknown) {
        return interaction.reply('Cannot find that button...');
    }
}
