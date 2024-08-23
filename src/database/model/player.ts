import mongoose, { Document, Schema } from 'mongoose';

interface IProperty {
    name: string;
    mortgaged: boolean;
}

interface IPlayer extends Document {
    name: string;
    money: number;
    properties: IProperty[];
    inJail: boolean;
    getOutOfJailFreeCards: number;
    position: number;
}

const PropertySchema: Schema = new Schema({
    name: { type: String, required: true },
    mortgaged: { type: Boolean, required: true }
});

const PlayerSchema: Schema = new Schema({
    name: { type: String, required: true },
    money: { type: Number, required: true },
    properties: { type: [PropertySchema], required: true },
    inJail: { type: Boolean, required: true },
    getOutOfJailFreeCards: { type: Number, required: true },
    position: { type: Number, required: true }
});

const Player = mongoose.model<IPlayer>('Player', PlayerSchema);

export { IPlayer, Player };

