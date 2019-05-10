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
        artifacts: {
          'com.chippanfire:max.msp.bucket': {
            version: '0.1.0',
            dependencies: {
              'org.testng:testng': {
                version: '6.1.1',
                scope: 'test'
              },
              'junit:junit': {
                version: '3.8.1',
                scope: 'test'
              },
              'org.beanshell:bsh': {
                version: '2.0b4',
                scope: 'test'
              },
              'com.beust:jcommander': {
                version: '1.12',
                scope: 'test'
              },
              'org.yaml:snakeyaml': {
                version: '1.6',
                scope: 'test'
              }
            }
          }
        },
        dependencies: {
          'org.testng:testng': [ '6.1.1' ],
          'junit:junit': [ '3.8.1' ],
          'org.beanshell:bsh': [ '2.0b4' ],
          'com.beust:jcommander': [ '1.12' ],
          'org.yaml:snakeyaml': [ '1.6' ]
        }
      }))
      .then(done, done.fail)
  })
})

function expectReturnedObjectToEqual (expected) {
  return actual => expect(JSON.stringify(actual, null, 2)).toEqual(JSON.stringify(expected, null, 2))
}
