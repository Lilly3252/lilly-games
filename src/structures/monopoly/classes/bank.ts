import { Player } from "./players";
import { Property } from "./property";

export class Bank {
    private money: number;
    private houses: number;
    private hotels: number;
    private property:Property;

    constructor(initialMoney: number, initialHouses: number, initialHotels: number) {
        this.money = initialMoney;
        this.houses = initialHouses;
        this.hotels = initialHotels;
    }

    distributeMoney(player: Player, amount: number) {
        if (this.money >= amount) {
            player.updateMoney(amount);
            this.money -= amount;
        } else {
            console.log('Bank does not have enough money.');
        }
    }

    receiveMoney(player: Player, amount: number) {
        player.updateMoney(-amount);
        this.money += amount;
    }

    buyHouse(player: Player, property: string) {
        if (this.houses > 0) {
            player.updateMoney(-this.property.houseCost);
            this.houses -= 1;
        } else {
            console.log('No houses left in the bank.');
        }
    }

    buyHotel(player: Player, property: string) {
        if (this.hotels > 0) {
            player.updateMoney(-this.property.hotelCost);
            this.hotels -= 1;
        } else {
            console.log('No hotels left in the bank.');
        }
    }
}