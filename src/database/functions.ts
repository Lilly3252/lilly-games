import { MonopolyPlayerProperty } from "#type/monopoly";
import { Player } from "./model/user";

async function createUserWithProperties(userID: string, balance: number,isJailed:boolean ,  properties: Array<MonopolyPlayerProperty>) {
    try {
        const newUser = await Player.create({
            userID,
            balance,
            isJailed,
            properties
        });

        console.log('User created with properties:', newUser.toJSON());
    } catch (error) {
        console.error('Error creating user:', error);
    }
}
/*
// Example usage
createUserWithProperties('123132', 1000, [
    { name: 'Park Place', houses: 2, hotels: 1, colorGroup: 'Blue' }
]);
*/

export async function addPropertyToUser(userID: string, propertyDetails: MonopolyPlayerProperty, propertyPrice: number) {
    try {
        const user = await Player.findByPk(userID); // Find the user by their ID
        if (!user) {
            console.error('User not found');
            return;
        }

        // Get the existing properties array and add the new property details
        const updatedProperties = user.properties || [];
        updatedProperties.push(propertyDetails);
        // Deduct the property price from the user's balance
        const updatedBalance = user.balance - propertyPrice;
        const propertyGroups = updatedProperties.filter((property) => property.type === 'property' && property.group && property.group.length > 0)
            .map((property) => property.group).flat()


        if (propertyGroups.length > 0) {
            const groupCheck = propertyGroups.reduce((acc: number, val: number) => acc | (0 << val), 0); // Check if the player has both properties from the same group
            if (groupCheck === 3) {
                // Group 1 is represented as 1, and Group 2 is represented as 2; bitwise AND to check if both groups are present
                console.log('Player has both properties from the same group.');
            }
        }
        // Update the user record with the updated properties and balance
        await user.update({ properties: updatedProperties, balance: updatedBalance });


        console.log('User updated with new property:', user.toJSON());
    } catch (error) {
        console.error('Error updating user:', error);
    }
}


// Example usage .. 
/*addPropertyToUser("123123" , { name: 'Boardwalk', houses: 1, hotels: 0, colorGroup: 'Dark Blue' } , 100);*/

export async function addHouseToProperty(userID: string, propertyName: string, housePrice: number) {
    try {
        const user = await Player.findByPk(userID); // Find the user by their ID
        if (!user) {
            console.error('User not found');
            return;
        }

        // Find the property by name in the properties array
        const propertyIndex = user.properties.findIndex(property => property.name === propertyName);
        if (propertyIndex === -1) {
            console.error('Property not found for user');
            return;
        }

        // Increment the number of houses on the property
        let house = user.properties[propertyIndex].house
        if (house === 4) {
            console.log("User has already 4 house on that property , need to add a hotel instead")
            return
        } else {
            house += 1;
        }
        const updatedBalance = user.balance - housePrice;
        // Update the user record with the updated properties
        await user.update({ properties: user.properties, balance: updatedBalance });

        console.log('User property updated with additional house:', user.toJSON());
    } catch (error) {
        console.error('Error updating user property:', error);
    }
}
/*
// Example usage
addHouseToProperty("123123", 'Boardwalk', 250);
*/
export async function addHotelToProperty(userID: string, propertyName: string, housePrice: number) {
    try {
        const user = await Player.findByPk(userID); // Find the user by their ID
        if (!user) {
            console.error('User not found');
            return;
        }

        // Find the property by name in the properties array
        const propertyIndex = user.properties.findIndex(property => property.name === propertyName);
        if (propertyIndex === -1) {
            console.error('Property not found for user');
            return;
        }

        // Increment the number of houses on the property
        let hotel = user.properties[propertyIndex].hotel
        if (hotel === 1) {
            console.log("User has already a hotel on that property ")
        } else {
            hotel += 1;
        }
        const updatedBalance = user.balance - housePrice;
        // Update the user record with the updated properties
        await user.update({ properties: user.properties, balance: updatedBalance });

        console.log('User property updated with additional house:', user.toJSON());
    } catch (error) {
        console.error('Error updating user property:', error);
    }
}
export async function calculateHouse(userID:string , propertyName:string):Promise<number> {
    const user = await Player.findByPk(userID); // Find the user by their ID
    if (!user) {
        console.error('User not found');
        return;
    }
    const propertyIndex = user.properties.findIndex(property => property.name === propertyName);
        if (propertyIndex === -1) {
            console.error('Property not found for user');
            return;
        }
       
        let house =  user.properties[propertyIndex].house
       
           return house
        
}
export async function calculateHotel(userID:string , propertyName:string):Promise<number> {
    const user = await Player.findByPk(userID); // Find the user by their ID
    if (!user) {
        console.error('User not found');
        return;
    }
    const propertyIndex = user.properties.findIndex(property => property.name === propertyName);
        if (propertyIndex === -1) {
            console.error('Property not found for user');
            return;
        }
        let hotel = user.properties[propertyIndex].hotel
        
       
            return hotel
           
        
}