import { MonopolyGame } from "#structures/monopoly/classes/monopoly";
import { Player as PlayerClass } from "#structures/monopoly/classes/players";
import { TurnManager } from "#structures/monopoly/classes/turnManager";
import { GameModel } from "./game";
import { IPlayer, Player } from './player';


const convertToIPlayer = (player:PlayerClass): IPlayer => {
    return {
        name: player.name,
        money: player.money,
        properties: player.properties,
        inJail: player.inJail,
        getOutOfJailFreeCards: player.getOutOfJailFreeCards,
        position: player.position
    } as IPlayer;
};


// database/model/database.ts

export async function saveGameData(game: MonopolyGame): Promise<void> {
    const playerDocs = await Promise.all(game.players.map(async player => {
        const playerDoc = new Player({
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

function convertToPlayer(playerDoc: any): Player {
    const player = new PlayerClass(playerDoc.name);
    player.position = playerDoc.position;
    player.money = playerDoc.money;
    player.properties = playerDoc.properties;
    player.inJail = playerDoc.inJail;
    player.getOutOfJailFreeCards = playerDoc.getOutOfJailFreeCards;
    return player;
}
export async function loadGameData(): Promise<MonopolyGame | null> {
    const gameDoc = await GameModel.findOne().populate('players').exec();
    if (!gameDoc) {
        return null;
    }

    const players: Player[] = gameDoc.players.map(convertToPlayer);

    const turnManager = new TurnManager(players);

    const game = new MonopolyGame(players, gameDoc.board);
    game.turnManager = turnManager; // Assign the turn manager separately
    return game;
}


const savePlayerData = async (player: IPlayer):Promise<IPlayer> =>  {
    try {
        const existingPlayer = await Player.findOne({ name: player.name });
        if (existingPlayer) {
            existingPlayer.money = player.money;
            existingPlayer.properties = player.properties;
            existingPlayer.inJail = player.inJail;
            existingPlayer.getOutOfJailFreeCards = player.getOutOfJailFreeCards;
            existingPlayer.position = player.position;
            await existingPlayer.save();
        } else {
            const newPlayer = new Player(player);
            await newPlayer.save();
        }
        console.log('Player data saved'); 
        return
    } catch (err) {
        console.error(err.message);
    }
};

const getPlayerData = async (playerName: string): Promise<IPlayer | null> => {
    try {
        const playerData = await Player.findOne({ name: playerName });
        return playerData;
    } catch (err) {
        console.error(err.message);
        return null;
    }
};

export { convertToIPlayer, getPlayerData, IPlayer, savePlayerData };

