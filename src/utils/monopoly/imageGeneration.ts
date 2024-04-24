import Canvas from "@napi-rs/canvas";

export async function createPropertyCard(property) {
	const canvas = Canvas.createCanvas(290, 382);
	canvas.width = 290;
	const x = canvas.width / 2;
	const ctx = canvas.getContext("2d");
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
	ctx.fillText(`FEES: $${property.rent}`, x, 125);
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
	ctx.fillText(`Mortgage Value: $${property.mortgage}`, x, 270);
	ctx.fillText(`Boosts cost $${property.house}`, x, 290);
	ctx.fillText(`Badges, $${property.house}. plus 4 boosts`, x, 310);
	ctx.font = "italic 12px Futura";
	ctx.fillText(`If a player owns ALL the lots of any Color-group,`, x, 340);
	ctx.fillText(`the rent is Doubled on Unimproved Lots in that group.`, x, 355);
}
/*
// display the property card in code


createPropertyCard(property);
const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"));
interaction.reply({ files: [attachment] });
*/
export async function createRailroadCard(property) {
	const canvas = Canvas.createCanvas(290, 382);
	canvas.width = 290;
	const x = canvas.width / 2;
	const ctx = canvas.getContext("2d");
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
	ctx.fillText(`FEES: $${property.rent}`, x, 210);
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

	//...the rest i guess
}
/*
// display the railroad card in code


createRailroadCard(property);
const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"));
interaction.reply({ files: [attachment] });


*/
/*
import Canvas from "@napi-rs/canvas";

export async function createPropertyOrRailroadCard(property) {
    const canvas = Canvas.createCanvas(290, 382);
    canvas.width = 290;
    const x = canvas.width / 2;
    const ctx = canvas.getContext("2d");
    let templateMonopolyImage;

    if (property.type === "property") {
        templateMonopolyImage = await Canvas.loadImage("src/utils/embeds/monopoly/templateTDM.jpg");
        ctx.fillStyle = property.color;
        ctx.textAlign = "center";
        ctx.font = "bold 15px Copperplate Gothic Std";
        ctx.fillText("PROPERTY", x, 30);
    } else if (property.type === "railroad") {
        templateMonopolyImage = await Canvas.loadImage("src/utils/embeds/monopoly/templateRRM.jpg");
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.font = "bold 15px Copperplate Gothic Std";
        ctx.fillText("RAILROAD", x, 180);
    }

    ctx.drawImage(templateMonopolyImage, 0, 0);           

    // Common card details for both property and railroad
    ctx.font = "bold 25px Copperplate Gothic Std";
    ctx.fillText(property.name, x, property.type === "property" ? 60 : 155);
    ctx.font = "20px Futura";
    ctx.fillText(`FEES: $${property.rent}`, x, property.type === "property" ? 125 : 210);

    // Houses for property or Choo Choos for railroad
    if (property.type === "property") {
        // Property details
        ctx.textAlign = "right";
        ctx.fillText("With 1 Boost:", x + 3, 160);
        ctx.fillText("With 2 Boosts:", x + 10, 180);
        ctx.fillText("With 3 Boosts:", x + 10, 200);
        ctx.fillText("With 4 Boosts:", x + 10, 220);
        ctx.fillText(`$`, x + 70, 160);
        ctx.fillText(`${property.multpliedrent[0]}`, x + 110, 160);
        ctx.fillText(`${property.multpliedrent[1]}`, x + 110, 180);
        ctx.fillText(`${property.multpliedrent[2]}`, x + 110, 200);
        ctx.fillText(`${property.multpliedrent[3]}`, x + 110, 220);
        ctx.textAlign = "center";
        ctx.fillText(`With BADGES: ${property.multpliedrent[4]}`, x, 240);
        ctx.fillText(`Mortgage Value: $${property.mortgage}`, x, 270);
        ctx.fillText(`Boosts cost $${property.house}`, x, 290);
        ctx.fillText(`Badges, $${property.house}. plus 4 boosts`, x, 310);
        ctx.font = "italic 12px Futura";
        ctx.fillText(`If a player owns ALL the lots of any Color-group,`, x, 340);
        ctx.fillText(`the rent is Doubled on Unimproved Lots in that group.`, x, 355);
    } else if (property.type === "railroad") {
        // Railroad details
        ctx.textAlign = "right";
        ctx.fillText("With 2 Choo Choos:", x + 45, 260);
        ctx.fillText("With 3 Choo Choos:", x + 45, 290);
        ctx.fillText("With 4 Choo Choos:", x + 45, 320);
        ctx.fillText(`$`, x + 70, 260);
        ctx.fillText(`${property.multpliedrent[0]}`, x + 110, 260);
        ctx.fillText(`${property.multpliedrent[1]}`, x + 110, 290);
        ctx.fillText(`${property.multpliedrent[2]}`, x + 110, 320);
    }
	createPropertyOrRailroadCard(property)
    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"));
    interaction.reply({ files: [attachment] });
}*/
