function handle (backup) {
  return backup.restore()
}

module.exports = function (backup) {
  return {
    command: 'restore',
    desc: 'pull backup from configured object store and post resources to chronograf and kapacitor',
    handler: handle.bind(null, backup)
  }
}
