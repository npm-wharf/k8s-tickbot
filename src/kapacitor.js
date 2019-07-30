const fetch = require('node-fetch')

async function addTasks (config, tasks) {
  const list = tasks.tasks ? tasks.tasks : tasks

  for (const task of list) {
    await addTask(config, task)
  }
  return true
}

async function addTask (config, task) {
  const { id } = task
  const url = `http://${config.kapacitor.host}:${config.kapacitor.port}/kapacitor/v1/tasks`

  const getReq = await fetch(`${url}/${id}`)

  if (getReq.status === 404) {
    // new task
    const req = { body: JSON.stringify(task), method: 'POST' }
    const resp = await fetch(url, req)
    if (resp.status >= 400) {
      throw new Error(`Attempt to post Task '${task.id}' to Kapacitor failed with status code '${resp.status}'`)
    }
    return resp.json()
  } else if (getReq.status === 200) {
    // update task
    const req = { body: JSON.stringify(task), method: 'PATCH' }
    const resp = await fetch(`${url}/${id}`, req)
    if (resp.status >= 400) {
      throw new Error(`Attempt to patch Task '${task.id}' in Kapacitor failed with status code '${resp.status}'`)
    }
    return resp.json()
  } else {
    throw new Error(`unepxected status code reading ${url}/${id} from Kapacitor: ${getReq.status}`)
  }
}

async function getTasks (config) {
  const url = `http://${config.kapacitor.host}:${config.kapacitor.port}/kapacitor/v1/tasks`

  const response = await fetch(url)
  if (response.status >= 400) {
    throw new Error(`Attempt to fetch tasks from Kapacitor failed with status code '${response.status}'`)
  }
  const { tasks } = await response.json()
  const sorted = sortTasks(tasks)
  return { tasks: sorted }
}

function sortTasks (tasks) {
  return tasks.sort((a, b) => {
    const aIsNumber = Number.isInteger(a.id)
    const bIsNumber = Number.isInteger(b.id)
    const aComp = aIsNumber ? parseInt(a.id) : a.id
    const bComp = bIsNumber ? parseInt(b.id) : b.id
    if (
      (aIsNumber && bIsNumber) ||
      (!aIsNumber && !bIsNumber)
    ) {
      if (aComp === bComp) {
        return 0
      } else if (aComp > bComp) {
        return 1
      } else {
        return -1
      }
    } else if (aIsNumber) {
      return -1
    } else if (bIsNumber) {
      return 1
    }
  })
}

module.exports = function (config) {
  return {
    addTasks: addTasks.bind(null, config),
    getTasks: getTasks.bind(null, config)
  }
}
