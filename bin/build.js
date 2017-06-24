#!/usr/bin/env node

'use strict'

const os = require('os')

let isWindows = false
// TODO - better heuristic to distinguish msys from windows cmd
if (os.platform() === 'win32' && (!('SHELL' in process.env))) {
  isWindows = true
}

const fs = require('fs')
const path = isWindows ? require('path').win32 : require('path').posix

// build system will execute these functions passing the second idx as params
const BUILD_LIST = [
  [writeVersion, ['quick/gen/version.js']],
  [jsonPack, ['quick/gen/strings.js', 'quick/locale']],
  [handlebars, ['quick/gen/templates.js', 'quick/templates']],
  [browserify, ['dist/js/hc-scaffold-quick-start.js', 'quick/quick-main.js',
    'hc_scaffold_quick_start', [
      'lib/hc-i18n.js',
      'quick/gen/templates.js',
      'quick/gen/strings.js',
      'quick/gen/version.js'
    ]
  ]],
  [browserify, ['dist/test/test.js', 'test/test-main.js',
    'hc_scaffold_quick_start_test', [
      'lib/hc-i18n.js',
      'quick/gen/strings.js'
    ]
  ]]
]

// cross-platform help
const shell = isWindows ? 'cmd /C ' : ''
const ninjaFile = fs.openSync('build.ninja', 'w')

// entrypoint
main()
function main () {
  // the rules can just be blobbed out all at once
  fs.writeSync(ninjaFile, `# AUTO GENERATED ninja.build for hc-scaffold
# see bin/build.js

rule writeversion
  command = node ${path.normalize('build/write_version.js')}

rule handlebars
  command = ${shell}${path.normalize('node_modules/.bin/handlebars')} $
    --output $out $
    --commonjs "handlebars/runtime" $
    --extension html $
    --min $
    $in

rule browserify
  command = ${shell}${path.normalize('node_modules/.bin/browserify')} $
    -s $s $
    -o $out $
    -e $in

rule babel
  command = ${shell}${path.normalize('node_modules/.bin/babel')} -o $out $in

rule uglify
  command = ${shell}${path.normalize('node_modules/.bin/uglifyjs')} $
    -c -m $
    -o $out $
    $in

rule jsonpack
  command = node ${path.normalize('build/json_pack.js')} $out $in`)

  // iterate through the BUILD_LIST executing sub functions
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

/**
 * recurse through a directory, finding all files matching `pattern`
 */
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

/**
 * run the version generator
 */
function writeVersion (cb, gen) {
  fs.writeSync(ninjaFile, `

build ${path.normalize(gen)}: writeversion package.json`)

  cb()
}

/**
 * run json lint on a directory of json files,
 * then parse them and re-render them into a single javascript file.
 */
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

/**
 * compile all template files from a directory into a single javascript file.
 */
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

/**
 * browserify -> babel es5 -> minify
 */
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
