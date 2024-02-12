import { ApplyOptions } from "@sapphire/decorators";
import type { ListenerOptions } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import * as Sentry from "@sentry/node";
import type { ClientEvents } from "discord.js";

@ApplyOptions<ListenerOptions>({
  event: Events.PreContextMenuCommandRun,
})
export class SentryBeforeContextCommandListener extends Listener {
  public run(
    ...[{ interaction }]: ClientEvents["preContextMenuCommandRun"]
  ): void {
    this.container.logger.info(
      `Got an interaction for a chat input command: ${interaction.commandName}`,
    );
    Sentry.setUser({
      id: interaction.user.id,
      username: interaction.user.tag,
      discriminator: interaction.user.discriminator,
    });
    if (interaction.inGuild()) {
      Sentry.setExtras({
        "Guild ID": interaction.guildId,
        "Guild Name": interaction.guild?.name,
        "Channel ID": interaction.channelId,
        "Channel Name": interaction.channel?.name,
      });
    } else {
      Sentry.setExtra("DM Channel ID", interaction.channelId);
    }
    Sentry.setExtra("Interaction ID", interaction.id);
  }
}
