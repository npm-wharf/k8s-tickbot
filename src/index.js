const config = require('../src/config')
const influx = require('../src/influx')
const chronograf = require('../src/chronograf')(config)
const kapacitor = require('../src/kapacitor')(config)
const bucketApi = require('../src/bucketApi')
const bucket = require('../src/bucket')(bucketApi)
const tar = require('../src/tar')
const backup = require('../src/backup')(config, chronograf, kapacitor, tar, bucket)

module.exports = {
  backup,
  influx
}
