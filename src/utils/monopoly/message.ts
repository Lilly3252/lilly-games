import { GuildTextBasedChannel, Message } from "discord.js";
import { cooldownDuration } from "./config.json";
import { flatten } from "lodash";

export class MessageHandler {
	messages: Array<Message>;
	channel: GuildTextBasedChannel;
	constructor(channel: GuildTextBasedChannel) {
		this.messages = [];
		this.channel = channel;
	}

	flushMessages(messages: Array<Message>) {
		const toFlush = flatten(
			messages.map((message) => {
				return [this.sendCrude(...message[0]), this.cooldown()];
			})
		);

		messages.length = 0;

		return Promise.all(toFlush);
	}

	formatMessage(identifier: string | number, ...parameters: any[]) {
		let message = TEXT[identifier];
		if (message) {
			for (const argument of parameters) {
				message = message.replace("%s", argument);
			}
			return message;
		} else {
			throw new Error(`No message available for "${identifier}" identifier (language ${language}). All identifiers must have an appropriate message.`);
		}
	}

	send(identifier: any, ...parameters: any[]) {
		const message = this.formatMessage(identifier, ...parameters);
		return this.sendCrude(message);
	}

	sendCrude(...items: any[]) {
		return new Promise((resolve, reject) => {
			this.channel.send(this.channel, ...items).then((message: Message<true>) => {
				this.cooldown().then(() => {
					resolve(message);
				});
			});
		});
	}

	stackMessage(identifier: any, ...parameters: any[]) {
		this.stackCrudeMessage(this.formatMessage(identifier, ...parameters));
	}

	stackCardMessage(message: Message<true>) {
		this.stackCrudeMessage(`The drawn card says, "${message}".`);
	}

	stackCrudeMessage(message: Message<true>) {
		this.messages.push(message);
	}

	cooldown(duration = cooldownDuration) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		return new Promise<void>((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, duration * 1000);
		});
	}
}
