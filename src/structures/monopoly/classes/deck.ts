import { Card } from "./card";

export class Deck {
    private cards: Card[];

    constructor(cards: Card[]) {
        this.cards = cards;
    }

    drawCard(): Card | undefined {
        return this.cards.shift();
    }

    addCard(card: Card) {
        this.cards.push(card);
    }
}