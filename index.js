const { Writable } = require('stream')
const apply = (f, x) => f(x)

function DependrixMaven (streams) {
  return Promise.all(streams.map(readStream))
    .then(rawTrees => rawTrees.map(parseDependencyTree))
    .then(dependencyTrees => dependencyTrees.reduce(
      (acc, dependencyTree) => ({
        artifacts: Object.assign(acc.artifacts, {
          [`${dependencyTree.artifact.groupId}:${dependencyTree.artifact.artifactId}`]: {
            groupId: dependencyTree.artifact.groupId,
            artifactId: dependencyTree.artifact.artifactId,
            version: dependencyTree.artifact.version,
            dependencies: {}
          }
        }),
        dependencies: {}
      }),
      { artifacts: {}, dependencies: {} }
    ))
}

function readStream (stream) {
  return new Promise((resolve, reject) => {
    let content
    const outStream = new Writable({
      write (chunk) {
        content = chunk.toString('utf8')
      }
    })
    stream.on('end', () => resolve(content))
    stream.pipe(outStream)
  })
}

function parseDependencyTree (raw) {
  const [artifact, ...dependencies] = raw.split('\n')
    .map(line => apply(result => result ? result[1] : undefined, line.match(/([\w.:-]+$)+/)))
    .filter(parsed => parsed)
    .map(parsed => parsed.split(':'))
    .map(parsed => {
      if (parsed.length > 5) {
        const [groupId, artifactId, type, identifier, version, scope] = parsed
        return { groupId, artifactId, version, scope, type, identifier }
      }
      const [groupId, artifactId, type, version, scope] = parsed
      return { groupId, artifactId, version, scope, type, identifier: '' }
    })
  return { artifact, dependencies }
}

module.exports = DependrixMaven
