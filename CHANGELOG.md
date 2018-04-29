# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.1.3"></a>
## [1.1.3](https://github.com/npm-wharf/k8s-tickbot/compare/v1.1.2...v1.1.3) (2018-04-29)


### Bug Fixes

* kapacitor api assumed task ids were numeric causing it to fail on alpha-numeric task ids ([9b327b8](https://github.com/npm-wharf/k8s-tickbot/commit/9b327b8))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/npm-wharf/k8s-tickbot/compare/v1.1.1...v1.1.2) (2018-03-12)


### Bug Fixes

* remove surrounding quotes from create database query ([7195118](https://github.com/npm-wharf/k8s-tickbot/commit/7195118))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/npm-wharf/k8s-tickbot/compare/v1.1.0...v1.1.1) (2018-03-12)


### Bug Fixes

* correct defect causing wrong arguments to get passed from command module to influx module resulting in invalid URL ([8a5b87c](https://github.com/npm-wharf/k8s-tickbot/commit/8a5b87c))



<a name="1.1.0"></a>
# 1.1.0 (2018-03-12)


### Bug Fixes

* add missing bin property to package.json ([8359cb3](https://github.com/npm-wharf/k8s-tickbot/commit/8359cb3))
* correct bad set of arguments passed to bucket upload from backup module ([59c85c2](https://github.com/npm-wharf/k8s-tickbot/commit/59c85c2))
* correct bug in influx module setup preventing create db command from working correctly ([f12f00d](https://github.com/npm-wharf/k8s-tickbot/commit/f12f00d))
* correct issue with tar creation causing full path to be included per file ([2069a7c](https://github.com/npm-wharf/k8s-tickbot/commit/2069a7c))
* support versions of chronograf API that nest querieis in dashboard definitions ([0a3a640](https://github.com/npm-wharf/k8s-tickbot/commit/0a3a640))


### Features

* add info level logging via bole ([27b58d8](https://github.com/npm-wharf/k8s-tickbot/commit/27b58d8))
