const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const log = require('bole')('backup')
const util = require('util')
const writeFileAsync = util.promisify(fs.writeFile)

async function create (config, chronograf, kapacitor, tar, bucket) {
  const dataPath = getDataPath(config)
  if (!fs.existsSync(dataPath)) {
    mkdirp.sync(dataPath)
  }
  try {
    await Promise.all([
      chronograf.getAll().then(graphs => {
        const file = getDataPath(config, 'graphs.json')
        return writeFileAsync(file, JSON.stringify(graphs), 'utf8')
      }),
      kapacitor.getTasks().then(tasks => {
        const file = getDataPath(config, 'tasks.json')
        return writeFileAsync(file, JSON.stringify(tasks), 'utf8')
      })
    ]).catch(error => {
      log.error(error.stack)
      log.error(`Failed to acquire some or all of the data. Backup will not continue.`)
      throw error
    })

    const tgz = await zipFiles(config, tar, bucket)
      .catch(error => {
        log.error(`Zipping files for upload failed. Backup will not continue.`)
        throw error
      })

    await bucket.uploadFile(tgz)
      .catch(error => {
        log.error(`Failed to upload tarball to configured object store. Backup has failed.`)
        throw error
      })
  } catch (err) {
    return process.exit(1)
  }

  log.info(`Backup completed successfully.`)
  process.exit(0)
}

function getDataPath (config, fileName = '') {
  return path.join(path.resolve(config.basePath), config.dataPath, fileName)
}

async function restore (config, chronograf, kapacitor, tar, bucket) {
  try {
    const tarball = await bucket.downloadFile('metrics.tgz')
      .catch(error => {
        log.error(`Failed to download file, restore will not complete:\n\t${error.stack}`)
        throw error
      })

    const map = await unzipFiles(config, tar, tarball).catch(err => {
      log.error(`The tarball was missing or corrupt. Restore will not continue.`)
      throw err
    })

    await Promise.all([
      chronograf.addAll(map.graphs),
      kapacitor.addTasks(map.tasks)
    ]).catch(err => {
      log.error(`Uploading data via APIs failed with: ${err.message}`)
      throw err
    })
  } catch (err) {
    process.exit(1)
  }

  log.info(`Restore complete.`)
  process.exit(0)
}

async function unzipFiles (config, tar, tarball) {
  const dataPath = getDataPath(config)
  return tar.unzipFiles(dataPath, tarball)
}

async function writeMetadata (config) {
  const file = getDataPath(config, 'info.json')
  try {
    const date = {
      createdOn: (new Date()).toUTCString()
    }
    const metadata = Object.assign({}, date, config.influx, config.chronograf, config.kapacitor)
    await writeFileAsync(file, JSON.stringify(metadata), 'utf8')
  } catch (err) {
    log.error(`Failed to write metadata to '${file}' (zip creation and upload will fail):\n\t${err.message}`)
  }
  return file
}

async function zipFiles (config, tar, bucket) {
  const metaFile = await writeMetadata(config)
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
