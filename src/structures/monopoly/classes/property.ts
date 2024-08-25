import { IProperty } from "#database/model/player";
import fs from 'fs';
import path from 'path';
import { Player } from "./players";

// Load property data from JSON file
const propertyData: IProperty[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'properties.json'), 'utf-8'));

// Function to calculate group sizes dynamically
function calculateGroupSizes(properties: IProperty[]): { [key: string]: number } {
    const groupSizes: { [key: string]: number } = {};

    properties.forEach(property => {
        const groupKey = `${property.group[0]}-${property.group[2]}`;
        if (!groupSizes[groupKey]) {
            groupSizes[groupKey] = 0;
        }
        groupSizes[groupKey]++;
    });

    return groupSizes;
}

// Calculate group sizes based on property data
const groupSizes = calculateGroupSizes(propertyData);

// Function to get the total number of properties in a group
function getTotalPropertiesInGroup(group: number[]): number {
    const groupKey = `${group[0]}-${group[2]}`;
    return groupSizes[groupKey] || 0;
}

// Function to check if a player owns all properties in a group
function ownsWholeGroup(properties: IProperty[], group: number[]): boolean {
    const groupKey = `${group[0]}-${group[2]}`;
    const totalPropertiesInGroup = group[2];
    const ownedPropertiesInGroup = properties.filter(property => {
        return property.group[0] === group[0] && property.group[2] === group[2];
    }).length;

    return ownedPropertiesInGroup === totalPropertiesInGroup;
}

// Function to find the group array for a given property name
function findGroupArray(propertyName: string, properties: IProperty[]): number[] | null {
    const property = properties.find(p => p.name === propertyName);
    return property ? property.group : null;
}
/**
 * Represents a property in the Monopoly game.
 */
export class Property {
    name: string;
    cost: number;
    mortgage: number;
    color: string;
    rent: number;
    multipliedRent: number[];
    houseCost: number;
    owner: Player | null;
    houses: number;
    hotel: boolean;
    hotelCost: number;
    isOwned: boolean;
    isDeveloped: boolean;
    mortgaged: boolean; 
    group:number[]

    /**
     * Creates an instance of Property.
     * @param data - The data to initialize the property.
     */
    constructor(data: any) {
        this.name = data.name;
        this.cost = data.cost;
        this.mortgage = data.mortgage;
        this.color = data.color;
        this.rent = data.rent;
        this.multipliedRent = data.multipliedRent;
        this.houseCost = data.house;
        this.hotelCost = data.house;
        this.owner = null;
        this.houses = 0;
        this.hotel = false;
        this.isOwned = false;
        this.isDeveloped = false;
        this.mortgaged = false; 
    }

    /**
     * Checks if the property is mortgaged.
     * @returns True if the property is mortgaged, false otherwise.
     */
    isMortgaged(): boolean {
        return this.mortgaged;
    }

    /**
     * Calculates the rent for the property.
     * @returns The rent amount.
     */
    calculateRent(): number {
        if (this.hotel) {
            return this.multipliedRent[4];
        } else if (this.houses > 0) {
            return this.multipliedRent[this.houses - 1];
        } else {
            return this.rent;
        }
    }

    /**
     * Buys the property for a player.
     * @param player - The player buying the property.
     */
    buyProperty(player: Player): void {
        if (!this.isOwned) {
            this.owner = player;
            this.isOwned = true;
            player.money -= this.cost;
            player.properties.push({
                name: this.name, mortgaged: this.mortgaged,
                house: 0,
                houses: 0,
                group: this.group 
            });
        }
    }

    /**
     * Mortgages the property.
     */
    mortgageProperty(): void {
        if (!this.isMortgaged()) {
            this.mortgaged = true;
            this.owner!.money += this.mortgage;
        }
    }

    /**
     * Unmortgages the property.
     */
    unmortgageProperty(): void {
        if (this.isMortgaged()) {
            this.mortgaged = false;
            this.owner!.money -= this.mortgage;
        }
    }
      /**
     * Checks if the owner owns the entire group.
     */
      ownsEntireGroup(properties: Property[]): boolean {
        const groupKey = `${this.group[0]}-${this.group[2]}`;
        const totalPropertiesInGroup = this.group[2];
        const ownedPropertiesInGroup = properties.filter(property => {
            return property.group[0] === this.group[0] && property.group[2] === this.group[2] && property.owner === this.owner;
        }).length;

        return ownedPropertiesInGroup === totalPropertiesInGroup;
    }


        /**
     * Builds a house on the property.
     */
        buildHouse(properties: Property[]): void {
            if (this.houses < 4 && !this.hotel && this.ownsEntireGroup(properties)) {
                this.houses += 1;
                this.owner!.money -= this.houseCost;
                this.isDeveloped = true;
            }
        }
    
        /**
         * Builds a hotel on the property.
         */
        buildHotel(properties: Property[]): void {
            if (this.houses === 4 && !this.hotel && this.ownsEntireGroup(properties)) {
                this.hotel = true;
                this.houses = 0;
                this.owner!.money -= this.hotelCost;
                this.isDeveloped = true;
            }
        }

    /**
     * Sells a house on the property.
     */
    sellHouse(): void {
        if (this.houses > 0) {
            this.houses -= 1;
            this.owner!.money += this.houseCost / 2;
            if (this.houses === 0 && !this.hotel) {
                this.isDeveloped = false;
            }
        }
    }

    /**
     * Sells a hotel on the property.
     */
    sellHotel(): void {
        if (this.hotel) {
            this.hotel = false;
            this.houses = 4;
            this.owner!.money += this.hotelCost / 2;
            this.isDeveloped = false;
        }
    }
}
