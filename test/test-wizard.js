'use strict'

const expect = require('chai').expect

exports.specify = (name, WizardLib) => {
  describe(name, () => {
    let wiz

    beforeEach(() => {
      wiz = new WizardLib()
    })

    it('field count', () => {
      expect(wiz.getFieldCount()).equals(1)
    })

    it('field idx 0 on page 1', () => {
      expect(wiz.getFieldIndexesForPage(1).indexOf(0) > -1).equals(true)
    })

    it('can set name as string', () => {
      let f = wiz.getField(0)
      f.setValue('test')
    })

    it('empty name throws', () => {
      let f = wiz.getField(0)
      expect(() => { f.setValue('') }).throw()
    })
  })
}
