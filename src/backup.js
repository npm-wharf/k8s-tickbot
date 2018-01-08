const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const log = require('bole')('backup')
const Promise = require('bluebird')

function create (config, chronograf, kapacitor, tar, bucket) {
  const dataPath = getDataPath(config)
  if (!fs.existsSync(dataPath)) {
    mkdirp.sync(dataPath)
  }
  return getData(config, chronograf, kapacitor)
    .then(
      onData.bind(null, config, tar, bucket),
      () => {
        log.error(`Failed to acquire some or all of the data. Backup will not continue.`)
        process.exit(1)
      }
    )
}

function getData (config, chronograf, kapacitor) {
  return Promise.all([
    chronograf.getAll()
      .then(
        onGraphs.bind(null, config),
        onGraphsFailed
      ),
    kapacitor.getTasks()
      .then(
        onTasks.bind(null, config),
        onTasksFailed
      )
  ])
}

function getDataPath (config, fileName = '') {
  return path.join(path.resolve(config.basePath), config.dataPath, fileName)
}

function onData (config, tar, bucket) {
  return zipFiles(config, tar, bucket)
    .then(
      onTgzCreated.bind(null, config, bucket),
      () => {
        log.error(`Zipping files for upload failed. Backup will not continue.`)
        process.exit(2)
      }
    )
}

function onDownloadFailed (config, err) {
  log.error(`Failed to download file, restore will not complete:\n\t${err.message}`)
  process.exit(1)
}

function onGraphs (config, graphs) {
  const file = getDataPath(config, 'graphs.json')
  return new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(graphs), 'utf8', (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function onGraphsFailed (error) {
  log.error(error.message)
  throw error
}

function onTasks (config, tasks) {
  const file = getDataPath(config, 'tasks.json')
  return new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(tasks), 'utf8', (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function onTasksFailed (error) {
  log.error(error.message)
  throw error
}

function onTgzCreated (config, bucket, tgz) {
  return bucket.uploadFile(config, tgz)
    .then(
      () => {
        log.info(`Backup completed successfully.`)
        process.exit(0)
      },
      () => {
        log.error(`Failed to upload tarball to configured object store. Backup has failed.`)
        process.exit(1)
      }
    )
}

function onTgzDownloaded (config, chronograf, kapacitor, tar, tarball) {
  const fail = () => {
    log.error(`The tarball was missing or corrupt. Restore will not continue.`)
    process.exit(1)
  }
  if (tarball) {
    return unzipFiles(config, tar, tarball)
      .then(
        map => {
          if (map) {
            return Promise.all([
              chronograf.addAll(map.graphs),
              kapacitor.addTasks(map.tasks)
            ])
          } else {
            fail()
          }
        }
      )
  } else {
    fail()
  }
}

function restore (config, chronograf, kapacitor, tar, bucket) {
  return bucket.downloadFile('metrics.tgz')
    .then(
      onTgzDownloaded.bind(null, config, chronograf, kapacitor, tar),
      onDownloadFailed.bind(null, config)
    )
    .then(
      () => {
        log.info(`Restore complete.`)
        process.exit(0)
      },
      err => {
        log.error(`Uploading data via APIs failed with: ${err.message}`)
        process.exit(1)
      }
    )
}

function unzipFiles (config, tar, tarball) {
  const dataPath = getDataPath(config)
  return tar.unzipFiles(dataPath, tarball)
}

function writeMetadata (config) {
  const file = getDataPath(config, 'info.json')
  try {
    const date = {
      createdOn: (new Date()).toUTCString()
    }
    const metadata = Object.assign({}, date, config.influx, config.chronograf, config.kapacitor)
    fs.writeFileSync(file, JSON.stringify(metadata), 'utf8')
  } catch (err) {
    log.error(`Failed to write metadata to '${file}' (zip creation and upload will fail):\n\t${err.message}`)
  }
  return file
}

function zipFiles (config, tar, bucket) {
  const metaFile = writeMetadata(config)
  const files = [
    getDataPath(config, 'graphs.json'),
    getDataPath(config, 'tasks.json'),
    metaFile
  ]
  const dataPath = path.resolve(getDataPath(config))
  return tar.zipFiles(dataPath, files)
}

module.exports = function (config, chronograf, kapacitor, tar, bucket) {
  return {
    create: create.bind(null, config, chronograf, kapacitor, tar, bucket),
    restore: restore.bind(null, config, chronograf, kapacitor, tar, bucket)
  }
}
