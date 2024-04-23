import { IPlayer } from "#utils/types/index.js";
import { model, Schema } from "mongoose";

const playerSchema = new Schema<IPlayer>({
	canBeFreed: { type: Boolean, required: true },
	position: { type: String, required: true },
	cash: { type: Number, required: true, default: 1500 },
	properties: { type: Map, required: true },
	isJailed: { type: Boolean, required: true },
	ownsFreedomChance: { type: Boolean, required: true, default: false },
	ownsFreedomCommunity: { type: Boolean, required: true, default: false },
	_position: { type: Number, required: true, default: 0 },
	turnsInJail: { type: Number, required: true },
	session: { type: Schema.Types.Mixed, required: true } // Added session property
});
export default model<IPlayer>("player", playerSchema);
