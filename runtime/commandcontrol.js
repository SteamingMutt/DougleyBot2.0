'use strict'
var directory = require('require-directory')
var com = directory(module, './commands', {
  exclude: /custom/
})
var cus = directory(module, './commands/custom')
var Logger = require('./internal/logger.js').Logger
var commands = []
var alias = []

for (var d in com) {
  for (var o in com[d].Commands) {
    commands[o] = com[d].Commands[o]
    if (com[d].Commands[o].aliases !== undefined) {
      for (var u in com[d].Commands[o].aliases) {
        alias[com[d].Commands[o].aliases[u]] = com[d].Commands[o]
      }
    }
  }
}

if (cus !== null) {
  for (var g in cus) {
    for (var l in cus[g].Commands) {
      if (commands[l]) {
        throw new Error('Custom commands cannot have the same name as default commands!')
      }
      commands[l] = cus[g].Commands[l]
      if (cus[g].Commands[l].aliases !== undefined) {
        for (var e in cus[g].Commands[l].aliases) {
          if (alias[cus[g].Commands[l].aliases[e]]) {
            throw new Error('Custom commands cannot share aliases with other commands!')
          }
          alias[cus[g].Commands[l].aliases[e]] = cus[g].Commands[l]
        }
      }
    }
  }
}

exports.helpHandle = function (msg, suffix) {
  var msgArray = []
  var commandnames = []
  if (!suffix) {
    for (var index in commands) {
      if (commands[index].hidden) {
        continue
      } else {
        commandnames.push(commands[index].name)
      }
    }
    msgArray.push('**Available commands:** \n')
    msgArray.push(commandnames.sort().join(', ') + '\n')
    msgArray.push('For questions: https://discord.gg/0cFoiR5QVh5LZlQO')
    if (!msg.isPrivate) {
      msg.channel.sendMessage('Help is underway ' + msg.author.mention + '!')
    }
    msg.author.openDM().then((y) => {
      y.sendMessage(msgArray.join('\n'))
    }).catch((e) => {
      Logger.error(e)
      msg.channel.sendMessage('Whoops, try again.')
    })
  } else if (suffix) {
    if (commands[suffix] || alias[suffix]) {
      var comad
      if (alias[suffix]) {
        comad = alias[suffix]
      } else {
        comad = commands[suffix]
      }
      msgArray = []
      msgArray.push('Command name `' + comad.name + '`')
      msgArray.push('What this does: `' + comad.help + '`\n')
      msgArray.push('Example:')
      if (comad.hasOwnProperty('usage')) {
        msgArray.push('```' + `${require('../config.json').settings.prefix}${comad.name} ${comad.usage}` + '```')
      } else {
        msgArray.push('```' + `${require('../config.json').settings.prefix}${comad.name}` + '```')
      }
      msgArray.push(`**Required access level**: ${comad.level}`)
      if (comad.hasOwnProperty('aliases')) {
        msgArray.push(`**Aliases for this command**: ${comad.aliases.join(', ')}.`)
      }
      if (comad.hasOwnProperty('hidden')) {
        msgArray.push('*Shh, this is a secret command.*')
      }
      if (comad.hasOwnProperty('timeout')) {
        msgArray.push(`*This command has a timeout of ${comad.timeout} seconds.*`)
      }
      if (comad.hasOwnProperty('nsfw')) {
        msgArray.push('*This command is NSFW.*')
      }
      if (comad.hasOwnProperty('noDM')) {
        msgArray.push('*This command cannot be used in DM.*')
      }
      msg.author.openDM().then((y) => {
        y.sendMessage(msgArray.join('\n'))
      }).catch((e) => {
        Logger.error(e)
        msg.channel.sendMessage('Whoops, try again.')
      })
    } else {
      msg.channel.sendMessage(`There is no **${suffix}** command!`)
    }
  }
}

exports.Commands = commands
exports.Aliases = alias
