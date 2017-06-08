'use strict'

const i18n = require('./hc_i18n')
const __ = i18n.getText

function def (v) {
  return typeof v !== 'undefined' && v !== null
}

class FieldDef {
  constructor (path, schema, wizard, parent) {
    this.path = path
    this.schema = schema
    this.wizard = wizard
    this.parent = parent
    this.children = []
    this.value = this.getDefault()

    if (this.parent) {
      this.trname = __('field-' + this.getJsonPath() + '-name')
      this.trdesc = __('field-' + this.getJsonPath() + '-description')
    }

    if (schema.type === 'object' && schema['hc-hint-type'] === 'category') {
      for (let subName of schema.required) {
        let subSchema = schema.properties[subName]
        this.children.push(new FieldDef(subName, subSchema, wizard, this))
      }
    } else if (schema.type === 'array') {
      for (let subName of schema.items.required) {
        let subSchema = schema.items.properties[subName]
        this.children.push(new FieldDef(subName, subSchema, wizard, this))
      }
    }
  }

  loadData (json) {
    switch (this.getHcHintType()) {
      case 'category':
        for (let c of this.children) {
          if (c.path in json) {
            c.loadData(json[c.path])
          }
        }
        break
      default:
        this.value = json
        break
    }
  }

  getJsonType () {
    return this.schema.type
  }

  getHcHintType () {
    return this.schema['hc-hint-type']
  }

  getHcHintLoopDisplay () {
    return this.schema['hc-hint-loop-display'] || false
  }

  getTrName () {
    return this.trname
  }

  getTrDescription () {
    return this.trdesc
  }

  getDefault () {
    return def(this.schema.default) ?
      JSON.parse(JSON.stringify(this.schema.default)) :
      null
  }

  getDummy () {
    if (this.schema.type === 'array') {
      let row = {}
      for (let child of this.children) {
        row[child.path] = child.getDummy()
      }
      return [row]
    } else {
      return def(this.schema['hc-hint-dummy']) ?
        JSON.parse(JSON.stringify(this.schema['hc-hint-dummy'])) :
        this.getDefault()
    }
  }

  getValue () {
    return this.value
  }

  getJsonPath () {
    let fullPath = this.path
    let obj = this.parent
    while (obj) {
      if (obj.parent) {
        fullPath = obj.path + '.' + fullPath
      }
      obj = obj.parent
    }
    return fullPath
  }

  getDummyJsonPath () {
    let fullPath = [this.path]
    let obj = this.parent
    while (obj) {
      if (obj.schema.type === 'array') {
        fullPath.unshift(0)
      }
      if (obj.parent) {
        fullPath.unshift(obj.path)
      }
      obj = obj.parent
    }
    return fullPath
  }

  getDefaultJson () {
    return JSON.parse(JSON.stringify(
      this._mapJson((c) => { return c.getDefault() })))
  }

  getDummyJson () {
    return JSON.parse(JSON.stringify(
      this._mapJson((c) => { return c.getDummy() })))
  }

  getJson () {
    return JSON.parse(JSON.stringify(
      this._mapJson((c) => { return c.getValue() })))
  }

  getDebugJson () {
    let data = {
      path: this.path,
      fullPath: this.getJsonPath(),
      type: this.getJsonType(),
      typeHint: this.getHcHintType(),
      trName: this.trname,
      trDescription: this.trdesc,
      default: this.getDefault(),
      dummy: this.getDummy(),
      value: this.getValue(),
      children: []
    }
    for (let c of this.children) {
      data.children.push(c.getDebugJson())
    }
    return data
  }

  toString () {
    return JSON.stringify(this.getDebugJson(), null, '  ')
  }

  // -- private -- //

  _mapJson (getter) {
    switch (this.getHcHintType()) {
      case 'category':
        let out = {}
        for (let c of this.children) {
          out[c.path] = c._mapJson(getter)
        }
        return out
      default:
        return getter(this)
    }
  }
}

exports.FieldDef = FieldDef
