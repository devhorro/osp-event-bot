import prisma from '#utils/prisma.js';
import logger from '#utils/logger.js';
import { SettingTypes } from '#constants/settings.js';

export class ConfigService {
  /**
   * Get the approval channel for a guild
   * @param {String} guildId - A Discord guild ID
   * @returns {Promise<String>} The approval channel ID
   */
  static async getApprovalChannel(guildId) {
    try {
      const config = await prisma.config.findUnique({
        where: {
          guildId_settingType: {
            guildId,
            settingType: SettingTypes.APPROVAL_CHANNEL,
          },
        },
      });

      return config?.value;
    } catch (error) {
      logger.error(`Error getting approval channel for guild ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Set the approval channel for a guild
   * @param {String} guildId - A Discord guild ID
   * @param {String} channelId - The approval channel ID
   * @returns {Promise<void>}
   */
  static async setApprovalChannel(guildId, channelId) {
    try {
      const existingConfig = await prisma.config.findUnique({
        where: {
          guildId_settingType: {
            guildId,
            settingType: SettingTypes.APPROVAL_CHANNEL,
          },
        },
      });

      if (existingConfig) {
        await prisma.config.update({
          where: {
            guildId_settingType: {
              guildId,
              settingType: SettingTypes.APPROVAL_CHANNEL,
            },
          },
          data: { value: channelId },
        });
      } else {
        await prisma.config.create({
          data: {
            guildId,
            settingType: SettingTypes.APPROVAL_CHANNEL,
            value: channelId,
          },
        });
      }
    } catch (error) {
      logger.error(`Error setting approval channel for guild ${guildId}:`, error);
      throw error;
    }
  }
}
