import { IProperty, PlayerModel } from "#database/model/player";
import { BoardSpace } from "./boardSpace";
import { Property } from "./property";

export class Player {
    name: string;
    position: number;
    money: number;
    properties: IProperty[];
    inJail: boolean;
    getOutOfJailFreeCards: number;
    isBankrupt: boolean;
    jailTurns: number;

    constructor(name: string) {
        this.name = name;
        this.position = 0;
        this.money = 1500;
        this.properties = [];
        this.inJail = false;
        this.getOutOfJailFreeCards = 0;
        this.isBankrupt = false;
        this.jailTurns = 0;
    }

    async save() {
        const playerData = await PlayerModel.findOne({ name: this.name });
        if (playerData) {
            playerData.position = this.position;
            playerData.money = this.money;
            playerData.properties = this.properties;
            playerData.inJail = this.inJail;
            playerData.getOutOfJailFreeCards = this.getOutOfJailFreeCards;
            playerData.isBankrupt = this.isBankrupt;
            playerData.jailTurns = this.jailTurns;
            await playerData.save();
        } else {
            const newPlayer = new PlayerModel(this);
            await newPlayer.save();
        }
    }

    async declareBankruptcy(toPlayer: Player | null) {
        if (toPlayer) {
            this.properties.forEach(property => {
                toPlayer.addProperty(property.name);
            });
            toPlayer.updateMoney(this.money);
        }
        this.properties = [];
        this.money = 0;
        this.inJail = false;
        this.getOutOfJailFreeCards = 0;
        this.isBankrupt = true;
        await this.save();
    }

    getCurrentBoardSpaceName(board: BoardSpace[]): string {
        return board[this.position].name;
    }

    move(steps: number, board: BoardSpace[]) {
        this.position = (this.position + steps) % board.length;
        this.save();
    }

    isPropertyMortgaged(propertyName: string): boolean {
        const property = this.properties.find(p => p.name === propertyName);
        return property ? property.mortgaged : false;
    }

    addProperty(property: string) {
        this.properties.push({
            name: property,
            mortgaged: false,
            house: 0,
            houses: 0,
            group: []
        });
        this.save();
    }

    updateMoney(amount: number) {
        this.money += amount;
        this.save();
    }

    mortgageProperty(property: string, mortgageValue: number): boolean {
        const prop = this.properties.find(p => p.name === property && !p.mortgaged);
        if (prop) {
            prop.mortgaged = true;
            this.updateMoney(mortgageValue);
            this.save();
            return true;
        }
        return false;
    }

    unmortgageProperty(property: string, mortgageValue: number): boolean {
        const prop = this.properties.find(p => p.name === property && p.mortgaged);
        if (prop && this.money >= mortgageValue * 1.1) {
            prop.mortgaged = false;
            this.updateMoney(-mortgageValue * 1.1);
            this.save();
            return true;
        }
        return false;
    }

    payRent(amount: number, toPlayer: Player): boolean {
        if (this.money >= amount) {
            this.updateMoney(-amount);
            toPlayer.updateMoney(amount);
            this.save();
            return true;
        }
        return false;
    }

    buyHouse(property: Property): boolean {
        if (this.money >= property.houseCost && property.houses < 4 && !property.hotel) {
            this.updateMoney(-property.houseCost);
            property.houses += 1;
            this.save();
            return true;
        }
        return false;
    }

    buyHotel(property: Property): boolean {
        if (this.money >= property.hotelCost && property.houses === 4 && !property.hotel) {
            this.updateMoney(-property.hotelCost);
            property.hotel = true;
            property.houses = 0;
            this.save();
            return true;
        }
        return false;
    }

    sellProperty(propertyName: string): boolean {
        const propertyIndex = this.properties.findIndex(p => p.name === propertyName);
        if (propertyIndex !== -1) {
            this.properties.splice(propertyIndex, 1);
            this.save();
            return true;
        }
        return false;
    }

    useGetOutOfJailFreeCard(): boolean {
        if (this.getOutOfJailFreeCards > 0) {
            this.getOutOfJailFreeCards -= 1;
            this.inJail = false;
            this.save();
            return true;
        }
        return false;
    }

    endTurn() {
        if (this.inJail) {
            this.jailTurns += 1;
        }
        this.save();
    }
}
