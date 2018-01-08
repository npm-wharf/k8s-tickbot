# k8s-tickbot

A CLI intended for use in Kubernetes jobs to help with administrative tasks related to the TICK stack.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

## Environment

Endpoints and connection configuration are set via environment variables:

 * `INFLUX_HOST` - the DNS name (not full URL)
 * `INFLUX_PORT` - defaults to `8086`
 * `INFLUX_USERNAME` - blank if no auth required
 * `INFLUX_PASSWORD` - blank if no auth required

 * `KAPACITOR_HOST` - the DNS name (not full URL)
 * `KAPACITOR_PORT` - defaults to `9092`

 * `CHRONOGRAF_HOST` - the DNS name (not full URL)
 * `CHRONOGRAF_PORT` - defaults to `8888`

 * `OBJECT_STORE` - the object store where tasks and grafs are stored and retrieved from, defaults to `metrics`
 
 * BASE_PATH - defaults to the processes' path
 * DATA_PATH - a subfolder off the base path, defaults to `data`

AWS:

 * `AWS_ACCESS_KEY_ID`
 * `AWS_SECRET_ACCESS_KEY`

GS:

 * `GS_PROJECT_ID`
 * `GS_USER_ID`
 * `GS_USER_KEY`

## CLI

### `create db [name]`

Creates a database in Influx.

Optional Arguments:

 * `--duration [duration]`
 * `--replication [replicationFactor]`
 * `--shard [shardDuration]`
 * `--policy [policyName]`

### `backup`

 * pulls down all graf and task definitions
 * zips them into a tarball
 * uploads them to the object store

### `restore`

 * pulls down tarball from object store
 * decompresses the tarball
 * makes POST calls for each graf and task definition

[travis-url]: https://travis-ci.org/npm-wharf/k8s-tickbot
[travis-image]: https://travis-ci.org/npm-wharf/k8s-tickbot.svg?branch=master
[coveralls-url]: https://coveralls.io/github/npm-wharf/k8s-tickbot?branch=master
[coveralls-image]: https://coveralls.io/repos/github/npm-wharf/k8s-tickbot/badge.svg?branch=master
