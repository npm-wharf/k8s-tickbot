require('./setup')

const Influx = require('../src/influx')

// CREATE DATABASE "NOAA_water_database" WITH DURATION 3d REPLICATION 1 SHARD DURATION 1h NAME "liquid"

describe('Influx', function () {
  describe('when creating a database only', function () {
    let influx
    before(function () {
      nock('http://localhost:8086')
        .post(`/query?q=CREATE%20DATABASE%20%22test%22`)
        .reply(201)
      influx = Influx({
        influx: {
          host: 'localhost',
          port: '8086'
        }
      })
    })

    it('should post to influx URL', function () {
      return influx.create({
        database: 'test'
      })
    })

    after(function () {
      nock.cleanAll()
    })
  })

  describe('when creating a database with auth', function () {
    let influx
    before(function () {
      nock('http://localhost:8086')
        .post(`/query?q=CREATE%20DATABASE%20%22test%22`)
        .matchHeader('authorization', 'Basic YWRtaW46dDNzdGwwbA==')
        .reply(201)
      influx = Influx({
        influx: {
          host: 'localhost',
          port: '8086',
          username: 'admin',
          password: 't3stl0l'
        }
      })
    })

    it('should post to influx URL', function () {
      return influx.create({
        database: 'test'
      })
    })

    after(function () {
      nock.cleanAll()
    })
  })

  describe('when creating a database with a duration', function () {
    let influx
    before(function () {
      nock('http://localhost:8086')
        .post(`/query?q=CREATE%20DATABASE%20%22test%22%20WITH%20DURATION%207d%20NAME%20%22weekly%22`)
        .reply(201)
      influx = Influx({
        influx: {
          host: 'localhost',
          port: '8086'
        }
      })
    })

    it('should post to influx URL', function () {
      return influx.create({
        database: 'test',
        duration: '7d',
        policy: 'weekly'
      })
    })

    after(function () {
      nock.cleanAll()
    })
  })

  describe('when creating a database with a duration and shards', function () {
    let influx
    before(function () {
      nock('http://localhost:8086')
        .post(`/query?q=CREATE%20DATABASE%20%22test%22%20WITH%20DURATION%207d%20REPLICATION%201%20NAME%20%22weekly%22`)
        .reply(201)
      influx = Influx({
        influx: {
          host: 'localhost',
          port: '8086'
        }
      })
    })

    it('should post to influx URL', function () {
      return influx.create({
        database: 'test',
        duration: '7d',
        policy: 'weekly',
        replication: 1
      })
    })

    after(function () {
      nock.cleanAll()
    })
  })

  describe('when creating a database with a duration, shards and retention', function () {
    let influx
    before(function () {
      nock('http://localhost:8086')
        .post(`/query?q=CREATE%20DATABASE%20%22test%22%20WITH%20DURATION%207d%20REPLICATION%201%20SHARD%20DURATION%201h%20NAME%20%22weekly%22`)
        .reply(201)
      influx = Influx({
        influx: {
          host: 'localhost',
          port: '8086'
        }
      })
    })

    it('should post to influx URL', function () {
      return influx.create({
        database: 'test',
        duration: '7d',
        policy: 'weekly',
        replication: 1,
        shard: '1h'
      })
    })

    after(function () {
      nock.cleanAll()
    })
  })
})
