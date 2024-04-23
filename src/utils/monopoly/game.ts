import { GuildTextBasedChannel, Message } from "discord.js";
import config from "./JSON/config.json";
import { handlePlayersList, handleSessionStart, handleStatusChange } from "./collectors.js";
import { addUser, clearList, commencePlay, endGame, removeUser } from "./collectorCallbacks.js";
import { Session } from "./classes/session.js";
const currentSessions = [];

export function game() {
	let channel: GuildTextBasedChannel;
	let session: Session;

	if (!currentSessions.includes(channel.id)) {
		const playerAdder = handlePlayersList("add", channel);
		const playerRemover = handlePlayersList("remove", channel);
		const listClearer = handlePlayersList("clear", channel);
		const gameStarter = handleSessionStart("start", session, channel);
		const gameEnder = handleStatusChange("end", channel);
		channel.send('Starting a new game on channel "' + channel.name + '"');
		playerAdder.on("collect", addUser(channel));
		playerRemover.on("collect", removeUser(session, channel));
		listClearer.on("collect", clearList(session, channel));
		gameStarter.on("collect", commencePlay(session, channel, [playerAdder, listClearer]));
		gameEnder.on("collect", endGame(session, channel, currentSessions));
		currentSessions.push(channel.id);
	} else {
		channel.send(`This channel already has an ongoing session. If you want to end it, please type \`${config.prefix}end\`.`);
	}
}

/*import { MongoClient } from "mongodb";
// Replace the uri string with your MongoDB deployment's connection string.
const uri = "<connection string uri>";
const client = new MongoClient(uri);
interface Monopoly {
  // Define the properties of the Monopoly object here
}
interface Player {
  canBeFreed: boolean;
  position: string;
  cash: number;
  properties: Map<string, Monopoly>;
  isJailed: boolean;
  ownsFreedomChance: boolean;
  ownsFreedomCom: boolean;
  _position: number;
  session: Session;
  turnsInJail: number;
}
async function createPlayerDocument(player: Player): Promise<void> {
  try {
    const database = client.db("yourDatabaseName");
    const players = database.collection<Player>("players");
    await players.insertOne(player);
    console.log("Player document created successfully!");
  } finally {
    await client.close();
  }
}
const player: Player = {
  canBeFreed: true,
  position: "Go",
  cash: 200,
  properties: new Map<string, Monopoly>(),
  isJailed: false,
  ownsFreedomChance: false,
  ownsFreedomCom: false,
  _position: 0,
  session: new Session(),
  turnsInJail: 0,
};
createPlayerDocument(player).catch(console.error);*/
