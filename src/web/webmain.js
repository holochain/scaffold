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
      fieldData.field.ops.set.cb(fieldData.setter(elem))
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
    fieldData.field.ops.add.cb()
    this._run()
  }

  $deleteTableRow (elem, evtName, params) {
    if (!('json-path' in params) || !(params['json-path'] in this.fields)) {
      throw new Error('invalid deleteTableRow call ' + JSON.stringify(params))
    }
    if (!('row-index' in params)) {
      throw new Error('invalid deleteTableRow call ' + JSON.stringify(params))
    }
    const fieldData = this.fields[params['json-path']]
    fieldData.field.ops.delete.cb(parseInt(params['row-index']))
    this._run()
  }

  $pressButton (elem, evtName, params) {
    if (!('button-type' in params)) {
      throw new Error('invalid pressButton call ' + JSON.stringify(params))
    }
    let buttonType = params['button-type']
    switch (buttonType) {
      case 'add':
        this._currentPage.ops.add.cb()
        this._run()
        break
      case 'next':
        this._currentPage.ops.next.cb()
        this._run()
        break
      default:
        throw new Error('invalid pressButton type ' + buttonType)
    }
  }

  // -- private -- //

  _run () {
    let state = this.wiz.getCurrentState()

    while (this.formBody.childNodes.length) {
      this.formBody.removeChild(this.formBody.childNodes[0])
    }

    if (state.pageIndex >= state.pages.length) {
      this.formBody.appendChild(document.createTextNode('ALL DONE!'))
      this._resolve(this.wiz)
      return
    }

    this._currentPage = state.pages[state.pageIndex]

    let pageType = this._currentPage.type

    if (pageType === 'loopControl') {
      let addButton = this._genTemplate('page-button', {
        buttonType: 'add',
        value: 'Add ' + this._currentPage.ref.getTrName() + ' Element'
      })
      this.formBody.appendChild(addButton)
      let nextButton = this._genTemplate('page-button', {
        buttonType: 'next',
        value: 'Done'
      })
      this.formBody.appendChild(nextButton)
    } else {
      for (let field of state.pages[state.pageIndex].fields) {
        let fieldData = this._genField(field, field.def.getJsonPath())
        this.formBody.appendChild(fieldData.containerElem)
      }

      let nextButton = this._genTemplate('page-button', {
        buttonType: 'next',
        value: 'Next Page'
      })
      this.formBody.appendChild(nextButton)

      this._displayJson()
    }
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

  _genField (field, jsonPath) {
    const fieldData = {
      field: field
    }

    let inputWidget
    switch (field.def.getHcHintType()) {
      case 'table':
        inputWidget = handlebars.templates['field-table']({
          jsonPath: jsonPath
        })
        break
      case 'checkbox':
        inputWidget = handlebars.templates['field-checkbox']({
          jsonPath: jsonPath,
          checked: field.def.getValue() ? 'checked="checked"' : ''
        })
        fieldData.setter = (elem) => elem.checked ? 'true' : 'false'
        break
      default:
        inputWidget = handlebars.templates['field-text']({
          jsonPath: jsonPath,
          value: field.def.getValue()
        })
        fieldData.setter = (elem) => elem.value
        break
    }

    fieldData.containerElem = this._genTemplate('field-container', {
      jsonPath: jsonPath,
      name: field.def.getTrName(),
      description: field.def.getTrDescription(),
      inputWidget: inputWidget
    })

    fieldData.validationResultElem = fieldData.containerElem.querySelector(
      '.validation-result')

    if (field.def.getHcHintType() === 'table') {
      this._fillTable(fieldData)
    }

    this.fields[jsonPath] = fieldData

    return fieldData
  }

  _fillTable (fieldData) {
    const jsonPath = fieldData.field.def.getJsonPath()

    const tableElem = fieldData.containerElem.querySelector('.hc-table')
    while (tableElem.childNodes.length) {
      tableElem.removeChild(tableElem.childNodes[0])
    }

    const rawValue = fieldData.field.def.getValue()
    for (let r = 0; r < rawValue.length; ++r) {
      let rowData = rawValue[r]

      let rowElem = document.createElement('div')
      rowElem.classList.add('hc-table-row')
      rowElem.appendChild(this._genTemplate('field-table-delete-row', {
        jsonPath: jsonPath,
        rowIndex: r
      }))

      for (let subField of fieldData.field.subFields[r]) {
      // for (let cFieldDef of fieldData.field.def.children) {
        // direct set avoids validation for now
        subField.def.value = rowData[subField.def.path]

        const subJsonPath = subField.def.getJsonPath() + '[' + r + ']'
        const subFieldData = this._genField(subField, subJsonPath)

        rowElem.appendChild(subFieldData.containerElem)
      }
      tableElem.appendChild(rowElem)
    }
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
