const DependrixMaven = require('..')
const { Readable } = require('stream')

describe('dependrix-maven', () => {
  it('generates an artifact for each passed maven dependency tree, parsing the groupId, artifactId and version', done => {
    DependrixMaven([
      asStream('dependrix.maven:artifactA:war:1.0.0'),
      asStream('dependrix.maven:artifactB:war:1.0.0')
    ])
      .then(expectReturnedObjectToEqual({
        artifacts: {
          'dependrix.maven:artifactA': {
            groupId: 'dependrix.maven',
            artifactId: 'artifactA',
            version: '1.0.0',
            dependencies: {}
          },
          'dependrix.maven:artifactB': {
            groupId: 'dependrix.maven',
            artifactId: 'artifactB',
            version: '1.0.0',
            dependencies: {}
          }
        },
        dependencies: {}
      }))
      .then(done, done.fail)
  })
})

function asStream (content) {
  const s = new Readable()
  s.push(content)
  s.push(null)
  return s
}

function expectReturnedObjectToEqual (expected) {
  return actual => expect(JSON.stringify(actual, null, 2)).toEqual(JSON.stringify(expected, null, 2))
}
