require('./setup')
const rimraf = require('rimraf')
const path = require('path')
const LOCAL_PATH = path.resolve('./')
const Backup = require('../src/backup')

const bucket = {
  uploadFile: () => {},
  downloadFile: () => {}
}

const chronograf = {
  addAll: () => {},
  getAll: () => {}
}

const kapacitor = {
  addTasks: () => {},
  getTasks: () => {}
}

const tar = {
  unzipFiles: () => {},
  zipFiles: () => {}
}

describe('Backup', function () {
  const ORIGINAL_EXIT = process.exit
  let spyOnExit
  before(function () {
    spyOnExit = () => {
      process.exit = sinon.spy()
    }
  })
  describe('when creating', function () {
    describe('and chronograf fails', function () {
      let backup, chronoMock, kapMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)

        chronoMock.expects('getAll')
          .rejects(new Error('eaux neaux'))
        kapMock.expects('getTasks')
          .resolves({})

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.create()
      })

      it('should exit with error code', function () {
        chronoMock.verify()
        kapMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })

      after(function () {
        rimraf.sync('./spec/tmp')
      })
    })

    describe('and kapacitor fails', function () {
      let backup, chronoMock, kapMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)

        chronoMock.expects('getAll')
          .resolves({})
        kapMock.expects('getTasks')
          .rejects(new Error('eaux neaux'))

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.create()
      })

      it('should exit with error code', function () {
        chronoMock.verify()
        kapMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })

      after(function () {
        rimraf.sync('./spec/tmp')
      })
    })

    describe('and tar fails', function () {
      let backup, chronoMock, kapMock, tarMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)
        tarMock = sinon.mock(tar)

        chronoMock.expects('getAll')
          .resolves({})
        kapMock.expects('getTasks')
          .resolves({})
        tarMock.expects('zipFiles')
          .withArgs(`${LOCAL_PATH}/spec/tmp`,
          [
            `${LOCAL_PATH}/spec/tmp/graphs.json`,
            `${LOCAL_PATH}/spec/tmp/tasks.json`,
            `${LOCAL_PATH}/spec/tmp/info.json`
          ])
          .rejects(new Error('nope'))

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.create()
      })

      it('should exit with error code', function () {
        chronoMock.verify()
        kapMock.verify()
        tarMock.verify()
        expect(process.exit.calledWith(2)).to.eql(true)
      })

      after(function () {
        rimraf.sync('./spec/tmp')
      })
    })

    describe('and upload fails', function () {
      let backup, chronoMock, kapMock, tarMock, bucketMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)
        bucketMock = sinon.mock(bucket)
        tarMock = sinon.mock(tar)

        chronoMock.expects('getAll')
          .resolves({})
        kapMock.expects('getTasks')
          .resolves({})
        tarMock.expects('zipFiles')
          .withArgs(`${LOCAL_PATH}/spec/files`,
          [
            `${LOCAL_PATH}/spec/files/graphs.json`,
            `${LOCAL_PATH}/spec/files/tasks.json`,
            `${LOCAL_PATH}/spec/files/info.json`
          ])
          .resolves('./spec/metrics.tgz')
        bucketMock.expects('uploadFile')
          .withArgs({
            basePath: './spec',
            dataPath: 'files'
          }, './spec/metrics.tgz')
          .rejects(new Error('oops'))

        backup = Backup({
          basePath: './spec',
          dataPath: 'files'
        }, chronograf, kapacitor, tar, bucket)
        return backup.create()
      })

      it('should exit with error code', function () {
        chronoMock.verify()
        kapMock.verify()
        tarMock.verify()
        bucketMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })

      after(function () {
        rimraf.sync('./spec/tmp')
      })
    })

    describe('and all calls succeed', function () {
      let backup, chronoMock, kapMock, tarMock, bucketMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)
        bucketMock = sinon.mock(bucket)
        tarMock = sinon.mock(tar)

        chronoMock.expects('getAll')
          .resolves({})
        kapMock.expects('getTasks')
          .resolves({})
        tarMock.expects('zipFiles')
          .withArgs(`${LOCAL_PATH}/spec/files`,
          [
            `${LOCAL_PATH}/spec/files/graphs.json`,
            `${LOCAL_PATH}/spec/files/tasks.json`,
            `${LOCAL_PATH}/spec/files/info.json`
          ])
          .resolves('./spec/metrics.tgz')
        bucketMock.expects('uploadFile')
          .withArgs({
            basePath: './spec',
            dataPath: 'files'
          }, './spec/metrics.tgz')
          .resolves({})

        backup = Backup({
          basePath: './spec',
          dataPath: 'files'
        }, chronograf, kapacitor, tar, bucket)
        return backup.create()
      })

      it('should exit with non-error code (0)', function () {
        chronoMock.verify()
        kapMock.verify()
        tarMock.verify()
        bucketMock.verify()
        expect(process.exit.calledWith(0)).to.eql(true)
      })

      after(function () {
        rimraf.sync('./spec/tmp')
      })
    })
  })

  describe('when restoring', function () {
    describe('and download errors', function () {
      let backup, bucketMock
      before(function () {
        spyOnExit()
        bucketMock = sinon.mock(bucket)

        bucketMock.expects('downloadFile')
          .withArgs('metrics.tgz')
          .rejects(new Error('no such tarball'))

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.restore()
      })

      it('should exit with error code', function () {
        bucketMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })
    })

    describe('and tarball is missing', function () {
      let backup, bucketMock
      before(function () {
        spyOnExit()
        bucketMock = sinon.mock(bucket)

        bucketMock.expects('downloadFile')
          .withArgs('metrics.tgz')
          .resolves(null)

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.restore()
      })

      it('should exit with error code', function () {
        bucketMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })
    })

    describe('and untar fails', function () {
      let backup, bucketMock, tarMock
      before(function () {
        spyOnExit()
        bucketMock = sinon.mock(bucket)
        tarMock = sinon.mock(tar)

        bucketMock.expects('downloadFile')
          .withArgs('metrics.tgz')
          .resolves({
            file: './spec/metrics.tgz',
            dir: './spec'
          })
        tarMock.expects('unzipFiles')
          .withArgs(path.resolve('./spec/tmp'),
          {
            file: './spec/metrics.tgz',
            dir: './spec'
          })
          .resolves(undefined)

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.restore()
      })

      it('should exit with error code', function () {
        bucketMock.verify()
        tarMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })
    })

    describe('and kapacitor fails', function () {
      let backup, chronoMock, kapMock, bucketMock, tarMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)
        bucketMock = sinon.mock(bucket)
        tarMock = sinon.mock(tar)

        bucketMock.expects('downloadFile')
          .withArgs('metrics.tgz')
          .resolves({
            file: './spec/metrics.tgz',
            dir: './spec'
          })
        tarMock.expects('unzipFiles')
          .withArgs(path.resolve('./spec/tmp'),
          {
            file: './spec/metrics.tgz',
            dir: './spec'
          })
          .resolves({
            graphs: 'chronograf-data',
            tasks: 'kapacitor-data'
          })
        chronoMock.expects('addAll')
          .withArgs('chronograf-data')
          .resolves({})
        kapMock.expects('addTasks')
          .withArgs('kapacitor-data')
          .rejects(new Error('bad data'))

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.restore()
      })

      it('should exit with error code', function () {
        bucketMock.verify()
        tarMock.verify()
        chronoMock.verify()
        kapMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })
    })

    describe('and chronograf fails', function () {
      let backup, chronoMock, kapMock, bucketMock, tarMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)
        bucketMock = sinon.mock(bucket)
        tarMock = sinon.mock(tar)

        bucketMock.expects('downloadFile')
          .withArgs('metrics.tgz')
          .resolves({
            file: './spec/metrics.tgz',
            dir: './spec'
          })
        tarMock.expects('unzipFiles')
          .withArgs(path.resolve('./spec/tmp'),
          {
            file: './spec/metrics.tgz',
            dir: './spec'
          })
          .resolves({
            graphs: 'chronograf-data',
            tasks: 'kapacitor-data'
          })
        chronoMock.expects('addAll')
          .withArgs('chronograf-data')
          .rejects(new Error('bad data'))
        kapMock.expects('addTasks')
          .withArgs('kapacitor-data')
          .resolves({})

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.restore()
      })

      it('should exit with error code', function () {
        bucketMock.verify()
        tarMock.verify()
        chronoMock.verify()
        kapMock.verify()
        expect(process.exit.calledWith(1)).to.eql(true)
      })
    })

    describe('and all calls succeed', function () {
      let backup, chronoMock, kapMock, bucketMock, tarMock
      before(function () {
        spyOnExit()
        chronoMock = sinon.mock(chronograf)
        kapMock = sinon.mock(kapacitor)
        bucketMock = sinon.mock(bucket)
        tarMock = sinon.mock(tar)

        bucketMock.expects('downloadFile')
          .withArgs('metrics.tgz')
          .resolves({
            file: './spec/metrics.tgz',
            dir: './spec'
          })
        tarMock.expects('unzipFiles')
          .withArgs(path.resolve('./spec/tmp'),
          {
            file: './spec/metrics.tgz',
            dir: './spec'
          })
          .resolves({
            graphs: 'chronograf-data',
            tasks: 'kapacitor-data'
          })
        chronoMock.expects('addAll')
          .withArgs('chronograf-data')
          .resolves({})
        kapMock.expects('addTasks')
          .withArgs('kapacitor-data')
          .resolves({})

        backup = Backup({
          basePath: './spec',
          dataPath: 'tmp'
        }, chronograf, kapacitor, tar, bucket)
        return backup.restore()
      })

      it('should exit with non-error code (0)', function () {
        bucketMock.verify()
        tarMock.verify()
        chronoMock.verify()
        kapMock.verify()
        expect(process.exit.calledWith(0)).to.eql(true)
      })
    })
  })

  after(function () {
    process.exit = ORIGINAL_EXIT
  })
})
