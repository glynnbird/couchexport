const { pipeline } = require('node:stream/promises')
const { URL } = require('url')
const querystring = require('querystring')
const jsonpour = require('jsonpour')
const ccurllib = require('ccurllib')
const stream = require('stream')
const Readable = stream.Readable
const pkg = require('./package.json')
const h = {
  'user-agent': `${pkg.name}@${pkg.version}`,
  'content-type': 'application/json'
}
let firstTime = true
let keys = []

// output an array of values in a CSV-safe way
const output = (arr) => {
  const newArr = []
  for (let a of arr) {
    a = a.toString()
    a = a.replace(/"/g, '""')
    if (a.includes(',')) {
      a = '"' + a + '"'
    }
    newArr.push(a)
  }
  return newArr.join(',') + '\n'
}

// returns a stream transformer
const changeProcessor = function (deletions) {
  // create stream transformer
  const filter = new stream.Transform({ objectMode: true })

  // add _transform function
  filter._transform = function (obj, encoding, done) {
    // ignore deleted docs
    if (!deletions && obj._deleted) {
      return done()
    }

    // ignore design docs
    if (obj._id.startsWith('_design/')) {
      return done()
    }

    // scrub the rev token
    delete obj._rev

    if (firstTime) {
      keys = Object.keys(obj)
      firstTime = false
      this.push(output(Object.keys(obj)))
    }

    // create an array of values matching the keys we
    // found in the first document
    const values = []
    for (const k of keys) {
      values.push(obj[k] || '')
    }

    // turn object into a string
    this.push(output(values))
    done()
  }
  return filter
}

// streaming pipeline
const changesreader = async (url, db, since, ws, deletions) => {
  // spool changes
  const opts = {
    url: `${url}/${db}/_changes`,
    method: 'get',
    headers: h,
    qs: {
      since,
      include_docs: true,
      seq_interval: 10000
    }
  }
  const responseStream = await ccurllib.requestStream(opts)
  await pipeline(
    responseStream,
    jsonpour.parse('results.*.doc'),
    changeProcessor(deletions),
    ws)
}

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
