#!/usr/bin/env node

'use strict'

const PORT = 18080

const path = require('path')
const express = require('express')
const opn = require('opn')

// entrypoint
main()

/**
 * Start up an express webserver
 * serve the docs folder
 * open a browser pointing to the server
 */
function main () {
  let app = express()

  app.use((req, res, next) => {
    res.header('Cache-Control',
      'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    next()
  })

  app.use(express.static(path.resolve(__dirname, '../docs')))

  app.listen(PORT, () => {
    console.log('server started at http://127.0.0.1:' + PORT)
    opn('http://127.0.0.1:' + PORT)
    // opn('http://127.0.0.1:' + PORT + '/test/test.html')
  })
}
