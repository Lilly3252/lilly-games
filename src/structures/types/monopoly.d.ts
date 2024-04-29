/**
 * Interface representing the properties of a space on the Monopoly board.
 */
export interface Property {
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



export interface GameSession {
    public properties: Property[];

    getPropertyByName(name: string): Property | undefined;
    getPropertiesByType(type: string): Property[];
    getTotalPropertyValue(): number;
    getTotalRent(): number;
    getPropertiesByGroup(groupNumber: number): Property[];
    getPropertyWithHighestRent(): Property | undefined;
}
interface Player {
    name: string;
    id:string
    balance: number;
    properties: Property[];
    hasLeftGame:boolean = false
    isJailed:boolean = false
    doublesCount:number
    rollsCount:number
    isInJail:boolean
    move({ number }: { number: number; }): void
    payMoney({ amount }: { amount: number; }): void
    toggleMortgage(propertyToMortgage: MonopolyProperty): Promise<void>
    toggleUnmortgage(propertyToUnmortgage: MonopolyProperty): Promise<void>
    getIndexOfProperty(property: MonopolyProperty): number
    addProperty(property: Property): void;
    removeProperty(property: Property): void;
    getTotalPropertyValue(): number;
    calculateRepairCost(house: number, hotel: number): number;
    incrementDoublesCount(): void
    resetDoublesCount(): void
    incrementRollsCount(): void 
    receiveMoney({ amount }: { amount: number; }): void
    setPlayerPosition(value: number):void
    isPropertyMortgaged(property: MonopolyProperty): boolean;
}

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