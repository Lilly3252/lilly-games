import { convertToPlayer } from "#database/model/database";
import { IPlayer, IProperty, PlayerModel } from "#database/model/player";
import { Achievement } from "#type/index";
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
/**
 * Represents an achievement in the game.
 */
const achievements: Achievement[] = [
    { name: 'Property Mogul', description: 'Own all properties of a single color group', dateEarned: new Date() },
    { name: 'Hotel Tycoon', description: 'Build a hotel on a property', dateEarned: new Date() },
    { name: 'Railroad Baron', description: 'Own all four railroads', dateEarned: new Date() },
    { name: 'Utility Master', description: 'Own both utilities (Water Works and Electric Company)', dateEarned: new Date() },
    { name: 'Rent Collector', description: 'Collect rent from other players a certain number of times', dateEarned: new Date() },
    { name: 'Lucky Roller', description: 'Roll doubles three times in a row', dateEarned: new Date() },
    { name: 'Community Helper', description: 'Draw a certain number of Community Chest cards', dateEarned: new Date() },
    { name: 'Chance Taker', description: 'Draw a certain number of Chance cards', dateEarned: new Date() },
    { name: 'Jail Breaker', description: 'Get out of jail without using a "Get Out of Jail Free" card', dateEarned: new Date() },
    { name: 'Big Spender', description: 'Spend a certain amount of in-game currency', dateEarned: new Date() },
    { name: 'Monopoly Master', description: 'Win a game of Monopoly', dateEarned: new Date() },
    { name: 'Bankruptcy Survivor', description: 'Avoid bankruptcy for a set number of turns', dateEarned: new Date() },
    { name: 'Trade Expert', description: 'Successfully trade properties with other players a certain number of times', dateEarned: new Date() },
    { name: 'First Purchase', description: 'Buy your first property', dateEarned: new Date() },
    { name: 'First Rent', description: 'Collect rent for the first time', dateEarned: new Date() },
    { name: 'First House', description: 'Build your first house', dateEarned: new Date() },
    { name: 'First Hotel', description: 'Build your first hotel', dateEarned: new Date() },
    { name: 'First Trade', description: 'Complete your first trade', dateEarned: new Date() },
    { name: 'First Jail', description: 'Go to jail for the first time', dateEarned: new Date() },
    { name: 'First Get Out of Jail', description: 'Get out of jail for the first time', dateEarned: new Date() },
    { name: 'First Bankruptcy', description: 'Go bankrupt for the first time', dateEarned: new Date() },
    { name: 'First Win', description: 'Win your first game', dateEarned: new Date() }
];

/**
 * Checks if the player has earned the "Property Mogul" achievement.
 * @param player - The player to check.
 */
export async function checkPropertyMogul(player: IPlayer): Promise<void> {
    const colorGroups = player.properties.reduce((groups, property) => {
        if (property.color) {
            groups[property.color] = (groups[property.color] || 0) + 1;
        }
        return groups;
    }, {} as Record<string, number>);

    for (const color in colorGroups) {
        if (colorGroups[color] === 3) { // Assuming 3 properties per color group
            await checkAndSaveAchievement(player.userId, 'Property Mogul');
            break;
        }
    }
}

/**
 * Checks if the player has earned the "Hotel Tycoon" achievement.
 * @param player - The player to check.
 */
export async function checkHotelTycoon(player: IPlayer): Promise<void> {
    const hasHotel = player.properties.some(property => property.hotel);
    if (hasHotel) {
        await checkAndSaveAchievement(player.userId, 'Hotel Tycoon');
    }
}

/**
 * Checks if the player has earned the "Railroad Baron" achievement.
 * @param player - The player to check.
 */
export async function checkRailroadBaron(player: IPlayer): Promise<void> {
    const railroads = player.properties.filter(property => property.type === 'railroad');
    if (railroads.length === 4) {
        await checkAndSaveAchievement(player.userId, 'Railroad Baron');
    }
}

/**
 * Checks if the player has earned the "Utility Master" achievement.
 * @param player - The player to check.
 */
export async function checkUtilityMaster(player: IPlayer): Promise<void> {
    const utilities = player.properties.filter(property => property.type === 'utility');
    if (utilities.length === 2) {
        await checkAndSaveAchievement(player.userId, 'Utility Master');
    }
}

/**
 * Checks if the player has earned the "Rent Collector" achievement.
 * @param player - The player to check.
 * @param rentCollected - The amount of rent collected by the player.
 */
export async function checkRentCollector(player: IPlayer, rentCollected: number): Promise<void> {
    if (rentCollected >= 10) { 
        await checkAndSaveAchievement(player.userId, 'Rent Collector');
    }
}

/**
 * Checks if the player has earned the "Lucky Roller" achievement.
 * @param player - The player to check.
 * @param doublesRolled - The number of doubles rolled by the player.
 */
export async function checkLuckyRoller(player: IPlayer, doublesRolled: number): Promise<void> {
    if (doublesRolled >= 3) {
        await checkAndSaveAchievement(player.userId, 'Lucky Roller');
    }
}

/**
 * Checks if the player has earned the "Community Helper" achievement.
 * @param player - The player to check.
 * @param communityChestCardsDrawn - The number of Community Chest cards drawn by the player.
 */
export async function checkCommunityHelper(player: IPlayer, communityChestCardsDrawn: number): Promise<void> {
    if (communityChestCardsDrawn >= 5) { 
        await checkAndSaveAchievement(player.userId, 'Community Helper');
    }
}

/**
 * Checks if the player has earned the "Chance Taker" achievement.
 * @param player - The player to check.
 * @param chanceCardsDrawn - The number of Chance cards drawn by the player.
 */
export async function checkChanceTaker(player: IPlayer, chanceCardsDrawn: number): Promise<void> {
    if (chanceCardsDrawn >= 5) { 
        await checkAndSaveAchievement(player.userId, 'Chance Taker');
    }
}

/**
 * Checks if the player has earned the "Jail Breaker" achievement.
 * @param player - The player to check.
 * @param gotOutOfJailWithoutCard - Whether the player got out of jail without using a "Get Out of Jail Free" card.
 */
export async function checkJailBreaker(player: IPlayer, gotOutOfJailWithoutCard: boolean): Promise<void> {
    if (gotOutOfJailWithoutCard) {
        await checkAndSaveAchievement(player.userId, 'Jail Breaker');
    }
}

/**
 * Checks if the player has earned the "Big Spender" achievement.
 * @param player - The player to check.
 * @param amountSpent - The amount of in-game currency spent by the player.
 */
export async function checkBigSpender(player: IPlayer, amountSpent: number): Promise<void> {
    if (amountSpent >= 1000) { 
        await checkAndSaveAchievement(player.userId, 'Big Spender');
    }
}

/**
 * Checks if the player has earned the "Monopoly Master" achievement.
 * @param player - The player to check.
 * @param gameWon - Whether the player won the game.
 */
export async function checkMonopolyMaster(player: IPlayer, gameWon: boolean): Promise<void> {
    if (gameWon) {
        await checkAndSaveAchievement(player.userId, 'Monopoly Master');
    }
}

/**
 * Checks if the player has earned the "Bankruptcy Survivor" achievement.
 * @param player - The player to check.
 * @param turnsSurvived - The number of turns the player survived without going bankrupt.
 */
export async function checkBankruptcySurvivor(player: IPlayer, turnsSurvived: number): Promise<void> {
    if (turnsSurvived >= 20) { 
        await checkAndSaveAchievement(player.userId, 'Bankruptcy Survivor');
    }
}

/**
 * Checks if the player has earned the "Trade Expert" achievement.
 * @param player - The player to check.
 * @param tradesCompleted - The number of trades completed by the player.
 */
export async function checkTradeExpert(player: IPlayer, tradesCompleted: number): Promise<void> {
    if (tradesCompleted >= 5) { 
        await checkAndSaveAchievement(player.userId, 'Trade Expert');
    }
}

/**
 * Checks and saves the achievement for the player.
 * @param playerId - The ID of the player.
 * @param achievementName - The name of the achievement.
 */
export async function checkAndSaveAchievement(playerId: string, achievementName: string) {
    const player = await PlayerModel.findOne({ userId: playerId }).lean<IPlayer>();
    if (!player) return;

    const achievement = achievements.find(a => a.name === achievementName);
    if (!achievement) return;

    const alreadyEarned = player.achievements.some(a => a.name === achievementName);
    if (alreadyEarned) return;

    // Re-fetch the player document to update it
    const playerDoc = await PlayerModel.findOne({ userId: playerId });
    playerDoc.achievements.push({
        name: achievement.name,
        description: achievement.description,
        dateEarned: new Date()
    });
    await playerDoc.save();
    console.log(`Achievement "${achievementName}" earned by player ${playerDoc.name}`);
}
/**
 * Checks if the player has earned the "First Purchase" achievement.
 * @param player - The player to check.
 */
export async function checkFirstPurchase(player: IPlayer): Promise<void> {
    if (player.properties.length === 1) {
        await checkAndSaveAchievement(player.userId, 'First Purchase');
    }
}

/**
 * Checks if the player has earned the "First Rent" achievement.
 * @param player - The player to check.
 * @param rentCollected - The amount of rent collected by the player.
 */
export async function checkFirstRent(player: IPlayer, rentCollected: number): Promise<void> {
    if (rentCollected === 1) {
        await checkAndSaveAchievement(player.userId, 'First Rent');
    }
}

/**
 * Checks if the player has earned the "First House" achievement.
 * @param player - The player to check.
 */
export async function checkFirstHouse(player: IPlayer): Promise<void> {
    const hasHouse = convertToPlayer(player).properties.some(property => property.houses === 1);
    if (hasHouse) {
        await checkAndSaveAchievement(player.userId, 'First House');
    }
}

/**
 * Checks if the player has earned the "First Hotel" achievement.
 * @param player - The player to check.
 */
export async function checkFirstHotel(player: IPlayer): Promise<void> {
    const hasHotel = player.properties.some(property => property.hotel);
    if (hasHotel) {
        await checkAndSaveAchievement(player.userId, 'First Hotel');
    }
}

/**
 * Checks if the player has earned the "First Trade" achievement.
 * @param player - The player to check.
 * @param tradesCompleted - The number of trades completed by the player.
 */
export async function checkFirstTrade(player: IPlayer, tradesCompleted: number): Promise<void> {
    if (tradesCompleted === 1) {
        await checkAndSaveAchievement(player.userId, 'First Trade');
    }
}

/**
 * Checks if the player has earned the "First Jail" achievement.
 * @param player - The player to check.
 */
export async function checkFirstJail(player: IPlayer): Promise<void> {
    if (player.inJail && player.jailTurns === 1) {
        await checkAndSaveAchievement(player.userId, 'First Jail');
    }
}

/**
 * Checks if the player has earned the "First Get Out of Jail" achievement.
 * @param player - The player to check.
 */
export async function checkFirstGetOutOfJail(player: IPlayer): Promise<void> {
    if (!player.inJail && player.jailTurns > 0) {
        await checkAndSaveAchievement(player.userId, 'First Get Out of Jail');
    }
}

/**
 * Checks if the player has earned the "First Bankruptcy" achievement.
 * @param player - The player to check.
 */
export async function checkFirstBankruptcy(player: IPlayer): Promise<void> {
    if (player.isBankrupt) {
        await checkAndSaveAchievement(player.userId, 'First Bankruptcy');
    }
}

/**
 * Checks if the player has earned the "First Win" achievement.
 * @param player - The player to check.
 * @param gameWon - Whether the player won the game.
 */
export async function checkFirstWin(player: IPlayer, gameWon: boolean): Promise<void> {
    if (gameWon) {
        await checkAndSaveAchievement(player.userId, 'First Win');
    }
}

/**
 * Checks all achievements for the player.
 * @param player - The player to check.
 */
export async function checkAllAchievements(player: IPlayer): Promise<void> {
    await checkPropertyMogul(player);
    await checkHotelTycoon(player);
    await checkRailroadBaron(player);
    await checkUtilityMaster(player);
    await checkRentCollector(player, 10); 
    await checkLuckyRoller(player, 3); 
    await checkCommunityHelper(player, 5); 
    await checkChanceTaker(player, 5); 
    await checkJailBreaker(player, true); 
    await checkBigSpender(player, 1000); 
    await checkMonopolyMaster(player, true); 
    await checkBankruptcySurvivor(player, 20); 
    await checkTradeExpert(player, 5); 
    await checkFirstPurchase(player);
    await checkFirstRent(player, 1); 
    await checkFirstHouse(player);
    await checkFirstHotel(player);
    await checkFirstTrade(player, 1); 
    await checkFirstJail(player);
    await checkFirstGetOutOfJail(player);
    await checkFirstBankruptcy(player);
    await checkFirstWin(player, true); 
}
