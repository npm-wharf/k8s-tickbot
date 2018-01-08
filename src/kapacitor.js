const request = require('request')
const Promise = require('bluebird')

function addTasks (config, tasks) {
  const list = tasks.tasks ? tasks.tasks : tasks
  return Promise.mapSeries(list, addTask.bind(null, config))
    .then(
      () => true
    )
}

function addTask (config, task) {
  const url = `http://${config.kapacitor.host}:${config.kapacitor.port}/kapacitor/v1/tasks`
  const req = {url, body: JSON.stringify(task)}
  return new Promise((resolve, reject) => {
    request.post(req, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(body)
        } else {
          reject(new Error(`Attempt to post Task '${task.id}' to Kapacitor failed with status code '${response.statusCode}'`))
        }
      }
    })
  })
}

function getTasks (config) {
  const url = `http://${config.kapacitor.host}:${config.kapacitor.port}/kapacitor/v1/tasks`
  const req = {url}
  return new Promise((resolve, reject) => {
    request.get(req, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          try {
            const list = JSON.parse(body).tasks
            const sorted = sortTasks(list)
            resolve({ tasks: sorted })
          } catch (e) {
            reject(new Error(`Received an invalid response from Kapacitor when requesting tasks (could not parse).`))
          }
        } else {
          reject(new Error(`Attempt to fetch tasks from Kapacitor failed with status code '${response.statusCode}'`))
        }
      }
    })
  })
}

function sortTasks (tasks) {
  const taskMap = tasks.reduce((acc, task) => {
    acc[task.id] = task
    return acc
  }, [])
  return taskMap.reduce((acc, task) => {
    if (task) {
      acc.push(task)
    }
    return acc
  }, [])
}

module.exports = function (config) {
  return {
    addTasks: addTasks.bind(null, config),
    getTasks: getTasks.bind(null, config)
  }
}
