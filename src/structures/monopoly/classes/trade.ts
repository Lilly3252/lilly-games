import { Player } from "./players";
import { Property } from "./property";

export class Trade {
    fromPlayer: Player;
    toPlayer: Player;
    property: Property;
    amount: number;

    constructor(fromPlayer: Player, toPlayer: Player, property: Property, amount: number) {
        this.fromPlayer = fromPlayer;
        this.toPlayer = toPlayer;
        this.property = property;
        this.amount = amount;
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
        if (this.validateTrade()) {
            this.updatePlayerMoney();
            this.updatePlayerProperties();
            console.log(`${this.fromPlayer.name} traded ${this.property.name} to ${this.toPlayer.name} for $${this.amount}`);
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
}