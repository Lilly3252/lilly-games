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
    isOwned: boolean;
    isDeveloped: boolean;
    mortgaged: boolean; // Add this property

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
        this.mortgaged = false; // Initialize this property
    }

    isMortgaged(): boolean {
        return this.mortgaged;
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

    buyProperty(player: Player): void {
        if (!this.isOwned) {
            this.owner = player;
            this.isOwned = true;
            player.money -= this.cost;
            player.properties.push({ name: this.name, mortgaged: this.mortgaged });
        }
    }

    mortgageProperty(): void {
        if (!this.isMortgaged()) {
            this.mortgaged = true;
            this.owner!.money += this.mortgage;
        }
    }

    unmortgageProperty(): void {
        if (this.isMortgaged()) {
            this.mortgaged = false;
            this.owner!.money -= this.mortgage;
        }
    }

    buildHouse(): void {
        if (this.houses < 4 && !this.hotel) {
            this.houses += 1;
            this.owner!.money -= this.houseCost;
            this.isDeveloped = true;
        }
    }

    buildHotel(): void {
        if (this.houses === 4 && !this.hotel) {
            this.hotel = true;
            this.houses = 0;
            this.owner!.money -= this.hotelCost;
            this.isDeveloped = true;
        }
    }

    sellHouse(): void {
        if (this.houses > 0) {
            this.houses -= 1;
            this.owner!.money += this.houseCost / 2;
            if (this.houses === 0 && !this.hotel) {
                this.isDeveloped = false;
            }
        }
    }

    sellHotel(): void {
        if (this.hotel) {
            this.hotel = false;
            this.houses = 4;
            this.owner!.money += this.hotelCost / 2;
            this.isDeveloped = false;
        }
    }
}
