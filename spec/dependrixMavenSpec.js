const DependrixMaven = require('..')
const { Readable } = require('stream')

describe('dependrix-maven', () => {
  it('reads content from the supplied array of streams', done => {
    DependrixMaven([
      asStream('abc'),
      asStream('def'),
      asStream('xyz')
    ])
      .then(readContent => {
        expect(readContent[0]).toEqual('abc')
        expect(readContent[1]).toEqual('def')
        expect(readContent[2]).toEqual('xyz')
      })
      .then(done, done.fail)
  })
})

function asStream (content) {
  const s = new Readable()
  s.push(content)
  s.push(null)
  return s
}
