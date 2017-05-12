'use strict'

const Ajv = require('ajv')

const i18n = require('./hc_i18n')
i18n.loadLocale(require('../gen/strings'))
const __ = i18n.getText

const schemas = require('../gen/schemas')
const schema = schemas['schema-hc-scaffold']
const schemaDummy = schemas['schema-hc-scaffold-dummy-values']
const schemaDefault = schemas['schema-hc-scaffold-default-values']

const fieldDefs = require('../gen/fields').fields
const fieldClasses = require('./fields/manifest')

class Wizard {
  constructor (current) {
    this.fields = []
    this.fieldPages = []

    this.ajv = new Ajv()
    this.validator = this.ajv.compile(schema)

    for (let field of fieldDefs) {
      let Class = fieldClasses.getClass(field.Class)

      let opt = {
        wizard: this,
        jsonPath: field.jsonPath,
        name: __(field.name),
        description: __(field.description),
        defaultValue: schemaDefault[field.jsonPath]
      }

      if (current && field.jsonPath in current) {
        opt.value = current[field.jsonPath]
      }

      let fieldInst = new Class(opt)
      this.fields.push(fieldInst)
      if (!(fieldInst.pageHint in this.fieldPages)) {
        this.fieldPages[fieldInst.pageHint] = []
      }
      this.fieldPages[fieldInst.pageHint].push(this.fields.length - 1)
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
    let out = {}
    for (let field of this.fields) {
      out[field.jsonPath] = field.value
    }
    return out
  }

  // -- private -- //

  _validateFieldValue (field, newVal) {
    // clone dummy
    let dummy = JSON.parse(JSON.stringify(schemaDummy))
    dummy[field.jsonPath] = newVal

    if (!this.validator(dummy)) {
      throw new Error(this.ajv.errorsText(this.validator.errors))
    }
  }
}

exports.Wizard = Wizard
