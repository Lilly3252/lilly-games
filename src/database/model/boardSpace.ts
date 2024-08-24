import mongoose, { Document, Schema } from 'mongoose';

interface IBoardSpace extends Document {
    name: string;
    type: string;
    cost: number;
    mortgage: number;
    color: string;
    rent: number;
    multpliedrent: number[];
    group: number[];
    house: number;
    position: number;
    isMortgaged:() => boolean; 
}


const BoardSpaceSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    cost: { type: Number, required: true },
    mortgage: { type: Number, required: true },
    color: { type: String, required: true },
    rent: { type: Number, required: true },
    multpliedrent: { type: [Number], required: true },
    group: { type: [Number], required: true },
    house: { type: Number, required: true },
    position: { type: Number, required: true },
    isMortgaged: { type: Function, default: false } 
});


const BoardSpaceModel = mongoose.model<IBoardSpace>('BoardSpace', BoardSpaceSchema);

export { BoardSpaceModel, IBoardSpace };

