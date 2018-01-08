const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const log = require('bole')('bucket')

function downloadFile (api, config, fileName) {
  const dir = path.join(path.resolve(config.basePath), config.dataPath)
  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir)
  }
  const file = path.join(dir, fileName)
  if (api.gs) {
    log.info(`Attempting to download '${fileName}' from '${config.storage.bucket}'`)
    return api.gs
      .bucket(config.storage.bucket)
      .file(fileName)
      .download({
        destination: file
      })
      .then(
        () => {
          log.info(`Downloaded tarball '${fileName}' successfully`)
          return { file, dir }
        },
        err => {
          log.info(`Could not download tarball '${fileName}':\n\t${err.message}`)
          return undefined
        }
      )
  } else {
    log.info(`Attempting to download '${fileName}' from '${config.storage.bucket}'`)
    return new Promise((resolve, reject) => {
      const download = api.s3.downloadFile({
        localFile: file,
        s3Params: {
          Bucket: config.storage.bucket,
          Key: fileName
        }
      })
      download.on('error', err => {
        log.info(`Could not download tarball with certs:\n\t${err.message}`)
        resolve(undefined)
      })
      download.on('end', () => {
        log.info(`Downloaded tarball '${fileName}' successfully`)
        resolve({
          file, dir
        })
      })
    })
  }
}

function uploadFile (api, config, file) {
  const dir = path.dirname(file)
  if (api.gs) {
    return api.gs
      .bucket(config.storage.bucket)
      .upload(file)
      .then(
        () => {
          log.info(`Uploaded tarball '${file}' to bucket '${config.storage.bucket}' successfully`)
          return { file, dir }
        },
        err => {
          log.info(`Could not upload tarball '${file}' to bucket '${config.storage.bucket}':\n\t${err.message}`)
          throw err
        }
      )
  } else {
    return new Promise((resolve, reject) => {
      const fileName = path.basename(file)
      const upload = api.s3.uploadFile({
        localFile: file,
        s3Params: {
          Bucket: config.storage.bucket,
          Key: fileName
        }
      })
      upload.on('error', err => {
        log.info(`Could not upload tarball '${file}' to bucket '${config.storage.bucket}':\n\t${err.message}`)
        reject(err)
      })
      upload.on('end', () => {
        log.info(`Uploaded tarball '${file}' to bucket '${config.storage.bucket}' successfully`)
        resolve({ file, dir })
      })
    })
  }
}

module.exports = function (api, config) {
  return {
    downloadFile: downloadFile.bind(null, api, config),
    uploadFile: uploadFile.bind(null, api, config)
  }
}
