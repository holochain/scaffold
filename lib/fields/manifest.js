'use strict'

let fieldmap = {}

registerFields(require('./common'))

function registerFields (module) {
  module.init((name, Class) => {
    if (name in fieldmap) {
      throw new Error('"' + name + '" already registered')
    }
    fieldmap[name] = Class
  })
}

exports.getClass = function getClass (name) {
  if (!(name in fieldmap)) {
    throw new Error('Invalid Field Name: "' + name + '"')
  }
  return fieldmap[name]
}
