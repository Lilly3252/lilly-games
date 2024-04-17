import type { guild } from "#type/database.js";
import { model, Schema } from "mongoose";

const guildSchema = new Schema<guild>({
	name: { type: String },
	guildID: { type: String }
});
export default model<guild>("guild", guildSchema);
