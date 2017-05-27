'use strict'

/* global hc_scaffold_wizard hljs Blob URL */

const Wizard = hc_scaffold_wizard.Wizard
const handlebars = require('handlebars/runtime')
require('../gen/webtemplates')

class WizardRunner {
  constructor (editData) {
    document.body.appendChild(this._genTemplate('page', {}))
    this.formBody = document.body.querySelector('.form-body')
    this.jsonDisplay = document.body.querySelector('.json-display')

    this.wiz = new Wizard(editData)
    this._displayJson()

    this.fields = {}
  }

  run () {
    return new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
      this._run()
    })
  }

  // -- access from template binding -- //

  $validateField (elem, evtName, params) {
    if (!('json-path' in params) || !(params['json-path'] in this.fields)) {
      throw new Error('invalid validateField call ' + JSON.stringify(params))
    }
    const fieldData = this.fields[params['json-path']]

    let validationResult = 'ok'
    try {
      fieldData.fieldDef.setValue(fieldData.setter(elem))
    } catch (e) {
      validationResult = e.toString()
    }

    const vrElem = fieldData.validationResultElem
    while (vrElem.childNodes.length) {
      vrElem.removeChild(vrElem.childNodes[0])
    }
    vrElem.appendChild(document.createTextNode(validationResult))
    if (validationResult === 'ok') {
      vrElem.classList.remove('validation-fail')
      vrElem.classList.add('validation-ok')
    } else {
      vrElem.classList.add('validation-fail')
      vrElem.classList.remove('validation-ok')
    }
    this._displayJson()
  }

  $downloadJson (elem, evtName, params) {
    let data = JSON.stringify(this.wiz.getJson(), null, '  ')
    data = new Blob([data], {type: 'application/json'})
    data = URL.createObjectURL(data)
    let a = document.createElement('a')
    a.style.display = 'none'
    a.href = data
    a.download = 'hc-scaffold.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.revokeObjectURL(data)
  }

  $addTableRow (elem, evtName, params) {
    if (!('json-path' in params) || !(params['json-path'] in this.fields)) {
      throw new Error('invalid addTableRow call ' + JSON.stringify(params))
    }
    const fieldData = this.fields[params['json-path']]
    const fieldDef = fieldData.fieldDef
    let value = JSON.parse(JSON.stringify(fieldDef.getValue()))
    let newRow = {}
    for (let c of fieldDef.children) {
      newRow[c.path] = c.getDefault()
    }
    value.push(newRow)
    // no validation here
    fieldDef.value = value
    this._fillTable(fieldData)
    this._displayJson()
  }

  $deleteTableRow (elem, evtName, params) {
    if (!('json-path' in params) || !(params['json-path'] in this.fields)) {
      throw new Error('invalid deleteTableRow call ' + JSON.stringify(params))
    }
    if (!('row-index' in params)) {
      throw new Error('invalid deleteTableRow call ' + JSON.stringify(params))
    }
    const fieldData = this.fields[params['json-path']]
    const fieldDef = fieldData.fieldDef
    const rowIndex = parseInt(params['row-index'])
    let value = JSON.parse(JSON.stringify(fieldDef.getValue()))
    value.splice(rowIndex, 1)
    // no validation here
    fieldDef.value = value
    this._fillTable(fieldData)
    this._displayJson()
  }

  // -- private -- //

  _run () {
    let fieldDef = this.wiz.getNextFieldDef()
    if (!fieldDef) {
      this._resolve(this.wiz)
      return
    }

    let fieldData = this._genField(fieldDef, fieldDef.getJsonPath())
    this.formBody.appendChild(fieldData.containerElem)

    this._run()
  }

  _displayJson () {
    while (this.jsonDisplay.childNodes.length) {
      this.jsonDisplay.removeChild(this.jsonDisplay.childNodes[0])
    }
    this.jsonDisplay.appendChild(document.createTextNode(
      JSON.stringify(this.wiz.getJson(), null, '  ')))
    hljs.highlightBlock(this.jsonDisplay)
  }

  _recBind (elem) {
    for (let child of elem.childNodes) {
      this._recBind(child)
    }
    if (!elem.getAttribute) {
      return
    }
    let events = elem.getAttribute('data-hc-bind')
    if (!events) {
      return
    }
    events = events.split(/\s+/)

    let params = {}
    for (let attr of elem.attributes) {
      if (attr.name && attr.name.startsWith('data-hc-')) {
        params[attr.name.substr(8)] =
          attr.value || attr.nodeValue || attr.textContent
      }
    }

    let timeout
    for (let event of events) {
      let evtName = event.split(':')
      let fnName = evtName[1]
      evtName = evtName[0]
      elem.addEventListener(evtName, () => {
        if (typeof this[fnName] !== 'function') {
          throw new Error('bad bind ' + fnName)
        }
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          this[fnName](elem, evtName, JSON.parse(JSON.stringify(params)))
        }, 200)
      }, false)
    }
  }

  _genTemplate (name, data) {
    let d = document.createElement('div')
    d.innerHTML = handlebars.templates[name](data)
    let c = d.childNodes[0]
    d.removeChild(c)

    this._recBind(c)

    return c
  }

  _genField (fieldDef, jsonPath) {
    const fieldData = {
      fieldDef: fieldDef
    }

    let inputWidget
    switch (fieldDef.getHcHintType()) {
      case 'table':
        inputWidget = handlebars.templates['field-table']({
          jsonPath: jsonPath
        })
        break
      case 'checkbox':
        inputWidget = handlebars.templates['field-checkbox']({
          jsonPath: jsonPath,
          checked: fieldDef.getValue() ? 'checked="checked"' : ''
        })
        fieldData.setter = (elem) => elem.checked ? 'true' : 'false'
        break
      default:
        inputWidget = handlebars.templates['field-text']({
          jsonPath: jsonPath,
          value: fieldDef.getValue()
        })
        fieldData.setter = (elem) => elem.value
        break
    }

    fieldData.containerElem = this._genTemplate('field-container', {
      jsonPath: jsonPath,
      name: fieldDef.getTrName(),
      description: fieldDef.getTrDescription(),
      inputWidget: inputWidget
    })

    fieldData.validationResultElem = fieldData.containerElem.querySelector(
      '.validation-result')

    if (fieldDef.getHcHintType() === 'table') {
      this._fillTable(fieldData)
    }

    this.fields[jsonPath] = fieldData

    return fieldData
  }

  _fillTable (fieldData) {
    const jsonPath = fieldData.fieldDef.getJsonPath()

    const tableElem = fieldData.containerElem.querySelector('.hc-table')
    while (tableElem.childNodes.length) {
      tableElem.removeChild(tableElem.childNodes[0])
    }

    const rawValue = fieldData.fieldDef.getValue()
    for (let r = 0; r < rawValue.length; ++r) {
      let rowData = rawValue[r]

      let rowElem = document.createElement('div')
      rowElem.classList.add('hc-table-row')
      rowElem.appendChild(this._genTemplate('field-table-delete-row', {
        jsonPath: jsonPath,
        rowIndex: r
      }))

      for (let cFieldDef of fieldData.fieldDef.children) {
        // direct set avoids validation for now
        cFieldDef.value = rowData[cFieldDef.path]

        const subJsonPath = cFieldDef.getJsonPath() + '[' + r + ']'
        const subFieldData = this._genField(cFieldDef, subJsonPath)

        const setter1 = subFieldData.setter
        subFieldData.setter = (elem) => {
          const subData = setter1(elem)
          this._tableValidate(fieldData, subFieldData, r, subData)
          return subData
        }

        rowElem.appendChild(subFieldData.containerElem)
      }
      tableElem.appendChild(rowElem)
    }
  }

  _tableValidate (fieldData, subFieldData, rowIndex, subData) {
    const fieldDef = fieldData.fieldDef
    let fullValue = JSON.parse(JSON.stringify(fieldDef.getValue()))
    fullValue[rowIndex][subFieldData.fieldDef.path] = subData
    fieldDef.setValue(fullValue)
  }
}

// entrypoint
main()
function main () {
  let runner = new WizardRunner(null)
  runner.run().then((wiz) => {
    console.log(JSON.stringify(wiz.getJson(), null, '  '))
  }, (err) => {
    console.error(err)
  })
}
