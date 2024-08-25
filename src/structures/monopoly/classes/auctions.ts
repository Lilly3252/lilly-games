import { Player } from "./players";
import { Property } from "./property";

/**
 * Represents an auction in the Monopoly game.
 */
export class Auction {
    property: Property;
    players: Player[];
    highestBid: number;
    highestBidder: Player | null;

    /**
     * Creates an instance of Auction.
     * @param property - The property being auctioned.
     * @param players - The players participating in the auction.
     */
    constructor(property: Property, players: Player[]) {
        this.property = property;
        this.players = players;
        this.highestBid = 0;
        this.highestBidder = null;
    }

    /**
     * Initializes the auction with a property and players.
     * @param property - The property being auctioned.
     * @param players - The players participating in the auction.
     */
    initializeAuction(property: Property, players: Player[]) {
        this.property = property;
        this.players = players;
        this.highestBid = 0;
        this.highestBidder = null;
    }

    /**
     * Places a bid in the auction.
     * @param player - The player placing the bid.
     * @param amount - The amount of the bid.
     */
    placeBid(player: Player, amount: number) {
        if (amount > this.highestBid) {
            this.highestBid = amount;
            this.highestBidder = player;
            console.log(`${player.name} placed a bid of $${amount} for ${this.property.name}`);
        } else {
            console.log(`Bid of $${amount} is too low. Current highest bid is $${this.highestBid}`);
        }
    }

    /**
     * Finalizes the auction and transfers the property to the highest bidder.
     */
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

    /**
     * Updates the money of the highest bidder.
     */
    updatePlayerMoney() {
        if (this.highestBidder) {
            this.highestBidder.updateMoney(-this.highestBid);
        }
    }
}
