const apply = (x, f) => f(x)

const key = ({ groupId, artifactId, identifier }) => identifier
  ? `${groupId}:${artifactId}:${identifier}`
  : `${groupId}:${artifactId}`

/**
 * Takes an array of functions that return a promise that resolves to the string content of the output of a mvn dependency:tree command
 */
function DependrixMaven (providers) {
  return Promise.all(providers.map(provider => provider()))
    .then(rawTrees => rawTrees.map(parseDependencyTree))
    .then(dependencyTrees => dependencyTrees.reduce((acc, { artifact, dependencies }) => ({
      artifacts: Object.assign({}, acc.artifacts, artifactModel(artifact, dependencies)),
      dependencies: dependencies.reduce(toDependencyList, acc.dependencies)
    }), { artifacts: {}, dependencies: {} }))
}

function parseDependencyTree (raw) {
  const [artifact, ...dependencies] = raw.split('\n')
    .map(line => apply(line.match(/([\w.:-]+$)+/), result => result ? result[1] : undefined))
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

function artifactModel (artifact, dependencies) {
  return {
    [key(artifact)]: {
      groupId: artifact.groupId,
      artifactId: artifact.artifactId,
      version: artifact.version,
      dependencies: dependencies.reduce((d, dependency) => Object.assign(d, ({
        [key(dependency)]: { version: dependency.version, scope: dependency.scope }
      })), {})
    }
  }
}

function toDependencyList (existingDependencyLists, dependency) {
  return apply(
    key(dependency),
    key => Object.assign({}, existingDependencyLists, ({
      [key]: dependencyList(existingDependencyLists[key], dependency.version)
    }))
  )
}

const dependencyList = (existing = [], versionToAdd) => [...(new Set(existing.concat(versionToAdd)))]

module.exports = DependrixMaven
