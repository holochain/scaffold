#!/usr/bin/env node

'use strict'

const Ajv = require('ajv')
const os = require('os')

let isWindows = false
// TODO - better heuristic to distinguish msys from windows cmd
if (os.platform() === 'win32' && (!('SHELL' in process.env))) {
  isWindows = true
}

const fs = require('fs')
const path = isWindows ? require('path').win32 : require('path').posix

const BUILD_LIST = [
  [schema, [
    'src/schemas/hc-scaffold-meta-schema.json',
    'src/schemas/json-meta-schema.json']],
  [schema, [
    'src/schemas/hc-scaffold-schema.json',
    'src/schemas/hc-scaffold-meta-schema.json']],
  [jsonPack, ['src/gen/strings.js', 'src/locales']],
  [jsonPack, ['src/gen/schemas.js', 'src/schemas']],
  [handlebars, ['src/gen/webtemplates.js', 'src/web/templates']],
  [browserify, ['dist/js/hc_scaffold_wizard.js', 'src/lib/wizard.js',
    'hc_scaffold_wizard', [
      'src/gen/schemas.js', 'src/gen/strings.js']]],
  [browserify, ['dist/js/hc_scaffold_web.js', 'src/web/webmain.js',
    'hc_scaffold_web', [
      'src/gen/webtemplates.js']]]
]

const ninjaFile = fs.openSync('build.ninja', 'w')

main()
function main () {
  fs.writeSync(ninjaFile, `rule handlebars
  command = ${path.normalize('node_modules/.bin/handlebars')} $
    --output $out $
    --commonjs handlebars/runtime $
    --extension html $
    --knownOnly $
    --min $
    $in

rule browserify
  command = ${path.normalize('node_modules/.bin/browserify')} $
    -s $s $
    -o $out $
    -e $in

rule babel
  command = ${path.normalize('node_modules/.bin/babel')} -o $out $in

rule uglify
  command = ${path.normalize('node_modules/.bin/uglifyjs')} $
    -c -m $
    -o $out $
    $in

rule jsonpack
  command = node ${path.normalize('build/json_pack.js')} $out $in`)

  const queue = BUILD_LIST.slice(0)
  const next = function next () {
    if (!queue.length) {
      fs.writeSync(ninjaFile, '\n')
      fs.closeSync(ninjaFile)

      console.log('wrote build.ninja')
      process.exit(0)
    }
    const step = queue.shift()
    const args = step[1].slice(0)
    args.unshift(next)
    step[0].apply(this, args)
  }
  next()
}

// -- helper functions -- //

function recFiles (dir, pattern) {
  let out = []
  let nodes = fs.readdirSync(dir)
  for (let node of nodes) {
    node = path.join(dir, node)
    if (fs.statSync(node).isDirectory()) {
      out = out.concat(recFiles(node, pattern))
    } else {
      if (pattern.test(node)) {
        out.push(node)
      }
    }
  }
  return out
}

function jsonPack (cb, gen, src) {
  const files = recFiles(src, /^.+\.json$/i)

  fs.writeSync(ninjaFile, `

build ${path.normalize(gen)}: jsonpack`)
  for (let i = 0; i < files.length; ++i) {
    fs.writeSync(ninjaFile, ` $
  ${path.normalize(files[i])}`)
  }

  cb()
}

function handlebars (cb, gen, src) {
  const files = recFiles(src, /^.+\.html$/i)

  fs.writeSync(ninjaFile, `

build ${path.normalize(gen)}: handlebars`)
  for (let i = 0; i < files.length; ++i) {
    fs.writeSync(ninjaFile, ` $
  ${path.normalize(files[i])}`)
  }

  cb()
}

function browserify (cb, gen, src, s, deps) {
  let files = recFiles(path.parse(src).dir, /^.+\.js$/i)
  files = files.concat(deps)

  let shortname = path.parse(gen).name

  fs.writeSync(ninjaFile, `

build .${shortname}.js: browserify ${path.normalize(src)} |`)
  for (let i = 0; i < files.length; ++i) {
    fs.writeSync(ninjaFile, ` $
    ${path.normalize(files[i])}`)
  }
  fs.writeSync(ninjaFile, `
  s = ${s}`)

  fs.writeSync(ninjaFile, `

build .${shortname}.es5.js: babel .${shortname}.js

build ${path.normalize(gen)}: uglify .${shortname}.es5.js`)

  cb()
}

/**
 * Validate a json file using a json schema file
 * Doesn't add a ninja rule... just does it right away
 */
function schema (cb, check, schema) {
  console.log('check "' +
    path.parse(check).name + '" against "' +
    path.parse(schema).name + '"')

  let ajv = new Ajv()
  let validator = ajv.compile(JSON.parse(fs.readFileSync(schema)))

  let data = JSON.parse(fs.readFileSync(check))
  if (!validator(data)) {
    throw new Error(ajv.errorsText(validator.errors))
  }

  cb()
}
