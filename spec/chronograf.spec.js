require('./setup')

const Chrono = require('../src/chronograf')

const dashboard1 = {
  id: 1,
  cells: [
    {
      queries: [
        'chronograf/v1/queries/1'
      ]
    }
  ]
}
const dashboard2 = {
  id: 2,
  cells: [
    {
      queries: [
        'chronograf/v1/queries/2',
        'chronograf/v1/queries/3'
      ]
    }
  ]
}
const dashboard3 = {
  id: 3,
  cells: [
    {
      queries: [
        'chronograf/v1/queries/4'
      ]
    }
  ]
}
const dashboards = [ dashboard1, dashboard2, dashboard3 ]
const query1 = {
  id: 1,
  url: 'chronograf/v1/queries/1',
  query: 'SELECT mean(things) from thing GROUP BY time(1s)',
  db: 'test'
}
const query2 = {
  id: 2,
  url: 'chronograf/v1/queries/2',
  query: 'SELECT mean(thanks) from thank GROUP BY time(1s)',
  db: 'test'
}
const query3 = {
  id: 3,
  url: 'chronograf/v1/queries/3',
  query: 'SELECT mean(thinks) from think GROUP BY time(1s)',
  db: 'test'
}
const query4 = {
  id: 4,
  url: 'chronograf/v1/queries/4',
  query: 'SELECT mean(thunks) from thunk GROUP BY time(1s)',
  db: 'test'
}
const queries = [ query1, query2, query3, query4 ]

describe('Chronograf', function () {
  describe('when retrieving graphs from chronograf', function () {
    let chronograf
    before(function () {
      nock('http://localhost:8888')
        .get('/chronograf/v1/dashboards')
        .reply(200, {
          dashboards: [
            dashboard2,
            dashboard3,
            dashboard1
          ]
        })

      nock('http://localhost:8888')
        .get('/chronograf/v1/queries/1')
        .reply(200, query1)

      nock('http://localhost:8888')
        .get('/chronograf/v1/queries/2')
        .reply(200, query2)

      nock('http://localhost:8888')
        .get('/chronograf/v1/queries/3')
        .reply(200, query3)

      nock('http://localhost:8888')
        .get('/chronograf/v1/queries/4')
        .reply(200, query4)

      chronograf = Chrono({
        chronograf: {
          host: 'localhost',
          port: '8888'
        }
      })
    })

    it('should return lists of dashboards and queries', function () {
      return chronograf.getAll()
        .should.eventually.eql({
          dashboards: dashboards,
          queries: queries
        })
    })

    after(function () {
      nock.cleanAll()
    })
  })

  describe('when writing graphs to chronograf', function () {
    let chronograf
    before(function () {
      nock('http://localhost:8888')
        .post('/chronograf/v1/queries', query1)
        .reply(201)

      nock('http://localhost:8888')
        .post('/chronograf/v1/queries', query2)
        .reply(201)

      nock('http://localhost:8888')
        .post('/chronograf/v1/queries', query3)
        .reply(201)

      nock('http://localhost:8888')
        .post('/chronograf/v1/queries', query4)
        .reply(201)

      nock('http://localhost:8888')
        .post('/chronograf/v1/dashboards', dashboard1)
        .reply(201)

      nock('http://localhost:8888')
        .post('/chronograf/v1/dashboards', dashboard2)
        .reply(201)

      nock('http://localhost:8888')
        .post('/chronograf/v1/dashboards', dashboard3)
        .reply(201)

      chronograf = Chrono({
        chronograf: {
          host: 'localhost',
          port: '8888'
        }
      })
    })

    it('should return lists of dashboards and queries', function () {
      return chronograf.addAll({
        dashboards: dashboards,
        queries: queries
      })
      .should.eventually.eql(true)
    })

    after(function () {
      nock.cleanAll()
    })
  })
})
