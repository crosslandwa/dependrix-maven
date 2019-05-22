const DependrixMaven = require('..')

describe('dependrix-maven', () => {
  it('generates an artifact for each passed maven dependency tree, parsing the groupId, artifactId and version', done => {
    DependrixMaven([
      asFunctionThatReturnsPromise('dependrix.maven:artifactA:war:1.0.0'),
      asFunctionThatReturnsPromise('dependrix.maven:artifactB:war:1.0.0')
    ])
      .then(expectReturnedObjectToEqual({
        projects: {
          'dependrix.maven:artifactA': {
            version: '1.0.0',
            dependencies: []
          },
          'dependrix.maven:artifactB': {
            version: '1.0.0',
            dependencies: []
          }
        }
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

    DependrixMaven([asFunctionThatReturnsPromise(tree)])
      .then(returned => expect(Object.keys(returned.projects).length).toEqual(1))
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
    DependrixMaven([asFunctionThatReturnsPromise(tree)])
      .then(expectReturnedObjectToEqual({
        projects: {
          'dependrix.maven:artifactA': {
            version: '1.0.0',
            dependencies: [
              {
                id: 'dependrix.maven:a-dependency',
                version: '2.0.0',
                scope: 'compile'
              },
              {
                id: 'dependrix.maven:a-transient-dependency',
                version: '3.0.0',
                scope: 'compile'
              }
            ]
          }
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
dependrix.maven:artifactB:war:1.0.0
+- dependrix.maven:a-dependency:jar:2.1.0:compile
`
    /* eslint-enable */
    DependrixMaven([tree1, tree2].map(asFunctionThatReturnsPromise))
      .then(expectReturnedObjectToEqual({
        projects: {
          'dependrix.maven:artifactA': {
            version: '1.0.0',
            dependencies: [
              {
                id: 'dependrix.maven:a-dependency',
                version: '2.0.0',
                scope: 'compile'
              }
            ]
          },
          'dependrix.maven:artifactB': {
            version: '1.0.0',
            dependencies: [
              {
                id: 'dependrix.maven:a-dependency',
                version: '2.1.0',
                scope: 'compile'
              }
            ]
          }
        }
      }))
      .then(done, done.fail)
  })

  it('includes the identifier if it exists in the ID of each dependency', done => {
    /* eslint-disable */
    const tree = `
dependrix.maven:top-level-artifact:war:1.0.0
+- dependrix.maven:dependency-a:jar:with-identifier:2.0.0:compile
+- dependrix.maven:dependency-b:jar:3.0.0:compile
`
    /* eslint-enable */
    DependrixMaven([asFunctionThatReturnsPromise(tree)])
      .then(expectReturnedObjectToEqual({
        projects: {
          'dependrix.maven:top-level-artifact': {
            version: '1.0.0',
            dependencies: [
              {
                id: 'dependrix.maven:dependency-a:with-identifier',
                version: '2.0.0',
                scope: 'compile'
              },
              {
                id: 'dependrix.maven:dependency-b',
                version: '3.0.0',
                scope: 'compile'
              }
            ]
          }
        }
      }))
      .then(done, done.fail)
  })
})

function asFunctionThatReturnsPromise (content) {
  return () => Promise.resolve(content)
}

function expectReturnedObjectToEqual (expected) {
  return actual => expect(JSON.stringify(actual, null, 2)).toEqual(JSON.stringify(expected, null, 2))
}
