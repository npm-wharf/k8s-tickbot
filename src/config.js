module.exports = {
  basePath: process.env.BASE_PATH || process.cwd(),
  dataPath: process.env.DATA_PATH || 'data',
  influx: {
    host: process.env.INFLUX_HOST || 'localhost',
    port: process.env.INFLUX_PORT || '8086',
    username: process.env.INFLUX_USERNAME || null,
    password: process.env.INFLUX_PASSWORD || null
  },
  kapacitor: {
    host: process.env.KAPACITOR_HOST || 'localhost',
    port: process.env.KAPACITOR_PORT || '9092'
  },
  chronograf: {
    host: process.env.CHRONOGRAF_HOST || 'localhost',
    port: process.env.CHRONOGRAF_PORT || '8888'
  },
  storage: {
    bucket: process.env.OBJECT_STORE || 'metrics'
  }
}
