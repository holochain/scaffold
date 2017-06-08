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

    this._pages = []
    this._pageIndex = 0

    this._calculatePages()

    this.curFieldDef = null

    this.ajv = new Ajv()
    this.validator = this.ajv.compile(schema)
  }

  getCurrentState () {
    if (this._pageIndex < 0) {
      this._pageIndex = 0
    }
    if (this._pageIndex > this._pages.length) {
      // allow it to go 1 beyond... this signifies completion
      this._pageIndex = this._pages.length
    }
    return {
      pageIndex: this._pageIndex,
      pages: this._pages
    }
  }

  getJson () {
    return this.rootFieldDef.getJson()
  }

  // -- for use by friend classes (fields) -- //

  /**
   */
  $valueTypeConvert (fieldDef, value) {
    let type = fieldDef.getJsonType()
    if (type === 'boolean' && typeof value === 'string') {
      let tmp = value.toLowerCase()
      if (tmp === 'true' || tmp === 'yes') {
        value = true
      } else if (tmp === 'false' || tmp === 'no') {
        value = false
      }
    }
    return value
  }

  /**
   * Plug one value into the dummy file, and run validation
   */
  $validateFieldValue (fieldDef, newVal) {
    let dummy = this.rootFieldDef.getDummyJson()
    this._dummySet(dummy, fieldDef.getDummyJsonPath(), newVal)

    if (!this.validator(dummy)) {
      throw new Error(this.ajv.errorsText(this.validator.errors))
    }
  }

  // -- private -- //

  /**
   */
  _calculatePages () {
    this._pages = []
    this._calculatePagesRec(this.rootFieldDef)
  }

  /**
   */
  _calculatePagesRec (fieldDef, curPage) {
    if (!curPage) {
      curPage = {
        type: 'basic',
        ops: {
          'prev': {
            cb: () => {
              this._pageIndex -= 1
            }
          },
          'next': {
            cb: () => {
              this._pageIndex += 1
            }
          }
        },
        fields: []
      }
      this._pages.push(curPage)
    }

    for (let childFieldDef of fieldDef.children) {
      let hint = childFieldDef.getHcHintType()
      if (hint === 'loop') {
        let loopControlIndex = this._pages.length
        this._pages.push({
          type: 'loopControl',
          ref: childFieldDef,
          ops: {
            'prev': {
              cb: () => {
                this._pageIndex -= 1
              }
            },
            'next': {
              cb: () => {
                this._pageIndex += childFieldDef.value.length + 1
              }
            },
            'add': {
              cb: () => {
                let newRow = {}
                for (let c of childFieldDef.children) {
                  newRow[c.path] = c.getDefaultJson()
                }
                childFieldDef.value.push(newRow)
                console.log(JSON.stringify(childFieldDef.value))
                this._pageIndex += childFieldDef.value.length
                this._calculatePages()
              }
            }
          },
          fields: []
        })
        let value = childFieldDef.value
        for (let r = 0; r < value.length; ++r) {
          let subCurPage = {
            type: 'loopRow',
            ref: childFieldDef,
            rowIndex: r,
            ops: {
              'prev': {
                cb: () => {
                  this._pageIndex -= 1
                }
              },
              'next': {
                cb: () => {
                  if (r === value.length - 1) {
                    this._pageIndex = loopControlIndex
                  } else {
                    this._pageIndex += 1
                  }
                }
              },
              'delete': {
                cb: () => {
                  childFieldDef.value.splice(r, 1)
                  this._pageIndex = loopControlIndex
                  this._calculatePages()
                }
              }
            },
            fields: []
          }
          this._pages.push(subCurPage)
          this._calculatePagesRec(childFieldDef, subCurPage)
          for (let r2 = 0; r2 < subCurPage.fields.length; ++r2) {
            let subPageField = subCurPage.fields[r2]
            subPageField.ops.get.cb = () => {
              return childFieldDef.value[r][subPageField.def.path]
            }
            let origSet = subPageField.ops.set.cb
            subPageField.ops.set.cb = (val) => {
              origSet(val)
              childFieldDef.value[r][subPageField.def.path] =
                subPageField.def.value
              subPageField.def.value = subPageField.def.getDefault()
            }
          }
        }
      } else if (hint === 'category') {
        this._calculatePagesRec(childFieldDef, curPage)
      } else if (hint === 'hidden') {
        // skip
      } else {
        let field = {
          def: childFieldDef,
          ops: {
            'get': {
              cb: () => {
                return childFieldDef.value
              }
            },
            'set': {
              cb: (val) => {
                val = this.$valueTypeConvert(childFieldDef, val)
                this.$validateFieldValue(childFieldDef, val)
                childFieldDef.value = val
              }
            }
          }
        }
        curPage.fields.push(field)
        if (hint === 'table') {
          field.ops['add'] = {
            cb: () => {
              let newRow = {}
              for (let c of childFieldDef.children) {
                newRow[c.path] = c.getDefaultJson()
              }
              childFieldDef.value.push(newRow)
              this._calculatePages()
            }
          }
          field.ops['delete'] = {
            cb: (idx) => {
              if (typeof idx !== 'number') {
                throw new Error('idx required to delete table row')
              }
              childFieldDef.value.splice(idx, 1)
              this._calculatePages()
            }
          }
          field.subFields = []
          let value = childFieldDef.value
          for (let r = 0; r < value.length; ++r) {
            let newRow = []
            for (let c of childFieldDef.children) {
              newRow.push({
                def: c,
                rowIndex: r,
                ops: {
                  'set': {
                    cb: (val) => {
                      val = this.$valueTypeConvert(c, val)
                      this.$validateFieldValue(c, val)
                      let tbl = field.ops.get.cb()
                      tbl[r][c.path] = val
                      field.ops.set.cb(tbl)
                    }
                  }
                }
              })
            }
            field.subFields.push(newRow)
          }
        }
      }
    }
  }

  /**
   */
  _dummySet (obj, dummyPath, val) {
    let cur = obj
    for (let i = 0; i < dummyPath.length - 1; ++i) {
      cur = cur[dummyPath[i]]
    }
    cur[dummyPath[dummyPath.length - 1]] = val
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
