import { Card } from "./card";

/**
 * Represents a deck of cards in the Monopoly game.
 */
export class Deck {
    private cards: Card[];

    /**
     * Creates an instance of Deck.
     * @param cards - The initial set of cards in the deck.
     */
    constructor(cards: Card[]) {
        this.cards = cards;
    }

    /**
     * Draws a card from the deck.
     * @returns The drawn card, or undefined if the deck is empty.
     */
    drawCard(): Card | undefined {
        return this.cards.shift();
    }

    /**
     * Adds a card to the deck.
     * @param card - The card to add to the deck.
     */
    addCard(card: Card) {
        this.cards.push(card);
    }
}
