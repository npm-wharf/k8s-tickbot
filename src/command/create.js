function build () {
  return {
    duration: {
      alias: 'd',
      description: 'Duration to retain metrics for the database'
    },
    policy: {
      alias: 'p',
      description: 'The name to give the retention policy'
    },
    replication: {
      alias: 'r',
      description: 'How many copies of the data to keep'
    },
    shard: {
      alias: 's',
      description: 'The number of shards to create'
    }
  }
}

function handle (influx, argv) {
  return influx.create(argv)
}

module.exports = function (config, influx) {
  return {
    command: 'create db <database> [options]',
    desc: 'creates the Influx database with the optional arguments provided',
    builder: build(config),
    handler: handle.bind(null, influx)
  }
}
