import mongoose, { Document, Schema } from 'mongoose';

interface IProperty {
    name: string;
    mortgaged: boolean;
    house: number;
    houses: number;
    group: number[];
}

interface IPlayer extends Document {
    name: string;
    position: number;
    money: number;
    properties: IProperty[];
    inJail: boolean;
    getOutOfJailFreeCards: number;
    isBankrupt: boolean;
    jailTurns: number;
}

const PropertySchema: Schema = new Schema({
    name: { type: String, required: true },
    mortgaged: { type: Boolean, default: false },
    house: { type: Number, default: 0 },
    houses: { type: Number, default: 0 },
    group: { type: [Number], default: [] }
});

const PlayerSchema: Schema = new Schema({
    name: { type: String, required: true },
    position: { type: Number, default: 0 },
    money: { type: Number, default: 1500 },
    properties: { type: [PropertySchema], default: [] },
    inJail: { type: Boolean, default: false },
    getOutOfJailFreeCards: { type: Number, default: 0 },
    isBankrupt: { type: Boolean, default: false },
    jailTurns: { type: Number, default: 0 }
});

const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);

export { IPlayer, IProperty, PlayerModel };

