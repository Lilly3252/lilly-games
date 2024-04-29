import { Player, Property } from "#type/index";

export default class MonopolyProperty implements Property{
    public name: string;
    public type: string;
    public cost: number;
    public mortgage: number;
    public color: string;
    public rent: number;
    public multpliedrent: number[];
    public group: number[];
    public house: number;
	public repairCost: number;
    public isMortgaged: boolean = false
    constructor(name: string, type: string, cost: number, mortgage: number, color: string, rent: number, multpliedrent: number[], group: number[], house: number) {
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.mortgage = mortgage;
        this.color = color;
        this.rent = rent;
        this.multpliedrent = multpliedrent;
        this.group = group;
        this.house = house;
    }

    public isOwned(player:Player){
        return Boolean(player.properties.includes(this))
    }
    public getName(): string {
        return this.name;
    }

    public getType(): string {
        return this.type;
    }

    public getCost(): number {
        return this.cost;
    }

    public getMortgage(): number {
        return this.mortgage;
    }

    public getColor(): string {
        return this.color;
    }

    public getRent(): number {
        return this.rent;
    }

    public getMultpliedrent(): number[] {
        return this.multpliedrent;
    }

    public getGroup(): number[] {
        return this.group;
    }

    public getHouse(): number  {
        return this.multpliedrent[0];
    }
    public getHotel(): number   {
        return this.multpliedrent[4];
    }
}