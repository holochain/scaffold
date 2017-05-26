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
      this.fieldDef = this.wiz.getNextFieldDef()
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
      fieldData.fieldDef.setValue(elem.value)
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

  // -- private -- //

  _run () {
    if (!this.fieldDef) {
      this._resolve(this.wiz)
      return
    }

    this._genField()

    this.fieldDef = this.wiz.getNextFieldDef()
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

  _genField () {
    const fieldData = {
      fieldDef: this.fieldDef
    }

    const jsonPath = this.fieldDef.getJsonPath()
    let inputWidget = handlebars.templates['field-text']({
      jsonPath: jsonPath,
      value: this.fieldDef.getValue()
    })

    fieldData.containerElem = this._genTemplate('field-container', {
      jsonPath: jsonPath,
      name: this.fieldDef.getTrName(),
      description: this.fieldDef.getTrDescription(),
      inputWidget: inputWidget
    })

    this.formBody.appendChild(fieldData.containerElem)

    fieldData.validationResultElem = fieldData.containerElem.querySelector(
      '.validation-result')

    this.fields[jsonPath] = fieldData
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
