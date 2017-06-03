#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const prompt = require('prompt')
const table = require('easy-table')

const Wizard = require('../src/lib/wizard').Wizard

const __ = require('../src/lib/hc_i18n').getText

class WizardRunner {
  constructor (editData) {
    this.wiz = new Wizard(editData)
    prompt.message = ''
    prompt.delimiter = ''
    prompt.start()
  }

  run () {
    return new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject

      this._pageIndex = -1

      this._run()
    })
  }

  // -- private -- //

  _run () {
    let state = this.wiz.getCurrentState()
    if (this._pageIndex !== state.pageIndex) {
      this._pageIndex = state.pageIndex
      this._fieldIndex = 0
    }
    this._pages = state.pages

    let field = this._pages[this._pageIndex].fields[this._fieldIndex]

    this._prompt(field)
  }

  _advance () {
    this._fieldIndex += 1
    if (this._fieldIndex >= this._pages[this._pageIndex].fields.length) {
      console.error('next page ops')
      process.exit(1)
    } else {
      this._run()
    }
  }

  _printFieldInfo (field) {
    console.log()
    console.log('# ' + field.def.getTrName() +
      ' (' + field.def.getJsonPath() + ')')
    console.log('# ' + field.def.getTrDescription())
  }

  _prompt (field) {
    this._printFieldInfo(field)

    switch (field.def.getHcHintType()) {
      case 'table':
        this._tablePrompt(field)
        break
      default:
        this._defaultPrompt(field)
        break
    }
  }

  _defaultPrompt (field) {
    console.log('# (' + JSON.stringify(field.def.getValue()) + ')')
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
          field.ops.set.cb(field.def.getValue())
        } else {
          field.ops.set.cb(result.data)
        }
        this._advance()
      } catch (e) {
        console.error(e.toString())
        this._run()
      }
    })
  }

  _printTableInfo (field) {
    let rawValue = field.def.getValue()
    let data = []
    for (let r = 0; r < rawValue.length; ++r) {
      let row = rawValue[r]
      let rowVal = {}
      rowVal[__('ui-row-index')] = r
      for (let c = 0; c < field.def.children.length; ++c) {
        let col = field.def.children[c]
        rowVal[col.getTrName()] = row[col.path]
      }
      data.push(rowVal)
    }

    console.log()
    console.log(table.print(data))
  }

  _editTableIndex (field, idx) {
    let subFieldIdx = 0

    let setField = () => {
      if (subFieldIdx >= field.subFields[idx].length) {
        return this._run()
      }
      let subField = field.subFields[idx][subFieldIdx]

      console.log()
      console.log('# ' + subField.def.getTrName() +
        ' (' + subField.def.getJsonPath() + ')')
      console.log('# ' + subField.def.getTrDescription())
      console.log('# (' + JSON.stringify(subField.def.getValue()) + ')')
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
            subField.ops.set.cb(subField.def.getValue())
          } else {
            subField.ops.set.cb(result.data)
          }
          subFieldIdx++
          setField()
        } catch (e) {
          console.error(e.stack)
          setField()
        }
      })
    }
    setField()
  }

  _selectTableIndex (idx) {
    this._printFieldInfo()
    this._printTableInfo()

    console.log(__('ui-action-row-number') + ' ' + idx)
    console.log('(' +
      'e - ' + __('ui-action-row-edit') + ' | ' +
      'd - ' + __('ui-action-row-delete') + ' | ' +
      'c - ' + __('ui-action-cancel') + ')')

    prompt.get({
      properties: {
        data: {
          message: '(e|d|c)'
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
          let value = JSON.parse(JSON.stringify(this.fieldDef.getValue()))
          if (cmd[0][0] === 'e') {
            return this._editTableIndex(idx)
          } else if (cmd[0][0] === 'd') {
            value.splice(idx, 1)
            this.fieldDef.setValue(value)
          }
        }
        this._run()
      } catch (e) {
        console.error(e.toString())
        this._run()
      }
    })
  }

  _tablePrompt (field) {
    this._printTableInfo(field)

    console.log('(' +
      '[#] - ' + __('ui-action-row-number') + ' | ' +
      'a - ' + __('ui-action-row-add') + ' | ' +
      'f - ' + __('ui-action-finish') + ')')

    prompt.get({
      properties: {
        data: {
          message: '([#]|a|f) >>>'
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
          let value = JSON.parse(JSON.stringify(field.def.getValue()))
          if (parseInt(cmd[0]).toString() === cmd[0]) {
            let idx = parseInt(cmd[0])
            if (idx < 0 || idx >= value.length) {
              throw new Error('index out of range')
            }
            return this._selectTableIndex(idx)
          } else if (cmd[0][0] === 'a') {
            field.ops.add.cb()
            return this._editTableIndex(field, value.length - 1)
          } else if (cmd[0][0] === 'f') {
            return this._advance()
          } else {
            throw new Error('invalid input')
          }
        }
        this._run()
      } catch (e) {
        console.error(e.stack)
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
