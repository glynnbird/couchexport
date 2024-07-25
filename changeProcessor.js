const stream = require('stream')
let firstTime = true
let keys = []

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
module.exports = function (deletions) {
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
