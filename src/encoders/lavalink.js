const superagent = require('superagent')
const nodes = process.env.LAVA_NODES ? JSON.parse(process.env.LAVA_NODES) : [{
  host: 'localhost',
  port: 80,
  restPort: 2333,
  region: 'us',
  password: 'password'
}]
const guildInfo = {}
module.exports = {
  nodes: nodes,
  guildInfo: guildInfo,
  init: () => {
    global.logger.debug('Using LavaLink encoder.')
    const { PlayerManager } = require('eris-lavalink')
    let regions = {
      eu: ['eu', 'amsterdam', 'frankfurt', 'russia', 'hongkong', 'singapore', 'sydney'],
      us: ['us', 'brazil']
    }
    if (!(global.bot.voiceConnections instanceof PlayerManager)) {
      global.bot.voiceConnections = new PlayerManager(global.bot, nodes, {
        numShards: global.bot.options.maxShards,
        userId: global.bot.user.id,
        regions: regions,
        defaultRegion: 'us'
      })
      global.bot.voiceConnections.nodes.forEach(x => {
        x.on('disconnect', () => global.logger.warn(`LavaLink node ${x.address} disconnected!`))
        x.on('error', global.logger.error)
        x.on('message', global.logger.trace)
        x.on('ready', () => global.logger.log(`LavaLink node ${x.address} ready.`))
      })
    }
  },
  getPlayer: async (channel) => {
    if (!channel || !channel.guild) {
      throw new Error('Not a guild channel.')
    }

    let player = global.bot.voiceConnections.get(channel.guild.id)
    if (player) {
      return (player)
    }

    let options = {}
    if (channel.guild.region) {
      options.region = channel.guild.region
    }

    return global.bot.joinVoiceChannel(channel.id)
  },
  resolveTracks: async (search) => {
    try {
      var result = await superagent.get(`http://${nodes[0].host}:${nodes[0].restPort || '2333'}/loadtracks?identifier=${search}`)
        .set('Authorization', nodes[0].password)
        .set('Accept', 'application/json')
    } catch (err) {
      throw new Error(err)
    }

    if (!result) {
      throw new Error('Unable play that video.')
    }

    return (result.body.tracks)
  },
  addTracks: async (msg, tracks) => {
    if (guildInfo[msg.channel.guild.id] !== undefined) {
      if (guildInfo[msg.channel.guild.id].tracks.length <= 0) {
        let player = await global.bot.voiceConnections.get(msg.channel.guild.id)
        player.play(tracks[0].track)
      }
      for (let track of tracks) {
        track.requester = msg.author.id
        guildInfo[msg.channel.guild.id].tracks.push(track)
      }
    }
  },
  skip: async (msg) => {
    guildInfo[msg.channel.guild.id].tracks.shift()
    guildInfo[msg.channel.guild.id].skips = []
    let player = await global.bot.voiceConnections.get(msg.channel.guild.id)
    player.play(guildInfo[msg.channel.guild.id].tracks[0].track)
    if (player.playing === false) player.setPause(false)
    if (guildInfo[msg.channel.guild.id].paused === true) guildInfo[msg.channel.guild.id].paused = false
  },
  stop: async (msg) => {
    if (!process.env.WILDBEAST_VOICE_PERSIST) {
      const channelID = global.bot.voiceConnections.get(msg.channel.guild.id).channelId === undefined ? global.bot.voiceConnections.get(msg.channel.guild.id).channelID : global.bot.voiceConnections.get(msg.channel.guild.id).channelId
      global.bot.leaveVoiceChannel(channelID)
      guildInfo[msg.channel.guild.id] = undefined
      global.i18n.send('QUEUE_END', msg.channel)
    } else {
      guildInfo[msg.channel.guild.id].tracks.shift()
      guildInfo[msg.channel.guild.id].skips = []
      module.exports.getPlayer(msg.channel).then(p => p.stop())
      global.i18n.send('VOICE_PERSIST', msg.channel)
    }
  },
  pause: async (guild) => {
    module.exports.getPlayer(guild).then(p => {
      p.setPause(true)
    })
  },
  resume: async (guild) => {
    module.exports.getPlayer(guild).then(p => {
      p.setPause(false)
    })
  },
  setVolume: async (guild, volume) => {
    module.exports.getPlayer(guild).then(p => {
      p.setVolume(volume)
    })
  },
  getTimestamp: async (guild) => {
    return module.exports.getPlayer(guild).then(p => p.getTimestamp())
  },
  hhMMss: async (time) => {
    if (time || !isNaN(time)) {
      let hours = (Math.floor(time / ((60 * 60)) % 24))
      let minutes = (Math.floor(time / (60)) % 60)
      let seconds = (Math.floor(time) % 60)
      let parsedTime = []
      if (hours >= 1) parsedTime.push(hours)
      minutes >= 10 ? parsedTime.push(minutes) : parsedTime.push(`0${minutes}`)
      seconds >= 10 ? parsedTime.push(seconds) : parsedTime.push(`0${seconds}`)
      return parsedTime.join(':')
    } else {
      return ('00:00:00')
    }
  },
  leaveVoiceChannel: async (msg) => {
    const channelID = global.bot.voiceConnections.get(msg.channel.guild.id).channelId
    guildInfo[msg.channel.guild.id].leave = true
    global.i18n.send('VOICE_DISCONNECT', msg.channel, { channel: msg.channel.guild.channels.find(c => c.id === channelID).name })
    global.bot.leaveVoiceChannel(channelID)
    guildInfo[msg.channel.guild.id] = undefined
  },
  createPlayer: async (msg, tracks) => {
    module.exports.getPlayer(msg.channel.guild.channels.find(c => c.id === msg.member.voiceState.channelID)).then(player => {
      guildInfo[msg.channel.guild.id] = {
        tracks: [],
        volume: 100,
        skips: [],
        paused: false,
        textChan: msg.channel.id
      }
      if (tracks) {
        module.exports.addTracks(msg, tracks)
      }
      player.on('error', err => global.logger.error(err))
      player.on('stuck', msg => global.logger.error(msg))
      player.on('disconnect', wat => {
        if (wat !== undefined) global.logger.error(`lava disconnect: ${wat}`)
      })
      player.on('end', async data => {
        if (data.reason && !['STOPPED', 'REPLACED'].includes(data.reason)) {
          if (guildInfo[data.guildId].tracks.length > 1) {
            const trackRequester = global.bot.users.get(guildInfo[data.guildId].tracks[1].requester)
            global.i18n.send('NEXT_TRACK', global.bot.guilds.get(data.guildId).channels.find(c => c.id === guildInfo[data.guildId].textChan), {
              current: guildInfo[data.guildId].tracks[0].info.title,
              next: guildInfo[data.guildId].tracks[1].info.title,
              duration: await module.exports.hhMMss(guildInfo[data.guildId].tracks[1].info.length / 1000),
              user: trackRequester ? trackRequester.username : 'Unknown user' // In case user is not in guild
            })
            guildInfo[data.guildId].tracks.shift()
            guildInfo[data.guildId].skips = []
            module.exports.getPlayer(global.bot.guilds.get(data.guildId).channels.find(c => c.id === global.bot.voiceConnections.get(data.guildId).channelId)).then(player => {
              player.play(guildInfo[data.guildId].tracks[0].track)
            })
          } else {
            if (!process.env.WILDBEAST_VOICE_PERSIST) {
              global.i18n.send('QUEUE_END', global.bot.guilds.get(data.guildId).channels.find(c => c.id === guildInfo[data.guildId].textChan))
              let player = await global.bot.voiceConnections.get(data.guildId)
              global.bot.leaveVoiceChannel(player.channelId)
              guildInfo[data.guildId] = undefined
            } else {
              guildInfo[data.guildId].tracks.shift()
              global.i18n.send('VOICE_PERSIST', global.bot.guilds.get(data.guildId).channels.find(c => c.id === guildInfo[data.guildId].textChan))
            }
          }
        }
      })
    })
  }
}
