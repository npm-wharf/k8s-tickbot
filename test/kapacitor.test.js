require('./setup')

const Kapacitor = require('../lib/kapacitor')

const task1 = {
  id: '1',
  type: 'stream',
  status: 'enabled',
  dbrps: [{ db: 'test', rp: 'weekly' }],
  script: `stream|from().measurement('cpu')`
}
const task2 = {
  id: '2',
  type: 'stream',
  status: 'enabled',
  dbrps: [{ db: 'test', rp: 'weekly' }],
  script: `stream|from().measurement('memory')`
}
const task3 = {
  id: 'a-string',
  type: 'stream',
  status: 'enabled',
  dbrps: [{ db: 'test', rp: 'weekly' }],
  script: `stream|from().measurement('cpu')`
}
const task4 = {
  id: '4',
  type: 'stream',
  status: 'enabled',
  dbrps: [{ db: 'test', rp: 'weekly' }],
  script: `stream|from().measurement('memory')`
}
const tasks = [task1, task2, task4, task3]

describe('Kapacitor', function () {
  describe('when retrieving alerts from kapacitor', function () {
    let kapacitor
    before(function () {
      nock('http://localhost:9092')
        .get('/kapacitor/v1/tasks')
        .reply(200, {
          tasks: [
            task3,
            task4,
            task1,
            task2
          ]
        })

      kapacitor = Kapacitor({
        kapacitor: {
          host: 'localhost',
          port: '9092'
        }
      })
    })

    it('should return lists of dashboards and queries', function () {
      return kapacitor.getTasks()
        .should.eventually.eql({
          tasks: tasks
        })
    })

    after(function () {
      nock.cleanAll()
    })
  })

  describe('when retrieving alerts from kapacitor', function () {
    let kapacitor
    before(function () {
      nock('http://localhost:9092')
        .post('/kapacitor/v1/tasks', task1)
        .reply(200, task1)

      nock('http://localhost:9092')
        .post('/kapacitor/v1/tasks', task2)
        .reply(200, task2)

      nock('http://localhost:9092')
        .get('/kapacitor/v1/tasks/1').reply(404)
        .get('/kapacitor/v1/tasks/2').reply(404)
        .get('/kapacitor/v1/tasks/a-string').reply(404)
        .get('/kapacitor/v1/tasks/4').reply(200, task4)

      nock('http://localhost:9092')
        .post('/kapacitor/v1/tasks', task3)
        .reply(200, task3)

      nock('http://localhost:9092')
        .patch('/kapacitor/v1/tasks/4', task4)
        .reply(200, task4)

      kapacitor = Kapacitor({
        kapacitor: {
          host: 'localhost',
          port: '9092'
        }
      })
    })

    it('should post all tasks', function () {
      return kapacitor.addTasks(tasks)
        .should.eventually.eql(true)
    })

    after(function () {
      nock.cleanAll()
    })
  })
})
