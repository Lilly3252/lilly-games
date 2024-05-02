import { MonopolyPlayerProperty, Player, Property } from "#type/monopoly.js";
import { User } from "discord.js";

import jsonData from "../JSON/board.json";
import MonopolyProperty from "./boardProperties";

export const propertiesData = Object.fromEntries(jsonData.map((item: MonopolyProperty) => [item.name, item])) as Record<string, Property>;

/**
 * Represents a player in the Monopoly game.
 */
export default class MonopolyPlayer implements Player {
	user: User;
    balance: number;
    properties: MonopolyPlayerProperty[] = [];
    hasLeftGame: boolean = false;
    private _isJailed: boolean = false;
    doublesCount: number = 0;
    rollsCount: number = 0;
	private _position:number = 0
	board: typeof jsonData;
	ownsFreedomChance: boolean;

	/**
	 * Increment the doubles count for the player when doubles are rolled.
	 */
	public incrementDoublesCount(): void {
		this.doublesCount++;
	}

	public addProperty(property: MonopolyProperty): void {
		/*
		const monopolyboard = JSON.parse(readFileSync("./structures/monopoly/JSON/board.json", 'utf8'))
		const index = this.playerPosition
		const selectedProperty = monopolyboard[index];
		const data = {
			owner: this.user.username,
			property: selectedProperty  
		}*/
    }

    public removeProperty(property: MonopolyProperty): void {
        /*const index = this.properties.findIndex(p => p.property.name === property.name);
        if (index !== -1) {
            this.properties.splice(index, 1);
        }*/
    }

    getTotalPropertyValue(): number {
        return this.properties.reduce((total, property) => total + property.property.cost, 0);
    }
	/**
	 * Reset the doubles count for the player to zero.
	 */
	public resetDoublesCount(): void {
		this.doublesCount = 0;
	}

	/**
	 * Increment the total number of rolls made by the player.
	 */
	public incrementRollsCount(): void {
		this.rollsCount++;
	}

	/**
 * Calculates the total repair cost for houses and hotels based on the provided house and hotel costs.
 * @param houseCost The cost of repairing a single house.
 * @param hotelCost The cost of repairing a single hotel.
 * @returns The total cost of repairing all houses and hotels.
 * @throws Error if the properties data is invalid or not an array.
 */
	public calculateRepairCost(house: number, hotel: number): number {
			let totalRepairCost = 0;
			for (const property of this.properties) {
				 house = property.house
				 hotel = property.hotel
				totalRepairCost += house + hotel
			}
			return totalRepairCost;
		}

		public addHotel(property:MonopolyPlayerProperty){
			
		}
		public addHouse(property:MonopolyPlayerProperty){
			

		}
	/**
	 * Move the player by a specified number of board spaces and handle passing Go.
	 * @param number The number of board spaces to move the player.
	 * @returns A Promise that resolves when the player has finished moving.
	 */
	public move({ number }: { number: number; }): void {
		const newPosition = (this.playerPosition + number) % this.board.length;

		if (newPosition < this._position) {
			this.receiveMoney({ amount: 200 });
		}
		this.setPlayerPosition(newPosition) 
	}
	/**
	 * Increase the player's balance by the specified amount.
	 * @param amount The amount of money to receive.
	 */
	public receiveMoney({ amount }: { amount: number; }): void {
		this.balance += amount;
	}

	setPlayerPosition(value: number) {
		if (value >= 0) {
		  this._position = value;
		} else {
		  throw new Error("Position value cannot be negative.");
		}
	  }
	
	get playerPosition(): number {
		return this._position;
	}
	
	get isInJail(): boolean {
        return this._isJailed;
    }

    set isJailed(value: boolean) {
        this._isJailed = value;
	}
	isPropertyMortgaged(property: MonopolyProperty): boolean {
        return property.isMortgaged;
    }

	getIndexOfProperty(property: MonopolyProperty): number {
        return this.properties.findIndex(p => p.property === property);
    }
	/**
	 * Deduct the specified amount from the player's balance if they have enough balance, otherwise log a message indicating insufficient funds.
	 * @param amount The amount of money to pay.
	 */
	public async payMoney({ amount }: { amount: number; }): Promise<void> {
		if (this.balance >= amount) {
			this.balance -= amount;
		} 
	}
	/**
	 * Toggle the mortgage status of the specified property owned by the player.
	 * @param propertyToMortgage The name of the property to mortgage.
	 */
	public async toggleMortgage(propertyToMortgage: MonopolyProperty): Promise<void> {
		const ownedPropertyIndex = this.getIndexOfProperty(propertyToMortgage)
		if (ownedPropertyIndex !== -1) {
			const ownedProperty = this.properties[ownedPropertyIndex];
			if (propertyToMortgage.isOwned(this,ownedProperty) && propertyToMortgage.isMortgaged){
				console.log("This property is already mortgaged")
				return
			}else{
				ownedProperty.isMortgaged = true;
				return console.log("This property is now mortgaged")
			}
		}
		
	}
	/**
	 * Toggle the mortgage status of the specified property owned by the player to unmortgaged.
	 * @param propertyToUnmortgage The name of the property to unmortgage.
	 */
	public async toggleUnmortgage(propertyToUnmortgage: MonopolyProperty): Promise<void> {
		const ownedPropertyIndex = this.getIndexOfProperty(propertyToUnmortgage);
    
    if (ownedPropertyIndex !== -1) {
        const ownedProperty = this.properties[ownedPropertyIndex];
        
        if (!ownedProperty.isMortgaged) {
            console.log("This property is not mortgaged");
            return;
        } else {
            const unmortgageCost = ownedProperty.property.cost;
            
            if (this.balance >= unmortgageCost) {
                this.balance -= unmortgageCost;
                ownedProperty.isMortgaged = false;
                console.log("This property has been unmortgaged");
            } else {
                console.log("Player does not have enough money to unmortgage this property");
            }
        }
    } else {
        console.log("This property is not owned by the player");
	}}

	// other stuff can be added
}
