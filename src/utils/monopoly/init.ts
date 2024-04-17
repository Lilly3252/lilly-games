import { GuildTextBasedChannel, Message, TextChannel } from "discord.js";
import config from "./config.json";
import { game } from "./game.js";
import { isEqual } from "lodash";
import { resolve } from "path";
import { writeFileSync } from "fs";

export class GameInstance {
	constructor(options) {
		const opts = this.refineOptions(options);
		const newPreset = Object.assign({}, config, opts);
		if (!isEqual(newPreset, config)) {
			this.updatePreset(opts);
		}
		this.targetChannel;
		return;
	}

	updatePreset(opts) {
		const newPreset = Object.assign({}, config, opts);
		writeFileSync(resolve(__dirname, "config.json"), JSON.stringify(newPreset));
		delete require.cache[require.resolve("./config.json")];
	}

	targetChannel(message: Message<true>) {
		if (!(message.channel instanceof TextChannel)) {
			throw new Error("Channel must be part of a server.");
		} else if ((config.channel ? message.channel.id == config.channel : true) && config.owners.includes(message.author.id)) {
			game();
		}
	}

	refineOptions(options = {}) {
		if (!options) return {};
		options.owners = this.validateOwners(options.owners);
		options.channel = "channel" in options ? this.validateChannelID(options.channel) : null;
		options.bidDuration = this.validateNumber(options.bidDuration) || config.bidDuration;
		options.turnDuration = this.validateNumber(options.turnDuration) || config.turnDuration;
		return options;
	}
	validateOwners(owners) {
		if (Array.isArray(owners)) {
			const validOwners = owners.filter((id) => `<@${id}>`.match(USERS_PATTERN));
			if (!validOwners.length) {
				throw new Error("Not a single user ID designates a potentially valid owner.");
			} else {
				return validOwners;
			}
		} else if (!owners) {
			throw new Error("You should provide at least one owner to the bot (usually you).");
		} else if (typeof owners === "number" || (typeof owners === "string" && +owners)) {
			if (`<@${owners}>`.match(USERS_PATTERN)) {
				return owners;
			} else {
				throw new Error(`"${owners}" is not a valid ID.`);
			}
		} else {
			throw Error(`Expected owners property to be either an array or a 18-digit number, received type ${typeof owners} instead.`);
		}
	}

	validateChannelID(channel: GuildTextBasedChannel) {
		if (!channel || (["number", "string"].includes(typeof channel) && `<#${channel}>`.match(CHANNELS_PATTERN))) {
			return channel;
		} else {
			throw new Error(`Expected channel property to be a number and a valid ID, received type ${typeof channel} and value ${channel.id} instead.
If you do not want to lock onto any precise channel, please omit the property entirely.`);
		}
	}
	validateNumber(n: number) {
		if (n !== 0 && (!n || Number(n))) {
			return n;
		} else {
			throw new Error(`Expected value ${n} to be a number or a falsy value, received type ${typeof n} instead.`);
		}
	}
}
