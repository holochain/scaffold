#!/usr/bin/env node
'use strict'

/* Hand-rolled build for now, may want a util at some point.
 */

const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

// define our build steps
const BUILD_LIST = [
  // check our code style
  [exec, ['./node_modules/.bin/standard', [
    'build.js',
    'server.js',
    'lib/**/*.js',
    'bin/**/*.js',
    'test/**/*.js',
    'websrc/**/*.js'
  ]]],

  // compile all our i18n json string files into one js file
  [jsongen, ['locales', /^.+\.json$/i, 'gen/strings.js']],

  // compile all our json schema files into one js file
  [jsongen, ['schemas', /^.+\.json$/i, 'gen/schemas.js']],

  // compile all our field definitions into one js file
  [jsongen, ['fields', /^.+\.json$/i, 'gen/fields.js']],

  // -- hc_scaffold_wizard -- //

  // bundle everything up into one js file
  [exec, ['./node_modules/.bin/browserify', [
    '-s', 'hc_scaffold_wizard',
    '-o', 'dist/js/.hc_scaffold_wizard.js',
    '-e', 'lib/wizard.js']]],

  // transpile it all into es5 compatible
  [exec, ['./node_modules/.bin/babel', [
    '-o', 'dist/js/.hc_scaffold_wizard.es5.js',
    'dist/js/.hc_scaffold_wizard.js']]],

  // minify
  [exec, ['./node_modules/.bin/uglifyjs', [
    '-c', '-m',
    '-o', 'dist/js/hc_scaffold_wizard.js',
    'dist/js/.hc_scaffold_wizard.es5.js']]],

  // -- hc_scaffold_web -- //

  // bundle everything up into one js file
  [exec, ['./node_modules/.bin/browserify', [
    '-t', 'vueify',
    '-s', 'hc_scaffold_wizard',
    '-o', 'dist/js/.hc_scaffold_web.js',
    '-e', 'websrc/webmain.js']]],

  // transpile it all into es5 compatible
  [exec, ['./node_modules/.bin/babel', [
    '-o', 'dist/js/.hc_scaffold_web.es5.js',
    'dist/js/.hc_scaffold_web.js']]],

  // minify
  [exec, ['./node_modules/.bin/uglifyjs', [
    '-c', '-m',
    '-o', 'dist/js/hc_scaffold_web.js',
    'dist/js/.hc_scaffold_web.es5.js']]],

  // remove build mid-artifacts
  [rm, [
    'dist/js/.hc_scaffold_wizard.js',
    'dist/js/.hc_scaffold_wizard.es5.js',
    'dist/js/.hc_scaffold_web.js',
    'dist/js/.hc_scaffold_web.es5.js'
  ]],

  // run unit tests
  [exec, ['./node_modules/.bin/mocha', [
    'test/*.js']]]
]

// entry point
main()

/**
 * Execute build steps sequentially
 */
function main () {
  process.on('uncaughtException', function (err) {
    console.error(err)
    console.error('Build Failed.')
    process.exit(1)
  })

  let queue = BUILD_LIST.slice(0)
  let next = function next () {
    if (!queue.length) {
      console.log('Done.')
      process.exit(0)
    }
    let cmd = queue.shift()
    let args = cmd[1].slice(0)
    args.unshift(next)
    cmd[0].apply(this, args)
  }
  next()
}

/**
 * Execute a shell sub-process
 */
function exec (cb, cmd, args) {
  cmd = '"' + cmd + '"'
  console.log(cmd + ' ' + args.join(' '))
  let proc = childProcess.spawn(cmd, args, {
    shell: true
  })
  proc.stdout.on('data', function (data) {
    process.stdout.write(data)
  })
  proc.stderr.on('data', function (data) {
    process.stderr.write(data)
  })
  proc.on('close', function (code) {
    if (code === 0) {
      cb()
    } else {
      throw new Error('exec got exit ' + code)
    }
  })
}

/**
 * Remove/Delete/Unlink a list of files
 */
function rm (cb /* args */) {
  let args = [].slice.call(arguments, 0)
  cb = args.shift()
  for (let i = 0; i < args.length; ++i) {
    fs.unlinkSync(args[i])
  }
  cb()
}

/**
 * Lint, then concatonate a set of json files
 */
function jsongen (cb, dir, pattern, gen) {
  let i
  let files = fs.readdirSync(dir)
  let toCheck = []
  for (i = 0; i < files.length; ++i) {
    if (pattern.test(files[i])) {
      toCheck.push(path.join(dir, files[i]))
    }
  }

  let toInclude = toCheck.slice(0)
  let finalize = function finalize () {
    // bundle all the files into `gen`
    let data = {}
    for (i = 0; i < toInclude.length; ++i) {
      let file = toInclude[i]
      let langId = path.parse(file).name.toLowerCase()
      data[langId] = JSON.parse(fs.readFileSync(file))
    }
    data = "'use strict'\n" +
      'module.exports = exports = ' +
      JSON.stringify(data, null, '  ')
    console.log('generating ' + gen)
    fs.writeFileSync(gen, data)
    cb()
  }

  let checkNext = function checkNext () {
    if (!toCheck.length) {
      return finalize()
    }
    exec(checkNext, './node_modules/.bin/jsonlint', [
      '-c', '-q', toCheck.shift()])
  }
  checkNext()
}
