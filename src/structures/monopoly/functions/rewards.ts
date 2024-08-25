import { IProperty } from "#database/model/player";
import fs from 'fs';
import path from 'path';

// Load property data from JSON file
const propertyData: IProperty[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'board.json'), 'utf-8'));

// Function to calculate group sizes dynamically
function calculateGroupSizes(properties: IProperty[]): { [key: string]: number } {
    const groupSizes: { [key: string]: number } = {};

    properties.forEach(property => {
        const groupKey = `${property.group[0]}-${property.group[2]}`;
        if (!groupSizes[groupKey]) {
            groupSizes[groupKey] = 0;
        }
        groupSizes[groupKey]++;
    });

    return groupSizes;
}

// Calculate group sizes based on property data
const groupSizes = calculateGroupSizes(propertyData);

// Function to get the total number of properties in a group
function getTotalPropertiesInGroup(group: number[]): number {
    const groupKey = `${group[0]}-${group[2]}`;
    return groupSizes[groupKey] || 0;
}

// Function to check if a player owns all properties in a group
function ownsWholeGroup(properties: IProperty[], group: number[]): boolean {
    const groupKey = `${group[0]}-${group[2]}`;
    const totalPropertiesInGroup = group[2];
    const ownedPropertiesInGroup = properties.filter(property => {
        return property.group[0] === group[0] && property.group[2] === group[2];
    }).length;

    return ownedPropertiesInGroup === totalPropertiesInGroup;
}

// Function to find the group array for a given property name
function findGroupArray(propertyName: string, properties: IProperty[]): number[] | null {
    const property = properties.find(p => p.name === propertyName);
    return property ? property.group : null;
}

// Example usage
const groupArray = findGroupArray("#General Road", propertyData); // Replace with the actual property name
if (groupArray) {
    console.log(ownsWholeGroup(propertyData, groupArray)); // Output: true or false based on the data
}
