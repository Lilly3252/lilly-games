import { ChatInputCommandInteraction } from "discord.js";
import { CURRENCY_SYMBOL } from "../constant";

const triviaQuestions = [
    { question: "How many **properties** are there in Monopoly?", answer: "28" },
    { question: "What is the most expensive property on a **standard Monopoly board**?", answer: "Boardwalk" },
    { question: "How much money does each player **start** with in Monopoly?", answer: "$1500" },
    { question: "What are the four **railroads** in a standard Monopoly board?", answer: "Reading, Pennsylvania, B&O, Short Line" },
    { question: "What happens when you land on the **'Go to Jail'** space in Monopoly?", answer: "You go to jail" },
    { question: "How much does it cost to **get out of jail** in Monopoly?", answer: "$50" },
    { question: "What **color** are the properties in the first set on a standard Monopoly board?", answer: "Brown" },
    { question: "What is the name of the **mascot character** in Monopoly?", answer: "Rich Uncle Pennybags" },
    { question: "How many **Chance cards** are there in a standard Monopoly game?", answer: "16" },
    { question: "What is the maximum number of **houses** you can have on a property in Monopoly?", answer: "4" },
    { question: "What is the name of the space where you collect **$200** in Monopoly?", answer: "Go" },
    { question: "What is the penalty for landing on the **Income Tax** space in Monopoly?", answer: "$200 or 10% of your total assets" },
    { question: "How many **Community Chest** cards are there in a standard Monopoly game?", answer: "16" },
    { question: "What is the rent for **Boardwalk with a hotel** in Monopoly?", answer: "$2000" },
    { question: "What are the two utilities in Monopoly?", answer: "Electric Company and Water Works" },
    { question: "What is the cost of a **house** in Monopoly?", answer: "$50" },
    { question: "What is the cost of a **hotel** in Monopoly?", answer: "$100" },
    { question: "What is the name of the space where you can rest without any action in Monopoly?", answer: "Free Parking" },
    { question: "What is the **rent** for **Park Place** with a hotel in Monopoly?", answer: "$1500" },
    { question: "What is the name of the space where you **draw** a Chance card in Monopoly?", answer: "Chance" },
    { question: "What is the name of the space where you **draw** a Community Chest card in Monopoly?", answer: "Community Chest" },
    { question: "What is the name of the Discord **mascot?**", answer: "Wumpus" },
    { question: "What is the maximum file size for uploads in Discord **without** Nitro?", answer: "8MB" },
    { question: "What is the maximum file size for uploads in Discord **with** Nitro?", answer: "100MB" },
    { question: "What is the name of the feature that allows you to **stream your screen** in Discord?", answer: "Go Live" },
    { question: "What is the **maximum number of members** in a Discord server?", answer: "250,000" },
    { question: "What is the **maximum number of channels** in a Discord server?", answer: "500" },
    { question: "What is the **name** of the feature that allows you to create **custom emojis** in Discord?", answer: "Emoji Manager" },
    { question: "What is the **name** of the feature that allows you to create **custom roles** in Discord?", answer: "Role Manager" },
    { question: "What is the **name** of the feature that allows you to create **custom bots** in Discord?", answer: "Bot Manager" },
    { question: "What is the **name** of the feature that allows you to create **custom webhooks** in Discord?", answer: "Webhook Manager" }
];


export async function triviaQuiz(interaction: ChatInputCommandInteraction) {
    const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    await interaction.reply(`Trivia Question: ${randomQuestion.question} **Win 100 ${CURRENCY_SYMBOL} if you get it right !**`);

    const filter = (response: any) => response.author.id === interaction.user.id;
    const collected = await interaction.channel?.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });

    if (collected?.first()?.content.toLowerCase() === randomQuestion.answer.toLowerCase()) {
        await interaction.followUp(`Correct! You earn 100 ${CURRENCY_SYMBOL}.`);
        // add player updated money here 
    } else {
        await interaction.followUp(`Incorrect. The correct answer was ${randomQuestion.answer}.`);
    }
}