const Command = require('../../classes/Command')

module.exports = new Command(async function (msg) {
  const client = require('../../components/client')
  const player = client.voiceConnectionManager.get(msg.channel.guild.id)
  if (!player) return this.safeSendMessage(msg.channel, i18n.t('commands.common.notStreaming'))
  player.next()
}, {
  prereqs: ['musicCommand'],
  disableDM: true
})
