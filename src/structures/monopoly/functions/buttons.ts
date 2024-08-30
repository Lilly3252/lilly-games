import { ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * Button to buy a property.
 */
export const buyButton = new ButtonBuilder()
    .setCustomId('buy')
    .setLabel('Buy')
    .setStyle(ButtonStyle.Primary);

/**
 * Button to mortgage a property.
 */
export const mortgageButton = new ButtonBuilder()
    .setCustomId('mortgage')
    .setLabel('Mortgage')
    .setStyle(ButtonStyle.Primary);

/**
 * Button to auction a property.
 */
export const auctionButton = new ButtonBuilder()
    .setCustomId('auction')
    .setLabel('Auction')
    .setStyle(ButtonStyle.Secondary);

/**
 * Button to unmortgage a property.
 */
export const unmortgageButton = new ButtonBuilder()
    .setCustomId('unmortgage')
    .setLabel('Unmortgage')
    .setStyle(ButtonStyle.Primary);

/**
 * Button to sell a property.
 */
export const sellButton = new ButtonBuilder()
    .setCustomId('sell')
    .setLabel('Sell')
    .setStyle(ButtonStyle.Danger);

/**
 * Button to build a house on a property.
 */
export const buildHouseButton = new ButtonBuilder()
    .setCustomId('buildHouse')
    .setLabel('Build House')
    .setStyle(ButtonStyle.Success);

/**
 * Button to build a hotel on a property.
 */
export const buildHotelButton = new ButtonBuilder()
    .setCustomId('buildHotel')
    .setLabel('Build Hotel')
    .setStyle(ButtonStyle.Success);

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
