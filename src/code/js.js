'use strict'

const __ = require('../hc-i18n').getText

/**
 * This code generator builds the JAVASCRIPT dna code stubs
 */
class JsCodeGen {
  /**
   * prepare some options for code generation
   */
  constructor (opt) {
    this.entryNames = opt.entryNames || []
    this.indent = opt.indent || 2
  }

  /**
   * run the actual code generation
   */
  generate () {
    this.src = "'use strict';\n"
    this.depth = 0

    this._callout([ __('code-callout-header') ].join('\n'))

    this._header([
      __('code-function-genesis'),
      '@return {boolean} success'
    ].join('\n'))
    this._function('genesis', [], () => {
      this.src += this._indent('// any genesis code here\nreturn true;') + '\n'
    })

    this.src += '\n'
    this._callout([
      __('code-callout-validation')
    ].join('\n'))

    this._validate('validateCommit', [
      'entryName', 'entry', 'header', 'pkg', 'sources'])

    this.src += '\n'
    this._validate('validatePut', [
      'entryName', 'entry', 'header', 'pkg', 'sources'])

    this.src += '\n'
    this._validate('validateMod', [
      'entryName', 'entry', 'header', 'replaces', 'pkg', 'sources'])

    this.src += '\n'
    this._validate('validateDel', [
      'entryName', 'hash', 'pkg', 'sources'])

    this.src += '\n'
    this._validatePkg('validatePutPkg')

    this.src += '\n'
    this._validatePkg('validateModPkg')

    this.src += '\n'
    this._validatePkg('validateDelPkg')

    return this.src
  }

  // -- private -- //

  /**
   * write out a package function
   */
  _validatePkg (fname) {
    this._header([
      __('code-function-pkg'),
      '@param {string} entryName - the name of entry to validate',
      '@return {*} the data required for validation'
    ].join('\n'))
    this._function(fname, ['entryName'], () => {
      this.src += this._indent('return null;') + '\n'
    })
  }

  /**
   * write out a validation function
   */
  _validate (fname, params) {
    const hdr = [__('code-function-validate')]
    for (let param of params) {
      switch (param) {
        case 'entryName':
          hdr.push('@param {string} entryName - the name of entry being modified')
          break
        case 'entry':
          hdr.push('@param {*} entry - the entry data to be set')
          break
        case 'hash':
          hdr.push('@param {string} hash - the hash of the entry to remove')
          break
        case 'header':
          hdr.push('@param {?} header - ?')
          break
        case 'replaces':
          hdr.push('@param {*} replaces - the old entry data')
          break
        case 'pkg':
          hdr.push('@param {?} pkg - ?')
          break
        case 'sources':
          hdr.push('@param {?} sources - ?')
          break
      }
    }
    hdr.push('@return {boolean} is valid?')
    this._header(hdr.join('\n'))
    this._function(
      fname,
      params,
      () => {
        this._switch('entryName', this.entryNames, (comp) => {
          this.src += this._indent('// validation code here\nreturn false;') + '\n'
        }, () => {
          this.src += this._indent('// invalid entry name!!\nreturn false;') + '\n'
        })
      }
    )
  }

  /**
   * apply proper indentation based on our depth
   */
  _indent (text) {
    let space = (new Array(this.depth * this.indent + 1)).join(' ')

    text = text.split('\n')
    return space + text.join('\n' + space)
  }

  /**
   * write out a callout comment
   */
  _callout (text) {
    text = text.split('\n')
    this.src += '\n' + this._indent(
      '// -----------------------------------------------------------------\n' +
      '//  ' + text.join('\n//  ') + '\n' +
      '// -----------------------------------------------------------------'
    ) + '\n'
  }

  /**
   * write out a function comment header
   */
  _header (text) {
    text = text.split('\n')
    this.src += '\n' + this._indent(
      '/**\n * ' + text.join('\n * ') + '\n */') + '\n'
  }

  /**
   * write out a function definition
   */
  _function (name, params, body) {
    let tmp = 'function ' + name + ' ('
    for (let i = 0; i < params.length; ++i) {
      if (i > 0) {
        tmp += ', '
      }
      tmp += params[i]
    }
    tmp += ') {\n'
    this.src += this._indent(tmp)
    this.depth++
    body()
    this.depth--
    this.src += this._indent('}')
  }

  /**
   * write out a switch statement
   */
  _switch (item, cases, body, def) {
    this.src += this._indent('switch (' + item + ') {') + '\n'
    this.depth++
    for (let comp of cases) {
      this.src += this._indent('case ' + JSON.stringify(comp) + ':') + '\n'
      this.depth++
      body(comp)
      this.depth--
    }
    this.src += this._indent('default:') + '\n'
    this.depth++
    def()
    this.depth--
    this.depth--
    this.src += this._indent('}') + '\n'
  }
}

/**
 * Export code generator
 */
exports.generate = function generate (opt) {
  const gen = new JsCodeGen(opt)
  return gen.generate()
}
