import { ClusterClient, InteractionCommandClient } from 'detritus-client'
import { GatewayIntents } from 'detritus-client-socket/lib/constants'
interface ModClient extends InteractionCommandClient {
  client: ClusterClient
}

const client = new InteractionCommandClient(process.env.BOT_TOKEN ?? '', {
  useClusterClient: true,
  gateway: {
    compress: true,
    guildSubscriptions: false,
    intents: [
      GatewayIntents.GUILDS,
      GatewayIntents.GUILD_MESSAGES,
      GatewayIntents.DIRECT_MESSAGES
    ]
  }
}) as ModClient

export default client
