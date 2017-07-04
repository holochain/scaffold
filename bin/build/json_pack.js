#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

const exec = require('./exec-helper').exec

/**
 * execute json lint on input files
 */
function dolint (inputs, done) {
  inputs = inputs.slice(0)
  const next = () => {
    if (!inputs.length) {
      done()
      return
    }
    exec(next, './node_modules/.bin/jsonlint', [
      '-c', '-q', inputs.shift()])
  }
  next()
}

/**
 * pack up json files into one javascript file
 */
function dopack (output, inputs) {
  output = path.normalize(output)

  const data = {}
  for (let file of inputs) {
    const name = path.parse(file).name.toLowerCase()
    data[name] = JSON.parse(fs.readFileSync(path.normalize(file)))
  }

  const fout = fs.openSync(output, 'w')
  fs.writeSync(fout, `'use strict'
module.exports = exports = ${JSON.stringify(data, null, '  ')}`)
  fs.closeSync(fout)
  let stat = fs.statSync(output)
  console.log('Generated ' + output + ' = ' + stat.size + ' bytes')
}

const inputs = process.argv.slice(2)
const output = inputs.shift()

// entrypoint
dolint(inputs, () => {
  dopack(output, inputs)
})
