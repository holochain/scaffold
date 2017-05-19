'use strict'

class BaseField {
  /**
   * @param {object} opt
   * @param {Wizard} opt.wizard
   * @param {string} opt.jsonPath
   * @param {string} opt.name
   * @param {string} [opt.description]
   * @param {*} [opt.defaultValue]
   * @param {*} [opt.value]
   * @param {number} [opt.pageHint]
   */
  constructor (opt) {
    if (typeof opt !== 'object') {
      throw new Error('required opt object')
    }
    if (typeof opt.name !== 'string' || !opt.name.length) {
      throw new Error('opt.name required')
    }
    if (typeof opt.jsonPath !== 'string' || !opt.jsonPath.length) {
      throw new Error('opt.jsonPath required')
    }
    if (typeof opt.wizard !== 'object') {
      throw new Error('cannot construct field without opt.wizard')
    }
    this.wizard = opt.wizard
    this.jsonPath = opt.jsonPath
    this.name = opt.name
    this.description = opt.description || ''
    this.value = this.defaultValue = opt.defaultValue
    if ('value' in opt) {
      this.value = opt.value
    }
    this.pageHint = opt.pageHint || 1
  }

  setValue (data) {
    this.wizard.$validateFieldValue(this, data)
    this.value = data
  }
}

class BooleanField extends BaseField {
  setValue (data) {
    if (typeof data === 'string') {
      data = data.toLowerCase()
      if (data === 'true' || data === 'yes') {
        data = true
      } else if (data === 'false' || data === 'no') {
        data = false
      }
    }
    super.setValue(data)
  }
}

exports.init = function init (registerField) {
  registerField('hidden', BaseField)
  registerField('text', BaseField)
  registerField('checkbox', BooleanField)
}
