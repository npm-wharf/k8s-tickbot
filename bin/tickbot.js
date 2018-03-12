#!/usr/bin/env node

const config = require('../src/config')
const influx = require('../src/influx')(config)
const chronograf = require('../src/chronograf')(config)
const kapacitor = require('../src/kapacitor')(config)
const bucketApi = require('../src/bucketApi')
const bucket = require('../src/bucket')(bucketApi, config)
const tar = require('../src/tar')
const backup = require('../src/backup')(config, chronograf, kapacitor, tar, bucket)
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
  .command(require('../src/command/backup')(backup))
  .command(require('../src/command/create')(config, influx))
  .command(require('../src/command/restore')(backup))
  .help()
  .version()
  .argv
