import { Player } from "./players";
import { Property } from "./property";

/**
 * Represents the bank in the Monopoly game.
 */
export class Bank {
    private money: number;
    private houses: number;
    private hotels: number;
    private property: Property;

    /**
     * Creates an instance of Bank.
     * @param initialMoney - The initial amount of money the bank has.
     * @param initialHouses - The initial number of houses the bank has.
     * @param initialHotels - The initial number of hotels the bank has.
     */
    constructor(initialMoney: number, initialHouses: number, initialHotels: number) {
        this.money = initialMoney;
        this.houses = initialHouses;
        this.hotels = initialHotels;
    }

    /**
     * Distributes money from the bank to a player.
     * @param player - The player receiving the money.
     * @param amount - The amount of money to distribute.
     */
    distributeMoney(player: Player, amount: number) {
        if (this.money >= amount) {
            player.updateMoney(amount);
            this.money -= amount;
        } else {
            console.log('Bank does not have enough money.');
        }
    }

    /**
     * Receives money from a player to the bank.
     * @param player - The player giving the money.
     * @param amount - The amount of money to receive.
     */
    receiveMoney(player: Player, amount: number) {
        player.updateMoney(-amount);
        this.money += amount;
    }

    /**
     * Allows a player to buy a house from the bank.
     * @param player - The player buying the house.
     * @param property - The property on which the house is being bought.
     */
    buyHouse(player: Player, property: string) {
        if (this.houses > 0) {
            player.updateMoney(-this.property.houseCost);
            this.houses -= 1;
        } else {
            console.log('No houses left in the bank.');
        }
    }

    /**
     * Allows a player to buy a hotel from the bank.
     * @param player - The player buying the hotel.
     * @param property - The property on which the hotel is being bought.
     */
    buyHotel(player: Player, property: string) {
        if (this.hotels > 0) {
            player.updateMoney(-this.property.hotelCost);
            this.hotels -= 1;
        } else {
            console.log('No hotels left in the bank.');
        }
    }
}
