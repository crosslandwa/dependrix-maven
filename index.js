const apply = (x, f) => f(x)

const key = (groupId, artifactId, identifier) => identifier
  ? `${groupId}:${artifactId}:${identifier}`
  : `${groupId}:${artifactId}`

/**
 * Takes an array of functions.
 * Each returns a promise that resolves to the string output of a mvn dependency:tree command
 */
function DependrixMaven (providers) {
  return Promise.all(providers.map(provider => provider()))
    .then(rawTrees => rawTrees.map(parseDependencyTree))
    .then(parsed => parsed.reduce((acc, { artifact, dependencies }) => ({
      projects: Object.assign({}, acc.projects, projectModel(artifact, dependencies))
    }), { projects: {} }))
}

function parseDependencyTree (raw) {
  const [artifact, ...dependencies] = raw.split('\n')
    .map(line => apply(line.match(/([\w.:-]+$)+/), result => result ? result[1] : undefined))
    .filter(parsed => parsed)
    .map(parsed => parsed.split(':'))
    .map(parsed => {
      if (parsed.length > 5) {
        const [groupId, artifactId, type, identifier, version, scope] = parsed
        return { key: key(groupId, artifactId, identifier), version, scope, type }
      }
      const [groupId, artifactId, type, version, scope] = parsed
      return { key: key(groupId, artifactId), version, scope, type }
    })
  return { artifact, dependencies }
}

function projectModel (artifact, dependencies) {
  return {
    [artifact.key]: {
      version: artifact.version,
      dependencies: dependencies.map(dependency => ({
        id: dependency.key,
        version: dependency.version,
        scope: dependency.scope
      }))
    }
  }
}

module.exports = DependrixMaven
