import { Player } from '#structures/monopoly/classes/players';
import mongoose, { Document, Schema } from 'mongoose';

interface IProperty {
    name: string;
    type: string;
    cost?: number;
    mortgage?: number;
    mortgaged:boolean;
    color?: string;
    rent?: number;
    multpliedrent?: number[];
    group?: number[];
    house?: number; // house cost
    houses?: number | null; // house the player has ( 0 to 4 )
    hotel?: number | null
    corner?: boolean;
    owner?: Player;
    position: number;
    isMortgaged:() => boolean
}


interface IPlayer extends Document {
    userId: string;
    name: string;
    position: number;
    money: number;
    properties: IProperty[];
    inJail: boolean;
    getOutOfJailFreeCards: number;
    isBankrupt: boolean;
    jailTurns: number;
    achievements: {
        name: string;
        description: string;
        dateEarned: Date;
    }[];
}

const PlayerSchema: Schema = new Schema({
    userId: { type: String, required: true }, 
    name: { type: String, required: true },
    position: { type: Number, default: 0 },
    money: { type: Number, default: 1500 },
    properties: { type: [{
        name: { type: String, required: true },
        mortgaged: { type: Boolean, default: false },
        house: { type: Number, default: 0 },
        houses: { type: Number, default: 0 },
        group: { type: [Number], default: [] }
    }], default: [] },
    inJail: { type: Boolean, default: false },
    getOutOfJailFreeCards: { type: Number, default: 0 },
    isBankrupt: { type: Boolean, default: false },
    jailTurns: { type: Number, default: 0 },
    achievements: { 
        type: [{
            name: { type: String, required: true },
            description: { type: String, required: true },
            dateEarned: { type: Date, default: Date.now }
        }], 
        default: [] 
    }
});

const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);

export { IPlayer, IProperty, PlayerModel };

