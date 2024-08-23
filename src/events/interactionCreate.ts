
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Auction } from '#structures/monopoly/classes/auctions';
import { MonopolyGame } from '#structures/monopoly/classes/monopoly';
import type { ContextCommand, event, ModalCommand, SlashCommand } from '#type/index.js';
import type { AutocompleteInteraction, ButtonInteraction, Interaction, ModalSubmitInteraction } from 'discord.js';

export const name: event['name'] = 'interactionCreate';
export const once: event['once'] = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
	if(interaction.isButton()){
		return handleButton(interaction)
	}
};


async function handleCommand(interaction: Interaction): Promise<any> {
	try {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName) as SlashCommand;
			if (command) {
				await command.run(MonopolyGame ,interaction);
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
async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<any> {
	try {
		const command = interaction.client.commands.get(interaction.commandName) as SlashCommand | undefined;
		if (command) {
			await command.run(MonopolyGame,interaction);
		}
	} catch (err: unknown) {
		return interaction.respond([]);
	}
}
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
async function handleButton(interaction: ButtonInteraction): Promise<any> {
	try {
		if (interaction.customId === 'buy') {
			if (game) {
				const currentPlayer = game.turnManager.getCurrentPlayer();
				const space = game.board[currentPlayer.position];
				if (space.type === 'property' && !space.owner) {
					currentPlayer.updateMoney(-space.cost);
					currentPlayer.addProperty(space.name);
					space.owner = currentPlayer;
					await interaction.update({ content: `${currentPlayer.name} bought ${space.name} for $${space.cost}`, components: [] });
				} else {
					await interaction.update({ content: 'This space cannot be bought or auctioned.', components: [] });
				}}} if (interaction.customId === 'auction') {
					if (game) {
						const currentPlayer = game.turnManager.getCurrentPlayer();
						const space = game.board[currentPlayer.position];
				
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
				}
	} catch (err: unknown) {
		return interaction.reply('Cannot find that button...');
	}
}
