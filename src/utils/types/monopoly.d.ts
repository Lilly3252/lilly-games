import { GuildTextBasedChannel, GuildMemberResolvable, GuildMember } from "discord.js";
export interface BoardSpace {
	color?: string;
	cost?: number;
	group?: number[];
	house?: number;
	mortgage?: number;
	multipliedRent?: number[];
	name: string;
	rent?: number;
	type: string;
}

export interface Property {
	name: string;
	owner: string | null;
	mortgaged?: boolean;
	houses: number;
	hotels: number;
	// Add other property details as needed .. pretty sure i wont need to add something else..
}
export type PropertyMap = Record<string, BoardSpace>;

export interface DiceRollResult {
	sum: number;
	double: boolean;
	dice1: number;
	dice2: number;
}
export type BoardData = BoardSpace[];

export type BoardSpaceOrProperty = PropertyMap | Property;

export interface ChanceCard {
	description: string;
	type: string;
	amount: number | string | number[];
}
export interface CommunityCard {
	description: string;
	type: string;
	amount: number | number[];
}
export interface PlayerCreationData {
	name: string;
	balance: number;
	guildMember: GuildMember;
	propertyMap: PropertyMap;
	board: BoardData;
}
export interface MonopolyCreationData {
	board: BoardData;
	propertyMap: PropertyMap;
	textChannel: GuildTextBasedChannel;
}
