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

async function unzipFiles (dataPath, tarball) {
  await tar.x(
    {
      file: tarball.file,
      C: tarball.dir,
      unlink: true
    }
  ).catch(err => {
    log.error(`Unpacking tarball failed with error:\n\t${err.stack}`)
    throw err
  })
  log.info(`Unpacked tarball to '${tarball.dir}'`)
  return createFileMap(dataPath)
}

async function zipFiles (relativePath, files) {
  const tgzFile = path.join(process.cwd(), 'metrics.tgz')
  await tar.c(
    {
      gzip: true,
      file: tgzFile,
      follow: true,
      C: relativePath
    },
    files.map(f => `./${path.basename(f)}`)
  ).catch(err => {
    log.error(`Failed to create tarball for files - '${files.join(', ')}' with error:\n\t${err.stack}`)
    throw err
  })
  log.info(`Created tarball with files '${files.join(', ')}'`)
  return tgzFile
}

module.exports = {
  unzipFiles,
  zipFiles
}
