import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BoardSpace } from '../classes/boardSpace';

export function createActionRow(property: BoardSpace): ActionRowBuilder<ButtonBuilder> {
    const buyButton = new ButtonBuilder()
        .setCustomId('buy')
        .setLabel('Buy')
        .setStyle(ButtonStyle.Primary);

    const mortgageButton = new ButtonBuilder()
        .setCustomId('mortgage')
        .setLabel('Mortgage')
        .setStyle(ButtonStyle.Primary);

    const auctionButton = new ButtonBuilder()
        .setCustomId('auction')
        .setLabel('Auction')
        .setStyle(ButtonStyle.Secondary);

    const unmortgageButton = new ButtonBuilder()
        .setCustomId('unmortgage')
        .setLabel('Unmortgage')
        .setStyle(ButtonStyle.Primary);

    const sellButton = new ButtonBuilder()
        .setCustomId('sell')
        .setLabel('Sell')
        .setStyle(ButtonStyle.Danger);

    if (!property.owner) {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(buyButton, auctionButton);
    } else if (property.owner && !property.isMortgaged()) {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(mortgageButton, sellButton, auctionButton);
    } else if (property.owner && property.isMortgaged()) {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(unmortgageButton, sellButton, auctionButton);
    }
}
export const acceptButton = new ButtonBuilder()
.setCustomId('accept')
.setLabel('Accept')
.setStyle(ButtonStyle.Success);

export const declineButton = new ButtonBuilder()
.setCustomId('decline')
.setLabel('Decline')
.setStyle(ButtonStyle.Danger);