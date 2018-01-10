const fs = require('fs')
const path = require('path')
const tar = require('tar')
const log = require('bole')('tar')

function createFileMap (dataPath) {
  const graphs = fs.readFileSync(path.join(dataPath, 'graphs.json'), 'utf8')
  const tasks = fs.readFileSync(path.join(dataPath, 'tasks.json'), 'utf8')
  return {
    graphs: JSON.parse(graphs),
    tasks: JSON.parse(tasks)
  }
}

function unzipFiles (dataPath, tarball) {
  return tar.x(
    {
      file: tarball.file,
      C: tarball.dir,
      unlink: true
    }
  ).then(
    () => {
      log.info(`Unpacked tarball to '${tarball.dir}'`)
      return createFileMap(dataPath)
    },
    err => {
      log.error(`Unpacking tarball failed with error:\n\t${err.message}`)
      return undefined
    }
  )
}

function zipFiles (relativePath, files) {
  const tgzFile = path.join(process.cwd(), 'metrics.tgz')
  return tar.c(
    {
      gzip: true,
      file: tgzFile,
      follow: true,
      C: relativePath
    },
    files.map(f => `./${path.basename(f)}`)
  ).then(
    () => {
      log.info(`Created tarball with files '${files.join(', ')}'`)
      return tgzFile
    },
    err => {
      log.error(`Failed to create tarball for files - '${files.join(', ')}' with error:\n\t${err.message}`)
      throw err
    }
  )
}

module.exports = {
  unzipFiles,
  zipFiles
}
