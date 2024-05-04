import { MonopolyPlayerProperty, Players, Property } from "#type/monopoly.js";
import { User } from "discord.js";

import { addHotelToProperty, addHouseToProperty, addPropertyToUser } from "#database/functions";
import { Player } from "#database/model/user";
import { readFileSync } from "node:fs";
import jsonData from "../JSON/board.json";
import MonopolyProperty from "./boardProperties";

export const propertiesData = Object.fromEntries(jsonData.map((item: MonopolyProperty) => [item.name, item])) as Record<string, Property>;

/**
 * Represents a player in the Monopoly game.
 */
export default class MonopolyPlayer implements Players {
	user: User;
	board: typeof jsonData;

	/**
	 * Increment the doubles count for the player when doubles are rolled.
	 */
	public async incrementDoublesCount(): Promise<void> {
		const user = await Player.findByPk(this.user.id);
		user.update({doublesCount: user.doublesCount++})
	}
	
	/**		
	 * add a Property to the user's database 
	 * 
	 * This function automatically see the position of the player 
	 * 
	 * preferred usage : with a button called "Buy!" 
	 */
	public async addProperty(): Promise<void> {
		const monopolyboard = JSON.parse(readFileSync("./structures/monopoly/JSON/board.json", 'utf8'))
		const index = await this.playerPosition()
		const selectedProperty = monopolyboard[index]
		await addPropertyToUser(this.user.id , selectedProperty , selectedProperty.cost)
    }

    public async removeProperty(property: string): Promise<void> {
		const user = await Player.findByPk(this.user.id);
		const ownedPropertyIndex = user.properties.findIndex(properties => properties.name === property);
        
        if (ownedPropertyIndex !== -1) {
            user.properties.splice(ownedPropertyIndex, 1);
        }
		user.save()
    }
	/**
	 * Reset the doubles count for the player to zero.
	 */
	public async resetDoublesCount(): Promise<void> {
		const user = await Player.findByPk(this.user.id);
		user.update({doublesCount: 0})
	}

	/**
	 * Increment the total number of rolls made by the player.
	 */
	public async incrementRollsCount(): Promise<void> {
		const user = await Player.findByPk(this.user.id);
		user.update({rollsCount: user.rollsCount++})
		
	}
	public async addHotel(property:MonopolyPlayerProperty){
		await addHotelToProperty(this.user.id, property.name, property.house)
	}
	
	public async addHouse(property:MonopolyPlayerProperty){
		await addHouseToProperty(this.user.id, property.name, property.house);
	}

	/**
	 * Move the player by a specified number of board spaces and handle passing Go.
	 * @param number The number of board spaces to move the player.
	 * @returns A Promise that resolves when the player has finished moving.
	 */
	public async move({ number }: { number: number; }): Promise<void> {
		const currentPositionOfPlayer =  await this.playerPosition()
		const newPosition = (currentPositionOfPlayer + number) % this.board.length;

		if (newPosition < currentPositionOfPlayer) {
			this.receiveMoney({ amount: 200 });
		}
		this.setPlayerPosition(newPosition) 
	}
	/**
	 * Increase the player's balance by the specified amount.
	 * @param amount The amount of money to receive.
	 */
	public async receiveMoney({ amount }: { amount: number; }): Promise<void> {
		const user = await Player.findByPk(this.user.id);
		user.update({balance: user.balance += amount})
	}

	public async setPlayerPosition(value: number):Promise<void> {
		const user = await Player.findByPk(this.user.id);
		if (value >= 0) {
		  user.update({position: user.position = value})
		} else {
		  throw new Error("Position value cannot be negative.");
		}
	  }
	async setOwnsFreedomChance(value:boolean):Promise<boolean>{
		const user = await Player.findByPk(this.user.id)
		user.ownsFreedomChance = value
		user.save()
		return
	}
	 async playerPosition(): Promise<number> {
		const user = await Player.findByPk(this.user.id)
		return user.position
	}
	
	public async isInJail(): Promise<boolean> {
		const user = await Player.findByPk(this.user.id)
        return user.isJailed
    }

   public async isJailed(value: boolean):Promise<void> {
		const user = await Player.findByPk(this.user.id)
        user.update({isJailed: user.isJailed = value})
	}

	public async isPropertyMortgaged(property:string): Promise<boolean> {
		const user = await Player.findByPk(this.user.id)
		const propMortgaged = user.properties.find(properties => properties.name === property)
        return propMortgaged.isMortgaged;
    }

	
	/**
	 * Deduct the specified amount from the player's balance if they have enough balance, otherwise log a message indicating insufficient funds.
	 * @param amount The amount of money to pay.
	 */
	public async payMoney({ amount }: { amount: number; }): Promise<void> {
		const user = await Player.findByPk(this.user.id)
		if (user.balance >= amount) {
			user.update({balance: user.balance -= amount})
		} 
	}
	/**
	 * Toggle the mortgage status of the specified property owned by the player.
	 * @param propertyToMortgage The name of the property to mortgage.
	 */
	public async toggleMortgage(propertyToMortgage: string): Promise<void> {
		const user = await Player.findByPk(this.user.id)
		const ownedPropertyIndex = user.properties.findIndex(properties => properties.name === propertyToMortgage);
		if (ownedPropertyIndex !== -1) {
			const ownedProperty = user.properties[ownedPropertyIndex];
			if (ownedProperty.isOwned(this,ownedProperty) && this.isPropertyMortgaged(propertyToMortgage)){
				console.log("This property is already mortgaged")
				return
			}else{
				this.receiveMoney({amount: ownedProperty.mortgage})
				ownedProperty.isMortgaged = true
				user.save()
				return console.log("This property is now mortgaged")
			}
		}
		
	}
	/**
	 * Toggle the mortgage status of the specified property owned by the player to unmortgaged.
	 * @param propertyToUnmortgage The name of the property to unmortgage.
	 */
	public async toggleUnmortgage(propertyToUnmortgage: string): Promise<void> {
		const user = await Player.findByPk(this.user.id)
		const ownedPropertyIndex = user.properties.findIndex(properties => properties.name === propertyToUnmortgage);
    
    if (ownedPropertyIndex !== -1) {
        const ownedProperty = user.properties[ownedPropertyIndex];
        
        if (!this.isPropertyMortgaged(propertyToUnmortgage)) {
            console.log("This property is not mortgaged");
            return;
        } else {
            const unmortgageCost = ownedProperty.cost;
            
            if (user.balance >= unmortgageCost) {
				this.payMoney({amount: unmortgageCost});
                ownedProperty.isMortgaged = false;
				user.save()
                console.log("This property has been unmortgaged");
            } else {
                console.log("Player does not have enough money to unmortgage this property");
            }
        }
    } else {
        console.log("This property is not owned by the player");
	}}

	// other stuff can be added here after..
	
}
