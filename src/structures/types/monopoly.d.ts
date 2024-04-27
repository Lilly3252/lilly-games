/**
 * Interface representing the properties of a space on the Monopoly board.
 */
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

/**
 * Type representing a property in the Monopoly game.
 */
export interface PropertyData {
    name: string;
    owner: string | null;
    mortgaged: boolean;
    houses: number;
    hotels: number;
}

/**
 * Type alias for mapping property names to their respective BoardSpace data.
 */
export type PropertyMap = Record<string, BoardSpace>;

/**
 * Type representing the result of a dice roll in the Monopoly game.
 */
export interface DiceRollResult {
    sum: number;
    double: boolean;
    dice1: number;
    dice2: number;
}

/**
 * Type alias for an array of BoardSpace objects representing the Monopoly board.
 */
export type BoardData = BoardSpace[];

/**
 * Union type representing a BoardSpace or Property.
 */
export type BoardSpaceOrProperty = PropertyMap | PropertyData;

/**
 * Interface representing a Chance card in the Monopoly game.
 */
export interface ChanceCard {
    description: string;
    type: string;
    amount: number | string | number[];
}

/**
 * Interface representing a Community Chest card in the Monopoly game.
 */
export interface CommunityCard {
    description: string;
    type: string;
    amount: number | number[];
}

/**
 * Interface representing the data needed to create a player in the Monopoly game.
 */
export interface PlayerCreationData {
    name: string;
    balance: number;
    guildMember: GuildMember;
    propertyMap: PropertyMap;
    board: BoardData;
}

/**
 * Interface representing the data needed to create a Monopoly game instance.
 */
export interface MonopolyCreationData {
    board: BoardData;
    propertyMap: PropertyMap;
    textChannel: GuildTextBasedChannel;
}