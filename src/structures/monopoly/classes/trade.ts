import { Player } from "./players";
import { Property } from "./property";

export class Trade {
    fromPlayer: Player;
    toPlayer: Player;
    property: Property;
    amount: number;
    isAccepted: boolean;

    constructor(fromPlayer: Player, toPlayer: Player, property: Property, amount: number) {
        this.fromPlayer = fromPlayer;
        this.toPlayer = toPlayer;
        this.property = property;
        this.amount = amount;
        this.isAccepted = false;
    }

    validateTrade(): boolean {
        if (this.fromPlayer.properties.some(p => p.name === this.property.name)) {
            return true;
        } else {
            console.log(`${this.fromPlayer.name} does not own ${this.property.name}`);
            return false;
        }
    }

    executeTrade() {
        if (this.validateTrade() && this.isAccepted) {
            this.updatePlayerMoney();
            this.updatePlayerProperties();
            console.log(`${this.fromPlayer.name} traded ${this.property.name} to ${this.toPlayer.name} for $${this.amount}`);
        } else {
            console.log(`Trade not executed. Either validation failed or trade was not accepted.`);
        }
    }

    updatePlayerProperties() {
        this.fromPlayer.properties = this.fromPlayer.properties.filter(p => p.name !== this.property.name);
        this.toPlayer.addProperty(this.property.name);
        this.property.owner = this.toPlayer;
    }

    updatePlayerMoney() {
        this.fromPlayer.updateMoney(this.amount);
        this.toPlayer.updateMoney(-this.amount);
    }

    acceptTrade() {
        this.isAccepted = true;
        console.log(`${this.toPlayer.name} accepted the trade.`);
    }

    rejectTrade() {
        this.isAccepted = false;
        console.log(`${this.toPlayer.name} rejected the trade.`);
    }

    cancelTrade() {
        this.isAccepted = false;
        console.log(`Trade between ${this.fromPlayer.name} and ${this.toPlayer.name} has been cancelled.`);
    }
}
