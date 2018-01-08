#!/usr/bin/env node

const config = require('../src/config')
const influx = require('../src/influx')
const chronograf = require('../src/chronograf')(config)
const kapacitor = require('../src/kapacitor')(config)
const bucketApi = require('../src/bucketApi')
const bucket = require('../src/bucket')(bucketApi)
const tar = require('../src/tar')
const backup = require('../src/backup')(config, chronograf, kapacitor, tar, bucket)

require('yargs') // eslint-disable-line no-unused-expressions
  .usage('$0 <command>')
  .command(require('../src/command/backup')(backup))
  .command(require('../src/command/create')(config, influx))
  .command(require('../src/command/restore')(backup))
  .help()
  .version()
  .argv
