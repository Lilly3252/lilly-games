import { Player } from "#utils/monopoly/player.js";
import { model, Schema } from "mongoose";

const playerSchema = new Schema<Player>({
	canBeFreed: { type: Boolean, required: true },
	position: { type: String, required: true },
	cash: { type: Number, required: true },
	properties: { type: Map, required: true },
	isJailed: { type: Boolean, required: true },
	ownsFreedomChance: { type: Boolean, required: true },
	ownsFreedomCommunity: { type: Boolean, required: true },
	_position: { type: Number, required: true },
	turnsInJail: { type: Number, required: true },
	session: { type: Schema.Types.Mixed, required: true } // Added session property
});
export default model<Player>("player", playerSchema);
