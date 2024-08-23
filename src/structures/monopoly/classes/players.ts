import { BoardSpace } from "./boardSpace";

export class Player {
    name: string;
    position: number;
    money: number;
    properties: { name: string, mortgaged: boolean }[];
    inJail: any;
    getOutOfJailFreeCards: any;

    constructor(name: string) {
        this.name = name;
        this.position = 0; // Starting position on the board
        this.money = 1500; // Starting money for each player
        this.properties = []; // List of properties owned by the player
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
}
