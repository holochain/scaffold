'use strict'

const vsprintf = require('sprintf-js').vsprintf

let map = {}
let curLang = 'en'

exports.loadLocale = function loadLocale (strings) {
  for (let langId in strings) {
    if (!(langId in map)) {
      map[langId] = {}
    }
    for (let stringId in strings[langId]) {
      if (stringId in map[langId]) {
        throw new Error('duplicate stringId: "' + stringId +
          '" for langId: "' + langId + '"')
      }
      map[langId][stringId] = strings[langId][stringId]
    }
  }
}

exports.setLocale = function setLocale (langId) {
  curLang = langId
}

exports.getText = function getText (stringId /* args */) {
  let args = [].slice.call(arguments, 0)
  stringId = args.shift()

  let out = null
  if (stringId in map[curLang]) {
    out = map[curLang][stringId]
  } else if (stringId in map['en']) {
    out = map['en'][stringId]
  }
  if (!out) {
    throw new Error(stringId + ' not found')
  }
  return vsprintf(out, args)
}
