'use strict'

/* global hc_scaffold_wizard */

const Wizard = hc_scaffold_wizard.Wizard
const handlebars = require('handlebars/runtime')
require('../gen/webtemplates')

class WizardRunner {
  constructor (editData) {
    document.body.appendChild(this._genTemplate('page', {}))
    this.formBody = document.body.querySelector('#form-body')

    this.wiz = new Wizard(editData)
    this.fieldIdx = 0
  }

  run () {
    return new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
      this._run()
    })
  }

  // -- private -- //

  _run () {
    if (this.fieldIdx >= this.wiz.getFieldCount()) {
      this._resolve(this.wiz)
      return
    }

    let field = this.wiz.getField(this.fieldIdx)
    this._genField(field)

    this.fieldIdx++
    this._run()
  }

  _genTemplate (name, data) {
    let d = document.createElement('div')
    d.innerHTML = handlebars.templates[name](data)
    let c = d.childNodes[0]
    d.removeChild(c)
    return c
  }

  _genField (field) {
    let inputWidget = handlebars.templates['field-text']({
      field: field
    })

    this.formBody.appendChild(this._genTemplate('field-container', {
      field: field,
      inputWidget: inputWidget
    }))
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
