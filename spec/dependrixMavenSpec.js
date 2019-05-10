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

  it('parses every dependency of the artifact', done => {
    DependrixMaven([
      asStream('dependrix.maven:artifactA:war:1.0.0\n+- dependrix.maven:a-dependency:jar:2.0.0:compile\n|  \- dependrix.maven:a-transient-dependency:jar:3.0.0:compile')
    ])
      .then(expectReturnedObjectToEqual({
        artifacts: {
          'dependrix.maven:artifactA': {
            groupId: 'dependrix.maven',
            artifactId: 'artifactA',
            version: '1.0.0',
            dependencies: {
              'dependrix.maven:a-dependency': {
                version: '2.0.0',
                scope: 'compile'
              },
              'dependrix.maven:a-transient-dependency': {
                version: '3.0.0',
                scope: 'compile'
              }
            }
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
