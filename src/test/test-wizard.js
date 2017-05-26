'use strict'

const expect = require('chai').expect

const testSchema = {
  '$schema': 'http://json-schema.org/draft-06/schema#',
  'id': 'http://ceptr.org/projects/holochain/schemas/hc-scaffold-schema.json',
  'definitions': {},
  'type': 'object',
  'hc-hint-type': 'category',
  'required': [
    'name'
  ],
  'properties': {
    'name': {
      'type': 'string',
      'hc-hint-type': 'text',
      'hc-hint-dummy': 'dummy',
      'pattern': '^.+$',
      'default': ''
    }
  }
}

exports.specify = (name, WizardLib) => {
  describe(name, () => {
    let wiz

    beforeEach(() => {
      wiz = new WizardLib(null, testSchema)
    })

    it('field count', () => {
      let count = 0
      while (wiz.getNextFieldDef()) {
        count++
      }
      expect(count).equals(1)
    })

    it('can set name as string', () => {
      let f = wiz.getNextFieldDef()
      f.setValue('test')
    })

    it('empty name throws', () => {
      let f = wiz.getNextFieldDef()
      expect(() => { f.setValue('') }).throw()
    })
  })
}
