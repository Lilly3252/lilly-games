import { ColorResolvable, EmbedBuilder } from 'discord.js';

/**
 * Creates a standardized embed.
 * @param title - The title of the embed.
 * @param description - The description of the embed.
 * @param color - The color of the embed (optional).
 * @param fields - Additional fields to add to the embed (optional).
 * @param footer - The footer text of the embed (optional).
 * @param image - The URL of the image to include in the embed (optional).
 * @param thumbnail - The URL of the thumbnail to include in the embed (optional).
 * @param author - The author information of the embed (optional).
 * @returns An EmbedBuilder instance with the specified properties.
 * @example
 * ```typescript
 * const embed = createStandardEmbed(
 *   'Hello, World!',
 *   'This is a standardized embed with additional features.',
 *   '#00ff00',
 *   [
 *     { name: 'Field 1', value: 'This is field 1', inline: true },
 *     { name: 'Field 2', value: 'This is field 2', inline: true },
 *   ],
 *   'Powered by Monopoly Game',
 *   'https://example.com/image.png',
 *   'https://example.com/thumbnail.png',
 *   { name: 'Author Name', iconURL: 'https://example.com/author-icon.png', url: 'https://example.com' }
 * );
 * ```
 */
export function createStandardEmbed(
    title: string,
    description: string,
    color: ColorResolvable = '#0099ff',
    fields: { name: string; value: string; inline?: boolean }[] = [],
    footer: string = 'Powered by Monopoly Game',
    image?: string,
    thumbnail?: string,
    author?: { name: string; iconURL?: string; url?: string }
): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .addFields(fields)
        .setFooter({ text: footer });

    if (image) {
        embed.setImage(image);
    }

    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    if (author) {
        embed.setAuthor(author);
    }

    return embed;
}
