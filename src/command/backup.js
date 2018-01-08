function handle (backup) {
  return backup.create()
}

module.exports = function (backup) {
  return {
    command: 'backup',
    desc: 'create a backup of resources in chronograf and kapacitor and store in configured object store',
    handler: handle.bind(null, backup)
  }
}
