import { BoardSpace } from "#structures/monopoly/classes/boardSpace";
import { Card } from "#structures/monopoly/classes/card";
import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { Player as PlayerClass } from "#structures/monopoly/classes/players";
import { TurnManager } from "#structures/monopoly/classes/turnManager";
import fs from 'fs';
import path from 'path';
import { BoardSpaceModel, IBoardSpace } from "./boardSpace";
import { GameModel } from "./game";
import { IPlayer, PlayerModel } from './player';

/**
 * Converts a PlayerClass instance to an IPlayer object.
 * @param player - The PlayerClass instance to convert.
 * @returns The converted IPlayer object.
 */
const convertToIPlayer = (player: PlayerClass): IPlayer => {
    return {
        name: player.name,
        money: player.money,
        properties: player.properties,
        inJail: player.inJail,
        getOutOfJailFreeCards: player.getOutOfJailFreeCards,
        position: player.position
    } as unknown as IPlayer;
};

/**
 * Fetches the board data from the database.
 * @returns A promise that resolves to an array of IBoardSpace objects.
 */
const getBoardData = async (): Promise<IBoardSpace[]> => {
    try {
        const boardData = await BoardSpaceModel.find().exec();
        return boardData;
    } catch (err) {
        console.error(err.message);
        return [];
    }
};

/**
 * Checks if a player has multiple properties in the same group.
 * @param playerName - The name of the player.
 * @returns A promise that resolves to a boolean indicating if the player has multiple properties in the same group.
 */
export async function hasMultiplePropertiesInGroup(playerName: string): Promise<boolean> {
    const playerDoc = await getPlayerData(playerName);
    if (!playerDoc) {
        console.error(`Player ${playerName} not found`);
        return false;
    }

    const board: BoardSpace[] = await getBoardData(); // Fetch board data from the database

    const propertyGroups: { [key: number]: number } = {};

    playerDoc.properties.forEach(property => {
        const boardSpace = board.find(space => space.name === property.name);
        if (boardSpace && boardSpace.group) {
            boardSpace.group.forEach(groupId => {
                if (!propertyGroups[groupId]) {
                    propertyGroups[groupId] = 0;
                }
                propertyGroups[groupId]++;
            });
        }
    });

    return Object.values(propertyGroups).some(count => count > 1);
}

/**
 * Saves the game data to the database.
 * @param game - The MonopolyGame instance to save.
 */
export async function saveGameData(game: MonopolyGame): Promise<void> {
    const playerDocs = await Promise.all(game.players.map(async player => {
        const playerDoc = new PlayerModel({
            name: player.name,
            position: player.position,
            money: player.money,
            properties: player.properties,
            inJail: player.inJail,
            getOutOfJailFreeCards: player.getOutOfJailFreeCards
        });
        await playerDoc.save();
        return playerDoc;
    }));

    const gameDoc = new GameModel({
        board: game.board,
        players: playerDocs.map(doc => doc._id),
        currentPlayerIndex: game.turnManager.currentPlayerIndex
    });

    await gameDoc.save();
}

type Player = InstanceType<typeof PlayerClass>;

/**
 * Loads card data from a JSON file.
 * @param filePath - The path to the JSON file.
 * @returns An array of Card objects.
 */
export const loadCardData = (filePath: string): Card[] => {
    const data = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
    const cardData = JSON.parse(data);
    return cardData.map((card: any) => new Card(card.type, card.CardActionType , card.description, card.amount));
};

/**
 * Converts a player document to a Player instance.
 * @param playerDoc - The player document to convert.
 * @returns The converted Player instance.
 */
export function convertToPlayer(playerDoc: any): Player {
    const player = new PlayerClass(playerDoc.name);
    player.position = playerDoc.position;
    player.money = playerDoc.money;
    player.properties = playerDoc.properties;
    player.inJail = playerDoc.inJail;
    player.getOutOfJailFreeCards = playerDoc.getOutOfJailFreeCards;
    return player;
}

/**
 * Loads game data from the database.
 * @returns A promise that resolves to a MonopolyGame instance or null if no game is found.
 */
export async function loadGameData(): Promise<MonopolyGame | null> {
    const gameDoc = await GameModel.findOne().populate('players').exec();
    if (!gameDoc) {
        return null;
    }

    const players: Player[] = gameDoc.players.map(convertToPlayer);

    const turnManager = new TurnManager(players);

    const chanceCards = loadCardData('src/structures/monopoly/JSON/chance.json');
    const communityChestCards = loadCardData('src/structures/monopoly/JSON/community.json');
    const game = new MonopolyGame(players, gameDoc.board, chanceCards, communityChestCards);
    game.turnManager = turnManager;
    return game;
}

/**
 * Saves player data to the database.
 * @param player - The IPlayer object to save.
 * @returns A promise that resolves to the saved IPlayer object.
 */
const savePlayerData = async (player: IPlayer): Promise<IPlayer> => {
    try {
        const existingPlayer = await PlayerModel.findOne({ name: player.name });
        if (existingPlayer) {
            existingPlayer.money = player.money;
            existingPlayer.properties = player.properties;
            existingPlayer.inJail = player.inJail;
            existingPlayer.getOutOfJailFreeCards = player.getOutOfJailFreeCards;
            existingPlayer.position = player.position;
            await existingPlayer.save();
        } else {
            const newPlayer = new PlayerModel(player);
            await newPlayer.save();
        }
        console.log('Player data saved');
        return player;
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

/**
 * Fetches player data from the database.
 * @param playerName - The name of the player.
 * @returns A promise that resolves to the IPlayer object or null if no player is found.
 */
const getPlayerData = async (playerName: string): Promise<IPlayer | null> => {
    try {
        const playerData = await PlayerModel.findOne({ name: playerName });
        return playerData;
    } catch (err) {
        console.error(err.message);
        return null;
    }
};

export { convertToIPlayer, getPlayerData, IPlayer, savePlayerData };

