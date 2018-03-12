const request = require('request')
const Promise = require('bluebird')

// CREATE DATABASE "NOAA_water_database" WITH DURATION 3d REPLICATION 1 SHARD DURATION 1h NAME "liquid"
function create (config, props) {
  const query = `CREATE DATABASE "${props.database}"`
  const duration = props.duration ? `DURATION ${props.duration}` : null
  const replication = props.replication ? `REPLICATION ${props.replication}` : null
  const shard = props.shard ? `SHARD DURATION ${props.shard}` : null
  const policy = props.policy ? `NAME "${props.policy}"` : null
  const qualifiers = [duration, replication, shard, policy].reduce((acc, q) => {
    if (q) {
      acc.push(q)
    }
    return acc
  }, [])
  const fullQuery = qualifiers.length ? [query, 'WITH'].concat(qualifiers).join(' ') : query
  const url = `http://${config.influx.host}:${config.influx.port}/query?q=${fullQuery}`
  const req = {url}
  if (config.influx.username) {
    req.auth = {
      user: config.influx.username,
      pass: config.influx.password,
      sendImmediately: true
    }
  }
  return new Promise((resolve, reject) => {
    request.post(req, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(body)
        } else {
          reject(new Error(`Attempt to create Influx DB failed with status code '${response.statusCode}'`))
        }
      }
    })
  })
}

module.exports = function (config) {
  return {
    create: create.bind(null, config)
  }
}
