#!/usr/bin/env node

const config = require('../lib/config')
const influx = require('../lib/influx')(config)
const chronograf = require('../lib/chronograf')(config)
const kapacitor = require('../lib/kapacitor')(config)
const bucketApi = require('../lib/bucketApi')
const bucket = require('../lib/bucket')(bucketApi, config)
const tar = require('../lib/tar')
const backup = require('../lib/backup')(config, chronograf, kapacitor, tar, bucket)
const chalk = require('chalk')
const bole = require('bole')

const levelColors = {
  debug: 'gray',
  info: 'white',
  warn: 'yellow',
  error: 'red'
}

const debugOut = {
  write: function (data) {
    const entry = JSON.parse(data)
    const levelColor = levelColors[entry.level]
    console.log(`${chalk[levelColor](entry.time)} - ${chalk[levelColor](entry.level)} ${entry.message}`)
  }
}

bole.output({
  level: 'info',
  stream: debugOut
})

require('yargs') // eslint-disable-line no-unused-expressions
  .usage('$0 <command>')
  .command(require('../lib/command/backup')(backup))
  .command(require('../lib/command/create')(config, influx))
  .command(require('../lib/command/restore')(backup))
  .help()
  .version()
  .argv
