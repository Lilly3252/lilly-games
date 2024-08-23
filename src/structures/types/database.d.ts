import { Collection } from 'discord.js';

export interface guildSetting {
	guildID: string;
	name: string;
	auditLogEvent: boolean;
	logChannelID: string | null;
	welcomeChannelID: string | null;
	antiRaid: boolean;
	botUpdate:boolean;
	roleUpdate:boolean;
	integrationUpdate:boolean;
	guildUpdate:boolean;
	emojiUpdate:boolean;
	stageInstanceUpdate:boolean;
	messageUpdate:boolean;
	channelUpdate:boolean;
	stickerUpdate:boolean;
	memberUpdate:boolean;
	guildScheduledUpdate:boolean;
	threadUpdate:boolean;
	inviteUpdate:boolean;
	webhookUpdate:boolean;
	autoModeration:boolean;
	commandPermission:boolean;
	urlLinkDetection: boolean;
	urlLinks: Collection<string, links>;
}
export interface links {
	domains: string;
}