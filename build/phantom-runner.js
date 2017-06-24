'use strict'

// NOTE - don't use anything beyond es5 in this file...
// phantom is a little out of date

/* global phantom */

/**
 * global fail handler - exits with an error status
 */
function fail (err) {
  if (err instanceof Error) {
    if (err.stack) {
      err = err.toString() + '\n' + err.stack
    } else {
      err = err.toString()
    }
  } else if (typeof err === 'object') {
    err = JSON.stringify(err, null, '  ')
  } else {
    err = err.toString()
  }
  console.error('# ' + err.replace(/\n/g, '\n# '))
  phantom.exit(1)
}

try {
  var system = require('system')
  var webpage = require('webpage')

  if (system.args.length !== 2) {
    fail(new Error('url required'))
  }

  var page = webpage.create()

  var curIndex = 0
  var failCount = 0
  var suitePath = []

  /**
   * executed on either test success or test fail
   */
  var printResult = function printResult (test, good) {
    var out = ''
    for (var i = 0; i < suitePath.length; ++i) {
      if (!suitePath[i].trim().length) {
        continue
      }
      if (out.length) {
        out += ' '
      }
      out += suitePath[i].trim()
    }
    console.log(good ? 'ok' : 'not ok', ++curIndex, '-', out, test)
  }

  /**
   * This is executed from `window.callPhantom()` within the actual page.
   * We inject a mocha reporter, that makes callPhantom calls to this fn.
   */
  page.onCallback = function (data) {
    try {
      switch (data[0]) {
        case 'start':
          console.log('\n# phantom-runner, executing ' + system.args[1] + '\n')
          console.log('1..' + data[1])
          break
        case 'suite':
          suitePath.push(data[1])
          break
        case 'pass':
          printResult(data[1], true)
          break
        case 'fail':
          printResult(data[1], false)
          console.error('# ' + data[2].replace(/\n/g, '\n# '))
          failCount += 1
          break
        case 'suiteEnd':
          suitePath.pop()
          break
        case 'end':
          if (failCount > 0) {
            fail(new Error(failCount + ' failing tests'))
          } else {
            console.log('# ' + curIndex + ' successful tests')
            phantom.exit(0)
          }
          break
        default:
          fail(new Error('unrecognized callPhantom', data[0]))
          break
      }
    } catch (e) {
      fail(e)
    }
  }

  /**
   * console.log() from within the page comes here
   */
  page.onConsoleMessage = function (msg, line, src) {
    console.log('# console -', msg.replace(/\n/g, '\n# '))
  }

  /**
   * console.error() from within the page comes here
   * BAIL ON ANY ERRORS
   */
  page.onError = function (msg, trace) {
    fail({
      msg: msg,
      trace: trace
    })
  }

  /**
   * entrypoint
   */
  page.open(system.args[1], function (status) {
    if (status !== 'success') {
      fail({
        msg: 'open page fail',
        status: status
      })
    }
  })
} catch (e) {
  fail(e)
}
