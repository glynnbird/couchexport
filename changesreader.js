const { pipeline } = require('node:stream/promises')
const { URL } = require('url')
const querystring = require('querystring')
const jsonpour = require('jsonpour')
const request = require('./request.js')
const changeProcessor = require('./changeProcessor.js')
const pkg = require('./package.json')
const h = {
  'user-agent': `${pkg.name}@${pkg.version}`,
  'content-type': 'application/json'
}

const changesreader = async (url, db, since, ws, deletions) => {
  // parse URL
  const parsed = new URL(url)
  const plainURL = parsed.origin
  if (parsed.username && parsed.password) {
    h.Authorization = 'Basic ' + Buffer.from(`${parsed.username}:${parsed.password}`).toString('base64')
  }

  // spool changes
  const opts = {
    method: 'get',
    headers: h
  }
  const qs = querystring.stringify({
    since,
    include_docs: true,
    seq_interval: 10000
  })
  opts.url = `${plainURL}/${db}/_changes?${qs}`
  const response = await request.requestStream(opts)
  await pipeline(
    response,
    jsonpour.parse('results.*.doc'),
    changeProcessor(deletions),
    ws)
}

module.exports = changesreader
