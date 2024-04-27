import process from 'node:process';

import LillyClient from '#structures/lillyClient.js';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from 'dotenv';

import { Monopoly } from '#structures/monopoly/classes/monopoly';

config();

const client = new LillyClient();
const monopolyGame = new Monopoly(); // Initialize an instance of the Monopoly game

client.start();
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
