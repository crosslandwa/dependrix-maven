const DependrixMaven = require('..')
const fs = require('fs')

describe('dependrix-maven', () => {
  it('analyses a maven dependency tree read in from a file by the client', done => {
    DependrixMaven([
      () => new Promise((resolve, reject) => fs.readFile(
        `${__dirname}/example-tree.txt`,
        (err, data) => err ? reject(err) : resolve(data.toString('utf-8'))
      ))
    ])
      .then(expectReturnedObjectToEqual({
        projects: {
          'com.chippanfire:max.msp.bucket': {
            version: '0.1.0',
            dependencies: [
              {
                id: 'org.testng:testng',
                version: '6.1.1',
                scope: 'test'
              },
              {
                id: 'junit:junit',
                version: '3.8.1',
                scope: 'test'
              },
              {
                id: 'org.beanshell:bsh',
                version: '2.0b4',
                scope: 'test'
              },
              {
                id: 'com.beust:jcommander',
                version: '1.12',
                scope: 'test'
              },
              {
                id: 'org.yaml:snakeyaml',
                version: '1.6',
                scope: 'test'
              }
            ]
          }
        }
      }))
      .then(done, done.fail)
  })
})

function expectReturnedObjectToEqual (expected) {
  return actual => expect(JSON.stringify(actual, null, 2)).toEqual(JSON.stringify(expected, null, 2))
}
