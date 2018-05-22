#!/usr/bin/env node

'use strict'

/* Start up a webserver hosting the dist folder,
 * Run the tests (dist/test/test.html) through phantomjs
 * using build/phantom-runner.js
 */

const PORT = 18181

const path = require('path')
const express = require('express')

const exec = require('./build/exec-helper').exec

// the phantomjs node module just downloads a platform appropriate
// binary and then provides a path to it. (phantomjs.path)
const phantomjs = require('phantomjs-prebuilt')

// entrypoint
main()
function main () {
  let app = express()

  app.use((req, res, next) => {
    res.header('Cache-Control',
      'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    next()
  })

  app.use(express.static(path.resolve(__dirname, '../dist')))

  app.listen(PORT, () => {
    console.log('server started at http://127.0.0.1:' + PORT)

    exec(() => {
      // exec-helper will process.exit(code) if it is an error.
      // if we got here, then it was a success
      process.exit(0)
    }, phantomjs.path, [
      // '--debug=true',
      '--disk-cache=false',
      '--ignore-ssl-errors=true',
      '--local-url-access=true',
      '--local-to-remote-url-access=true',
      '--web-security=false',
      path.resolve('./bin/build/phantom-runner.js'),
      'http://127.0.0.1:' + PORT + '/test/test.html'
    ])
  })
}
