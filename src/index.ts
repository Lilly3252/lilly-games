import process from 'node:process';

import LillyClient from '#structures/lillyClient.js';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from 'dotenv';

import { MonopolyGame } from '#structures/monopoly/classes/monopoly';
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

config();

const client = new LillyClient();

let game: MonopolyGame | null = null;
const boardData = JSON.parse(readFileSync('board.json', 'utf-8'));
client.start();
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/monopoly');
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
console.log('im connected with db!');

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (err, origin) => {
	console.error('uncaughtException:', err, origin);
});

process.on('warning', (warning) => {
	console.warn(warning.name);
	console.warn(warning.message);
	console.warn(warning.stack);
});
