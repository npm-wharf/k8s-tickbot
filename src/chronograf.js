const request = require('request')
const Promise = require('bluebird')
const path = require('path')
const log = require('bole')('chronograf')

function addAll (config, set) {
  return addQueries(config, set.queries)
    .then(
      () => addDashboards(config, set.dashboards)
    )
    .then(
      () => true
    )
}

function addDashboards (config, dashboards) {
  return Promise.mapSeries(dashboards, addDashboard.bind(null, config))
}

function addDashboard (config, dashboard) {
  const url = `http://${config.chronograf.host}:${config.chronograf.port}/chronograf/v1/dashboards`
  const req = {url, body: JSON.stringify(dashboard)}
  return new Promise((resolve, reject) => {
    request.post(req, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(body)
        } else {
          reject(new Error(`Attempt to post dashboard '${dashboard.id}' to Chronograf failed with status code '${response.statusCode}'`))
        }
      }
    })
  })
}

function addQueries (config, queries) {
  return Promise.mapSeries(queries, addQuery.bind(null, config))
}

function addQuery (config, query) {
  const url = `http://${config.chronograf.host}:${config.chronograf.port}/chronograf/v1/queries`
  const req = {url, body: JSON.stringify(query)}
  return new Promise((resolve, reject) => {
    request.post(req, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(body)
        } else {
          reject(new Error(`Attempt to post query '${query.id}' to Chronograf failed with status code '${response.statusCode}'`))
        }
      }
    })
  })
}

function getAll (config) {
  return getDashboards(config)
    .then(
      onDashboards.bind(null, config),
      err => {
        log.error(`Failed to retrieve dashboards from '${config.chronograf.host}:${config.chronograf.host}' with: ${err.messsage}`)
      }
    )
}

function getDashboards (config) {
  const url = `http://${config.chronograf.host}:${config.chronograf.port}/chronograf/v1/dashboards`
  const req = {url}
  return new Promise((resolve, reject) => {
    request.get(req, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          try {
            resolve(JSON.parse(body).dashboards)
          } catch (e) {
            reject(new Error(`Received an invalid response from Chronograf when requesting dashboards (could not parse).`))
          }
        } else {
          reject(new Error(`Attempt to fetch dashboards from Chronograf failed with status code '${response.statusCode}'`))
        }
      }
    })
  })
}

function getQueries (config, queries) {
  const queryMap = queries.reduce((map, query) => {
    if (typeof query === 'string') {
      const index = parseInt(path.basename(query))
      map[index - 1] = query
    }
    return map
  }, [])
  const filtered = queryMap.reduce((acc, item) => {
    if (item) {
      acc.push(item)
    }
    return acc
  }, [])
  return Promise.mapSeries(filtered, getQuery.bind(null, config))
}

function getQuery (config, query) {
  const url = `http://${config.chronograf.host}:${config.chronograf.port}/${query}`
  const req = {url}
  return new Promise((resolve, reject) => {
    request.get(req, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          try {
            const json = JSON.parse(body)
            json.id = parseInt(path.basename(query))
            json.url = query
            resolve(json)
          } catch (e) {
            reject(new Error(`Received an invalid response from Chronograf when requesting query (could not parse).`))
          }
        } else {
          reject(new Error(`Attempt to fetch query '${query}' from Chronograf failed with status code '${response.statusCode}'`))
        }
      }
    })
  })
}

function onDashboards (config, dashboards) {
  const dashboardMap = []
  const queries = dashboards.reduce((acc, dashboard) => {
    if (dashboard.cells && dashboard.cells.length > 0) {
      const cellQueries = dashboard.cells.reduce((queries, cell) => {
        if (cell.queries && cell.queries.length > 0) {
          queries = queries.concat(cell.queries)
        }
        return queries
      }, [])
      acc = acc.concat(cellQueries)
    }
    dashboardMap[dashboard.id] = dashboard
    return acc
  }, [])
  const list = dashboardMap.reduce((acc, dashboard) => {
    if (dashboard) {
      acc.push(dashboard)
    }
    return acc
  }, [])
  return getQueries(config, queries)
    .then(
      results => {
        return {
          dashboards: list,
          queries: results
        }
      }
    )
}

module.exports = function (config) {
  return {
    addAll: addAll.bind(null, config),
    getAll: getAll.bind(null, config)
  }
}
