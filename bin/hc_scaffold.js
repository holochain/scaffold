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

  _updateState () {
    let state = this.wiz.getCurrentState()
    if (this._pageIndex !== state.pageIndex) {
      console.log('RUN PAGE', state.pageIndex)
      this._pageIndex = state.pageIndex
      this._fieldIndex = 0
    }
    this._pages = state.pages

    if (this._pageIndex >= this._pages.length) {
      return null
    }

    return this._pages[this._pageIndex].fields[this._fieldIndex]
  }

  _run () {
    let field = this._updateState()

    if (this._pageIndex >= this._pages.length) {
      this._resolve()
      return
    }

    let pageType = this._pages[this._pageIndex].type

    if (pageType === 'loopControl') {
      this._promptLoopControl(this._pages[this._pageIndex])
    } else {
      this._prompt(field)
    }
  }

  _advance () {
    this._fieldIndex += 1
    if (this._fieldIndex >= this._pages[this._pageIndex].fields.length) {
      this._pages[this._pageIndex].ops.next.cb()
    }
    this._run()
  }

  _printFieldInfo (field) {
    console.log()
    console.log('# ' + field.def.getTrName() +
      ' (' + field.def.getJsonPath() + ')')
    console.log('# ' + field.def.getTrDescription())
  }

  _promptLoopControl (page) {
    console.log()
    console.log('# ' + page.ref.getTrName() +
      ' (' + page.ref.getJsonPath() + ')')
    console.log('# ' + page.ref.getTrDescription())
    console.log()
    console.log('# Current ' + page.ref.getTrName())
    /* let value = page.ref.getValue()
    for (let sub of page.ref.children) {
      console.log('# - ' + sub.children[
    } */
    console.log()
    console.log('(' +
      'a - Add an Entry | ' +
      'f - Finish with ' + page.ref.getTrName() + ' )')

    this._getInput('(a|f)').then((result) => {
      try {
        if (!result.length) {
          throw new Error('invalid input')
        } else {
          let cmd = result.toLowerCase().split(' ')
          if (cmd[0][0] === 'a') {
            page.ops.add.cb()
            this._run()
          } else if (cmd[0][0] === 'f') {
            this._advance()
            return
          }
        }
      } catch (e) {
        console.error(e.stack)
        this._run()
      }
    })
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

  _getInput (message) {
    if (!message) {
      message = ''
    }
    if (message.length) {
      message += ' '
    }
    message += '>>>'
    return new Promise((resolve, reject) => {
      prompt.get({
        properties: {
          data: {
            message: message
          }
        }
      }, (err, result) => {
        if (err) {
          console.error(err)
          process.exit(1)
        }
        resolve(result.data)
      })
    })
  }

  _defaultPrompt (field) {
    console.log('# (' + JSON.stringify(field.def.getValue()) + ')')
    this._getInput().then((result) => {
      try {
        if (result.length) {
          field.ops.set.cb(result)
        } else {
          field.ops.set.cb(field.def.getValue())
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
        rowVal[c + ' ' + col.getTrName()] = row[col.path]
      }
      data.push(rowVal)
    }
    if (!data.length) {
      // empty table
      let rowVal = {}
      rowVal[__('ui-row-index')] = '-'
      for (let c = 0; c < field.def.children.length; ++c) {
        let col = field.def.children[c]
        rowVal[c + ' ' + col.getTrName()] = '-'
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
      this._getInput().then((result) => {
        try {
          if (result.length) {
            subField.ops.set.cb(result)
          } else {
            subField.ops.set.cb(subField.def.getValue())
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

  _selectTableIndex (field, idx) {
    this._printFieldInfo(field)
    this._printTableInfo(field)

    console.log(__('ui-action-row-number') + ' ' + idx)
    console.log('(' +
      'e - ' + __('ui-action-row-edit') + ' | ' +
      'd - ' + __('ui-action-row-delete') + ' | ' +
      'c - ' + __('ui-action-cancel') + ')')

    this._getInput('(e|d|c)').then((result) => {
      try {
        if (!result.length) {
          throw new Error('invalid input')
        } else {
          let cmd = result.toLowerCase().split(' ')
          if (cmd[0][0] === 'e') {
            return this._editTableIndex(field, idx)
          } else if (cmd[0][0] === 'd') {
            field.ops.delete.cb(idx)
            field = this._updateState()
            return this._tablePrompt(field)
          }
        }
        this._run()
      } catch (e) {
        console.error(e.stack)
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

    this._getInput('([#]|a|f)').then((result) => {
      try {
        if (!result.length) {
          throw new Error('invalid input')
        } else {
          let cmd = result.toLowerCase().split(' ')
          if (parseInt(cmd[0]).toString() === cmd[0]) {
            let idx = parseInt(cmd[0])
            if (idx < 0 || idx >= field.def.getValue().length) {
              throw new Error('index out of range')
            }
            return this._selectTableIndex(field, idx)
          } else if (cmd[0][0] === 'a') {
            field.ops.add.cb()
            field = this._updateState()
            return this._editTableIndex(field, field.def.getValue().length - 1)
          } else if (cmd[0][0] === 'f') {
            return this._advance()
          } else {
            throw new Error('invalid input')
          }
        }
        // this._run()
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
        console.log(JSON.stringify(runner.wiz.getJson(), null, '  '))
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
