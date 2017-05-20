#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const prompt = require('prompt')
const table = require('easy-table')

const Wizard = require('../lib/wizard').Wizard

const __ = require('../lib/hc_i18n').getText

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
      this.fieldDef = this.wiz.getNextFieldDef()
      this._run()
    })
  }

  // -- private -- //

  _run () {
    if (!this.fieldDef) {
      this._resolve(this.wiz)
      return
    }

    this._prompt()
  }

  _prompt () {
    console.log()
    console.log('# ' + this.fieldDef.getTrName() +
      ' (' + this.fieldDef.getJsonPath() + ')')
    console.log('# ' + this.fieldDef.getTrDescription())

    switch (this.fieldDef.getHcHintType()) {
      case 'table':
        this._tablePrompt()
        break
      default:
        this._defaultPrompt()
        break
    }
  }

  _defaultPrompt () {
    console.log('# (' + JSON.stringify(this.fieldDef.getValue()) + ')')
    prompt.get({
      properties: {
        data: {
          message: '>>>'
        }
      }
    }, (err, result) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      try {
        if (!result.data.length) {
          this.fieldDef.setValue(this.fieldDef.getValue())
        } else {
          this.fieldDef.setValue(result.data)
        }
        this.fieldDef = this.wiz.getNextFieldDef()
        this._run()
      } catch (e) {
        console.error(e.toString())
        this._run()
      }
    })
  }

  _tablePrompt () {
    let rawValue = this.fieldDef.getValue()
    let data = []
    for (let r = 0; r < rawValue.length; ++r) {
      let row = rawValue[r]
      let rowVal = {}
      rowVal[__('ui-row-index')] = r
      for (let c = 0; c < this.fieldDef.children.length; ++c) {
        let col = this.fieldDef.children[c]
        rowVal[col.getTrName()] = row[col.path]
      }
      data.push(rowVal)
    }

    console.log()
    console.log(table.print(data))

    prompt.get({
      properties: {
        data: {
          message: '(delete [idx] | addrow | finish) >>>'
        }
      }
    }, (err, result) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      try {
        if (!result.data.length) {
          throw new Error('invalid input')
        } else {
          let cmd = result.data.toLowerCase().split(' ')
          let value = this.fieldDef.getValue()
          if (cmd[0][0] === 'd') {
            let idx = (cmd[1]) | 0
            if (idx < 0 || idx > value.length) {
              throw new Error('index out of range')
            }
            console.log(idx, value)
            value.splice(idx, 1)
            console.log(value)
            this.fieldDef.setValue(value)
          } else if (cmd[0][0] === 'a') {
            value.push({name: 'a' + value.length.toString()})
            this.fieldDef.setValue(value)
          } else if (cmd[0][0] === 'f') {
            this.fieldDef = this.wiz.getNextFieldDef()
          } else {
            throw new Error('invalid input')
          }
        }
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
