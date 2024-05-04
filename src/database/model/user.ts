import { MonopolyPlayerProperty } from '#type/monopoly';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from './../configuration';

interface UserAttributes {
    userID: string;
    balance: number;
    position: number;
    isJailed: boolean
    hasLeftGame: boolean
    ownsFreedomChance:boolean
    doublesCount: number
    rollsCount: number 
    properties: Array<MonopolyPlayerProperty>;
}

class player extends Model<UserAttributes> implements UserAttributes {
    public userID!: string;
    public balance!: number;
    public position!: number
    public isJailed: boolean;
    public doublesCount: number
    public rollsCount: number 
    public hasLeftGame: boolean;
    public ownsFreedomChance: boolean;
    public properties!: Array<MonopolyPlayerProperty>;
}
export const Player = sequelize.define<player, UserAttributes>('User', {
    userID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    balance: {
        type: DataTypes.INTEGER,
        defaultValue: 1500
    },
    hasLeftGame: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isJailed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ownsFreedomChance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    doublesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rollsCount:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    position: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    properties: {
        type: DataTypes.JSONB
    }
});