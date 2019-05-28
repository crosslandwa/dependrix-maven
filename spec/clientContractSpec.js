const DependrixMaven = require('..')
const { validateModel } = require('dependrix-visualisation')

describe('dependrix-maven', () => {
  it('generates output that meets requirements of dependrix-visualisation schema', done => {
    /* eslint-disable */
    const tree1 = `
dependrix.maven:artifactA:war:1.0.0
+- dependrix.maven:a-dependency:jar:2.0.0:compile
|  \- dependrix.maven:a-transient-dependency:jar:3.0.0:compile
`
    const tree2 = `
dependrix.maven:artifactB:war:1.0.0
+- dependrix.maven:a-dependency:jar:2.1.0:compile
`
    /* eslint-enable */
    DependrixMaven([tree1, tree2].map(asFunctionThatReturnsPromise))
      .then(validateModel)
      .then(done, done.fail)
  })
})

function asFunctionThatReturnsPromise (content) {
  return () => Promise.resolve(content)
}
