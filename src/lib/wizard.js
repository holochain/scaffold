'use strict'

const Ajv = require('ajv')

const i18n = require('./hc_i18n')
i18n.loadLocale(require('../gen/strings'))

const schemas = require('../gen/schemas')
const scaffoldSchema = schemas['hc-scaffold-schema']

const FieldDef = require('./field-def').FieldDef

class Wizard {
  constructor (current, schema) {
    current || (current = {})
    if (!schema) {
      // param mostly used for unit tests
      schema = scaffoldSchema
    }

    this.rootFieldDef = new FieldDef('root', schema, this, null)

    this.rootFieldDef.loadData(current)

    this.curFieldDef = null

    console.log(this.rootFieldDef.toString())
    // process.exit(0)

    /*
    console.log(this.rootFieldDef.toString())
    console.log(JSON.stringify(this.rootFieldDef.getDefaultJson(), null, '  '))
    console.log(JSON.stringify(this.rootFieldDef.getDummyJson(), null, '  '))
    console.log(JSON.stringify(this.rootFieldDef.getJson(), null, '  '))
    */

    this.ajv = new Ajv()
    this.validator = this.ajv.compile(schema)
  }

  getNextOp () {
    if (!this.curPage) {
      this.curPage = this.rootFieldDef.children[0]
      return ['page']
    }
    if (!this.curOpDef) {
      this.curOpDef = this.curPage
      return ['field', this.curOpDef]
    }
    if (this.curOpDef.children.length) {
      this.curOpDef = this.curOpDef.children[0]
      return ['field', this.curOpDef]
    }
    if (this.curOpDef.parent) {
      let obj = this.curOpDef
      let p = obj.parent
      while (p) {
        let idx = p.children.indexOf(obj)
        if (idx + 1 < p.children.length) {
          this.curOpDef = p.children[idx + 1]
          return ['field', this.curOpDef]
        }
        obj = p
        p = obj.parent
      }
    }
  }

  getNextFieldDef () {
    if (this.curFieldDef && this.curFieldDef.getHcHintType() === 'table') {
      // skip all children in tables
      this.curFieldDef = this.curFieldDef.children[this.curFieldDef.children.length - 1]
    }
    let nxt = this._getNextFieldDef()
    if (!nxt) {
      return nxt
    }
    switch (nxt.getHcHintType()) {
      case 'category':
      case 'hidden':
        return this.getNextFieldDef()
      default:
        return nxt
    }
  }

  getJson () {
    return this.rootFieldDef.getJson()
  }

  // -- for use by friend classes (fields) -- //

  /**
   * Plug one value into the dummy file, and run validation
   */
  $validateFieldValue (fieldDef, newVal) {
    let dummy = this.rootFieldDef.getDummyJson()
    this._deepSet(dummy, fieldDef.getJsonPath(), newVal)

    if (!this.validator(dummy)) {
      throw new Error(this.ajv.errorsText(this.validator.errors))
    }
  }

  // -- private -- //

  _getNextFieldDef () {
    if (!this.curFieldDef) {
      this.curFieldDef = this.rootFieldDef.children[0]
      return this.curFieldDef
    }
    if (this.curFieldDef.children.length) {
      this.curFieldDef = this.curFieldDef.children[0]
      return this.curFieldDef
    }
    if (this.curFieldDef.parent) {
      let obj = this.curFieldDef
      let p = obj.parent
      while (p) {
        let idx = p.children.indexOf(obj)
        if (idx + 1 < p.children.length) {
          this.curFieldDef = p.children[idx + 1]
          return this.curFieldDef
        }
        obj = p
        p = obj.parent
      }
    }
  }

  /**
   */
  _deepSet (obj, name, val) {
    let parts = name.split('.')
    let cur = obj
    for (let i = 0; i < parts.length - 1; ++i) {
      cur = cur[parts[i]]
    }
    cur[parts[parts.length - 1]] = val
  }

  /**
   */
  _deepGet (obj, name) {
    let parts = name.split('.')
    let cur = obj
    for (let i = 0; i < parts.length - 1; ++i) {
      if (!cur) {
        return
      }
      cur = cur[parts[i]]
    }
    if (!cur) {
      return
    }
    return cur[parts[parts.length - 1]]
  }
}

exports.Wizard = Wizard
