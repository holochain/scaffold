#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const prompt = require('prompt')

const Wizard = require('../lib/wizard').Wizard

class WizardRunner {
  constructor (editData) {
    this.wiz = new Wizard(editData)
    this.fieldIdx = 0
    prompt.message = ''
    prompt.delimiter = ''
    prompt.start()
  }

  run () {
    return new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
      this._run()
    })
  }

  // -- private -- //

  _run () {
    if (this.fieldIdx >= this.wiz.getFieldCount()) {
      this._resolve(this.wiz)
      return
    }

    let field = this.wiz.getField(this.fieldIdx)
    console.log()
    console.log('# ' + field.name + ' (' + field.jsonPath + ')')
    console.log('# ' + field.description)

    prompt.get({
      properties: {
        data: {
          message: '(' + JSON.stringify(field.value) + ') $ '
        }
      }
    }, (err, result) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      try {
        if (!result.data.length) {
          field.setValue(field.value)
        } else {
          field.setValue(result.data)
        }
        this.fieldIdx++
        this._run()
      } catch (e) {
        console.error(e.toString())
        this._run()
      }
    })
  }
}

// entry point
main()
function main () {
  try {
    let cliOptions = minimist(process.argv.slice(2), {
      string: [
        'edit', 'e'
      ],
      boolean: [
        'help', 'h'
      ],
      alias: {
        'help': 'h',
        'edit': 'e'
      }
    })

    if (cliOptions.help) {
      let cmd = path.basename(process.argv[0]) + ' ' +
        path.basename(process.argv[1])
      console.log()
      console.log(
        '`' + cmd + '` - generate a scaffold from scratch')
      console.log(
        '`' + cmd + ' -e old_scaffold.json` - update existing scaffold')
      console.log(
        '\nOptions:')
      console.log(
        '  --help      -h        : display this help')
      console.log(
        '  --edit=file -e=file   : loaded `file` will be used for values')
      process.exit(0)
    }

    let editData = {}
    if (cliOptions.edit) {
      editData = JSON.parse(fs.readFileSync(cliOptions.edit))
    }

    let runner = new WizardRunner(editData)
    runner.run().then((wiz) => {
      try {
        console.log('\nResults:')
        console.log(JSON.stringify(wiz.getJson(), null, '  '))
      } catch (e) {
        console.error(e)
        process.exit(1)
      }
    }, (err) => {
      console.error(err)
      process.exit(1)
    })
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
