const config = require('../lib/config')
const influx = require('../lib/influx')
const chronograf = require('../lib/chronograf')(config)
const kapacitor = require('../lib/kapacitor')(config)
const bucketApi = require('../lib/bucketApi')
const bucket = require('../lib/bucket')(bucketApi)
const tar = require('../lib/tar')
const backup = require('../lib/backup')(config, chronograf, kapacitor, tar, bucket)

module.exports = {
  backup,
  influx
}
