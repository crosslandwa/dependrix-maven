const { Writable } = require('stream')

function DependrixMaven (streams) {
  return Promise.all(streams.map(
    stream => new Promise((resolve, reject) => {
      let content
      const outStream = new Writable({
        write (chunk) {
          content = chunk.toString('utf8')
        }
      })
      stream.pipe(outStream)
      stream.on('end', () => resolve(content))
    })
  ))
}

module.exports = DependrixMaven
