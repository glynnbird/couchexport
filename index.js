const changesreader = require('./changesreader.js')
const URL = require('url').URL

// start spooling and monitoring the changes feed
const couchexport = async (opts) => {
  let parsed
  // check URL is valid
  try {
    parsed = new URL(opts.url)
  } catch (e) {
    console.error('Invalid URL')
    process.exit(1)
  }
  if (!opts.database) {
    console.error('Missing database parameter')
    process.exit(2)
  }

  try {
    // spool changes
    await changesreader(opts.url, opts.database, opts.since, process.stdout, opts.deletions)
  } catch (e) {
    console.error('Failed to spool changes from CouchDB')
    console.error(e.toString())
    process.exit(3)
  }

  // die
  process.exit(0)
}

module.exports = couchexport
