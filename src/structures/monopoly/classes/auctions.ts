import { Player } from "./players";
import { Property } from "./property";

export class Auction {
    property: Property;
    players: Player[];
    highestBid: number;
    highestBidder: Player | null;

    constructor(property: Property, players: Player[]) {
        this.property = property;
        this.players = players;
        this.highestBid = 0;
        this.highestBidder = null;
    }

    initializeAuction(property: Property, players: Player[]) {
        this.property = property;
        this.players = players;
        this.highestBid = 0;
        this.highestBidder = null;
    }

    placeBid(player: Player, amount: number) {
        if (amount > this.highestBid) {
            this.highestBid = amount;
            this.highestBidder = player;
            console.log(`${player.name} placed a bid of $${amount} for ${this.property.name}`);
        } else {
            console.log(`Bid of $${amount} is too low. Current highest bid is $${this.highestBid}`);
        }
    }

    finalizeAuction() {
        if (this.highestBidder) {
            this.updatePlayerMoney();
            this.highestBidder.addProperty(this.property.name);
            this.property.owner = this.highestBidder;
            console.log(`${this.highestBidder.name} won the auction for ${this.property.name} with a bid of $${this.highestBid}`);
        } else {
            console.log(`No bids were placed for ${this.property.name}`);
        }
    }

    updatePlayerMoney() {
        if (this.highestBidder) {
            this.highestBidder.updateMoney(-this.highestBid);
        }
    }
}