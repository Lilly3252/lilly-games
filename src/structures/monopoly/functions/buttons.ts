import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Property } from '../classes/property';

/**
 * Creates an action row with buttons based on the property state.
 * @param property - The property for which to create the action row.
 * @returns An ActionRowBuilder with the appropriate buttons.
 */
export function createActionRow(property: Property, properties: Property[]): ActionRowBuilder<ButtonBuilder> {
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

    const buildHouseButton = new ButtonBuilder()
        .setCustomId('buildHouse')
        .setLabel('Build House')
        .setStyle(ButtonStyle.Success);

    const buildHotelButton = new ButtonBuilder()
        .setCustomId('buildHotel')
        .setLabel('Build Hotel')
        .setStyle(ButtonStyle.Success);

    if (!property.owner) {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(buyButton, auctionButton);
    } else if (property.owner && !property.isMortgaged) {
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(mortgageButton, sellButton, auctionButton);

        if (property.ownsEntireGroup(properties)) {
            if (property.houses < 4) {
                actionRow.addComponents(buildHouseButton);
            } else if (property.houses === 4 && !property.hotel) {
                actionRow.addComponents(buildHotelButton);
            }
        }

        return actionRow;
    } else if (property.owner && property.isMortgaged) {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(unmortgageButton, sellButton, auctionButton);
    }
}

/**
 * Button to accept an action.
 */
export const acceptButton = new ButtonBuilder()
    .setCustomId('accept')
    .setLabel('Accept')
    .setStyle(ButtonStyle.Success);

/**
 * Button to decline an action.
 */
export const declineButton = new ButtonBuilder()
    .setCustomId('decline')
    .setLabel('Decline')
    .setStyle(ButtonStyle.Danger);
