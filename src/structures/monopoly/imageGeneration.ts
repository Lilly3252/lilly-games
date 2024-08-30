import Canvas from "@napi-rs/canvas";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ChatInputCommandInteraction } from "discord.js";
import { BoardSpace, convertToProperty } from "./classes/boardSpace";
import { Property } from "./classes/property"; // Assuming Property class is imported from here
import { CURRENCY_SYMBOL } from "./constant";
import { auctionButton, buildHotelButton, buildHouseButton, buyButton, mortgageButton, sellButton, unmortgageButton } from "./functions/buttons";

export async function createPropertyOrRailroadCard(property: BoardSpace, interaction: ChatInputCommandInteraction, properties: Property[]) {
	const canvas = Canvas.createCanvas(290, 382);
	canvas.width = 290;
	const x = canvas.width / 2;
	const ctx = canvas.getContext("2d");
	if (property.type === "property") {
		const templateMonopolyImage = await Canvas.loadImage("src/utils/embeds/monopoly/templateTDM.jpg");
		ctx.drawImage(templateMonopolyImage, 0, 0);
		//colored square with property name
		ctx.fillStyle = property.color;
		ctx.fillRect(12, 10, 267, 63);
		ctx.fillStyle = "#000000";
		ctx.textAlign = "center";
		ctx.font = "bold 15px Copperplate Gothic Std";
		ctx.fillText("PROPERTY", x, 30);
		ctx.font = "bold 25px Copperplate Gothic Std";
		ctx.fillText(property.name, x, 60);
		// White square
		ctx.font = "20px Futura";
		ctx.fillText(`FEES: ${CURRENCY_SYMBOL}${property.rent}`, x, 125);
		// Houses
		ctx.textAlign = "right";
		ctx.fillText("With 1 Boost:", x + 3, 160);
		ctx.fillText("With 2 Boosts:", x + 10, 180);
		ctx.fillText("With 3 Boosts:", x + 10, 200);
		ctx.fillText("With 4 Boosts:", x + 10, 220);
		//Prices based on how many houses
		ctx.fillText(`$`, x + 70, 160);
		ctx.fillText(`${property.multpliedrent[0]}`, x + 110, 160);
		ctx.fillText(`${property.multpliedrent[1]}`, x + 110, 180);
		ctx.fillText(`${property.multpliedrent[2]}`, x + 110, 200);
		ctx.fillText(`${property.multpliedrent[3]}`, x + 110, 220);
		//...the rest i guess
		ctx.textAlign = "center";
		ctx.fillText(`With BADGES: ${property.multpliedrent[4]}`, x, 240);
		ctx.fillText(`Mortgage Value: ${CURRENCY_SYMBOL}${property.mortgage}`, x, 270);
		ctx.fillText(`Boosts cost ${CURRENCY_SYMBOL}${property.house}`, x, 290);
		ctx.fillText(`Badges, ${CURRENCY_SYMBOL}${property.house}. plus 4 boosts`, x, 310);
		ctx.font = "italic 12px Futura";
		ctx.fillText(`If a player owns ALL the lots of any Color-group,`, x, 340);
		ctx.fillText(`the rent is Doubled on Unimproved Lots in that group.`, x, 355);
	} else if (property.type === "railroad") {
		const templateMonopolyImage = await Canvas.loadImage("src/utils/embeds/monopoly/templateRRM.jpg");
		ctx.drawImage(templateMonopolyImage, 0, 0);
		//colored square with property name
		ctx.fillStyle = "#000000";
		ctx.textAlign = "center";
		ctx.font = "bold 15px Copperplate Gothic Std";
		ctx.fillText("RAILROAD", x, 180);
		ctx.font = "bold 25px Copperplate Gothic Std";
		ctx.fillText(property.name, x, 155);
		// White square
		ctx.font = "20px Futura";
		ctx.fillText(`FEES: ${CURRENCY_SYMBOL}${property.rent}`, x, 210);
		// Houses
		ctx.textAlign = "right";
		ctx.fillText("With 2 Choo Choos:", x + 45, 260);
		ctx.fillText("With 3 Choo Choos:", x + 45, 290);
		ctx.fillText("With 4 Choo Choos:", x + 45, 320);

		//Prices based on how many houses
		ctx.fillText(`$`, x + 70, 260);
		ctx.fillText(`${property.multpliedrent[0]}`, x + 110, 260);
		ctx.fillText(`${property.multpliedrent[1]}`, x + 110, 290);
		ctx.fillText(`${property.multpliedrent[2]}`, x + 110, 320);
	}

	const propertyInstance = convertToProperty(property);
	const row = createActionRow(propertyInstance, properties);
	const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"));
	await interaction.followUp({ files: [attachment], components: [row] });
}

function createActionRow(property: Property, properties: Property[]): ActionRowBuilder<ButtonBuilder> {
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
