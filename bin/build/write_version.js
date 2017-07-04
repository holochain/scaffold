#!/usr/bin/env node

'use strict'

const fs = require('fs')

const childProcess = require('child_process')
const packageJson = require('../../package')

/**
 */
function getShortHash () {
  return new Promise((resolve, reject) => {
    let proc = childProcess.spawn('"git"', [
      'rev-parse',
      '--short',
      'HEAD'
    ], {
      shell: true
    })
    let hash = ''
    proc.stdout.on('data', (data) => {
      hash += data.toString()
    })
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(hash.trim())
      } else {
        console.error('exiting with code', code)
        process.exit(code)
      }
    })
  })
}

// entrypoint
main()
function main () {
  getShortHash().then((hash) => {
    const data = JSON.stringify({
      version: packageJson.version + '+' + hash,
      url: packageJson.homepage
    }, null, '  ')
    fs.writeFileSync('src/gen/version.js',
      "'use strict'\n" +
      'module.exports = exports = ' + data)
  })
}
