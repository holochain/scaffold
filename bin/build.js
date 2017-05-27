#!/usr/bin/env node

'use strict'

// const os = require('os')
const fs = require('fs')
const path = require('path')

const BUILD_LIST = [
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
  command = node_modules/.bin/handlebars $
    --output $out $
    --commonjs handlebars/runtime $
    --extension html $
    --knownOnly $
    --min $
    $in

rule browserify
  command = node_modules/.bin/browserify $
    -s $s $
    -o $out $
    -e $in

rule babel
  command = node_modules/.bin/babel -o $out $in

rule uglify
  command = node_modules/.bin/uglifyjs $
    -c -m $
    -o $out $
    $in

rule jsonpack
  command = node ${'build/json_pack.js'} $out $in`)

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

build ${gen}: jsonpack`)
  for (let i = 0; i < files.length; ++i) {
    fs.writeSync(ninjaFile, ` $
  ${files[i]}`)
  }

  cb()
}

function handlebars (cb, gen, src) {
  const files = recFiles(src, /^.+\.html$/i)

  fs.writeSync(ninjaFile, `

build ${gen}: handlebars`)
  for (let i = 0; i < files.length; ++i) {
    fs.writeSync(ninjaFile, ` $
  ${files[i]}`)
  }

  cb()
}

function browserify (cb, gen, src, s, deps) {
  let files = recFiles(path.parse(src).dir, /^.+\.js$/i)
  files = files.concat(deps)

  let shortname = path.parse(gen).name

  fs.writeSync(ninjaFile, `

build .${shortname}.js: browserify ${src} |`)
  for (let i = 0; i < files.length; ++i) {
    fs.writeSync(ninjaFile, ` $
    ${files[i]}`)
  }
  fs.writeSync(ninjaFile, `
  s = ${s}`)

  fs.writeSync(ninjaFile, `

build .${shortname}.es5.js: babel .${shortname}.js

build ${gen}: uglify .${shortname}.es5.js`)

  cb()
}
