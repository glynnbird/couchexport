#!/usr/bin/env node
const { parseArgs } = require('node:util')
const couchexport = require('../index.js')
const syntax =
`
Parameters:

--url/-u           (COUCH_URL)           the URL of the CouchDB instance                     (required)
--database/--db/-d (COUCH_DATABASE)      CouchDB database name                               (required)
`
const URL = process.env.COUCH_URL ? process.env.COUCH_URL : undefined
const DATABASE = process.env.COUCH_DATABASE ? process.env.COUCH_DATABASE : undefined
const argv = process.argv.slice(2)
const options = {
  url: {
    type: 'string',
    short: 'u',
    default: URL
  },
  database: {
    type: 'string',
    short: 'd',
    default: DATABASE
  },
  db: {
    type: 'string',
    default: DATABASE
  },
  help: {
    type: 'boolean',
    short: 'h',
    default: false
  }
}

// parse command-line options
const { values } = parseArgs({ argv, options, allowPositionals: true })
if (values.db) {
  values.database = values.db
  delete values.db
}

// help mode
if (values.help) {
  console.log(syntax)
  process.exit(0)
}

const main = async () => {
  values.since = '0'
  values.deletions = false
  await couchexport(values)
}
main()
