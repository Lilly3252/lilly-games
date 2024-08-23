//import emoji from "../../structures/JSONs/emoji.json" assert {type : "json"};
import { convertToIPlayer, savePlayerData } from '#database/model/database';
import { MonopolyGame } from '#structures/monopoly/classes/monopoly';
import { Player } from '#structures/monopoly/classes/players';
import { boardData } from '#structures/monopoly/game';
import type { SlashCommand } from '#type/index.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';


export const slashy: SlashCommand['slashy'] = new SlashCommandBuilder().setName('startgame').setDescription('start a monopoly game');

export const run: SlashCommand['run'] = async (game: MonopolyGame,interaction: ChatInputCommandInteraction<'cached'>): Promise<void> => {
    const playerNames = interaction.options.getString('players')?.split(',').map((name: string) => name.trim()) || [];
    // Create Player instances from player names
    const players = playerNames.map(name => new Player(name));
    game = new MonopolyGame(players, boardData);

    // Save initial player data to the database
    for (const player of game.players) {
        const playerData = convertToIPlayer(player);
        await savePlayerData(playerData);
    }
        await interaction.reply(`Monopoly game started with ${playerNames.join(', ')}!`);
    }


