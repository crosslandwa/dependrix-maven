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

  it('is tolerant of empty lines when parsing a dependency tree', done => {
    /* eslint-disable */
    const tree = `


dependrix.maven:artifactA:war:1.0.0
+- dependrix.maven:a-dependency:jar:2.0.0:compile
|  \- dependrix.maven:a-transient-dependency:jar:3.0.0:compile


`
    /* eslint-enable */

    DependrixMaven([asStream(tree)])
      .then(returned => expect(Object.keys(returned.artifacts).length).toEqual(1))
      .then(done, done.fail)
  })

  it('parses every dependency of the artifact', done => {
    /* eslint-disable */
    const tree = `
dependrix.maven:artifactA:war:1.0.0
+- dependrix.maven:a-dependency:jar:2.0.0:compile
|  \- dependrix.maven:a-transient-dependency:jar:3.0.0:compile
`
    /* eslint-enable */
    DependrixMaven([asStream(tree)])
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
        dependencies: {
          'dependrix.maven:a-dependency': [ '2.0.0' ],
          'dependrix.maven:a-transient-dependency': [ '3.0.0' ]
        }
      }))
      .then(done, done.fail)
  })

  it('records where two artifacts are dependent on different versions of the same dependency', done => {
    /* eslint-disable */
    const tree1 = `
dependrix.maven:artifactA:war:1.0.0
+- dependrix.maven:a-dependency:jar:2.0.0:compile
`
    const tree2 = `
dependrix.maven:artifactA:war:1.0.0
+- dependrix.maven:a-dependency:jar:2.1.0:compile
`
    /* eslint-enable */
    DependrixMaven([tree1, tree2].map(asStream))
      .then(returned => returned.dependencies)
      .then(expectReturnedObjectToEqual({
        'dependrix.maven:a-dependency': [ '2.0.0', '2.1.0' ]
      }))
      .then(done, done.fail)
  })

  it('includes the identifier if it exists in the dependencies', done => {
    /* eslint-disable */
    const tree = `
dependrix.maven:top-level-artifact:war:1.0.0
+- dependrix.maven:dependency-a:jar:with-identifier:2.0.0:compile
+- dependrix.maven:dependency-b:jar:3.0.0:compile
`
    /* eslint-enable */
    DependrixMaven([asStream(tree)])
      .then(expectReturnedObjectToEqual({
        artifacts: {
          'dependrix.maven:top-level-artifact': {
            groupId: 'dependrix.maven',
            artifactId: 'top-level-artifact',
            version: '1.0.0',
            dependencies: {
              'dependrix.maven:dependency-a:with-identifier': {
                version: '2.0.0',
                scope: 'compile'
              },
              'dependrix.maven:dependency-b': {
                version: '3.0.0',
                scope: 'compile'
              }
            }
          }
        },
        dependencies: {
          'dependrix.maven:dependency-a:with-identifier': [ '2.0.0' ],
          'dependrix.maven:dependency-b': [ '3.0.0' ]
        }
      }))
      .then(done, done.fail)
  })

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
