'use strict'

const childProcess = require('child_process')

exports.exec = function exec (cb, cmd, args) {
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

