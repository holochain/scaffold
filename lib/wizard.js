'use strict'

const Ajv = require('ajv')

const i18n = require('./hc_i18n')
i18n.loadLocale(require('../gen/strings'))
const __ = i18n.getText

const schemas = require('../gen/schemas')
const scaffoldSchema = schemas['hc-scaffold-schema']

const fieldClasses = require('./fields/manifest')

class Wizard {
  constructor (current, schema) {
    current || (current = {})
    if (!schema) {
      // param mostly used for unit tests
      schema = scaffoldSchema
    }
    this.fieldDefs = this._parseSchema(schema)
    this.fields = []

    this.ajv = new Ajv()
    this.validator = this.ajv.compile(schema)

    for (let field of this.fieldDefs) {
      // eventually we will need to forward hidden fields,
      // for now, let's skip them in the wizard
      if (field.typeHint === 'hidden') {
        continue
      }

      let Class = fieldClasses.getClass(field.typeHint)

      let opt = {
        wizard: this,
        field: JSON.parse(JSON.stringify(field)),
        name: __('field-' + field.jsonPath + '-name'),
        description: __('field-' + field.jsonPath + '-description')
      }

      opt.value = this._deepGet(current, field.jsonPath) || field.default

      let fieldInst = new Class(opt)
      this.fields.push(fieldInst)

      /*
      if (!(fieldInst.pageHint in this.fieldPages)) {
        this.fieldPages[fieldInst.pageHint] = []
      }
      this.fieldPages[fieldInst.pageHint].push(this.fields.length - 1)
      */
    }
  }

  getFieldCount () {
    return this.fields.length
  }

  getFieldIndexesForPage (pageNumber) {
    return this.fieldPages[pageNumber]
  }

  getField (idx) {
    return this.fields[idx]
  }

  getJson () {
    let out = JSON.parse(JSON.stringify(this.def))
    for (let field of this.fields) {
      this._deepSet(out, field.field.jsonPath, field.value)
    }
    return out
  }

  // -- for use by friend classes (fields) -- //

  /**
   * Plug one value into the dummy file, and run validation
   */
  $validateFieldValue (field, newVal) {
    // clone dummy
    let dummy = JSON.parse(JSON.stringify(this.dummy))
    this._deepSet(dummy, field.field.jsonPath, newVal)

    if (!this.validator(dummy)) {
      throw new Error(this.ajv.errorsText(this.validator.errors))
    }
  }

  // -- private -- //

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

  /**
   * Parse all the hints/defaults/dummy values/etc we need from the schema
   */
  _parseSchema (schema, path, field, def, dummy) {
    def || (def = this.def = {})
    dummy || (dummy = this.dummy = {})

    if (schema.type === 'object' && schema['hc-hint-type'] === 'category') {
      let out = []
      if (field) {
        def[field] = {}
        dummy[field] = {}
        def = def[field]
        dummy = dummy[field]
      }
      for (let subfield of schema.required) {
        let sub = schema.properties[subfield]
        out = out.concat(
          this._parseSchema(
            sub, path ? path + '.' + subfield : subfield,
            subfield,
            def,
            dummy))
      }
      return out
    } else if (path && schema['hc-hint-type'] !== 'category') {
      let out = {
        jsonPath: path,
        type: schema.type,
        typeHint: schema['hc-hint-type'],
        default: schema.default,
        dummy: schema['hc-hint-dummy'] || schema.default
      }
      def[field] = out.default
      dummy[field] = out.dummy
      return [out]
    }
  }
}

exports.Wizard = Wizard
