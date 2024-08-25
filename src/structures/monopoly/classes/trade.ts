import { Player } from "./players";
import { Property } from "./property";

/**
 * Represents a trade between two players in the Monopoly game.
 */
export class Trade {
    fromPlayer: Player;
    toPlayer: Player;
    property: Property;
    amount: number;
    isAccepted: boolean;

    /**
     * Creates an instance of Trade.
     * @param fromPlayer - The player offering the trade.
     * @param toPlayer - The player receiving the trade.
     * @param property - The property being traded.
     * @param amount - The amount of money involved in the trade.
     */
    constructor(fromPlayer: Player, toPlayer: Player, property: Property, amount: number) {
        this.fromPlayer = fromPlayer;
        this.toPlayer = toPlayer;
        this.property = property;
        this.amount = amount;
        this.isAccepted = false;
    }

    /**
     * Validates the trade to ensure the offering player owns the property.
     * @returns True if the trade is valid, false otherwise.
     */
    validateTrade(): boolean {
        if (this.fromPlayer.properties.some(p => p.name === this.property.name)) {
            return true;
        } else {
            console.log(`${this.fromPlayer.name} does not own ${this.property.name}`);
            return false;
        }
    }

    /**
     * Executes the trade if it is valid and accepted.
     */
    executeTrade() {
        if (this.validateTrade() && this.isAccepted) {
            this.updatePlayerMoney();
            this.updatePlayerProperties();
            console.log(`${this.fromPlayer.name} traded ${this.property.name} to ${this.toPlayer.name} for $${this.amount}`);
        } else {
            console.log(`Trade not executed. Either validation failed or trade was not accepted.`);
        }
    }

    /**
     * Updates the properties of the players involved in the trade.
     */
    updatePlayerProperties() {
        this.fromPlayer.properties = this.fromPlayer.properties.filter(p => p.name !== this.property.name);
        this.toPlayer.addProperty(this.property.name);
        this.property.owner = this.toPlayer;
    }

    /**
     * Updates the money of the players involved in the trade.
     */
    updatePlayerMoney() {
        this.fromPlayer.updateMoney(this.amount);
        this.toPlayer.updateMoney(-this.amount);
    }

    /**
     * Accepts the trade.
     */
    acceptTrade() {
        this.isAccepted = true;
        console.log(`${this.toPlayer.name} accepted the trade.`);
    }

    /**
     * Rejects the trade.
     */
    rejectTrade() {
        this.isAccepted = false;
        console.log(`${this.toPlayer.name} rejected the trade.`);
    }

    /**
     * Cancels the trade.
     */
    cancelTrade() {
        this.isAccepted = false;
        console.log(`Trade between ${this.fromPlayer.name} and ${this.toPlayer.name} has been cancelled.`);
    }
}
