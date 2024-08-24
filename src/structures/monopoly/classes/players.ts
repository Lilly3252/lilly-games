import { BoardSpace } from "./boardSpace";
import { Property } from "./property";

export class Player {
    name: string;
    position: number;
    money: number;
    properties: { name: string, mortgaged: boolean }[];
    inJail: boolean;
    getOutOfJailFreeCards: number;
    isBankrupt: boolean;
    jailTurns: number;

    constructor(name: string) {
        this.name = name;
        this.position = 0; // Starting position on the board
        this.money = 1500; // Starting money for each player
        this.properties = []; // List of properties owned by the player
        this.inJail = false;
        this.getOutOfJailFreeCards = 0;
        this.isBankrupt = false;
        this.jailTurns = 0;
    }

    declareBankruptcy(toPlayer: Player | null) {
        if (toPlayer) {
            // Transfer properties to the other player
            this.properties.forEach(property => {
                toPlayer.addProperty(property.name);
            });
            // Transfer money to the other player
            toPlayer.updateMoney(this.money);
        }
        // Reset player's assets
        this.properties = [];
        this.money = 0;
        this.inJail = false;
        this.getOutOfJailFreeCards = 0;
        this.isBankrupt = true;
    }

    getCurrentBoardSpaceName(board: BoardSpace[]): string {
        return board[this.position].name;
    }

    move(steps: number, board: BoardSpace[]) {
        this.position = (this.position + steps) % board.length; // Move the player and wrap around the board
    }

    isPropertyMortgaged(propertyName: string): boolean {
        const property = this.properties.find(p => p.name === propertyName);
        return property ? property.mortgaged : false;
    }

    addProperty(property: string) {
        this.properties.push({ name: property, mortgaged: false }); // Add a new property to the player's list
    }

    updateMoney(amount: number) {
        this.money += amount; // Update the player's money by the specified amount
    }

    mortgageProperty(property: string, mortgageValue: number): boolean {
        const prop = this.properties.find(p => p.name === property && !p.mortgaged);
        if (prop) {
            prop.mortgaged = true; // Mark the property as mortgaged
            this.updateMoney(mortgageValue); // Add the mortgage value to the player's money
            return true;
        }
        return false;
    }

    unmortgageProperty(property: string, mortgageValue: number): boolean {
        const prop = this.properties.find(p => p.name === property && p.mortgaged);
        if (prop && this.money >= mortgageValue * 1.1) {
            prop.mortgaged = false; // Mark the property as unmortgaged
            this.updateMoney(-mortgageValue * 1.1); // Deduct the mortgage value plus interest from the player's money
            return true;
        }
        return false;
    }

    payRent(amount: number, toPlayer: Player): boolean {
        if (this.money >= amount) {
            this.updateMoney(-amount);
            toPlayer.updateMoney(amount);
            return true;
        }
        return false;
    }

    buyHouse(property: Property): boolean {
        if (this.money >= property.houseCost && property.houses < 4 && !property.hotel) {
            this.updateMoney(-property.houseCost);
            property.houses += 1;
            return true;
        }
        return false;
    }

    buyHotel(property: Property): boolean {
        if (this.money >= property.hotelCost && property.houses === 4 && !property.hotel) {
            this.updateMoney(-property.hotelCost);
            property.hotel = true;
            property.houses = 0;
            return true;
        }
        return false;
    }

    sellProperty(propertyName: string): boolean {
        const propertyIndex = this.properties.findIndex(p => p.name === propertyName);
        if (propertyIndex !== -1) {
            this.properties.splice(propertyIndex, 1);
            return true;
        }
        return false;
    }

    useGetOutOfJailFreeCard(): boolean {
        if (this.getOutOfJailFreeCards > 0) {
            this.getOutOfJailFreeCards -= 1;
            this.inJail = false;
            return true;
        }
        return false;
    }

    endTurn() {
        if (this.inJail) {
            this.jailTurns += 1;
        }
    }
}
