import { Player } from "./players";

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
        
    }
    isMortgaged(): boolean {
        return this.owner ? this.owner.isPropertyMortgaged(this.name) : false;
    }
    calculateRent(): number {
        if (this.hotel) {
            return this.multipliedRent[4];
        } else if (this.houses > 0) {
            return this.multipliedRent[this.houses - 1];
        } else {
            return this.rent;
        }
    }
}