import MonopolyProperty from "#structures/monopoly/classes/boardProperties";
import { User } from "discord.js";

/**
 * Interface representing the properties of a space on the Monopoly board.
 */
export interface Property extends MonopolyProperty{
    color?: string;
    cost?: number;
    group?: number[];
    house?: number;
    mortgage?: number;
    multipliedRent?: number[];
    name: string;
    rent?: number;
    type: string;
    isOwned(player: MonopolyPlayer ,property:MonopolyPlayerProperty):boolean
}

interface MonopolyPlayerProperty extends Property {
    property: Property,
    owner:User,
    house: number = 0
    hotel: number = 0
    isMortgaged: boolean = false
}

export interface GameSession {
    public properties: MonopolyPlayerProperty[];

    getPropertyByName(name: string): MonopolyPlayerProperty | undefined;
    getPropertiesByType(type: string):  MonopolyPlayerProperty[];
    getTotalPropertyValue(): number;
    getTotalRent(): number;
    getPropertiesByGroup(groupNumber: number):  MonopolyPlayerProperty[];
    getPropertyWithHighestRent():  MonopolyPlayerProperty | undefined;
}
interface Player {
    user:User
    balance: number;
    ownsFreedomChance:boolean = false
    properties: MonopolyPlayerProperty[];
    hasLeftGame: boolean = false
    isJailed: boolean = false
    doublesCount: number
    rollsCount: number
    isInJail: boolean
    move({ number }: { number: number; }): void
    payMoney({ amount }: { amount: number; }): void
    toggleMortgage(propertyToMortgage: Property): Promise<void>
    toggleUnmortgage(propertyToUnmortgage: Property): Promise<void>
    getIndexOfProperty(property: Property): number
    addProperty(property: Property): void;
    removeProperty(property: Property): void;
    getTotalPropertyValue(): number;
    calculateRepairCost(house: number, hotel: number): number;
    incrementDoublesCount(): void
    resetDoublesCount(): void
    incrementRollsCount(): void
    receiveMoney({ amount }: { amount: number; }): void
    setPlayerPosition(value: number): void
    isPropertyMortgaged(property: Property): boolean;
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
    user: User;   
}

/**
 * Interface representing the data needed to create a Monopoly game instance.
 */
export interface MonopolyCreationData {
    textChannel: GuildTextBasedChannel;
}