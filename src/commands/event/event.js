import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EventService } from '#services/eventService.js';
import logger from '#utils/logger.js';
import { getColorFromName } from '#utils/color.js';

export const data = new SlashCommandBuilder()
  .setName('event')
  .setDescription('Get Event information')
  .addStringOption((option) =>
    option
      .setName('event')
      .setDescription('Select the event to get information about')
      .setRequired(false)
      .setAutocomplete(true)
  );

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const eventId = interaction.options.getString('event');
  const event = eventId
    ? await EventService.getEventById(eventId)
    : await EventService.getActiveEvent();
  if (!event) {
    await interaction.reply('No event found.');
    return;
  }
  const embed = {
    title: event.name,
    description: event.description,
    fields: [
      { name: 'Start Date', value: event.startDate?.toString() || 'None', inline: true },
      { name: 'End Date', value: event.endDate?.toString() || 'None', inline: true },
      { name: 'Status', value: event.status, inline: true },
      {
        name: 'Teams',
        value: event.teams.map((team, index) => `${index + 1}. ${team.name}`).join('\n') || 'None',
        inline: false,
      },
    ],
    color: getColorFromName(event.name),
  };
  await interaction.reply({ embeds: [embed] });
  logger.info(`Event info requested: ${event.name}`);
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
export async function autocomplete(interaction) {
  const focusedValue = interaction.options.getFocused();
  const events = await EventService.getEvents();
  const filtered = events.filter((event) => event.name.startsWith(focusedValue));
  const choices = filtered.map((event) => event).slice(0, 25);
  await interaction.respond(choices.map((choice) => ({ name: choice.name, value: choice.id })));
}
