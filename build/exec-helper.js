'use strict'

const path = require('path')
const childProcess = require('child_process')

/**
 * simple child-process helper
 */
exports.exec = function exec (cb, cmd, args, env) {
  let out = path.parse(cmd).base + ' ' + args.join(' ')
  if (out.length > 70) {
    let tmp = out.substr(0, 35) + '...' + out.substr(out.length - 35)
    out = tmp
  }
  console.log(out)
  let proc = childProcess.spawn('"' + cmd + '"', args, {
    shell: true,
    stdio: 'inherit',
    env: env || process.env
  })
  proc.on('close', function (code) {
    if (code === 0) {
      cb()
    } else {
      process.exit(code)
    }
  })
}
