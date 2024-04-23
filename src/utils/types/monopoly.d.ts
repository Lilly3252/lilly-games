export interface BoardSpace {
	color?: string;
	cost?: number;
	group?: number[];
	house?: number;
	mortgage?: number;

	multipliedRent?: number[];
	// This interface is based on how the JSON file is structured
	name: string;
	rent?: number;
	type: string;
}
export interface DiceRollResult {
	sum: number;
	double: boolean;
	dice1: number;
	dice2: number;
}
export interface Property {
	name: string;
	owner: string | null;
	mortgaged?: boolean;
	// Add other property details as needed .. pretty sure i wont need to add something else..
}
export type PropertyMap = Record<string, BoardSpace>;

export type BoardData = BoardSpace[];
