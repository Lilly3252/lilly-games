import { Message } from "discord.js";

export function getUser(message: Message<true>) {
	if (message.mentions.everyone) {
		return false;
	}
	const [...leftovers] = message.content.trim().split(" ");
	const stitched = leftovers.join(" ");
	const name = stitched.toLowerCase();
	if (message.mentions.members.size) {
		const { user } = message.mentions.members.first();
		if (user.bot) return false;
		return user;
	}
	if (!name.length) {
		return false;
	}
	const { members } = message.channel.guild;
	const foundUsers = members.cache.filter(function (member) {
		if (member.user.bot) return false;
		if (member.nickname) return member.nickname.toLowerCase().includes(name);
		return member.user.username.toLowerCase().includes(name);
	});
	if (foundUsers.size) {
		return foundUsers.first().user;
	}
	return false;
}
