import { Collection, GuildTextBasedChannel } from "discord.js";
import { MessageHandler } from "#utils/monopoly/message.js";
import { Document } from "mongoose";
export interface InterfaceMonopoly {
	name: string;
	type: string;
	corner?: boolean;
	cost?: number | null;
	mortgage?: number;
	color?: string;
	rent?: number;
	multpliedrent?: number[];
	group?: number[];
	house?: number;
}

export interface InterfaceChance {
	description: string;
	type: string;
	amount: number[] | number | string;
}
export interface InterfaceCommunity {
	description: string;
	type: string;
	amount: number[] | number;
}

export interface InterfacePlayer extends Document {
	canBeFreed: boolean;
	position: string;
	cash: number;
	properties: Map<string, InterfaceMonopoly>;
	isJailed: boolean;
	ownsFreedomChance: boolean;
	ownsFreedomCommunity: boolean;
	_position: number;
	session: Session;
	turnsInJail: number;
}
export interface InterfaceSession {
	players: Collection<string, Player>;
	channel: GuildTextBasedChannel;
	messageHandler: MessageHandler;
	occupiedProperties: Collection<string, unknown>;
	turnListener: NonNullable<unknown>;
	hotels: number;
	houses: number;
	hasChanceOutOfJail: boolean;
	hasCommunityOutOfJail: boolean;
	turnHandler: Generator<unknown, void, unknown>;
	started: boolean;
	board: (
		| { name: string; type: string; corner: boolean; cost?: undefined; mortgage?: undefined; color?: undefined; rent?: undefined; multpliedrent?: undefined; group?: undefined; house?: undefined }
		| { name: string; type: string; cost: number; mortgage: number; color: string; rent: number; multpliedrent: number[]; group: number[]; house: number; corner?: undefined }
		| { name: string; type: string; corner?: undefined; cost?: undefined; mortgage?: undefined; color?: undefined; rent?: undefined; multpliedrent?: undefined; group?: undefined; house?: undefined }
		| { name: string; type: string; cost: number; corner?: undefined; mortgage?: undefined; color?: undefined; rent?: undefined; multpliedrent?: undefined; group?: undefined; house?: undefined }
		| { name: string; type: string; cost: number; mortgage: number; group: number[]; corner?: undefined; color?: undefined; rent?: undefined; multpliedrent?: undefined; house?: undefined }
	)[];
	orderedPlayers: Array<number>;
}
