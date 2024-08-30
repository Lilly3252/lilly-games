import { IProperty } from "#database/model/player";
import { Player } from "./players";
import { Property } from "./property";

// Function to convert BoardSpace to Property
export function convertToProperty(item: BoardSpace | IProperty): Property {
	return new Property({
		name: item.name,
		color:item.color,
		rent: item.rent,
		multpliedrent:item.multpliedrent,
		mortgage:item.mortgage,
		house: item.house,
		hotel: item.hotel,
		owner: item.owner,
		isMortgaged: item.isMortgaged(),
		type: item.type
	});
}  
/**
 * Represents a space on the Monopoly board.
 */
export interface BoardSpace {
    name: string;
    type: string;
    cost?: number;
    mortgage?: number;
    color?: string;
    rent?: number;
    multpliedrent?: number[];
    group?: number[];
    house?: number;
    hotel?: number | null
    corner?: boolean;
    owner?: Player;
    position: number; // Add position property
}

/**
 * Represents a space on the Monopoly board.
 */
export class BoardSpace {
    name: string;
    type: string;
    cost?: number;
    mortgage?: number;
    color?: string;
    rent?: number;
    multpliedrent?: number[];
    group?: number[];
    house?: number;
    corner?: boolean;
    owner?: Player;
    position: number; // Add position property

    /**
     * Creates an instance of BoardSpace.
     * @param data - The data to initialize the board space.
     */
    constructor(data: BoardSpace) {
        this.name = data.name;
        this.type = data.type;
        this.cost = data.cost;
        this.mortgage = data.mortgage;
        this.color = data.color;
        this.rent = data.rent;
        this.multpliedrent = data.multpliedrent;
        this.group = data.group;
        this.house = data.house;
        this.corner = data.corner;
        this.owner = data.owner;
        this.position = data.position; // Initialize position property
    }

    /**
     * Checks if the property is mortgaged.
     * @returns True if the property is mortgaged, false otherwise.
     */
    isMortgaged(): boolean {
        return this.owner ? this.owner.isPropertyMortgaged(this.name) : false;
    }
}
