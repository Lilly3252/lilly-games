import { Monopoly } from '#structures/monopoly/classes/monopoly';
import type { AutocompleteInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface SlashCommand {
	/**
	 * Data as SlashCommandBuilder.
	 */
	slashy: SlashCommandBuilder | Omit<SlashCommandBuilder, "addBooleanOption" |"addSubcommandGroup" | "addSubcommand"| "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">;
	/**
	 *
	 * @param {CommandInteraction} interaction  The CommandInteraction object from the interactionCreate event or collector
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	run(monopoly?: Monopoly ,interaction: CommandInteraction | AutocompleteInteraction): Promise<any>;
}
