import mongoose, { Schema } from "mongoose";
import { IPlayer } from "./player";

interface IGame extends Document {
    board: any[];
    players: IPlayer[];
    currentPlayerIndex: number;
}

const GameSchema: Schema = new Schema({
    board: { type: Array, required: true },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    currentPlayerIndex: { type: Number, required: true }
});

const GameModel = mongoose.model<IGame>('Game', GameSchema);
export { GameModel, IGame };
